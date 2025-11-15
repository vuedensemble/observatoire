import reflex as rx
from sqlmodel import select, func

from observatoire.processors import exporters
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
                select(Locality).where(Locality.id == self.lid)
            ).one()
            documents_results = session.exec(
                select(
                    Document.id,
                    Document.file_name,
                    Document.source_url,
                    Document.i_type,
                    Document.i_topic,
                    Document.i_title,
                    Document.i_summary,
                    Document.i_year,
                    Document.i_month,
                    Document.i_day_number,
                )
                .where(Document.locality_id == self.lid)
                .order_by(Document.id)
            ).all()
            documents = [
                Document(id=id, file_name=file_name, source_url=source_url,i_type=i_type, i_topic=i_topic, i_title=i_title, i_summary=i_summary, i_year=i_year, i_month=i_month, i_day_number=i_day_number)
                for id, file_name, source_url, i_type, i_topic, i_title, i_summary, i_year, i_month, i_day_number
                in documents_results
            ]
            self.locality = locality
            self.documents = documents
            self.loading = False

    @rx.event
    def download_csv(self):
        csv_str = exporters.export_documents_for_localities([self.lid])
        return rx.download(
            data=csv_str,
            filename=f"{self.locality.name}-export.csv",
        )


def make_row_display_func(locality_id: int):
    def row_display(row: Document):
        return rx.table.row(
            rx.table.cell(
                rx.link(
                    row.file_name, href=f"/localities/{locality_id}/documents/{row.id}"
                )
            ),
            rx.table.cell(
                rx.link(rx.icon("eye"), href=row.source_url, is_external=True)
            ),
            rx.table.cell(row.i_topic),
            rx.table.cell(row.i_type),
            rx.table.cell(row.i_title),
            rx.table.cell(row.i_summary),
            rx.table.cell(format_date(row)),
        )

    return row_display


@rx.page(on_load=State.on_load, route="/localities/[lid]")
def index() -> rx.Component:
    return rx.box(
        navbar(),
        rx.cond(
            State.loading,
            rx.spinner(),
            rx.grid(
                rx.color_mode.button(position="top-right"),
                rx.flex(
                    rx.vstack(
                        rx.heading(State.locality.name, size="9"),
                        spacing="5",
                        justify="center",
                    ),
                    rx.button("Exporter CSV", on_click=State.download_csv),
                    justify="between"
                ),
                rx.heading("Documents", size="7"),
                rx.table.root(
                    rx.table.header(
                        rx.table.row(
                            rx.table.column_header_cell("Nom"),
                            rx.table.column_header_cell("Source"),
                            rx.table.column_header_cell("Sujet"),
                            rx.table.column_header_cell("Type"),
                            rx.table.column_header_cell("Titre"),
                            rx.table.column_header_cell("Résumé"),
                            rx.table.column_header_cell("Date"),
                        )
                    ),
                    rx.table.body(
                        rx.foreach(
                            State.documents,
                            make_row_display_func(State.lid),
                        )
                    ),
                    width="100%",
                ),
                spacing="8",
            ),
        ),
        padding="2rem"
    )


def format_date(row: Document):
    if row.i_year is None:
        return ""
    return f"{row.i_day_number}/{row.i_month}/{row.i_year}"
