.PHONY: run
run:
	$(MAKE) -C ../b2-query run
	../.venv/bin/python ukur.py
	dart run cek_header.dart > output/dart-header.txt
