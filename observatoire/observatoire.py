"""Welcome to Reflex! This file outlines the steps to create a basic app."""

import reflex as rx
from sqlmodel import select

from observatoire.schema.locality import Locality
from rxconfig import config
import workers


class State(rx.State):
    """The app state."""

    rows: list[str] = []

    @rx.event
    def test_huey(self):
        result = workers.add_numbers(1, 2)
        print("result", result)

    @rx.event
    def on_load(self):
        with rx.session() as session:
            self.rows = session.exec(select(Locality.name)).all()


def row_display(value: str):
    return rx.table.row(
        rx.table.row_header_cell(value),
    )


@rx.page(on_load=State.on_load)
def index() -> rx.Component:
    # Welcome Page (Index)
    return rx.container(
        rx.color_mode.button(position="top-right"),
        rx.vstack(
            rx.heading("Welcome to Reflex!", size="9"),
            rx.text(
                "Get started by editing ",
                rx.code(f"{config.app_name}/{config.app_name}.py"),
                size="5",
            ),
            rx.link(
                rx.button("Check out our docs!"),
                href="https://reflex.dev/docs/getting-started/introduction/",
                is_external=True,
            ),
            rx.button(
                "Test Huey",
                color_scheme="red",
                on_click=State.test_huey,
            ),
            spacing="5",
            justify="center",
            min_height="85vh",
        ),
        rx.table.root(
            rx.table.header(
                rx.table.row(
                    rx.table.column_header_cell("Name"),
                ),
            ),
            rx.table.body(
                rx.foreach(
                    State.rows,
                    row_display,
                )
            ),
            width="100%",
        ),
    )


app = rx.App()
app.add_page(index)
