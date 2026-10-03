import fs from 'fs';
import path from 'path';
import { INITIAL_BILLBOARD_SPOTS } from '../src/data/jabarData';

const ROOT_DIR = path.resolve('.');
const TARGET_DIR = path.join(ROOT_DIR, 'app_phpmysql');

console.log('🚀 Generating PHP Native 8.4 + MySQL 8.0 / MariaDB Migration Project in app_phpmysql/ ...');

// 1. Safe Idempotent Directory Preparation
if (fs.existsSync(TARGET_DIR)) {
  const backupDir = path.join(ROOT_DIR, `app_phpmysql_backup_${Date.now()}`);
  console.log(`ℹ️ Existing app_phpmysql found. Preserving safety backup to ${path.basename(backupDir)}`);
  fs.cpSync(TARGET_DIR, backupDir, { recursive: true });
}

const SUBDIRS = [
  'app/Controllers',
  'app/Models',
  'app/Middleware',
  'app/Helpers',
  'config',
  'database',
  'views/layouts',
  'views/dashboard',
  'views/spots',
  'views/leads',
  'views/reports',
  'views/auth',
  'views/users',
  'views/errors',
  'routes',
  'public/assets/css',
  'public/assets/js',
  'public/uploads',
  'storage/logs',
  'storage/cache'
];

for (const sub of SUBDIRS) {
  fs.mkdirSync(path.join(TARGET_DIR, sub), { recursive: true });
}

// Helper to write files
function writeFile(relativePath: string, content: string) {
  const fullPath = path.join(TARGET_DIR, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trimStart(), 'utf8');
}

// -----------------------------------------------------------------------------
// 2. CONFIGURATION & DATABASE CONNECTION
// -----------------------------------------------------------------------------
writeFile('config/config.example.php', `<?php
/**
 * Konfigurasi Utama Aplikasi - PHP Native 8.4 + MySQL 8.0 / MariaDB
 * JabarOOH Enterprise Portal
 */

return [
    'app' => [
        'name' => 'JabarOOH Media Analytics',
        'env' => 'production', // 'development' atau 'production'
        'debug' => false,
        'url' => 'https://oohmediabandung.com',
        'timezone' => 'Asia/Jakarta',
        'key' => 'base64:JabarOOHSecretKeyForSessionSecurity2026=='
    ],
    'db' => [
        'driver' => 'mysql',
        'host' => 'localhost',
        'port' => 3306,
        'database' => 'oohmediabandung_bbmoni',
        'username' => 'oohmediabandung_bbmoni',
        'password' => 'AdminOOH@2026',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
    ],
    'mail' => [
        'admin_email' => 'suherman.reklame2012@gmail.com',
        'admin_name' => 'Suherman Reklame'
    ]
];
`);

writeFile('config/config.php', `<?php
/**
 * Konfigurasi Aktif Aplikasi
 */
$configFile = __DIR__ . '/config.local.php';
if (file_exists($configFile)) {
    return require $configFile;
}
return require __DIR__ . '/config.example.php';
`);

writeFile('config/database.php', `<?php
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
`);

import { generateHelpersAndMiddleware } from './generators/generateHelpersAndMiddleware';
import { generateModels } from './generators/generateModels';
import { generateControllersAndRouter } from './generators/generateControllersAndRouter';
import { generateViews } from './generators/generateViews';
import { generateDatabaseAndDocs } from './generators/generateDatabaseAndDocs';
import { execSync } from 'child_process';

console.log('✅ Configuration & Database layers generated.');

// Execute Modular Generators
console.log('📦 Generating Helpers & Middlewares...');
generateHelpersAndMiddleware(TARGET_DIR);

console.log('📦 Generating Models...');
generateModels(TARGET_DIR);

console.log('📦 Generating Controllers & Router...');
generateControllersAndRouter(TARGET_DIR);

console.log('📦 Generating Views & Layouts...');
generateViews(TARGET_DIR);

console.log('📦 Generating MySQL Database Schema & Documentation...');
generateDatabaseAndDocs(TARGET_DIR);

// Package ZIP archive for easy deployment
try {
  console.log('📦 Compressing app_phpmysql to app_phpmysql.zip for 1-Click cPanel Upload...');
  execSync('python3 -m zipfile -c app_phpmysql.zip app_phpmysql', { stdio: 'inherit' });
  execSync('tar -czf app_phpmysql.tar.gz app_phpmysql', { stdio: 'inherit' });
  console.log('✅ Generated app_phpmysql.zip & app_phpmysql.tar.gz');
} catch (err: any) {
  console.warn('⚠️ Archive compression notice:', err.message);
}

console.log('🎉 Migration to app_phpmysql (PHP Native 8.4 + MySQL 8.0) completed successfully!');
