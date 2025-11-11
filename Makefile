# Formatting
format:
	uv run ruff format

# DB migration
migrate:
	uv run reflex db migrate

# Individual services to start, in the following order
start-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml up -d

run-app: migrate
	uv run --env-file .env reflex run

run-workers:
	uv run celery -A workers worker

run-celery-dashboard:
	uv run celery -A workers flower

# Stop services
stop-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml down
