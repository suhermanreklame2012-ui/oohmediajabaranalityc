<?php
/**
 * Konfigurasi Database Resilient Dual Engine (SQLite / MySQL)
 * JabarOOH Enterprise Portal
 */

// Pilihan Driver: 'sqlite' (default tanpa setup) atau 'mysql'
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'sqlite');

// Konfigurasi SQLite
define('SQLITE_PATH', __DIR__ . '/../data/app.sqlite');

// Konfigurasi MySQL (Untuk XAMPP, cPanel, atau Laragon)
define('MYSQL_HOST', getenv('MYSQL_HOST') ?: '127.0.0.1');
define('MYSQL_PORT', getenv('MYSQL_PORT') ?: '3306');
define('MYSQL_DATABASE', getenv('MYSQL_DATABASE') ?: 'jabarooh_db');
define('MYSQL_USER', getenv('MYSQL_USER') ?: 'root');
define('MYSQL_PASSWORD', getenv('MYSQL_PASSWORD') ?: '');

// Kredensial Super Administrator Resmi
define('ADMIN_EMAIL', 'suherman.reklame2012@gmail.com');
define('ADMIN_PASSWORD', 'AdminOOH@2026');
define('ADMIN_PIN', '889900');
define('ADMIN_PHONE', '087822248975');

/**
 * Mendapatkan koneksi PDO Database dengan Fallback Otomatis
 */
function getDbConnection(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $driver = DB_DRIVER;

    if ($driver === 'mysql') {
        try {
            $dsn = "mysql:host=" . MYSQL_HOST . ";port=" . MYSQL_PORT . ";dbname=" . MYSQL_DATABASE . ";charset=utf8mb4";
            $pdo = new PDO($dsn, MYSQL_USER, MYSQL_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 3
            ]);
            return $pdo;
        } catch (Exception $e) {
            error_log("Koneksi MySQL gagal, beralih ke SQLite lokal: " . $e->getMessage());
            // Fallback ke SQLite
        }
    }

    // Default: SQLite 3
    $sqliteFile = SQLITE_PATH;
    $isNew = !file_exists($sqliteFile);
    
    $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    // Aktifkan mode WAL untuk performa tinggi
    $pdo->exec("PRAGMA journal_mode = WAL;");
    $pdo->exec("PRAGMA synchronous = NORMAL;");

    if ($isNew) {
        initSqliteSchema($pdo);
    }

    return $pdo;
}

function initSqliteSchema(PDO $pdo): void {
    $schemaFile = __DIR__ . '/../database.sql';
    if (file_exists($schemaFile)) {
        $sql = file_get_contents($schemaFile);
        $pdo->exec($sql);
    }
}
