from dotenv import load_dotenv

load_dotenv()

import os

import reflex as rx

# Database
db_url = f"postgresql://{os.environ.get('POSTGRES_USER')}:{os.environ.get('POSTGRES_PASSWORD')}@{os.environ.get('POSTGRES_HOST')}:{os.environ.get('POSTGRES_PORT')}/{os.environ.get('POSTGRES_DB')}"


# Reflex config
config = rx.Config(
    app_name="observatoire",
    db_url=db_url,
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ],
)
