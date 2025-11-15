import reflex as rx
from sqlmodel import select

from observatoire.schema.locality import Locality
from observatoire.schema.document import Document, extract_md
from observatoire.schema.documented_event import DocumentedEvent
from observatoire.components.navbar import navbar
from rxconfig import config


class State(rx.State):
    loading: bool = True
    document: Document | None = None
    document_md: str | None = None

    @rx.event
    def on_load(self):
        with rx.session() as session:
            id, file_name, i_md_from_ocr, source_url = session.exec(
                select(Document.id, Document.file_name, Document.i_md_from_ocr, Document.source_url).where(Document.id == self.did)
            ).one()
            self.document = Document(id=id, file_name=file_name, i_md_from_ocr=i_md_from_ocr, source_url=source_url)
            self.document_md = extract_md(i_md_from_ocr, image_strategy="include_base64")
            self.loading = False

    @rx.event
    def download_pdf(self):
        with rx.session() as session:
            document = session.exec(
                select(Document).where(Document.id == self.did)
            ).one()
            return rx.download(
                data=document.raw_content,
                filename=f"{document.file_name}.{document.file_extension}",
            )


@rx.page(
    on_load=State.on_load, route="/localities/[lid]/documents/[did]"
)
def index() -> rx.Component:
    return rx.container(
        navbar(),
        rx.cond(
            State.loading,
            rx.spinner(),
            rx.grid(
                rx.color_mode.button(position="top-right"),
                rx.vstack(
                    rx.flex(
                        rx.heading("Document", size="9"),
                        align="center",
                        spacing="4",
                    ),
                    rx.text(State.document.file_name),
                    rx.flex(
                        rx.link(rx.icon("eye"), href=State.document.source_url, is_external=True),
                        rx.button(
                            "Télécharger", on_click=State.download_pdf
                        ),
                        spacing="4"
                    ),
                    rx.cond(
                        State.document_md,
                        rx.box(
                            rx.heading("Résultat OCR", size="6"),
                            rx.markdown(State.document_md)
                        )
                    ),
                    spacing="5",
                    justify="center",
                )
            ),
        ),
    )
