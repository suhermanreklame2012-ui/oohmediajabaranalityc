<?php
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
