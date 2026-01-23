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

        logger.info("Batch job %s status: %s", job_id, status)

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


def run_ocr_batch(
    pdf_paths: list[str],
    model: str = "mistral-ocr-latest",
    poll_interval: float = 5.0,
    include_image_base64: bool = True,
    mistral_client: mistralai.Mistral | None = None,
) -> dict[str, str]:
    """
    Run OCR on a list of PDF files using Mistral's batch API and save results locally.

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
    requests = [
        build_ocr_batch_request(pdf_path, include_image_base64=include_image_base64)
        for pdf_path in pdf_paths
    ]

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
    logger.info("Uploaded OCR batch file: %s", uploaded_file.id)

    # Create batch job with OCR endpoint
    created_job = mistral_client.batch.jobs.create(
        input_files=[uploaded_file.id],
        model=model,
        endpoint="/v1/ocr",
    )

    job_id = created_job.id
    logger.info("OCR batch job created: %s", job_id)

    # Poll for completion
    while True:
        job = mistral_client.batch.jobs.get(job_id=job_id)
        status = str(job.status.value) if hasattr(job.status, "value") else str(job.status)

        progress_info = ""
        if hasattr(job, "succeeded_requests") and hasattr(job, "total_requests"):
            progress_info = f" ({job.succeeded_requests}/{job.total_requests})"

        logger.info("OCR batch job %s status: %s%s", job_id, status, progress_info)

        if status == "SUCCESS":
            break
        elif status in ("FAILED", "TIMEOUT_EXCEEDED", "CANCELLED"):
            raise RuntimeError(f"OCR batch job {job_id} ended with status: {status}")

        time.sleep(poll_interval)

    # Download results
    logger.info("Downloading OCR results from file: %s", job.output_file)
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
        logger.info("Saved OCR result: %s", output_path)

    logger.info("OCR batch complete: %d results saved", len(output_paths))
    return output_paths


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
) -> dict[str, str]:
    """
    Run OCR on all PDF files in a folder using Mistral's batch API.

    Args:
        folder_path: Path to folder containing PDF files
        recursive: If True, search for PDFs recursively in subfolders
        skip_existing: If True, skip PDFs that already have a corresponding _ocr.json file
        model: Mistral OCR model to use
        include_image_base64: Whether to include base64 images in OCR response

    Returns:
        Dict mapping input pdf_path to output JSON file path
    """
    folder_path = os.path.abspath(folder_path)

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

    if not pdf_paths:
        logger.info("No PDFs to process")
        return {}

    return run_ocr_batch(
        pdf_paths=pdf_paths,
        model=model,
        include_image_base64=include_image_base64,
    )


