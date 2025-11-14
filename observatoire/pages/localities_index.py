"""Welcome to Reflex! This file outlines the steps to create a basic app."""

import reflex as rx
from sqlmodel import select

from observatoire.schema.locality import Locality
from observatoire.schema.document import Document
from observatoire.schema.documented_event import DocumentedEvent
from rxconfig import config
import workers


class State(rx.State):
    rows: list[Locality] = []

    @rx.event
    def test_queue(self):
        workers.add.delay(1, 2)

    @rx.event
    def on_load(self):
        with rx.session() as session:
            self.rows = session.exec(select(Locality)).all()


def row_display(row: Locality):
    return rx.table.row(
        rx.table.cell(rx.link(rx.icon("eye"), href=f"/localities/{row.id}")),
        rx.table.cell(row.name),
        rx.table.cell(rx.link(row.website, href=row.website, is_external=True)),
    )


@rx.page(on_load=State.on_load, route="/")
def index() -> rx.Component:
    return rx.container(
        rx.grid(
            rx.color_mode.button(position="top-right"),
            rx.vstack(
                rx.heading("Observatoire", size="9"),
                rx.text(
                    "Bienvenue sur l'observatoire des villes du pays basque",
                    size="5",
                ),
                spacing="5",
                justify="center",
            ),
            rx.heading("Villes", size="7"),
            rx.table.root(
                rx.table.header(
                    rx.table.row(
                        rx.table.column_header_cell(""),
                        rx.table.column_header_cell("Nom"),
                        rx.table.column_header_cell("Site web"),
                        rx.table.column_header_cell("Documents"),
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
        )
    )
