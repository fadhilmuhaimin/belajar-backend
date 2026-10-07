# Lab B3 · race condition & lock di Postgres 17
# Butuh: Docker, Python 3. Sekali saja: make setup
VENV := ../.venv
PY   := $(VENV)/bin/python

.PHONY: setup up run down

setup:
	python3 -m venv $(VENV) && $(VENV)/bin/pip install -q -r ../requirements.txt

up:
	docker compose up -d --wait

# Menjalankan semua skenario dan menulis ulang output/*.txt + output/*.json.
# .txt ditampilkan di docs lewat snippet; .json disalin untuk widget race.js.
run: up
	$(PY) run.py
	mkdir -p ../../docs/widgets/data/b3-race
	cp output/*.json ../../docs/widgets/data/b3-race/

down:
	docker compose down -v
