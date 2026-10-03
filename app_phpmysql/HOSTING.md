# Panduan Deployment ke Hosting (cPanel / DirectAdmin / VPS)

### 1. Persyaratan Server
- PHP Version: **PHP 8.4**
- Ekstensi: `pdo`, `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `json`, `session`
- Web Server: **Apache** dengan modul `mod_rewrite` aktif
- Database: **MySQL 8.0+** atau **MariaDB 10.5+**

### 2. Langkah-Langkah Deployment ke cPanel:
1. **Upload File**:
   - Kompres seluruh isi folder `app_phpmysql/` menjadi file `.zip`.
   - Buka File Manager cPanel, masuk ke folder `public_html/`.
   - Upload dan ekstrak file zip tersebut.
2. **Setup Database**:
   - Buat database `oohmediabandung_bbmoni` dan user database di menu *MySQL Databases*.
   - Buka *phpMyAdmin*, pilih database tersebut, lalu impor file `database/database.sql`.
3. **Konfigurasi**:
   - Buat file `config/config.local.php` (atau edit `config/config.php`) dan isi kredensial MySQL cPanel:
   ```php
   <?php
   return [
       'db' => [
           'host' => 'localhost',
           'port' => 3306,
           'database' => 'oohmediabandung_bbmoni',
           'username' => 'oohmediabandung_bbmoni',
           'password' => 'AdminOOH@2026',
           'charset' => 'utf8mb4',
           'collation' => 'utf8mb4_unicode_ci'
       ]
   ];
   ```
4. **Izin Berkas (File Permissions)**:
   - Folder: `755`
   - File: `644`
   - Folder `storage/logs/` dan `public/uploads/`: `775` (dapat ditulis web server).
5. **Verifikasi**:
   Buka `https://oohmediabandung.com/` di browser.
