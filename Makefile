.PHONY : api
api:
	@echo "start api"
	@pnpm run dev:api

.PHONY : ui
ui:
	@echo "start ui"
	@pnpm run dev:ui

.PHONY: up
up:
	docker compose -f ./docker-compose.dev.yml up -d

.PHONY: down
down:
	docker compose -f ./docker-compose.dev.yml down

.PHONY: stop
stop:
	docker compose -f ./docker-compose.dev.yml stop

.PHONY: install
install:
	npm install

.PHONY: reset
reset:
	docker stop $$(docker ps -a -q) \
	&& docker rm $$(docker ps -a -q) \
	&& docker rmi $$(docker images -q) \
	&& docker volume rm $$(docker volume ls -q) \
	&& docker system prune -a -f

