"""Welcome to Reflex! This file outlines the steps to create a basic app."""

import reflex as rx
from sqlmodel import select, func

from observatoire.schema.locality import Locality
from observatoire.schema.document import Document
from observatoire.schema.documented_event import DocumentedEvent
from observatoire.components.navbar import navbar
from rxconfig import config


class State(rx.State):
    loading: bool = True
    locality: Locality | None = None
    documents: list[Document] = 0

    @rx.event
    def on_load(self):
        with rx.session() as session:
            locality = session.exec(
                select(Locality).where(Locality.id == self.id)
            ).one()
            documents_results = session.exec(
                select(Document.id, Document.file_name, Document.source_url).where(Document.locality_id == self.id).order_by(Document.id)
            ).all()
            documents = [
                Document(id=id, file_name=file_name, source_url=source_url)
                for id, file_name, source_url
                in documents_results
            ]
            self.locality = locality
            self.documents = documents
            self.loading = False


def make_row_display_func(locality_id: int):
    def row_display(row: Document):
        return rx.table.row(
            rx.table.cell(row.id),
            rx.table.cell(
                rx.link(
                    row.file_name, href=f"/localities/{locality_id}/documents/{row.id}"
                )
            ),
            rx.table.cell(
                rx.link(rx.icon("eye"), href=row.source_url, is_external=True)
            ),
            rx.table.cell(row.i_title),
            rx.table.cell(""),
        )
    return row_display


@rx.page(on_load=State.on_load, route="/localities/[id]")
def index() -> rx.Component:
    return rx.container(
        navbar(),
        rx.cond(
            State.loading,
            rx.spinner(),
            rx.grid(
                rx.color_mode.button(position="top-right"),
                rx.vstack(
                    rx.heading(State.locality.name, size="9"),
                    spacing="5",
                    justify="center",
                ),
                rx.heading("Documents", size="7"),
                rx.table.root(
                    rx.table.header(
                        rx.table.row(
                            rx.table.column_header_cell(""),
                            rx.table.column_header_cell("Nom"),
                            rx.table.column_header_cell("Source"),
                            rx.table.column_header_cell("Sujet"),
                            rx.table.column_header_cell("Date"),
                        )
                    ),
                    rx.table.body(
                        rx.foreach(
                            State.documents,
                            make_row_display_func(State.locality.id),
                        )
                    ),
                    width="100%",
                ),
                spacing="8",
            ),
        ),
        width="100%"
    )
