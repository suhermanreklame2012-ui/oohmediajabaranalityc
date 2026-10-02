# 🚀 Panduan Deploy & Menjalankan JabarOOH di Localhost

Aplikasi **JabarOOH - Dashboard Performa Reklame Jawa Barat** telah siap dideploy di komputer lokal (**Localhost**) Anda dengan 2 metode yang sangat fleksibel:
1. **Metode 1 (Paling Mudah)**: Localhost Node.js / Express + SQLite (Langsung jalan dengan 1-klik).
2. **Metode 2**: Localhost PHP 8.4 / XAMPP / Laragon + SQLite / MySQL (Hasil migrasi folder `app_phpsql/`).

---

## 🔑 Kredensial Keamanan Sistem (Super Administrator)
- **Nama Pengguna**: Suherman Reklame
- **Email / Username**: `suherman.reklame2012@gmail.com` (atau `suherman`)
- **Nomor Telepon**: `087822248975`
- **Kata Sandi**: `AdminOOH@2026`
- **PIN Keamanan Master**: `889900`
- *(Tersedia tombol pintas **"Masuk Instan (Sandi Resmi)"** di layar pembuka untuk login cepat tanpa mengetik).*

---

## 💻 METODE 1: Jalankan Langsung di Localhost (Node.js & Express)

Metode ini menjalankan server full-stack terintegrasi dengan database SQLite lokal.

### Langkah-langkah:
1. Pastikan komputer Anda telah terpasang **Node.js (versi 18 ke atas)**:
   - Cek di terminal/CMD: `node -v`
   - Jika belum ada, unduh di [https://nodejs.org/](https://nodejs.org/)

2. **Jalankan Aplikasi**:
   - **Di Windows**: Cukup **Double-Click** file `start-localhost.bat` yang ada di folder root proyek.
   - **Di Mac / Linux**: Buka terminal dan jalankan:
     ```bash
     chmod +x start-localhost.sh
     ./start-localhost.sh
     ```
   - **Atau manual melalui Terminal / Command Prompt**:
     ```bash
     npm install
     npm run dev
     ```

3. **Buka di Browser**:
   - Akses: [http://localhost:3000](http://localhost:3000)
   - Masukkan kata sandi `AdminOOH@2026` atau klik **"Masuk Instan (Sandi Resmi)"**.
   - Selesai! Seluruh data 77 titik reklame, peta interaktif, kalkulator ROI, AI Pipeline, dan optimasi rute logistik langsung aktif secara lokal.

---

## 🐘 METODE 2: Deploy di Localhost PHP / XAMPP / Laragon (`app_phpsql`)

Seluruh sistem, database, dan antarmuka telah dimigrasikan ke dalam folder `app_phpsql/` dengan teknologi **Zero-Config Resilient Dual Engine (PHP 8.4 + SQLite 3 / MySQL)**.

### Langkah-langkah di XAMPP / Laragon:
1. **Salin Folder Proyek**:
   - Salin seluruh isi folder `app_phpsql/` ke direktori web server lokal Anda:
     * **XAMPP**: `C:\xampp\htdocs\jabarooh\`
     * **Laragon**: `C:\laragon\www\jabarooh\`
     * **Linux / Mac (Apache)**: `/var/www/html/jabarooh/`

2. **Inisialisasi Database 1-Klik**:
   - Buka browser dan akses:
     ```
     http://localhost/jabarooh/setup.php
     ```
   - Klik tombol hijau: **"🚀 Seed / Inisialisasi Database 77 Titik Reklame"**.
   - Database SQLite lokal (`app_phpsql/data/app.sqlite`) akan dibuat dan diisi otomatis tanpa perlu konfigurasi MySQL tambahan!

3. **Buka Aplikasi Utama**:
   - Dashboard Web: `http://localhost/jabarooh/`
   - Panel Kontrol Admin: `http://localhost/jabarooh/admin/`

4. *(Opsional)* **Jika Ingin Menggunakan MySQL XAMPP / phpMyAdmin**:
   - Buka `http://localhost/phpmyadmin/`, buat database bernama `jabarooh_db`.
   - Impor file `database.sql` yang ada di dalam folder `app_phpsql/`.
   - Ubah driver di `app_phpsql/config/config.php`:
     ```php
     define('DB_DRIVER', 'mysql');
     define('MYSQL_HOST', '127.0.0.1');
     define('MYSQL_DATABASE', 'jabarooh_db');
     define('MYSQL_USER', 'root');
     define('MYSQL_PASSWORD', ''); // Kosongkan jika default XAMPP
     ```

---

## 🔄 Perintah Terminal untuk Memperbarui Migrasi
Kapan pun Anda melakukan perubahan pada tampilan web atau data titik reklame, jalankan perintah ini di terminal:

```bash
# Melakukan build ulang dan menyinkronkan seluruh aset + database ke folder app_phpsql/
npm run migrate:all
```

---

## 📂 Struktur File Migrasi Localhost
```text
├── start-localhost.bat       <- File 1-klik untuk menjalankan server di Windows
├── start-localhost.sh        <- File 1-klik untuk Mac / Linux
├── .env.local                <- Konfigurasi environment localhost
├── database.sqlite           <- Database SQLite lokal aktif
├── app_phpsql/               <- Paket lengkap mandiri PHP 8.4
│   ├── index.php             <- Entry point dengan proteksi Anti-Blank Page
│   ├── setup.php             <- Wizard inisialisasi database 1-klik
│   ├── database.sql          <- Skema dan data lengkap SQL
│   ├── .htaccess             <- Routing SPA dan pengamanan file database
│   ├── config/config.php     <- Konfigurasi koneksi dual-engine (SQLite & MySQL)
│   ├── data/                 <- Direktori database SQLite dan initial_spots.json
│   ├── api/                  <- Endpoint REST API (spots, auth, leads, health)
│   └── admin/                <- Panel kontrol database
└── dist/                     <- Bundle frontend hasil kompilasi Vite
```
