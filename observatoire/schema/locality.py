import reflex as rx

from sqlmodel import Field, Column, TEXT
from sqlalchemy.dialects.postgresql import JSONB

import pydantic

class Locality(rx.Model, table=True):
    """
    Localities (cities, regions, etc.)
    """

    id: int | None = Field(default=None, primary_key=True)
    type: str = Field(sa_column=Column(TEXT), description="One of 'city', 'region'")
    name: str = Field(sa_column=Column(TEXT), description="Locality name")
    postcode: str = Field(
        sa_column=Column(TEXT), description="Locality postcode, if any"
    )
    country_iso3: str = Field(
        sa_column=Column(TEXT), description="ISO3 code of the locality country"
    )
    website: str = Field(
        sa_column=Column(TEXT), description="Official or main website of the locality"
    )
    administrative_reporting_setup: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="A dictionary describing the reporting setup of that locality",
    )


class LocalityAdministrativeSetup(pydantic.BaseModel):
    pages_by_year: list[dict[str, list[str]]]
