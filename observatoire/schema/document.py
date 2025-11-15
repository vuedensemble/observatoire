import typing

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
    i_md_from_ocr: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="The extracted OCR content",
    )

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
    i_people_present_csv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of people present when the document was written, separated by commas",
    )
    i_people_absent_given_power_csv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of people absent, but given power, when the document was written, separated by commas",
    )
    i_people_absent_csv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of people absent, when the document was written, separated by commas",
    )
    i_secretaries_csv: str = Field(
        sa_column=Column(TEXT),
        description="Inferred list of secretaries, when the document was written, separated by commas",
    )


def extract_md(md_dict: dict | None, image_strategy: typing.Literal["include_base64", "remove"]):
    if md_dict is None:
        return None
    s = ""
    for page in md_dict["pages"]:
        page_images_by_id = dict([
            (img["id"], img["image_base64"])
            for img in page.get("images", [])
        ])
        page_md = page["markdown"]
        for img_id, img_base64 in page_images_by_id.items():
            if image_strategy == "include_base64":
                page_md = page_md.replace(f"![{img_id}]({img_id})", f"![{img_id}]({img_base64})")
            elif image_strategy == "remove":
                page_md = page_md.replace(f"![{img_id}]({img_id})", "")
        s += page_md
        s += "\n"
    return s
