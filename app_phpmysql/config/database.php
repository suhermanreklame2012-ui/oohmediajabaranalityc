<?php
/**
 * PDO Singleton Database Connection (MySQL 8.0+ / MariaDB)
 * Strict prepared statements & security flags
 */

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $config = require __DIR__ . '/config.php';
            $db = $config['db'];

            $dsn = sprintf(
                "mysql:host=%s;port=%d;dbname=%s;charset=%s",
                $db['host'],
                $db['port'],
                $db['database'],
                $db['charset']
            );

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . $db['charset'] . " COLLATE " . $db['collation']
            ];

            try {
                self::$instance = new PDO($dsn, $db['username'], $db['password'], $options);
            } catch (PDOException $e) {
                error_log("Database connection error: " . $e->getMessage());
                if (($config['app']['debug'] ?? false) === true) {
                    throw $e;
                }
                http_response_code(500);
                require __DIR__ . '/../views/errors/500.php';
                exit;
            }
        }
        return self::$instance;
    }
}
