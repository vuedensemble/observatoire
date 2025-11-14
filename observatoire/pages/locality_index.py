"""Welcome to Reflex! This file outlines the steps to create a basic app."""

import reflex as rx
from sqlmodel import select

from observatoire.schema.locality import Locality
from observatoire.schema.document import Document
from observatoire.schema.documented_event import DocumentedEvent
from rxconfig import config


class State(rx.State):
    locality: Locality | None = None
    rows: list[Document] = []

    @rx.event
    def on_load(self):
        with rx.session() as session:
            locality = session.exec(
                select(Locality).where(Locality.id == self.id)
            ).one()
            self.locality = locality


def row_display(row: Document):
    return rx.table.row(
        rx.table.cell(
            rx.link(
                rx.icon("eye"), href=f"/localities/{row.locality_id}/documents/{row.id}"
            )
        ),
        rx.table.cell(row.i_title),
        rx.table.cell(""),
    )


@rx.page(on_load=State.on_load, route="/localities/[id]")
def index() -> rx.Component:
    return rx.container(
        rx.cond(
            State.locality,
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
                            State.rows,
                            row_display,
                        )
                    ),
                    width="100%",
                ),
                spacing="8",
            ),
            rx.text("Loading")
        )
    )
