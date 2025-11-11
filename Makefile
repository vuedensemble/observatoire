run:
	uv run --env-file .env reflex run

start-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml up -d

stop-dev-services:
	docker compose --env-file .env -f docker-compose.services.yml -f docker-compose.dev.yml down
