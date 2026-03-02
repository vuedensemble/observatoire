.PHONY: build up down restart logs ps seed import-all import-city import-city-dedup delete-city migrate migrate-local shell-db shell-app db-up db-dev db-down db-logs db-ps

DB_COMPOSE = docker compose -f docker-compose.db.yml
DB_DEV_COMPOSE = docker compose -f docker-compose.db.yml -f docker-compose.db.dev.yml
APP_COMPOSE = docker compose -f docker-compose.db.yml -f docker-compose.yml

# --- Database (standalone) ---

# Start the database (no port exposed)
db-up:
	$(DB_COMPOSE) up -d

# Start the database for local dev (exposed on localhost:3306)
db-dev:
	$(DB_DEV_COMPOSE) up -d

# Stop the database
db-down:
	$(DB_COMPOSE) down

# View database logs
db-logs:
	$(DB_COMPOSE) logs -f

# Show database status
db-ps:
	$(DB_COMPOSE) ps

# --- App services (requires DB running) ---

# Build and start app services
up:
	$(APP_COMPOSE) up -d --build

# Stop app services
down:
	$(APP_COMPOSE) down

# Restart app services
restart:
	$(APP_COMPOSE) restart

# Rebuild and restart
rebuild:
	$(APP_COMPOSE) up -d --build --force-recreate

# View logs (all app services)
logs:
	$(APP_COMPOSE) logs -f

# View logs for a specific service (usage: make log s=webapp)
log:
	$(APP_COMPOSE) logs -f $(s)

# Show service status
ps:
	$(APP_COMPOSE) ps

# --- Database operations ---

# Run database migration (via Docker)
migrate:
	$(APP_COMPOSE) run --rm migrate npx drizzle-kit push --force

# Run database migration locally (no Docker, uses .env)
migrate-local:
	npx drizzle-kit push --force

# Seed the database
seed:
	$(APP_COMPOSE) run --rm migrate npx tsx scripts/seed.ts

# Import all cities (usage: make import-all path=/path/to/datasets/cities)
import-all:
	$(APP_COMPOSE) run --rm -v $(path):/app/datasets/cities migrate npx tsx scripts/import-city.ts --all ./datasets/cities/

# Import a single city (usage: make import-city path=/path/to/Anglet)
import-city:
	$(eval _p := $(patsubst %/,%,$(path)))
	$(APP_COMPOSE) run --rm -v $(dir $(_p)):/app/data migrate npx tsx scripts/import-city.ts ./data/$(notdir $(_p))

# Import a single city + deduplicate (usage: make import-city-dedup path=/path/to/Anglet slug=anglet)
import-city-dedup:
	$(eval _p := $(patsubst %/,%,$(path)))
	$(APP_COMPOSE) run --rm -v $(dir $(_p)):/app/data migrate npx tsx scripts/import-city.ts ./data/$(notdir $(_p))
	$(APP_COMPOSE) run --rm migrate npx tsx scripts/dedup-projects.ts $(slug)

# Delete a city (usage: make delete-city name=Bayonne)
delete-city:
	$(APP_COMPOSE) run --rm migrate npx tsx scripts/delete-city.ts $(name)

# Deduplicate projects (usage: make dedup slug=anglet  OR  make dedup slug=--all)
dedup:
	$(APP_COMPOSE) run --rm migrate npx tsx scripts/dedup-projects.ts $(slug)

# Open MySQL shell
shell-db:
	$(DB_COMPOSE) exec db mysql -u$${MYSQL_USER} -p$${MYSQL_PASSWORD} $${MYSQL_DATABASE}

# Open shell in webapp container
shell-app:
	$(APP_COMPOSE) exec webapp sh
