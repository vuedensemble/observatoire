import reflex as rx

from sqlmodel import Field, Column, TEXT


class DocumentedEvent(rx.Model, table=True):
    """
    In a Document, there can be multiple DocumentedEvent(s) that are reported within it, each with its own topic and summary
    """

    id: int | None = Field(default=None, primary_key=True)
    document_id: int = Field(
        foreign_key="document.id", description="Relationship to the source document"
    )

    # Inferred starts with i_
    i_topic: str = Field(
        sa_column=Column(TEXT),
        description="Inferred topic of the event, like 'sports', 'environment', etc.",
    )
    i_summary: str = Field(sa_column=Column(TEXT), description="Inferred event summary")
