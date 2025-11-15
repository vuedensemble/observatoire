import reflex as rx
from sqlmodel import select

from observatoire.schema.locality import Locality
from observatoire.schema.document import Document
from observatoire.schema.documented_event import DocumentedEvent
from observatoire.components.navbar import navbar
from rxconfig import config


class State(rx.State):
    loading: bool = True
    document: Document | None = None

    @rx.event
    def on_load(self):
        with rx.session() as session:
            id, file_name = session.exec(
                select(Document.id, Document.file_name).where(Document.id == self.did)
            ).one()
            self.document = Document(id=id, file_name=file_name)
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
                        rx.cond(State.loading, rx.spinner()),
                        align="center",
                        spacing="4",
                    ),
                    rx.text(
                        State.document.file_name,
                        size="5",
                    ),
                    rx.button(
                        "Télécharger le fichier source", on_click=State.download_pdf
                    ),
                    spacing="5",
                    justify="center",
                ),
                rx.heading("Villes", size="7"),
            ),
        ),
    )
