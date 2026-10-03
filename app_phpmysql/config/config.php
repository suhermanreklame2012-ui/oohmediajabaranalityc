<?php
/**
 * Konfigurasi Aktif Aplikasi
 */
$configFile = __DIR__ . '/config.local.php';
if (file_exists($configFile)) {
    return require $configFile;
}
return require __DIR__ . '/config.example.php';
