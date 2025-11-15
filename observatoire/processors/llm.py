import base64
import os

import mistralai
from pydantic import BaseModel, Field
import reflex as rx
from sqlmodel import select, text

from observatoire.schema.document import Document, extract_md
from observatoire.schema.locality import Locality


def get_mistral_client():
    return mistralai.Mistral(
        api_key=os.environ["LLM_API_KEY"],
    )


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
        if doc_id in doc_ids_no_ocr:
            run_and_save_ocr(doc_id=doc_id, mistral_client=mistral_client)
        if doc_id in doc_ids_no_detail:
            run_and_save_document_parsed_details(doc_id=doc_id, mistral_client=mistral_client)

def process_all_localities_documents():
    with rx.session() as session:
        locality_ids = session.exec(
            select(Locality.id).order_by(Locality.id)
        ).all()
    count = len(locality_ids)
    for idx, locality_id in enumerate(locality_ids):
        print(f"Running {locality_id} | {idx + 1}/{count}")
        process_locality_documents(locality_id=locality_id)
