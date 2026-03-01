import base64
import json
import logging
import os
import time
from typing import TypedDict

import mistralai
from pydantic import BaseModel, Field
import reflex as rx
from sqlmodel import select, text


class BatchRequestBody(TypedDict, total=False):
    messages: list[dict]
    max_tokens: int
    temperature: float
    response_format: dict


class BatchRequest(TypedDict):
    custom_id: str
    body: BatchRequestBody

logger = logging.getLogger(__name__)

from observatoire.schema.document import Document, extract_md
from observatoire.schema.locality import Locality


# Conseil Municipal extraction models

class ProjetMentionne(BaseModel):
    nom: str = Field(description="Nom du projet")
    description: str = Field(description="Description du projet")
    nature: str = Field(description="Nature du projet (infrastructure, service, etc.)")
    competence: str = Field(description="Compétence concernée (voirie, culture, sport, etc.)")


class Deliberation(BaseModel):
    numero: str = Field(description="Numéro de la délibération")
    objet: str = Field(description="Objet de la délibération")
    detail: str = Field(description="Détail de la délibération en texte libre")
    decision: str = Field(description="Décision prise (adoptée, rejetée, reportée, etc.)")
    votants: str = Field(description="Information sur les votants (nombre, unanimité, etc.)")
    projets_mentionnes: list[ProjetMentionne] = Field(
        default_factory=list,
        description="Liste des projets mentionnés dans cette délibération"
    )


class ConseilMunicipalExtraction(BaseModel):
    date: str = Field(description="Date du conseil municipal au format JJ-MM-AAAA")
    deliberations: list[Deliberation] = Field(
        default_factory=list,
        description="Liste des délibérations du conseil municipal"
    )
    projets_mentionnes_global: list[ProjetMentionne] = Field(
        default_factory=list,
        description="Liste globale de tous les projets mentionnés lors du conseil municipal"
    )


def get_mistral_client():
    return mistralai.Mistral(
        api_key=os.environ["LLM_API_KEY"],
    )


def run_batch(
    requests: list[BatchRequest],
    model: str = "mistral-large-latest",
    endpoint: str = "/v1/chat/completions",
    poll_interval: float = 5.0,
    mistral_client: mistralai.Mistral | None = None,
) -> dict[str, dict]:
    """
    Run a batch of requests on Mistral's batch API and wait for results.

    Args:
        requests: List of BatchRequest dicts
        model: Mistral model to use
        endpoint: API endpoint (e.g., "/v1/chat/completions")
        poll_interval: Seconds between status checks
        mistral_client: Optional pre-configured client

    Returns:
        Dict mapping custom_id to response body
    """
    if mistral_client is None:
        mistral_client = get_mistral_client()

    logger.info("Creating batch job with %d requests", len(requests))

    # Create JSONL content from requests
    jsonl_content = "\n".join(json.dumps(req) for req in requests)

    # Upload the JSONL file
    uploaded_file = mistral_client.files.upload(
        file={
            "file_name": "batch_requests.jsonl",
            "content": jsonl_content.encode("utf-8"),
        },
        purpose="batch",
    )
    logger.info("Uploaded batch file: %s", uploaded_file.id)

    created_job = mistral_client.batch.jobs.create(
        input_files=[uploaded_file.id],
        model=model,
        endpoint=endpoint,
    )

    job_id = created_job.id
    logger.info("Batch job created: %s", job_id)

    # Poll for completion
    while True:
        job = mistral_client.batch.jobs.get(job_id=job_id)
        status = str(job.status.value) if hasattr(job.status, 'value') else str(job.status)

        progress_info = ""
        if hasattr(job, "succeeded_requests") and hasattr(job, "total_requests"):
            progress_info = f" ({job.succeeded_requests}/{job.total_requests})"

        logger.info("Batch job %s status: %s%s", job_id, status, progress_info)

        if status == "SUCCESS":
            break
        elif status in ("FAILED", "TIMEOUT_EXCEEDED", "CANCELLED"):
            raise RuntimeError(f"Batch job {job_id} ended with status: {status}")

        time.sleep(poll_interval)

    # Download results
    logger.info("Downloading results from file: %s", job.output_file)
    output_file = mistral_client.files.download(file_id=job.output_file)
    # Handle different response types from the SDK
    if hasattr(output_file, 'read'):
        output_content = output_file.read()
        if isinstance(output_content, bytes):
            output_content = output_content.decode("utf-8")
    else:
        output_content = output_file

    # Parse JSONL results
    results = {}
    for line in output_content.strip().split("\n"):
        if not line:
            continue
        result = json.loads(line)
        custom_id = result.get("custom_id")
        if result.get("error"):
            logger.warning("Error for %s: %s", custom_id, result["error"])
            results[custom_id] = {"error": result["error"]}
        else:
            results[custom_id] = result.get("response", {}).get("body", {})

    logger.info("Batch complete: %d results", len(results))
    return results


def build_section_classification_request(section_folder: str) -> BatchRequest:
    """
    Build a batch request to classify whether a section relates to a conseil municipal.

    Args:
        section_folder: Path to a section folder containing section.json

    Returns:
        BatchRequest dict ready to be passed to run_batch
    """
    section_json_path = os.path.join(section_folder, "section.json")
    with open(section_json_path, "r", encoding="utf-8") as f:
        section_data = json.load(f)

    title = section_data.get("title", "")
    source_url = section_data.get("source_url", "")
    files = section_data.get("files", [])

    files_description = "\n".join([
        f"- {file.get('text', '')} (fichier: {file.get('filename', '')})"
        for file in files
    ])

    prompt = f"""Analyse les informations suivantes provenant d'une section d'un site web municipal et détermine si cette section concerne un conseil municipal (délibérations, comptes-rendus, procès-verbaux de conseil municipal).

Titre de la section : {title}
URL source : {source_url}

Liste des fichiers :
{files_description}
"""

    json_schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "section_classification",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "est_conseil_municipal": {
                        "type": "boolean",
                        "description": "True si la section concerne un conseil municipal"
                    },
                    "raison": {
                        "type": "string",
                        "description": "Courte explication de la décision"
                    },
                    "type_documents": {
                        "type": "string",
                        "description": "Type de documents identifiés (ex: délibérations, comptes-rendus, budgets, autre)"
                    }
                },
                "required": ["est_conseil_municipal", "raison", "type_documents"],
                "additionalProperties": False
            }
        }
    }

    return {
        "custom_id": section_folder,
        "body": {
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 200,
            "temperature": 0,
            "response_format": json_schema,
        },
    }


def build_section_classification_requests(city_folder: str) -> list[BatchRequest]:
    """
    Build batch requests for all sections in a city folder.

    Args:
        city_folder: Path to a city folder containing section_* subfolders

    Returns:
        List of BatchRequest dicts
    """
    requests = []
    for entry in sorted(os.listdir(city_folder)):
        section_folder = os.path.join(city_folder, entry)
        if os.path.isdir(section_folder) and entry.startswith("section_"):
            section_json = os.path.join(section_folder, "section.json")
            if os.path.exists(section_json):
                requests.append(build_section_classification_request(section_folder))
    logger.info("Built %d classification requests for %s", len(requests), city_folder)
    return requests


def encode_pdf(pdf_path: str):
    with open(pdf_path, "rb") as pdf_file:
        return base64.b64encode(pdf_file.read()).decode("utf-8")


def ocr_pdf(mistral_client: mistralai.Mistral, fp=None, bytes=None):
    assert fp is not None or bytes is not None

    if bytes is None and fp is not None:
        with open(fp, "rb") as pdf_file:
            bytes = pdf_file.read()

    base64_pdf = base64.b64encode(bytes).decode("utf-8")
    return mistral_client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": f"data:application/pdf;base64,{base64_pdf}",
        },
        include_image_base64=True,
    )


class OcrBatchRequest(TypedDict):
    custom_id: str
    body: dict


def build_ocr_batch_request(pdf_path: str, include_image_base64: bool = True) -> OcrBatchRequest:
    """
    Build a batch OCR request for a single PDF file.

    Args:
        pdf_path: Path to the PDF file
        include_image_base64: Whether to include base64 images in the response

    Returns:
        OcrBatchRequest dict ready for batch processing
    """
    with open(pdf_path, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode("utf-8")

    return {
        "custom_id": pdf_path,
        "body": {
            "document": {
                "type": "document_url",
                "document_url": f"data:application/pdf;base64,{base64_pdf}",
            },
            "include_image_base64": include_image_base64,
        },
    }


def _run_single_ocr_batch(
    requests: list[OcrBatchRequest],
    model: str,
    poll_interval: float,
    mistral_client: mistralai.Mistral,
    batch_num: int = 1,
    total_batches: int = 1,
) -> dict[str, str]:
    """
    Run a single OCR batch and return output paths.

    Args:
        requests: List of OcrBatchRequest dicts
        model: Mistral OCR model to use
        poll_interval: Seconds between status checks
        mistral_client: Pre-configured client
        batch_num: Current batch number (for logging)
        total_batches: Total number of batches (for logging)

    Returns:
        Dict mapping input pdf_path to output JSON file path
    """
    batch_label = f"[{batch_num}/{total_batches}] " if total_batches > 1 else ""

    # Create JSONL content
    jsonl_content = "\n".join(json.dumps(req) for req in requests)

    # Upload the JSONL file
    uploaded_file = mistral_client.files.upload(
        file={
            "file_name": "ocr_batch_requests.jsonl",
            "content": jsonl_content.encode("utf-8"),
        },
        purpose="batch",
    )
    logger.info("%sUploaded OCR batch file: %s", batch_label, uploaded_file.id)

    # Create batch job with OCR endpoint
    created_job = mistral_client.batch.jobs.create(
        input_files=[uploaded_file.id],
        model=model,
        endpoint="/v1/ocr",
    )

    job_id = created_job.id
    logger.info("%sOCR batch job created: %s", batch_label, job_id)

    # Poll for completion
    while True:
        job = mistral_client.batch.jobs.get(job_id=job_id)
        status = str(job.status.value) if hasattr(job.status, "value") else str(job.status)

        progress_info = ""
        if hasattr(job, "succeeded_requests") and hasattr(job, "total_requests"):
            progress_info = f" ({job.succeeded_requests}/{job.total_requests})"

        logger.info("%sOCR batch job %s status: %s%s", batch_label, job_id, status, progress_info)

        if status == "SUCCESS":
            break
        elif status in ("FAILED", "TIMEOUT_EXCEEDED", "CANCELLED"):
            raise RuntimeError(f"OCR batch job {job_id} ended with status: {status}")

        time.sleep(poll_interval)

    # Download results
    logger.info("%sDownloading OCR results from file: %s", batch_label, job.output_file)
    output_file = mistral_client.files.download(file_id=job.output_file)

    if hasattr(output_file, "read"):
        output_content = output_file.read()
        if isinstance(output_content, bytes):
            output_content = output_content.decode("utf-8")
    else:
        output_content = output_file

    # Parse JSONL results and save each to a file next to the input PDF
    output_paths = {}
    for line in output_content.strip().split("\n"):
        if not line:
            continue
        result = json.loads(line)
        custom_id = result.get("custom_id")  # This is the original pdf_path

        # Generate output path next to the input PDF
        output_path = os.path.splitext(custom_id)[0] + "_ocr.json"

        if result.get("error"):
            logger.warning("OCR error for %s: %s", custom_id, result["error"])
            output_data = {"error": result["error"], "source_pdf": custom_id}
        else:
            # Extract the OCR response body
            response_body = result.get("response", {}).get("body", {})
            output_data = response_body

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        output_paths[custom_id] = output_path
        logger.info("%sSaved OCR result: %s", batch_label, output_path)

    return output_paths


def run_ocr_batch(
    pdf_paths: list[str],
    model: str = "mistral-ocr-latest",
    poll_interval: float = 5.0,
    include_image_base64: bool = True,
    mistral_client: mistralai.Mistral | None = None,
) -> dict[str, str]:
    """
    Run OCR on a list of PDF files using Mistral's batch API and save results locally.
    If the total JSONL content exceeds 200MB, requests are split into multiple batches.

    Args:
        pdf_paths: List of paths to PDF files to process
        model: Mistral OCR model to use
        poll_interval: Seconds between status checks
        include_image_base64: Whether to include base64 images in OCR response
        mistral_client: Optional pre-configured client

    Returns:
        Dict mapping input pdf_path to output JSON file path (saved next to input)
    """
    if mistral_client is None:
        mistral_client = get_mistral_client()

    logger.info("Building OCR batch requests for %d PDFs", len(pdf_paths))

    # Filter out PDFs larger than 50MB
    max_file_size_bytes = 50 * 1024 * 1024  # 50MB
    pdf_paths_filtered = []
    for pdf_path in pdf_paths:
        file_size = os.path.getsize(pdf_path)
        if file_size > max_file_size_bytes:
            logger.warning("Skipping %s: file size %.1f MB exceeds 50MB limit", pdf_path, file_size / (1024 * 1024))
        else:
            pdf_paths_filtered.append(pdf_path)
    if len(pdf_paths_filtered) < len(pdf_paths):
        logger.info("Skipped %d PDFs exceeding 50MB, %d remaining", len(pdf_paths) - len(pdf_paths_filtered), len(pdf_paths_filtered))
    pdf_paths = pdf_paths_filtered

    if not pdf_paths:
        logger.info("No PDFs to process")
        return {}

    # Build all requests
    requests = [
        build_ocr_batch_request(pdf_path, include_image_base64=include_image_base64)
        for pdf_path in pdf_paths
    ]

    # Split into batches if total JSONL content exceeds 200MB
    max_batch_size_bytes = 200 * 1024 * 1024  # 200MB
    batches: list[list[OcrBatchRequest]] = []
    current_batch: list[OcrBatchRequest] = []
    current_batch_size = 0

    for req in requests:
        req_size = len(json.dumps(req).encode("utf-8")) + 1  # +1 for newline
        if current_batch and current_batch_size + req_size > max_batch_size_bytes:
            # Start a new batch
            batches.append(current_batch)
            current_batch = [req]
            current_batch_size = req_size
        else:
            current_batch.append(req)
            current_batch_size += req_size

    if current_batch:
        batches.append(current_batch)

    if len(batches) > 1:
        logger.info("Split %d requests into %d batches (200MB limit per batch)", len(requests), len(batches))

    # Process each batch
    all_output_paths = {}
    for batch_num, batch_requests in enumerate(batches, 1):
        logger.info("Processing batch %d/%d with %d requests", batch_num, len(batches), len(batch_requests))
        batch_output_paths = _run_single_ocr_batch(
            requests=batch_requests,
            model=model,
            poll_interval=poll_interval,
            mistral_client=mistral_client,
            batch_num=batch_num,
            total_batches=len(batches),
        )
        all_output_paths.update(batch_output_paths)

    logger.info("OCR batch complete: %d results saved", len(all_output_paths))
    return all_output_paths


def find_doc_ids_no_ocr(locality_id: int):
    with rx.session() as session:
        existing_document_ids_no_ocr_tuples = list(session.connection().execute(text("SELECT id FROM document WHERE locality_id=:locality_id AND i_md_from_ocr = '{}'"), {"locality_id": locality_id}))
        existing_document_ids_no_ocr = [tup[0] for tup in existing_document_ids_no_ocr_tuples]
        return existing_document_ids_no_ocr


def run_and_save_ocr(doc_id: int, mistral_client: mistralai.Mistral | None = None):
    if mistral_client is None:
        mistral_client = get_mistral_client()

    with rx.session() as session:
        doc: Document = session.exec(
            select(Document).where(Document.id == doc_id)
        ).one()
        ocr_response = ocr_pdf(mistral_client, bytes=doc.raw_content)
        doc.i_md_from_ocr = ocr_response.model_dump()
        session.add(doc)
        session.commit()


# Document parsing

class DocumentDetails(BaseModel):
    type: str = Field(
        description="Le type de document, peut être 'compte-rendu', 'débat', 'délibération', etc."
    )
    sujet: str = Field(
        description="Le sujet principal du document, peut être 'sports', 'environnement', 'voirie', etc."
    )
    titre: str = Field(description="Le titre du document")
    resume: str = Field(
        description="Un résumé des points clés document, en format markdown"
    )
    annee: int = Field(description="Année, format YYYY, de rédaction du document")
    mois: int = Field(description="Mois, de 1 à 12, de rédaction du document")
    jour: int = Field(description="Jour, de 1 to 31, de rédaction du document")
    heure: int = Field(description="Heure, de 0 to 23, de rédaction du document")
    minute: int = Field(description="Minute, de 0 to 59, de rédaction du document")
    personnes_presentes: list[str] = Field(
        description="Liste de personnes mentionnées dans le document"
    )
    personnes_absentes_avec_pouvoir: list[str] = Field(
        description="Liste de personnes mentionnées dans le document, absentes mais avec pouvoir"
    )
    personnes_absentes: list[str] = Field(
        description="Liste de personnes mentionnées dans le document, mais absentes",
    )
    secretaires: list[str] = Field(
        description="Liste de secrétaires mentionnés dans le document"
    )


def find_doc_ids_no_detail(locality_id: int):
    with rx.session() as session:
        existing_document_ids_no_details_tuples = list(session.connection().execute(text("SELECT id FROM document WHERE locality_id=:locality_id AND i_title is null"), {"locality_id": locality_id}))
        existing_document_ids_no_details = [tup[0] for tup in existing_document_ids_no_details_tuples]
        return existing_document_ids_no_details


def parse_document_details(
    mistral_client: mistralai.Mistral, file_name: str, content: str
):
    return mistral_client.chat.parse(
        model="mistral-medium-latest",
        messages=[
            {
                "content": f"""
                Extrais les informations structurées suivantes du document '{file_name}', dont le contenu est entre les balises <document>...</document>.
                Réponds en format JSON, en suivant la spécification demandée, ainsi que les descriptions de chaque champ.
                
                <document>{content}</document>
                """,
                "role": "user",
            },
        ],
        stream=False,
        response_format=DocumentDetails,
        temperature=0,
    )


def run_and_save_document_parsed_details(
    doc_id: int, mistral_client: mistralai.Mistral | None = None
):
    if mistral_client is None:
        mistral_client = get_mistral_client()

    with rx.session() as session:
        doc: Document = session.exec(
            select(Document).where(Document.id == doc_id)
        ).one()
        md = extract_md(doc.i_md_from_ocr, image_strategy="remove")
        document_details: DocumentDetails = (
            parse_document_details(mistral_client, file_name=doc.file_name, content=md)
            .choices[0]
            .message.parsed
        )

        doc.i_type = document_details.type
        doc.i_topic = document_details.sujet
        doc.i_title = document_details.titre
        doc.i_summary = document_details.resume
        doc.i_year = document_details.annee
        doc.i_month = document_details.mois
        doc.i_day_number = document_details.jour
        doc.i_minute = document_details.minute
        doc.i_people_present_csv = ",".join(document_details.personnes_presentes)
        doc.i_people_absent_given_power_csv = ",".join(
            document_details.personnes_absentes_avec_pouvoir
        )
        doc.i_people_absent_csv = ",".join(document_details.personnes_absentes)
        doc.i_secretaries_csv = ",".join(document_details.secretaires)

        session.add(doc)
        session.commit()


def process_locality_documents(locality_id: int):
    mistral_client = get_mistral_client()

    doc_ids_no_ocr = set(find_doc_ids_no_ocr(locality_id))
    doc_ids_no_detail = set(find_doc_ids_no_detail(locality_id))
    all_ids_sorted = sorted(doc_ids_no_ocr.union(doc_ids_no_detail))
    count = len(all_ids_sorted)
    print(f"Will process {count} docs")
    for idx, doc_id in enumerate(all_ids_sorted):
        print(f"Processing {doc_id} | {idx + 1}/{count}")
        try:
            if doc_id in doc_ids_no_ocr:
                run_and_save_ocr(doc_id=doc_id, mistral_client=mistral_client)
            if doc_id in doc_ids_no_detail:
                run_and_save_document_parsed_details(doc_id=doc_id, mistral_client=mistral_client)
        except KeyboardInterrupt:
            print("Stopped by keyboard")
            return
        except BaseException as e:
            print(f"Error processing {str(e)}")


def process_all_localities_documents():
    with rx.session() as session:
        locality_ids = session.exec(
            select(Locality.id).order_by(Locality.id)
        ).all()
    count = len(locality_ids)
    for idx, locality_id in enumerate(locality_ids):
        print(f"Running {locality_id} | {idx + 1}/{count}")
        process_locality_documents(locality_id=locality_id)


def classify_sections_by_city(cities_dir: str, city_names: list[str] | None = None, overwrite: bool=False):
    """
    Process all cities in a directory, running one batch request per city
    to classify sections as municipal council related or not.

    Args:
        cities_dir: Path to directory containing city folders (e.g., 'cities/')
                   Structure: cities/<city>/<section>/
        city_names: Optional list of city folder names to process. If None, all cities are processed.

    Results are saved to cities/<city>/municipal_council_section_check.json
    """
    mistral_client = get_mistral_client()

    city_folders = sorted([
        entry for entry in os.listdir(cities_dir)
        if os.path.isdir(os.path.join(cities_dir, entry))
    ])

    if city_names is not None:
        city_names_lower = set(name.lower() for name in city_names)
        city_folders = [c for c in city_folders if c.lower() in city_names_lower]

    count = len(city_folders)
    logger.info("Found %d cities to process", count)

    for idx, city_name in enumerate(city_folders):
        city_path = os.path.join(cities_dir, city_name)
        output_path = os.path.join(city_path, "municipal_council_section_check.json")

        if os.path.exists(output_path) and not overwrite:
            logger.info("Skipping %s (%d/%d): classification already exists", city_name, idx + 1, count)
            continue

        logger.info("Processing city %s (%d/%d)", city_name, idx + 1, count)

        requests = build_section_classification_requests(city_path)
        if not requests:
            logger.warning("No sections found for %s, skipping", city_name)
            continue

        try:
            results = run_batch(
                requests=requests,
                mistral_client=mistral_client,
            )

            # Parse JSON responses and build output
            output = {}
            for custom_id, response_body in results.items():
                section_name = os.path.basename(custom_id)
                if "error" in response_body:
                    output[section_name] = {"error": response_body["error"]}
                else:
                    # Extract the parsed JSON from the response
                    choices = response_body.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content", "{}")
                        try:
                            output[section_name] = json.loads(content)
                        except json.JSONDecodeError:
                            output[section_name] = {"raw_content": content}
                    else:
                        output[section_name] = {"error": "No choices in response"}

            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output, f, ensure_ascii=False, indent=2)

            logger.info("Saved results for %s to %s", city_name, output_path)

        except Exception as e:
            logger.error("Error processing city %s: %s", city_name, str(e))
            continue


def ocr_folder(
    folder_path: str,
    recursive: bool = False,
    skip_existing: bool = True,
    model: str = "mistral-ocr-latest",
    include_image_base64: bool = True,
    manifest_path: str | None = None,
) -> dict[str, str]:
    """
    Run OCR on all PDF files in a folder using Mistral's batch API.

    Args:
        folder_path: Path to folder containing PDF files
        recursive: If True, search for PDFs recursively in subfolders
        skip_existing: If True, skip PDFs that already have a corresponding _ocr.json file
        model: Mistral OCR model to use
        include_image_base64: Whether to include base64 images in OCR response
        manifest_path: Optional path to a filter manifest JSON file. When provided,
            only PDFs listed in the manifest are processed instead of all PDFs in the folder.

    Returns:
        Dict mapping input pdf_path to output JSON file path
    """
    folder_path = os.path.abspath(folder_path)

    if manifest_path:
        # Load manifest and build list of allowed PDF paths
        import json

        with open(manifest_path, encoding="utf-8") as f:
            manifest = json.load(f)

        allowed_paths = set()
        for city_entry in manifest:
            for file_entry in city_entry.get("files", []):
                # Manifest paths are relative like "section_0001/file.pdf"
                # Resolve them against folder_path
                allowed_paths.add(
                    os.path.normpath(os.path.join(folder_path, city_entry["city"], file_entry["path"]))
                )

        pdf_paths = sorted(p for p in allowed_paths if os.path.exists(p))
        logger.info(
            "Manifest loaded: %d files listed, %d found on disk",
            len(allowed_paths),
            len(pdf_paths),
        )
    else:
        # Find all PDF files
        if recursive:
            pdf_paths = []
            for root, _, files in os.walk(folder_path):
                for f in files:
                    if f.lower().endswith(".pdf"):
                        pdf_paths.append(os.path.join(root, f))
        else:
            pdf_paths = [
                os.path.join(folder_path, f)
                for f in os.listdir(folder_path)
                if f.lower().endswith(".pdf")
            ]

        pdf_paths = sorted(pdf_paths)
    logger.info("Found %d PDF files in %s", len(pdf_paths), folder_path)

    # Filter out PDFs that already have OCR results
    if skip_existing:
        pdf_paths_to_process = []
        for pdf_path in pdf_paths:
            ocr_path = os.path.splitext(pdf_path)[0] + "_ocr.json"
            if os.path.exists(ocr_path):
                logger.debug("Skipping %s: OCR result already exists", pdf_path)
            else:
                pdf_paths_to_process.append(pdf_path)
        logger.info(
            "Skipped %d PDFs with existing OCR results, %d to process",
            len(pdf_paths) - len(pdf_paths_to_process),
            len(pdf_paths_to_process),
        )
        pdf_paths = pdf_paths_to_process

    # Filter out PDFs larger than 50MB
    max_size_bytes = 50 * 1024 * 1024  # 50MB
    pdf_paths_under_limit = []
    skipped_large = 0
    for pdf_path in pdf_paths:
        file_size = os.path.getsize(pdf_path)
        if file_size > max_size_bytes:
            logger.warning("Skipping %s: file size %.1f MB exceeds 50MB limit", pdf_path, file_size / (1024 * 1024))
            skipped_large += 1
        else:
            pdf_paths_under_limit.append(pdf_path)
    if skipped_large > 0:
        logger.info("Skipped %d PDFs exceeding 50MB size limit, %d to process", skipped_large, len(pdf_paths_under_limit))
    pdf_paths = pdf_paths_under_limit

    if not pdf_paths:
        logger.info("No PDFs to process")
        return {}

    return run_ocr_batch(
        pdf_paths=pdf_paths,
        model=model,
        include_image_base64=include_image_base64,
    )


def load_ocr_markdown(ocr_json_path: str) -> str:
    """
    Load an OCR JSON file and extract the markdown content.

    Args:
        ocr_json_path: Path to the _ocr.json file

    Returns:
        Markdown string from all pages
    """
    with open(ocr_json_path, "r", encoding="utf-8") as f:
        ocr_data = json.load(f)

    if "error" in ocr_data:
        logger.warning("OCR file %s contains an error: %s", ocr_json_path, ocr_data["error"])
        return ""

    return extract_md(ocr_data, image_strategy="remove") or ""


def find_ocr_files(folder_path: str) -> list[str]:
    """
    Find all _ocr.json files in a folder recursively.

    Args:
        folder_path: Path to folder to search

    Returns:
        List of paths to _ocr.json files
    """
    import glob as glob_module
    return sorted(glob_module.glob(os.path.join(folder_path, "**", "*_ocr.json"), recursive=True))


CONSEIL_MUNICIPAL_EXTRACTION_PROMPT = """Tu es un assistant spécialisé dans l'analyse de documents administratifs français.

Analyse le contenu suivant, qui provient d'un document de conseil municipal (procès-verbal, compte-rendu, délibération), et extrais les informations en suivant EXACTEMENT le format markdown ci-dessous.

FORMAT DE SORTIE (à suivre strictement):

# Date
<date, format JJ-MM-AAAA>

# Présents / Absents
<lister les personnes présentes et absentes>

# Liste des délibérations

## Délibération <numéro>

### Numéro
<numéro>

### Objet
<objet>

### Détail

<détail de la délibération en texte libre ici>

### Décision

<décision>

### Votants
<votants>

### Projet mentionné

<liste des projets mentionnés avec nom, description, nature, compétence>

## Liste des projets mentionnés lors du conseil municipal

<liste des projets mentionnés avec nom, description, nature, compétence>

FIN DU FORMAT

Instructions:
- Répète la section "## Délibération <numéro>" pour chaque délibération trouvée dans le document
- Si une information n'est pas disponible, laisse le champ vide
- N'ajoute pas de commentaires ou d'explications, seulement le markdown structuré
- IMPORTANT: Retourne directement le markdown, sans l'entourer de blocs de code (pas de ```markdown)

Contenu du document:

{content}
"""


def build_conseil_municipal_extraction_request(
    ocr_file_path: str,
    markdown_content: str,
) -> BatchRequest:
    """
    Build a batch request to extract conseil municipal data from markdown content.

    Args:
        ocr_file_path: Path to the _ocr.json file (used as custom_id)
        markdown_content: Markdown content from OCR

    Returns:
        BatchRequest dict ready for batch processing
    """
    prompt = CONSEIL_MUNICIPAL_EXTRACTION_PROMPT.format(content=markdown_content)

    return {
        "custom_id": ocr_file_path,
        "body": {
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 16000,
            "temperature": 0,
        },
    }


def get_extraction_output_path(ocr_file_path: str) -> str:
    """Get the extraction output path for an OCR file (replaces _ocr.json with _extraction.md)."""
    return ocr_file_path.replace("_ocr.json", "_extraction.md")


def extract_conseil_municipal_batch(
    folders: list[str],
    model: str = "mistral-large-latest",
    skip_existing: bool = True,
) -> dict[str, str]:
    """
    Extract conseil municipal data from all _ocr.json files in the given folders.
    Each _ocr.json file is processed separately. Output is markdown.

    Args:
        folders: List of folder paths to search for _ocr.json files
        model: Mistral model to use for extraction
        skip_existing: If True, skip files that already have extraction results

    Returns:
        Dict mapping _ocr.json file paths to extraction markdown or error dict
    """
    mistral_client = get_mistral_client()

    # Find all OCR files and build requests
    requests = []

    for folder_path in folders:
        folder_path = os.path.abspath(folder_path)
        ocr_files = find_ocr_files(folder_path)

        if not ocr_files:
            logger.warning("No _ocr.json files found in %s", folder_path)
            continue

        for ocr_file in ocr_files:
            # Check if extraction already exists
            if skip_existing:
                md_output = get_extraction_output_path(ocr_file)
                if os.path.exists(md_output):
                    logger.debug("Skipping %s: extraction already exists", ocr_file)
                    continue

            # Load markdown content
            markdown_content = load_ocr_markdown(ocr_file)

            if not markdown_content:
                logger.warning("Skipping %s: no markdown content", ocr_file)
                continue

            logger.info("Adding %s (%d chars)", ocr_file, len(markdown_content))

            request = build_conseil_municipal_extraction_request(ocr_file, markdown_content)
            requests.append(request)

    if not requests:
        logger.info("No files to process")
        return {}

    logger.info("Processing %d OCR files in batch", len(requests))

    # Run batch
    results = run_batch(
        requests=requests,
        model=model,
        mistral_client=mistral_client,
    )

    # Process results
    extractions = {}
    for ocr_file_path, response_body in results.items():
        if "error" in response_body:
            logger.error("Error for %s: %s", ocr_file_path, response_body["error"])
            extractions[ocr_file_path] = {"error": response_body["error"]}
            continue

        choices = response_body.get("choices", [])
        if not choices:
            extractions[ocr_file_path] = {"error": "No choices in response"}
            continue

        md_content = choices[0].get("message", {}).get("content", "")

        # Save markdown output next to the OCR file
        md_output_path = get_extraction_output_path(ocr_file_path)
        with open(md_output_path, "w", encoding="utf-8") as f:
            f.write(md_content)

        logger.info("Saved extraction for %s", ocr_file_path)
        extractions[ocr_file_path] = md_content

    return extractions


# --- Structured JSON extraction from markdown ---

def find_extraction_md_files(folder_path: str) -> list[str]:
    """
    Find all _extraction.md files in a folder recursively.

    Args:
        folder_path: Path to folder to search

    Returns:
        List of paths to _extraction.md files
    """
    import glob as glob_module
    return sorted(glob_module.glob(os.path.join(folder_path, "**", "*_extraction.md"), recursive=True))


def get_structured_json_output_path(extraction_md_path: str) -> str:
    """Get the JSON output path for an extraction.md file (replaces _extraction.md with _structured.json)."""
    return extraction_md_path.replace("_extraction.md", "_structured.json")


STRUCTURED_JSON_EXTRACTION_PROMPT = """Tu es un assistant spécialisé dans l'extraction de données structurées à partir de documents markdown.

Analyse le contenu markdown suivant, qui décrit un conseil municipal avec ses délibérations, et extrais les informations en JSON structuré.

Contenu markdown:

{content}
"""

STRUCTURED_JSON_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "conseil_municipal_structured",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "description": "Date du conseil municipal au format JJ-MM-AAAA"
                },
                "deliberations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "numero": {"type": "string"},
                            "objet": {"type": "string"},
                            "detail": {"type": "string"},
                            "decision": {"type": "string"},
                            "votants": {"type": "string"},
                            "projets_mentionnes": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "nom": {"type": "string"},
                                        "description": {"type": "string"},
                                        "nature": {"type": "string"},
                                        "competence": {"type": "string"}
                                    },
                                    "required": ["nom", "description", "nature", "competence"],
                                    "additionalProperties": False
                                }
                            }
                        },
                        "required": ["numero", "objet", "detail", "decision", "votants", "projets_mentionnes"],
                        "additionalProperties": False
                    }
                },
                "projets_mentionnes_global": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "nom": {"type": "string"},
                            "description": {"type": "string"},
                            "nature": {"type": "string"},
                            "competence": {"type": "string"}
                        },
                        "required": ["nom", "description", "nature", "competence"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["date", "deliberations", "projets_mentionnes_global"],
            "additionalProperties": False
        }
    }
}


def build_structured_json_extraction_request(
    extraction_md_path: str,
    markdown_content: str,
) -> BatchRequest:
    """
    Build a batch request to extract structured JSON from extraction markdown.

    Args:
        extraction_md_path: Path to the _extraction.md file (used as custom_id)
        markdown_content: Markdown content from extraction

    Returns:
        BatchRequest dict ready for batch processing
    """
    prompt = STRUCTURED_JSON_EXTRACTION_PROMPT.format(content=markdown_content)

    return {
        "custom_id": extraction_md_path,
        "body": {
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 16000,
            "temperature": 0,
            "response_format": STRUCTURED_JSON_SCHEMA,
        },
    }


def extract_structured_json_batch(
    folders: list[str],
    model: str = "mistral-large-latest",
    skip_existing: bool = True,
) -> dict[str, dict]:
    """
    Extract structured JSON from all _extraction.md files in the given folders.
    Each _extraction.md file is processed separately.

    Args:
        folders: List of folder paths to search for _extraction.md files
        model: Mistral model to use for extraction
        skip_existing: If True, skip files that already have JSON results

    Returns:
        Dict mapping _extraction.md file paths to structured JSON or error dict
    """
    mistral_client = get_mistral_client()

    # Find all extraction.md files and build requests
    requests = []

    for folder_path in folders:
        folder_path = os.path.abspath(folder_path)
        md_files = find_extraction_md_files(folder_path)

        if not md_files:
            logger.warning("No _extraction.md files found in %s", folder_path)
            continue

        for md_file in md_files:
            # Check if JSON output already exists
            if skip_existing:
                json_output = get_structured_json_output_path(md_file)
                if os.path.exists(json_output):
                    logger.debug("Skipping %s: JSON already exists", md_file)
                    continue

            # Load markdown content
            with open(md_file, "r", encoding="utf-8") as f:
                markdown_content = f.read()

            if not markdown_content.strip():
                logger.warning("Skipping %s: empty file", md_file)
                continue

            logger.info("Adding %s (%d chars)", md_file, len(markdown_content))

            request = build_structured_json_extraction_request(md_file, markdown_content)
            requests.append(request)

    if not requests:
        logger.info("No files to process")
        return {}

    logger.info("Processing %d extraction.md files in batch", len(requests))

    # Run batch
    results = run_batch(
        requests=requests,
        model=model,
        mistral_client=mistral_client,
    )

    # Process results
    extractions = {}
    for md_file_path, response_body in results.items():
        if "error" in response_body:
            logger.error("Error for %s: %s", md_file_path, response_body["error"])
            extractions[md_file_path] = {"error": response_body["error"]}
            continue

        choices = response_body.get("choices", [])
        if not choices:
            extractions[md_file_path] = {"error": "No choices in response"}
            continue

        content = choices[0].get("message", {}).get("content", "{}")
        try:
            structured_data = json.loads(content)
        except json.JSONDecodeError:
            logger.error("Failed to parse JSON for %s", md_file_path)
            extractions[md_file_path] = {"error": "Failed to parse JSON", "raw_content": content}
            continue

        # Save JSON output next to the extraction.md file
        json_output_path = get_structured_json_output_path(md_file_path)
        with open(json_output_path, "w", encoding="utf-8") as f:
            json.dump(structured_data, f, ensure_ascii=False, indent=2)

        logger.info("Saved structured JSON for %s", md_file_path)
        extractions[md_file_path] = structured_data

    return extractions


def run_full_extraction_pipeline(
    folder_path: str,
    ocr_model: str = "mistral-ocr-latest",
    extraction_model: str = "mistral-large-latest",
    skip_existing: bool = True,
    include_image_base64: bool = True,
) -> dict:
    """
    Run the full extraction pipeline: OCR → extract-deliberations → structure-json.

    Args:
        folder_path: Path to folder containing PDF files
        ocr_model: Mistral OCR model to use
        extraction_model: Mistral model for extraction steps
        skip_existing: If True, skip files that already have results at each step
        include_image_base64: Whether to include base64 images in OCR response

    Returns:
        Dict with results from each step
    """
    folder_path = os.path.abspath(folder_path)
    results = {
        "ocr": {},
        "extract_deliberations": {},
        "structure_json": {},
    }

    # Step 1: OCR
    logger.info("=== Step 1/3: Running OCR ===")
    ocr_results = ocr_folder(
        folder_path=folder_path,
        recursive=True,
        skip_existing=skip_existing,
        model=ocr_model,
        include_image_base64=include_image_base64,
    )
    results["ocr"] = ocr_results
    logger.info("OCR complete: %d files processed", len(ocr_results))

    # Step 2: Extract deliberations
    logger.info("=== Step 2/3: Extracting deliberations ===")
    extract_results = extract_conseil_municipal_batch(
        folders=[folder_path],
        model=extraction_model,
        skip_existing=skip_existing,
    )
    results["extract_deliberations"] = extract_results
    logger.info("Extraction complete: %d files processed", len(extract_results))

    # Step 3: Structure JSON
    logger.info("=== Step 3/3: Structuring JSON ===")
    json_results = extract_structured_json_batch(
        folders=[folder_path],
        model=extraction_model,
        skip_existing=skip_existing,
    )
    results["structure_json"] = json_results
    logger.info("JSON structuring complete: %d files processed", len(json_results))

    return results

