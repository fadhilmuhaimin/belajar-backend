.PHONY: run
# Rekam semua bagian lab (database dibuat ulang dari nol). Satu bagian saja: make run BAGIAN=login
run:
	$(MAKE) -C ../b3-race up
	../.venv/bin/python run.py $(BAGIAN)
