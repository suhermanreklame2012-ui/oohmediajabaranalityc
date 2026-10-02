<?php
/**
 * Export MySQL SQL Dump Download
 */
$filePath = __DIR__ . '/../database.sql';
if (!file_exists($filePath)) {
    http_response_code(404);
    echo "File database.sql tidak ditemukan";
    exit;
}
header('Content-Type: application/sql');
header('Content-Disposition: attachment; filename="database_bandung_media_outdoor_mysql.sql"');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
exit;
