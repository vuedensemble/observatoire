format:
	uv run ruff format

migrate:
	uv run reflex db migrate

run-app: migrate
	uv run --env-file .env reflex run

run-workers:
	uv run celery -A workers worker

start-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml up -d

stop-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml down
