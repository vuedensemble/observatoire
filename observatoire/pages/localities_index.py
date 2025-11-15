import reflex as rx
from sqlmodel import select, func

from observatoire.schema.locality import Locality
from observatoire.schema.document import Document
from observatoire.schema.documented_event import DocumentedEvent
from observatoire.components.navbar import navbar
from rxconfig import config
import workers


class State(rx.State):
    loading: bool = True
    rows: list[Locality] = []
    n_documents_per_locality: dict[str, int]

    @rx.event
    def on_load(self):
        with rx.session() as session:
            self.rows = session.exec(select(Locality)).all()
            n_documents_per_locality = dict(
                session.exec(
                    select(Document.locality_id, func.count(Document.id)).group_by(
                        Document.locality_id
                    )
                ).all()
            )
            self.n_documents_per_locality = n_documents_per_locality

            self.loading = False


def build_row_display(n_documents_per_locality: dict[str, int]):
    def row_display(row: Locality):
        return rx.table.row(
            rx.table.cell(
                rx.flex(
                    rx.link(rx.icon("eye"), href=f"/localities/{row.id}"),
                    rx.dialog.root(
                        rx.dialog.trigger(rx.icon("settings")),
                        rx.dialog.content(
                            rx.dialog.title("Paramètres"),
                            rx.dialog.description(
                                rx.markdown(row.administrative_reporting_setup)
                            ),
                            rx.dialog.close(
                                rx.button("Fermer", size="3"),
                            ),
                        ),
                    ),
                    spacing="2",
                )
            ),
            rx.table.cell(row.name),
            rx.table.cell(rx.link(row.website, href=row.website, is_external=True)),
            rx.table.cell(n_documents_per_locality.get(row.id)),
        )

    return row_display


@rx.page(on_load=State.on_load, route="/")
def index() -> rx.Component:
    return rx.box(
        navbar(),
        rx.grid(
            rx.color_mode.button(position="top-right"),
            rx.vstack(
                rx.flex(
                    rx.heading("Observatoire", size="9"),
                    rx.cond(State.loading, rx.spinner()),
                    align="center",
                    spacing="4",
                ),
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
                        build_row_display(State.n_documents_per_locality),
                    )
                ),
                width="100%",
            ),
            spacing="8",
        ),
        padding="2rem"
    )
