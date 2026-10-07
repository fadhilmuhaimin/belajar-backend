<?php
// Lab B3 · PHP 8.5 + illuminate/database 13 (query builder Laravel, tanpa framework penuh).
// Jalankan: make laravel
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$u = parse_url(getenv('DATABASE_URL'));
$capsule = new Capsule;
$capsule->addConnection(['driver' => 'pgsql', 'host' => $u['host'], 'port' => $u['port'],
    'database' => ltrim($u['path'], '/'), 'username' => $u['user'], 'password' => $u['pass'],
    'application_name' => getenv('APP_NAME') ?: 'laravel']);
$capsule->setAsGlobal();
$db = Capsule::connection();

// --8<-- [start:transfer]
// Transaction: exception di dalam closure -> rollback otomatis, lalu exception dilempar ulang.
function transfer($db, string $dari, string $ke, int $jumlah): void {
    $db->transaction(function () use ($db, $dari, $ke, $jumlah) {
        $db->table('akun')->where('nama', $dari)->decrement('saldo', $jumlah);
        $db->table('akun')->where('nama', $ke)->increment('saldo', $jumlah);
    });
}
// --8<-- [end:transfer]

// --8<-- [start:tarik]
// Race condition: lockForUpdate() = SELECT ... FOR UPDATE, di dalam transaction.
function tarik($db, string $nama, int $jumlah): void {
    $db->transaction(function () use ($db, $nama, $jumlah) {
        $akun = $db->table('akun')->where('nama', $nama)->lockForUpdate()->first();
        if ($akun->saldo < $jumlah) {
            throw new RuntimeException('saldo tidak cukup');
        }
        $db->table('akun')->where('nama', $nama)->update(['saldo' => $akun->saldo - $jumlah]);
    });
}
// --8<-- [end:tarik]

function cetak($db): void {
    $s = $db->table('akun')->pluck('saldo', 'nama');
    echo "budi={$s['budi']} ani={$s['ani']} total=" . $s->sum() . "\n";
}

// PHP tidak berbagi memori antar request: setiap penarikan adalah proses terpisah.
// php main.php transfer | php main.php tarik 70000 | php main.php cetak
match ($argv[1] ?? '') {
    'transfer' => (function () use ($db) {
        $db->unprepared(file_get_contents(__DIR__ . '/../schema.sql'));
        try {
            transfer($db, 'budi', 'ani', 70000);
        } catch (Throwable $e) {
            echo 'transfer budi -> ani 70000: ' . strtok($e->getMessage(), "\n") . "\n";
        }
        cetak($db);
    })(),
    'tarik' => (function () use ($db, $argv) {
        try {
            tarik($db, 'budi', (int) $argv[2]);
            echo "tarik {$argv[2]}: sukses\n";
        } catch (RuntimeException $e) {
            echo "tarik {$argv[2]}: {$e->getMessage()}\n";
        }
    })(),
    'cetak' => cetak($db),
};
