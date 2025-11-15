from observatoire.schema.locality import Locality, LocalityAdministrativeSetup

import reflex as rx
from sqlmodel import delete, select


def create_locality(
    type: str,
    name: str,
    postcode: str,
    country_iso3: str,
    website: str,
    administrative_reporting_setup: dict,
    delete_if_exists: bool = False,
):
    with rx.session() as session:
        statement = select(Locality).where(name == name)
        rows = session.exec(statement).all()
        n_rows = len(rows)
        if n_rows > 0 and delete_if_exists:
            statement = delete(Locality).where(name == name)
            session.exec(statement)
            session.commit()
        elif n_rows > 0 and not delete_if_exists:
            return False, f"{n_rows} found"

    locality = Locality(
        type=type,
        name=name,
        postcode=postcode,
        country_iso3=country_iso3,
        website=website,
        administrative_reporting_setup=administrative_reporting_setup,
    )
    with rx.session() as session:
        session.add(locality)
        session.commit()
        print("ok", locality)
        return True, locality.model_dump()


def update_locality_administrative_setup(id: int, new_administrative_reporting_setup: LocalityAdministrativeSetup):
    with rx.session() as session:
        statement = select(Locality).where(Locality.id == id)
        locality: Locality = session.exec(statement).one()
        locality.administrative_reporting_setup = new_administrative_reporting_setup
        session.add(locality)
        session.commit()
