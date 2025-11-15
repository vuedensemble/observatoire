import reflex as rx

from sqlmodel import Field, Column, LargeBinary, TEXT, Boolean, Integer
from sqlalchemy.dialects.postgresql import JSONB


class Document(rx.Model, table=True):
    """
    Generic Document type, usually PDFs, with OCR content extraction to Markdown and events parsing
    """

    id: int | None = Field(default=None, primary_key=True)
    locality_id: int = Field(
        foreign_key="locality.id", description="Link back to the locality, if any"
    )

    file_name: str = Field(
        sa_column=Column(TEXT),
        description="The document file name, without the extension",
    )
    file_extension: str = Field(
        sa_column=Column(TEXT), description="The file extension"
    )

    source_url: str = Field(
        sa_column=Column(TEXT), description="The URL of the document"
    )
    base_url: str = Field(
        sa_column=Column(TEXT),
        description="The URL of the page where the source_url was found",
    )

    raw_content: bytes = Field(
        sa_column=Column(LargeBinary),
        description="Raw content bytes, can be gzipped, see 'gzipped' field",
    )
    gzipped: bool = Field(
        sa_column=Column(Boolean), description="True if the raw_content is gzipped"
    )

    # Inferred starts with i_
    i_type: str = Field(
        sa_column=Column(TEXT),
        description="The document type, one of 'minutes', 'debate', etc.",
    )
    i_topic: str = Field(
        sa_column=Column(TEXT),
        description="The document main topic, one of 'sports', 'environment', etc.",
    )
    i_title: str = Field(
        sa_column=Column(TEXT), description="An inferred document title"
    )
    i_summary: str = Field(
        sa_column=Column(TEXT), description="An inferred document summary"
    )

    i_md_from_ocr: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="The extracted OCR content",
    )
    i_year: int = Field(
        sa_column=Column(Integer),
        description="Inferred year, format YYYY, the document was written",
    )
    i_month: int = Field(
        sa_column=Column(Integer),
        description="Inferred month, from 1 to 12, the document was written",
    )
    i_day_number: int = Field(
        sa_column=Column(Integer),
        description="Inferred day, from 1 to 31, the document was written",
    )
    i_hour: int = Field(
        sa_column=Column(Integer),
        description="Inferred hour, from 0 to 23, the document was written",
    )
    i_minute: int = Field(
        sa_column=Column(Integer),
        description="Inferred minute, from 0 to 59, the document was written",
    )
    i_people_present_tsv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of people present when the document was written, separated by tabs",
    )
    i_people_absent_given_power_tsv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of people absent, but given power, when the document was written, separated by tabs",
    )
    i_people_absent_tsv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of people absent, when the document was written, separated by tabs",
    )
    i_secretaries_tsv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of secretaries, when the document was written, separated by tabs",
    )

    ocr_processing_details: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Details of the OCR processing, for reproducibility",
    )
    events_processing_details: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Details of the events processing, for reproducibility",
    )
