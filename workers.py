from dotenv import load_dotenv

load_dotenv()

import os

from celery import Celery

app = Celery(
    "tasks",
    broker=f"redis://{os.environ.get('REDIS_HOST')}:{os.environ.get('REDIS_PORT')}/0",
    backend=f"redis://{os.environ.get('REDIS_HOST')}:{os.environ.get('REDIS_PORT')}/0",
)


@app.task
def add(x, y):
    print("adding ", x, y)
    return x + y
