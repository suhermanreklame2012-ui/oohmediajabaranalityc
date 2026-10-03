import fs from 'fs';
import path from 'path';
import { INITIAL_BILLBOARD_SPOTS } from '../../src/data/jabarData';

export function generateDatabaseAndDocs(targetDir: string) {
  const writeFile = (rel: string, content: string) => {
    const full = path.join(targetDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content.trimStart(), 'utf8');
  };

  // 1. Generate database/database.sql
  function escapeSql(str: any): string {
    if (str === null || str === undefined) return '';
    return String(str).replace(/'/g, "''").replace(/\\/g, '\\\\');
  }

  function slugify(text: string): string {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  let sql = `-- ============================================================================
-- JABAROOH MEDIA NETWORK - BASIS DATA MYSQL 8.0+ / MARIADB
-- Pengelola: Suherman Reklame (suherman.reklame2012@gmail.com / 087822248975)
-- Target Host: oohmediabandung.com
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABEL PENGGUNA & RBAC
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) DEFAULT NULL,
    role ENUM('Super Admin', 'Operator Lapangan', 'Pengelola Titik Reklame', 'Auditor Bapenda & Pajak') NOT NULL DEFAULT 'Super Admin',
    agency_or_company VARCHAR(150) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    security_pin VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED AKUN UTAMA SUPER ADMIN (Suherman Reklame - Password: AdminOOH@2026)
INSERT INTO users (id, username, email, full_name, phone_number, role, agency_or_company, password_hash, security_pin)
VALUES 
('usr_suherman', 'suherman', 'suherman.reklame2012@gmail.com', 'Suherman Reklame', '087822248975', 'Super Admin', 'Pengelola Solusi Reklame OOH & DOOH Jawa Barat', '$2y$12$f0Tq14b434oGqV0KkJtEaejNl2O5mC1iH4jV1aA0mD8sF6hJ2iK1u', '889900'),
('usr_operator', 'operator_jabar', 'operator@oohmediabandung.com', 'Operator Lapangan Bandung', '081234567890', 'Operator Lapangan', 'Divisi Operasional Lapangan Jabar', '$2y$12$f0Tq14b434oGqV0KkJtEaejNl2O5mC1iH4jV1aA0mD8sF6hJ2iK1u', '123456'),
('usr_auditor', 'auditor_bapenda', 'auditor@bapenda.jabarprov.go.id', 'Tim Audit Pajak Reklame Jabar', '081987654321', 'Auditor Bapenda & Pajak', 'Badan Pendapatan Daerah Jawa Barat', '$2y$12$f0Tq14b434oGqV0KkJtEaejNl2O5mC1iH4jV1aA0mD8sF6hJ2iK1u', '654321')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. TABEL TITIK REKLAME (SPOTS)
CREATE TABLE IF NOT EXISTS spots (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    regency VARCHAR(100) NOT NULL,
    district VARCHAR(100) DEFAULT NULL,
    address TEXT NOT NULL,
    road_name VARCHAR(150) NOT NULL,
    road_type VARCHAR(100) NOT NULL,
    corridor_type VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    width_m DECIMAL(6,2) NOT NULL,
    height_m DECIMAL(6,2) NOT NULL,
    area_m2 DECIMAL(8,2) NOT NULL,
    sides INT DEFAULT 1,
    orientation VARCHAR(50) DEFAULT 'Frontal',
    viewing_distance_m DECIMAL(6,2) DEFAULT 120.0,
    daily_gross_reach INT DEFAULT 50000,
    vac_daily INT DEFAULT 35000,
    avg_dwell_time_sec DECIMAL(5,1) DEFAULT 15.0,
    avg_speed_kmh DECIMAL(5,1) DEFAULT 30.0,
    visibility_score DECIMAL(5,1) DEFAULT 8.5,
    effectiveness_score DECIMAL(5,1) DEFAULT 80.0,
    clutter_level VARCHAR(50) DEFAULT 'Sedang',
    occupancy_status ENUM('Occupied', 'Available', 'Maintenance', 'Reserved') NOT NULL DEFAULT 'Available',
    current_brand VARCHAR(150) DEFAULT '',
    rate_per_month_idr BIGINT DEFAULT 35000000,
    cpm_idr DECIMAL(10,2) DEFAULT 18500.0,
    lighting_type VARCHAR(100) DEFAULT 'Frontlight LED',
    facing_direction VARCHAR(100) DEFAULT 'Arah Pusat Kota',
    target_demographics TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_spots_slug (slug),
    INDEX idx_spots_regency (regency),
    INDEX idx_spots_status (occupancy_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL PIPELINE LEADS (CRM)
CREATE TABLE IF NOT EXISTS crm_leads (
    id VARCHAR(50) PRIMARY KEY,
    client_name VARCHAR(150) NOT NULL,
    brand_name VARCHAR(150) DEFAULT NULL,
    email VARCHAR(150) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    spot_id VARCHAR(50) DEFAULT NULL,
    budget_idr BIGINT DEFAULT 0,
    campaign_duration_months INT DEFAULT 1,
    status ENUM('Baru', 'Dihubungi', 'Negosiasi', 'Deal / Aktif', 'Batal') NOT NULL DEFAULT 'Baru',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lead_status (status),
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED 32 TITIK REKLAME JAWA BARAT
`;

  for (const s of INITIAL_BILLBOARD_SPOTS) {
    const slug = slugify(`${s.code}-${s.name}`);
    const corridor = (s as any).corridorType || 'Jalur Komersial & Retail';
    sql += `INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    '${escapeSql(s.id)}', '${escapeSql(s.code)}', '${escapeSql(s.name)}', '${escapeSql(slug)}', '${escapeSql(s.regency)}', '${escapeSql(s.district || '')}',
    '${escapeSql(s.address)}', '${escapeSql(s.roadName)}', '${escapeSql(s.roadType)}', '${escapeSql(corridor)}',
    ${s.coordinates.lat}, ${s.coordinates.lng}, '${escapeSql(s.type)}',
    ${s.dimensions.width}, ${s.dimensions.height}, ${s.dimensions.areaM2}, ${s.dimensions.sides || 1}, '${escapeSql(s.orientation)}',
    ${s.viewingDistanceM}, ${s.dailyGrossReach}, ${s.vacDaily}, ${s.avgDwellTimeSec}, ${s.avgSpeedKmh},
    ${s.visibilityScore}, ${s.effectivenessScore}, '${escapeSql(s.clutterLevel)}', '${escapeSql(s.occupancyStatus)}', '${escapeSql(s.currentBrand || '')}',
    ${s.ratePerMonthIdr || 35000000}, ${s.cpmIdr || 18500}, '${escapeSql(s.lightingType || 'Frontlight LED')}', '${escapeSql(s.facingDirection || 'Arah Pusat Kota')}',
    '${escapeSql(s.targetDemographics || 'SES A/B')}'
) ON DUPLICATE KEY UPDATE name=VALUES(name);\n`;
  }

  sql += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;
  writeFile('database/database.sql', sql);

  // 2. Root index.php & .htaccess
  writeFile('index.php', `<?php
/**
 * JabarOOH Media Network - Front Controller (PHP Native 8.4)
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/app/Helpers/Security.php';
require_once __DIR__ . '/app/Helpers/Session.php';
require_once __DIR__ . '/app/Helpers/View.php';
require_once __DIR__ . '/app/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/app/Middleware/RoleMiddleware.php';
require_once __DIR__ . '/app/Middleware/CsrfMiddleware.php';
require_once __DIR__ . '/routes/Router.php';

// Set production security headers
Security::setSecurityHeaders();

// Initialize Session
Session::init();

// Validate CSRF for POST / PUT / DELETE
CsrfMiddleware::validate();

// Route Dispatching
require_once __DIR__ . '/app/Controllers/DashboardController.php';
require_once __DIR__ . '/app/Controllers/SpotController.php';
require_once __DIR__ . '/app/Controllers/AuthController.php';
require_once __DIR__ . '/app/Controllers/LeadController.php';
require_once __DIR__ . '/app/Controllers/ReportController.php';
require_once __DIR__ . '/app/Controllers/UserController.php';
require_once __DIR__ . '/app/Controllers/ApiController.php';

$router = new Router();

// Public Routes
$router->get('/', [DashboardController::class, 'index']);
$router->get('/dashboard', [DashboardController::class, 'index']);
$router->get('/titik-reklame', [SpotController::class, 'index']);
$router->get('/titik-reklame/{slug}', [SpotController::class, 'show']);
$router->get('/laporan', [ReportController::class, 'index']);
$router->post('/leads/submit', [LeadController::class, 'store']);

// Authentication Routes
$router->get('/login', [AuthController::class, 'loginForm']);
$router->post('/login', [AuthController::class, 'login']);
$router->get('/logout', [AuthController::class, 'logout']);

// Admin & Staff Protected Routes
$router->get('/leads', [LeadController::class, 'index']);
$router->get('/admin/spots/create', [SpotController::class, 'create']);
$router->post('/admin/spots/store', [SpotController::class, 'store']);

// Super Admin Exclusive Routes (RBAC Enforced)
$router->get('/admin/users', [UserController::class, 'index']);

// API Endpoints
$router->get('/api/spots', [ApiController::class, 'spots']);
$router->get('/api/stats', [ApiController::class, 'stats']);
$router->get('/api/database/export/mysql', [ApiController::class, 'exportMysql']);

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$router->dispatch($uri, $method);
`);

  writeFile('.htaccess', `# Apache mod_rewrite for PHP Native 8.4 MVC & SEO-Friendly URLs
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # 1. Protect sensitive files, databases, configurations, and logs
    RewriteRule ^config/ - [F,L]
    RewriteRule ^database/ - [F,L]
    RewriteRule ^storage/logs/ - [F,L]
    RewriteRule ^\\.env.* - [F,L]
    RewriteRule \\.(sql|log|bak|ini|sh|json)$ - [F,L]

    # 2. Allow direct access to existing assets and files
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # 3. Route all clean and SEO-friendly URLs to front-controller index.php
    RewriteRule ^ index.php [L,QSA]
</IfModule>

# Disable Directory Listing
Options -Indexes

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`);

  // Protect Uploads Directory from PHP Execution
  writeFile('public/uploads/.htaccess', `# Disable PHP execution in uploads directory
<FilesMatch "\\.(php|phtml|php3|php4|php5|php7|php8|phar)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>
Options -Indexes
`);

  // 3. Documentation
  writeFile('README.md', `# JabarOOH Media Network - PHP Native 8.4 + MySQL 8.0 / MariaDB

Sistem Analisis Performa dan Inventaris Media Luar Ruang (OOH/DOOH) Jawa Barat berbasis **PHP Native 8.4 murni** tanpa framework, dirancang aman untuk production hosting.

## Fitur Utama
1. **Interactive GIS Map & KPI Summary**: Peta interaktif Leaflet.js dengan sebaran 32 titik reklame Jawa Barat beserta kartu ringkasan KPI *Global Performance* (Total Impresi DGR & VAC, Revenue Forecast, Occupancy Rate).
2. **SEO-Friendly Permalinks**: URL ramah mesin pencari, misalnya \`/titik-reklame/jbr-bdg-001-simpang-lima-asia-afrika\`.
3. **Server-Side RBAC (Role-Based Access Control)**:
   - **Super Admin**: Akses penuh, manajemen user & hak akses, manajemen titik reklame.
   - **Operator Lapangan**: Tambah/kelola titik reklame & prospek CRM.
   - **Auditor Bapenda**: Audit data & laporan eksekutif.
4. **Security Hardening**:
   - PDO Prepared Statements (Bebas SQL Injection).
   - Validasi CSRF Token di seluruh form POST/PUT/DELETE.
   - Escaping XSS kontekstual via \`Security::e()\`.
   - Proteksi sesi aman (HTTPOnly, SameSite, Session Regeneration).
   - Direktori upload terlindungi dari eksekusi file PHP.

## Kredensial Login Bawaan
- **Super Admin**: \`suherman\` / Kata Sandi: \`AdminOOH@2026\`
- **Operator Lapangan**: \`operator_jabar\` / Kata Sandi: \`AdminOOH@2026\`
- **Auditor**: \`auditor_bapenda\` / Kata Sandi: \`AdminOOH@2026\`
`);

  writeFile('INSTALL.md', `# Panduan Instalasi Lokal (XAMPP / Laragon / PHP CLI)

1. Pastikan terpasang **PHP 8.4+** dan **MySQL 8.0 / MariaDB**.
2. Buat database baru di MySQL:
   \`\`\`sql
   CREATE DATABASE oohmediabandung_bbmoni;
   \`\`\`
3. Impor skema dan data awal dari \`database/database.sql\`:
   \`\`\`bash
   mysql -u root -p oohmediabandung_bbmoni < database/database.sql
   \`\`\`
4. Salin file konfigurasi:
   \`\`\`bash
   cp config/config.example.php config/config.local.php
   \`\`\`
   Sesuaikan username dan password database di \`config/config.local.php\`.
5. Jalankan server lokal:
   \`\`\`bash
   php -S localhost:8000
   \`\`\`
6. Buka di browser: \`http://localhost:8000\`
`);

  writeFile('HOSTING.md', `# Panduan Deployment ke Hosting (cPanel / DirectAdmin / VPS)

### 1. Persyaratan Server
- PHP Version: **PHP 8.4**
- Ekstensi: \`pdo\`, \`pdo_mysql\`, \`mbstring\`, \`openssl\`, \`fileinfo\`, \`json\`, \`session\`
- Web Server: **Apache** dengan modul \`mod_rewrite\` aktif
- Database: **MySQL 8.0+** atau **MariaDB 10.5+**

### 2. Langkah-Langkah Deployment ke cPanel:
1. **Upload File**:
   - Kompres seluruh isi folder \`app_phpmysql/\` menjadi file \`.zip\`.
   - Buka File Manager cPanel, masuk ke folder \`public_html/\`.
   - Upload dan ekstrak file zip tersebut.
2. **Setup Database**:
   - Buat database \`oohmediabandung_bbmoni\` dan user database di menu *MySQL Databases*.
   - Buka *phpMyAdmin*, pilih database tersebut, lalu impor file \`database/database.sql\`.
3. **Konfigurasi**:
   - Buat file \`config/config.local.php\` (atau edit \`config/config.php\`) dan isi kredensial MySQL cPanel:
   \`\`\`php
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
   \`\`\`
4. **Izin Berkas (File Permissions)**:
   - Folder: \`755\`
   - File: \`644\`
   - Folder \`storage/logs/\` dan \`public/uploads/\`: \`775\` (dapat ditulis web server).
5. **Verifikasi**:
   Buka \`https://oohmediabandung.com/\` di browser.
`);

  writeFile('SECURITY.md', `# Arsitektur & Checklist Keamanan

- [x] **PDO Prepared Statements**: Semua query database menggunakan prepared statements.
- [x] **Password Hashing**: Kata sandi di-hash menggunakan algoritma BCRYPT resmi.
- [x] **CSRF Protection**: Token sesi random diverifikasi pada setiap request POST/PUT/DELETE.
- [x] **XSS Protection**: Semua output di-escape secara aman melalui \`Security::e()\`.
- [x] **Session Security**: Session cookies berstatus HTTPOnly, SameSite=Lax, dan Session ID diregenerasi setelah proses login.
- [x] **Server-Side RBAC**: Validasi otorisasi dilakukan secara ketat di sisi server melalui \`RoleMiddleware\`. Halaman seperti \`/admin/users\` langsung mengembalikan HTTP 403 Forbidden bila diakses pengguna non-Super Admin.
- [x] **Directory Protection**: Direktori sensitif seperti \`config/\`, \`database/\`, dan \`storage/logs/\` diblokir langsung oleh Apache \`.htaccess\`.
- [x] **Uploads Security**: Folder \`public/uploads/\` dilengkapi aturan pencegahan eksekusi berkas skrip PHP.
`);
}
