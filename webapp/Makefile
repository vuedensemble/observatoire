.PHONY: build up down restart logs ps seed import-all import-city import-city-dedup delete-city migrate shell-db shell-app

# Build and start all services
up:
	docker compose up -d --build

# Stop all services
down:
	docker compose down

# Restart all services
restart:
	docker compose restart

# Rebuild and restart
rebuild:
	docker compose up -d --build --force-recreate

# View logs (all services)
logs:
	docker compose logs -f

# View logs for a specific service (usage: make log s=webapp)
log:
	docker compose logs -f $(s)

# Show service status
ps:
	docker compose ps

# Run database migration
migrate:
	docker compose run --rm migrate npx drizzle-kit push --force

# Seed the database
seed:
	docker compose run --rm migrate npx tsx scripts/seed.ts

# Import all cities (usage: make import-all path=/path/to/datasets/cities)
import-all:
	docker compose run --rm -v $(path):/app/datasets/cities migrate npx tsx scripts/import-city.ts --all ./datasets/cities/

# Import a single city (usage: make import-city path=/path/to/city.json)
import-city:
	docker compose run --rm -v $(dir $(path)):/app/data migrate npx tsx scripts/import-city.ts ./data/$(notdir $(path))

# Import a single city + deduplicate (usage: make import-city-dedup path=/path/to/city.json)
import-city-dedup:
	docker compose run --rm -v $(dir $(path)):/app/data migrate npx tsx scripts/import-city.ts ./data/$(notdir $(path))
	docker compose run --rm migrate npx tsx scripts/dedup-projects.ts

# Delete a city (usage: make delete-city name=Bayonne)
delete-city:
	docker compose run --rm migrate npx tsx scripts/delete-city.ts $(name)

# Deduplicate projects
dedup:
	docker compose run --rm migrate npx tsx scripts/dedup-projects.ts

# Open MySQL shell
shell-db:
	docker compose exec db mysql -u$${MYSQL_USER} -p$${MYSQL_USER_PASSWORD} $${MYSQL_DATABASE}

# Open shell in webapp container
shell-app:
	docker compose exec webapp sh
