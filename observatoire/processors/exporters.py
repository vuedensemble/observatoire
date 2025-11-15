import csv
import io

import reflex as rx
from sqlmodel import select, text


def export_documents_for_localities(locality_ids: list[int]):
    fields = ["document.id", "document.locality_id", "locality.name", "document.file_name", "document.file_extension", "document.source_url", "document.base_url", "document.i_type", "document.i_topic", "document.i_summary", "document.i_year", "document.i_month", "document.i_day_number", "document.i_hour", "document.i_minute", "document.i_people_present_csv", "document.i_people_absent_given_power_csv", "document.i_people_absent_csv", "document.i_secretaries_csv"]

    with rx.session() as session:
        query = f"""
        SELECT {", ".join(fields)}
        FROM document
        JOIN locality
        ON document.locality_id = locality.id
        WHERE document.locality_id IN :locality_ids
        """
        results_raw = session.connection().execute(text(query), {"locality_ids": tuple(locality_ids)})
        results = [
            dict(zip(fields, result_raw))
            for result_raw in results_raw
        ]
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for result_dict in results:
        writer.writerow(result_dict)
    return output.getvalue().encode("utf-8-sig")
