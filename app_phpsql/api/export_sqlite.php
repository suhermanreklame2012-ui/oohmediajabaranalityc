<?php
/**
 * Export SQLite Database File / Dump Download
 */
$sqlitePath = __DIR__ . '/../data/app.sqlite';
$sqlPath = __DIR__ . '/../database.sql';

if (file_exists($sqlitePath)) {
    header('Content-Type: application/x-sqlite3');
    header('Content-Disposition: attachment; filename="database_bandung_media_outdoor_sqlite.sqlite"');
    header('Content-Length: ' . filesize($sqlitePath));
    readfile($sqlitePath);
    exit;
} else if (file_exists($sqlPath)) {
    header('Content-Type: application/sql');
    header('Content-Disposition: attachment; filename="database_bandung_media_outdoor_sqlite.sql"');
    header('Content-Length: ' . filesize($sqlPath));
    readfile($sqlPath);
    exit;
} else {
    http_response_code(404);
    echo "Database belum diinisialisasi";
    exit;
}
