.PHONY: run
run:
	docker compose up -d --wait
	$(MAKE) -C ../b3-race up
	../.venv/bin/python run.py
