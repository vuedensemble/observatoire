import reflex as rx


def navbar_link(text: str, url: str) -> rx.Component:
    return rx.link(rx.text(text, size="4", weight="medium"), href=url)


def navbar() -> rx.Component:
    return rx.box(
        rx.hstack(
            rx.hstack(
                rx.heading("Observatoire", size="7", weight="bold"),
                align_items="center",
            ),
            rx.hstack(
                navbar_link("Accueil", "/"),
                justify="end",
                spacing="5",
            ),
            justify="between",
            align_items="center",
        ),
        bg=rx.color("accent", 3),
        padding="1em",
        # position="fixed",
        # top="0px",
        # z_index="5",
        width="100%",
        margin_bottom="2em",
        border_radius="1em"
    )
