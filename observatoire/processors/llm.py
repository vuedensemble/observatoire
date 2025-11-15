import base64
import os

import mistralai
from pydantic import BaseModel, Field
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


class DocumentEvent(BaseModel):
    sujet: str = Field(description="Le sujet principal de l'évènement documenté")
    resume: str = Field(description="Un résumé de l'évènement documenté")

class DocumentDetails(BaseModel):
    type: str = Field(description="Le type de document, peut être 'compte-rendu', 'débat', 'délibération', etc.")
    sujet: str = Field(description="Le sujet principal du document, peut être 'sports', 'environnement', 'voirie', etc.")
    titre: str = Field(description="Le titre du document")
    resume: str = Field(description="Un résumé des points clés document, en format markdown")
    evenements_documentes: list[DocumentEvent] = Field(description="Une liste des évènements majeurs décrits dans le document")
    annee: int = Field(description="Année, format YYYY, de rédaction du document")
    mois: int = Field(description="Mois, de 1 à 12, de rédaction du document")
    jour: int = Field(description="Jour, de 1 to 31, de rédaction du document")
    heure: int = Field(description="Heure, de 0 to 23, de rédaction du document")
    minute: int = Field(description="Minute, de 0 to 59, de rédaction du document")
    personnes_presentes: list[str] = Field(description="Liste de personnes mentionnées dans le document")
    personnes_absentes_avec_pouvoir: list[str] = Field(description="Liste de personnes mentionnées dans le document, absentes mais avec pouvoir")
    personnes_absentes: list[str] = Field(
        description="Liste de personnes mentionnées dans le document, mais absentes",
    )
    secretaires: list[str] = Field(
        description="Liste de secrétaires mentionnés dans le document"
    )

def parse_document_md(mistral_client: mistralai.Mistral, content: str):
    return mistral_client.chat.parse(
        model="mistral-medium-latest",
        messages=[
            {
                "content": f"Extrais les informations structurées suivantes du document entre les balises <document>...<, en format JSON, en suivant la spécification demandée, ainsi que les descriptions de chaque champ. \n<document>{content}</document>",
                "role": "user",
            },
        ],
        stream=False,
        response_format=DocumentDetails,
        temperature=0,
    )