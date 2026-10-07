"""Lab B3 · Django 6.1 + PostgreSQL. Jalankan: make django"""
import os, pathlib, sys, threading
from urllib.parse import urlparse

import django
from django.conf import settings

u = urlparse(os.environ["DATABASE_URL"])
settings.configure(DATABASES={"default": {
    "ENGINE": "django.db.backends.postgresql", "NAME": u.path[1:], "USER": u.username,
    "PASSWORD": u.password, "HOST": u.hostname, "PORT": u.port,
    "OPTIONS": {"application_name": os.environ.get("APP_NAME", "django")}}})
django.setup()

from django.db import connection, models, transaction  # noqa: E402
from django.db.models import F  # noqa: E402


class Akun(models.Model):
    nama = models.TextField(primary_key=True)
    saldo = models.IntegerField()

    class Meta:
        app_label, db_table, managed = "lab", "akun", False


# --8<-- [start:transfer]
# Transaction: semua di dalam atomic() ikut batal kalau ada exception.
def transfer(dari, ke, jumlah):
    with transaction.atomic():
        Akun.objects.filter(nama=dari).update(saldo=F("saldo") - jumlah)
        Akun.objects.filter(nama=ke).update(saldo=F("saldo") + jumlah)
# --8<-- [end:transfer]


# --8<-- [start:tarik]
# Race condition: select_for_update() wajib di dalam atomic().
def tarik(nama, jumlah):
    with transaction.atomic():
        akun = Akun.objects.select_for_update().get(nama=nama)
        if akun.saldo < jumlah:
            raise ValueError("saldo tidak cukup")
        akun.saldo -= jumlah
        akun.save(update_fields=["saldo"])
# --8<-- [end:tarik]


def cetak():
    s = dict(Akun.objects.values_list("nama", "saldo"))
    print(f"budi={s['budi']} ani={s['ani']} total={sum(s.values())}")


def jalankan(jumlah):
    try:
        tarik("budi", jumlah)
        print(f"tarik {jumlah}: sukses")
    except ValueError as e:
        print(f"tarik {jumlah}: {e}")
    finally:
        connection.close()  # koneksi Django per thread


mode = sys.argv[1] if len(sys.argv) > 1 else "semua"
with connection.cursor() as c:
    c.execute((pathlib.Path(__file__).parent / "../schema.sql").read_text())
if mode in ("transfer", "semua"):
    try:
        transfer("budi", "ani", 70000)
    except Exception as e:
        print("transfer budi -> ani 70000:", type(e).__name__, str(e).splitlines()[0])
    cetak()
if mode in ("tarik", "semua"):
    ts = [threading.Thread(target=jalankan, args=(j,)) for j in (70000, 50000)]
    [t.start() for t in ts]
    [t.join() for t in ts]
    cetak()
