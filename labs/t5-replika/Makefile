.PHONY: up run down
up:
	docker compose up -d --wait primary
	docker compose up -d replica
run: up
	../.venv/bin/python run.py
down:
	docker compose down -v
