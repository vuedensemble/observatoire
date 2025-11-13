"""Welcome to Reflex! This file outlines the steps to create a basic app."""

import reflex as rx
from sqlmodel import select

from observatoire.schema.locality import Locality
from observatoire.schema.document import Document
from observatoire.schema.documented_event import DocumentedEvent
from rxconfig import config
import workers


class State(rx.State):
    """The app state."""

    rows: list[dict[str, str]] = []

    @rx.event
    def test_queue(self):
        workers.add.delay(1, 2)

    @rx.event
    def on_load(self):
        # with rx.session() as session:
        #     self.rows = session.exec(select(Locality.name)).all()
        self.rows = [
            {"name": "Biarritz", "annees": "2020, 2021", "docs": 981},
            {"name": "Bayonne", "annees": "2020, 2021, 2022, 2023", "docs": 420},
        ]


def row_display(row: dict[str, str]):
    print(row)
    return rx.table.row(
        rx.table.row_header_cell(row["name"]),
        rx.table.cell(row["annees"]),
        rx.table.cell(row["docs"]),
    )


@rx.page(on_load=State.on_load)
def index() -> rx.Component:
    # Welcome Page (Index)
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
                        rx.table.column_header_cell("Nom"),
                        rx.table.column_header_cell("Années couvertes"),
                        rx.table.column_header_cell("Nombre de documents"),
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


app = rx.App()
app.add_page(index)
