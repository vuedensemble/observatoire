import os
from huey import RedisHuey, crontab

import reflex as rx
from observatoire.schema.locality import Locality

# Queues
queue = RedisHuey(
    "vue_ensemble_huey",
    host=os.environ.get("REDIS_HOST", "localhost"),
    port=int(os.environ.get("REDIS_PORT", "6379")),
)


@queue.task()
def add_numbers(a, b):
    ret = a + b

    with rx.session() as session:
        session.add(Locality(name=f"new locality {ret}"))
        session.commit()

    return ret
