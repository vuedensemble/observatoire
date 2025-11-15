import base64
import os

import mistralai
import reflex as rx
from sqlmodel import select

from observatoire.schema.document import Document


def get_mistral_client():
    return mistralai.Mistral(
        api_key=os.environ["LLM_API_KEY"],
    )


def encode_pdf(pdf_path: str):
    with open(pdf_path, "rb") as pdf_file:
        return base64.b64encode(pdf_file.read()).decode("utf-8")


def ocr_pdf(mistral_client, fp=None, bytes=None):
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
        existing_document_ids_no_ocr = session.exec(
            select(Document.id).where(Document.locality_id == locality_id and Document.i_md_from_ocr is None)
        ).all()
        return existing_document_ids_no_ocr


def run_and_save_ocr(doc_id: int, mistral_client: mistralai.Mistral | None=None):
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
