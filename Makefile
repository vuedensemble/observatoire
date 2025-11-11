format:
	uv run ruff format

run-app:
	uv run --env-file .env reflex run

run-workers:
	uv run huey_consumer.py workers.queue -w 2

start-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml up -d

stop-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml down
