# Panduan Instalasi Lokal (XAMPP / Laragon / PHP CLI)

1. Pastikan terpasang **PHP 8.4+** dan **MySQL 8.0 / MariaDB**.
2. Buat database baru di MySQL:
   ```sql
   CREATE DATABASE oohmediabandung_bbmoni;
   ```
3. Impor skema dan data awal dari `database/database.sql`:
   ```bash
   mysql -u root -p oohmediabandung_bbmoni < database/database.sql
   ```
4. Salin file konfigurasi:
   ```bash
   cp config/config.example.php config/config.local.php
   ```
   Sesuaikan username dan password database di `config/config.local.php`.
5. Jalankan server lokal:
   ```bash
   php -S localhost:8000
   ```
6. Buka di browser: `http://localhost:8000`
