<?php
/**
 * Konfigurasi Database Resilient Dual Engine (SQLite / MySQL)
 * JabarOOH Enterprise Portal - oohmediabandung.com
 */

// Muat config.local.php jika tersedia (untuk override cPanel hosting)
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

// Pilihan Driver: 'mysql' (default hosting cPanel oohmediabandung.com) dengan fallback otomatis ke 'sqlite'
if (!defined('DB_DRIVER')) define('DB_DRIVER', getenv('DB_DRIVER') ?: 'mysql');

// Konfigurasi SQLite
if (!defined('SQLITE_PATH')) define('SQLITE_PATH', __DIR__ . '/../data/app.sqlite');

// Konfigurasi MySQL (cPanel oohmediabandung.com)
if (!defined('MYSQL_HOST')) define('MYSQL_HOST', getenv('MYSQL_HOST') ?: 'localhost');
if (!defined('MYSQL_PORT')) define('MYSQL_PORT', getenv('MYSQL_PORT') ?: '3306');
if (!defined('MYSQL_DATABASE')) define('MYSQL_DATABASE', getenv('MYSQL_DATABASE') ?: 'oohmediabandung_bbmoni');
if (!defined('MYSQL_USER')) define('MYSQL_USER', getenv('MYSQL_USER') ?: 'oohmediabandung_bbmoni');
if (!defined('MYSQL_PASSWORD')) define('MYSQL_PASSWORD', getenv('MYSQL_PASSWORD') ?: 'AdminOOH@2026');

// Kredensial Super Administrator Resmi
if (!defined('ADMIN_EMAIL')) define('ADMIN_EMAIL', 'suherman.reklame2012@gmail.com');
if (!defined('ADMIN_PASSWORD')) define('ADMIN_PASSWORD', 'AdminOOH@2026');
if (!defined('ADMIN_PIN')) define('ADMIN_PIN', '889900');
if (!defined('ADMIN_PHONE')) define('ADMIN_PHONE', '087822248975');

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
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            return $pdo;
        } catch (Exception $e) {
            error_log("Koneksi MySQL gagal: " . $e->getMessage());
        }
    }

    // Default Fallback: SQLite 3 (jika pdo_sqlite aktif)
    if (extension_loaded('pdo_sqlite')) {
        try {
            $sqliteFile = SQLITE_PATH;
            $isNew = !file_exists($sqliteFile);
            
            $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            
            $pdo->exec("PRAGMA journal_mode = WAL;");
            $pdo->exec("PRAGMA synchronous = NORMAL;");

            if ($isNew) {
                initSqliteSchema($pdo);
            }

            return $pdo;
        } catch (Exception $e) {
            error_log("Fallback SQLite gagal: " . $e->getMessage());
        }
    }

    // Jika driver MySQL gagal dan SQLite tidak tersedia, coba koneksi MySQL default agar error jelas
    $dsn = "mysql:host=" . MYSQL_HOST . ";port=" . MYSQL_PORT . ";dbname=" . MYSQL_DATABASE . ";charset=utf8mb4";
    return new PDO($dsn, MYSQL_USER, MYSQL_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
}

function initSqliteSchema(PDO $pdo): void {
    $schemaFile = __DIR__ . '/../database.sql';
    if (file_exists($schemaFile)) {
        $sql = file_get_contents($schemaFile);
        $pdo->exec($sql);
    }
}
