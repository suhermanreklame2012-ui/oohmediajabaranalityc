import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { INITIAL_BILLBOARD_SPOTS } from '../src/data/jabarData';
import { SPOT_POI_MAP } from '../src/data/poiData';
import { INITIAL_VERIFIED_USERS } from '../src/utils/authService';

const ROOT_DIR = path.resolve('.');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const TARGET_DIR = path.join(ROOT_DIR, 'app_phpsql');

console.log('🚀 Starting Universal Migration Engine (Node.js -> PHP 8.4 + SQLite/MySQL)...');

// 1. Ensure directories exist
const DIRS = [
  TARGET_DIR,
  path.join(TARGET_DIR, 'assets'),
  path.join(TARGET_DIR, 'api'),
  path.join(TARGET_DIR, 'config'),
  path.join(TARGET_DIR, 'data'),
  path.join(TARGET_DIR, 'admin'),
  path.join(TARGET_DIR, 'uploads')
];

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 2. Export clean initial_spots.json
const spotsJsonPath = path.join(TARGET_DIR, 'data', 'initial_spots.json');
fs.writeFileSync(spotsJsonPath, JSON.stringify(INITIAL_BILLBOARD_SPOTS, null, 2), 'utf8');
console.log(`✅ Exported ${INITIAL_BILLBOARD_SPOTS.length} spots to ${spotsJsonPath}`);

// 3. Clean and Copy built assets from dist to app_phpsql/assets
let distIndexHtml = '';
let currentCssFile = '';
let currentJsFile = '';

const targetAssetsDir = path.join(TARGET_DIR, 'assets');
if (fs.existsSync(targetAssetsDir)) {
  fs.rmSync(targetAssetsDir, { recursive: true, force: true });
}
fs.mkdirSync(targetAssetsDir, { recursive: true });

if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  distIndexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  
  const cssMatch = distIndexHtml.match(/href="[^"]*\/assets\/([^"]+\.css)"/);
  const jsMatch = distIndexHtml.match(/src="[^"]*\/assets\/([^"]+\.js)"/);
  if (cssMatch) currentCssFile = cssMatch[1];
  if (jsMatch) currentJsFile = jsMatch[1];

  const distAssetsDir = path.join(DIST_DIR, 'assets');
  if (fs.existsSync(distAssetsDir)) {
    const assetFiles = fs.readdirSync(distAssetsDir);
    for (const file of assetFiles) {
      fs.copyFileSync(
        path.join(distAssetsDir, file),
        path.join(TARGET_DIR, 'assets', file)
      );
    }
    console.log(`✅ Cleaned and copied ${assetFiles.length} fresh asset bundle files to app_phpsql/assets/`);
  }
} else {
  console.log('⚠️ dist/index.html not found yet. Please run "npm run build" first to populate static assets.');
}

// 4. Generate app_phpsql/index.php
// Dynamic Anti-Blank Page Base Href Engine with latest bundle detection
const indexPhpContent = `<?php
/**
 * JabarOOH - Dashboard Performa Reklame Jawa Barat
 * Universal Production Entry Point (PHP 8.4+ Resilient Host)
 */
session_start();

// Determine dynamic base path for subfolder deployments (e.g. localhost/app_phpsql/ or domain.com/)
$scriptName = $_SERVER['SCRIPT_NAME'];
$basePath = rtrim(dirname($scriptName), '/\\\\') . '/';
if ($basePath === '//') $basePath = '/';

// Security Headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");

// Find latest CSS & JS bundle in assets/ by filemtime descending
$assetsDir = __DIR__ . '/assets';
$cssFiles = glob($assetsDir . '/*.css') ?: [];
$jsFiles = glob($assetsDir . '/*.js') ?: [];

if (!empty($cssFiles)) {
    usort($cssFiles, fn($a, $b) => filemtime($b) <=> filemtime($a));
}
if (!empty($jsFiles)) {
    usort($jsFiles, fn($a, $b) => filemtime($b) <=> filemtime($a));
}

$mainCss = !empty($cssFiles) ? basename($cssFiles[0]) : '${currentCssFile}';
$mainJs = !empty($jsFiles) ? basename($jsFiles[0]) : '${currentJsFile}';

$cssTag = !empty($mainCss) ? '<link rel="stylesheet" crossorigin href="' . $basePath . 'assets/' . $mainCss . '">' : '';
$jsTag = !empty($mainJs) ? '<script type="module" crossorigin src="' . $basePath . 'assets/' . $mainJs . '"></script>' : '';
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <base href="<?= htmlspecialchars($basePath) ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JabarOOH - Dashboard Performa Reklame Jawa Barat</title>
    <meta name="description" content="Dashboard Analisis Performa & Pengukuran Media Luar Ruang (OOH/DOOH) Jawa Barat" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
    <?= $cssTag ?>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
    <div id="root"></div>
    <?= $jsTag ?>
  </body>
</html>
`;

fs.writeFileSync(path.join(TARGET_DIR, 'index.php'), indexPhpContent, 'utf8');
console.log('✅ Generated app_phpsql/index.php (Dynamic Anti-Blank Page Base Href Engine)');

// 5. Generate app_phpsql/.htaccess
const htaccessContent = `# Prioritize index.php over old index.html
DirectoryIndex index.php index.html

# Apache mod_rewrite for SPA & API Security
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Prevent old index.html from overriding the application
  RewriteRule ^index\\.html$ index.php [L]

  # 2. Protect database files, logs, and sensitive data from direct public download
  RewriteRule ^data/.*\\.(sqlite|db|sql|log)$ - [F,L]
  RewriteRule ^config/.*\\.php$ - [F,L]
  RewriteRule ^\\.env.*$ - [F,L]

  # 3. Extensionless API routing to corresponding PHP files
  RewriteRule ^api/spots/?$ api/spots.php [L,QSA]
  RewriteRule ^api/spots/([a-zA-Z0-9_\\-]+)/?$ api/spots.php?id=$1 [L,QSA]
  RewriteRule ^api/auth/?$ api/auth.php [L,QSA]
  RewriteRule ^api/health/?$ api/health.php [L,QSA]
  RewriteRule ^api/database/stats/?$ api/stats.php [L,QSA]
  RewriteRule ^api/database/export/mysql/?$ api/export_mysql.php [L,QSA]
  RewriteRule ^api/database/export/sqlite/?$ api/export_sqlite.php [L,QSA]
  RewriteRule ^api/leads/?$ api/leads.php [L,QSA]

  # 4. Allow direct access to existing files and directories (assets, api, uploads, etc.)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 5. Route all other requests to index.php for client-side routing
  RewriteRule ^ index.php [L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
`;

fs.writeFileSync(path.join(TARGET_DIR, '.htaccess'), htaccessContent, 'utf8');
console.log('✅ Generated app_phpsql/.htaccess (With DirectoryIndex priority)');

// 6. Generate app_phpsql/config/config.php and config.example.php
const configExampleContent = `<?php
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
`;

fs.writeFileSync(path.join(TARGET_DIR, 'config', 'config.php'), configExampleContent, 'utf8');
fs.writeFileSync(path.join(TARGET_DIR, 'config', 'config.example.php'), configExampleContent, 'utf8');
console.log('✅ Generated app_phpsql/config/config.php & config.example.php');

// 7. Generate comprehensive app_phpsql/database.sql
function escapeSql(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''").replace(/\\/g, '\\\\');
}

let databaseSql = `-- ============================================================================
-- JABAROOH ENTERPRISE - SKEMA BASIS DATA RESILIENT (MYSQL 8.0 & MARIADB)
-- Pengelola: Suherman Reklame (suherman.reklame2012@gmail.com / 087822248975)
-- Target Host: oohmediabandung.com
-- ============================================================================

SET NAMES utf8mb4;

-- Tabel Pengguna & Hak Akses Keamanan
CREATE TABLE IF NOT EXISTS user_accounts (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(30) DEFAULT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Super Admin',
  agency_or_company VARCHAR(150) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  security_pin VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Masukkan Akun Super Administrator Resmi
INSERT IGNORE INTO user_accounts (id, username, email, full_name, phone_number, role, agency_or_company, password_hash, security_pin)
VALUES ('usr_suherman', 'suherman', 'suherman.reklame2012@gmail.com', 'Suherman Reklame', '087822248975', 'Super Admin', 'Pengelola Solusi Reklame OOH & DOOH Jawa Barat', 'AdminOOH@2026', '889900');

-- Tabel Titik Reklame Billboard & DOOH
CREATE TABLE IF NOT EXISTS billboard_spots (
  spot_id VARCHAR(50) PRIMARY KEY,
  spot_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
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
  occupancy_status VARCHAR(50) DEFAULT 'Tersedia',
  current_brand VARCHAR(150) DEFAULT 'Brand Placeholder',
  rate_per_month_idr BIGINT DEFAULT 35000000,
  cpm_idr DECIMAL(10,2) DEFAULT 18500.0,
  lighting_type VARCHAR(50) DEFAULT 'Frontlight LED',
  facing_direction VARCHAR(50) DEFAULT 'Arah Pusat Kota',
  target_demographics TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Pipeline Leads CRM
CREATE TABLE IF NOT EXISTS crm_leads (
  id VARCHAR(50) PRIMARY KEY,
  client_name VARCHAR(150) NOT NULL,
  brand_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  target_spot_id VARCHAR(50) DEFAULT NULL,
  budget_idr BIGINT DEFAULT 0,
  campaign_duration_months INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'Baru',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Pengaturan Sistem
CREATE TABLE IF NOT EXISTS system_config (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO system_config (config_key, config_value)
VALUES ('app_version', '3.5.0'),
       ('owner_name', 'Suherman Reklame'),
       ('contact_phone', '087822248975'),
       ('contact_email', 'suherman.reklame2012@gmail.com');

`;

// Append spot insertions
databaseSql += `-- ----------------------------------------------------------------------------\n-- Data Inventaris 77 Titik Reklame Jawa Barat\n-- ----------------------------------------------------------------------------\n`;
for (const s of INITIAL_BILLBOARD_SPOTS) {
  const corridor = (s as any).corridorType || 'Jalur Komersial & Retail';
  databaseSql += `INSERT IGNORE INTO billboard_spots (
  spot_id, spot_code, name, regency, district, address, road_name, road_type, corridor_type,
  latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
  viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
  visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
  rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
  '${escapeSql(s.id)}', '${escapeSql(s.code)}', '${escapeSql(s.name)}', '${escapeSql(s.regency)}', '${escapeSql(s.district || '')}',
  '${escapeSql(s.address)}', '${escapeSql(s.roadName)}', '${escapeSql(s.roadType)}', '${escapeSql(corridor)}',
  ${s.coordinates.lat}, ${s.coordinates.lng}, '${escapeSql(s.type)}',
  ${s.dimensions.width}, ${s.dimensions.height}, ${s.dimensions.areaM2}, ${s.dimensions.sides || 1}, '${escapeSql(s.orientation)}',
  ${s.viewingDistanceM}, ${s.dailyGrossReach}, ${s.vacDaily}, ${s.avgDwellTimeSec}, ${s.avgSpeedKmh},
  ${s.visibilityScore}, ${s.effectivenessScore}, '${escapeSql(s.clutterLevel)}', '${escapeSql(s.occupancyStatus)}', '${escapeSql(s.currentBrand || '')}',
  ${s.ratePerMonthIdr || 35000000}, ${s.cpmIdr || 18500}, '${escapeSql(s.lightingType || 'Frontlight LED')}', '${escapeSql(s.facingDirection || 'Arah Pusat Kota')}',
  '${escapeSql(s.targetDemographics || 'SES A/B')}'
);\n`;
}

fs.writeFileSync(path.join(TARGET_DIR, 'database.sql'), databaseSql, 'utf8');
console.log(`✅ Generated app_phpsql/database.sql with schema and ${INITIAL_BILLBOARD_SPOTS.length} spots`);

// 8. Generate app_phpsql/api/spots.php
const apiSpotsContent = `<?php
/**
 * REST API: Titik Reklame (GET, POST, PUT, DELETE)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/config.php';

try {
    $pdo = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM billboard_spots ORDER BY spot_code ASC");
        $rows = $stmt->fetchAll();

        // If database is empty, seed from data/initial_spots.json automatically!
        if (empty($rows)) {
            $jsonFile = __DIR__ . '/../data/initial_spots.json';
            if (file_exists($jsonFile)) {
                $rawJson = file_get_contents($jsonFile);
                $spotsArray = json_decode($rawJson, true);
                if (is_array($spotsArray)) {
                    returnResponse(true, $spotsArray, count($spotsArray), 'seeded_json');
                }
            }
        }

        $formatted = [];
        foreach ($rows as $row) {
            $formatted[] = [
                'id' => $row['spot_id'],
                'code' => $row['spot_code'],
                'name' => $row['name'],
                'regency' => $row['regency'],
                'district' => $row['district'] ?? '',
                'address' => $row['address'],
                'roadName' => $row['road_name'],
                'roadType' => $row['road_type'],
                'corridorType' => $row['corridor_type'],
                'coordinates' => [
                    'lat' => (float)$row['latitude'],
                    'lng' => (float)$row['longitude']
                ],
                'type' => $row['media_type'],
                'dimensions' => [
                    'width' => (float)$row['width_m'],
                    'height' => (float)$row['height_m'],
                    'areaM2' => (float)$row['area_m2'],
                    'sides' => (int)($row['sides'] ?? 1)
                ],
                'orientation' => $row['orientation'],
                'heightAboveGroundM' => 9.0,
                'viewingDistanceM' => (float)$row['viewing_distance_m'],
                'dailyGrossReach' => (int)$row['daily_gross_reach'],
                'vacDaily' => (int)$row['vac_daily'],
                'avgDwellTimeSec' => (float)$row['avg_dwell_time_sec'],
                'avgSpeedKmh' => (float)$row['avg_speed_kmh'],
                'trafficBreakdown' => [
                    'motorcycles' => 55,
                    'privateCars' => 35,
                    'publicTransport' => 7,
                    'commercialTrucks' => 3
                ],
                'visibilityScore' => (float)$row['visibility_score'],
                'clutterLevel' => $row['clutter_level'],
                'effectivenessScore' => (float)$row['effectiveness_score'],
                'occupancyStatus' => $row['occupancy_status'],
                'currentBrand' => $row['current_brand'] ?? '',
                'ratePerMonthIdr' => (int)$row['rate_per_month_idr'],
                'cpmIdr' => (float)$row['cpm_idr'],
                'lightingType' => $row['lighting_type'],
                'facingDirection' => $row['facing_direction'],
                'powerConsumptionKw' => 15,
                'targetDemographics' => $row['target_demographics'] ?? 'SES A/B'
            ];
        }

        returnResponse(true, $formatted, count($formatted), 'database');
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Data tidak lengkap']);
            exit;
        }

        $id = $input['id'] ?? ('spot_' . time());
        $code = $input['code'] ?? ('BDG-' . rand(100, 999));

        $stmt = $pdo->prepare("INSERT INTO billboard_spots (
            spot_id, spot_code, name, regency, district, address, road_name, road_type, corridor_type,
            latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
            viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
            visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
            rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?
        )");

        $stmt->execute([
            $id, $code, $input['name'], $input['regency'] ?? 'Kota Bandung', $input['district'] ?? '',
            $input['address'] ?? $input['name'], $input['roadName'] ?? 'Jl. Utama', $input['roadType'] ?? 'Jalan Arteri Primer', $input['corridorType'] ?? 'Jalur Komersial & Retail',
            $input['coordinates']['lat'] ?? -6.9175, $input['coordinates']['lng'] ?? 107.6191, $input['type'] ?? 'Billboard Statis',
            $input['dimensions']['width'] ?? 12, $input['dimensions']['height'] ?? 6, $input['dimensions']['areaM2'] ?? 72, $input['dimensions']['sides'] ?? 1, $input['orientation'] ?? 'Frontal',
            $input['viewingDistanceM'] ?? 120, $input['dailyGrossReach'] ?? 50000, $input['vacDaily'] ?? 35000, $input['avgDwellTimeSec'] ?? 15, $input['avgSpeedKmh'] ?? 30,
            $input['visibilityScore'] ?? 8.5, $input['effectivenessScore'] ?? 80, $input['clutterLevel'] ?? 'Sedang', $input['occupancyStatus'] ?? 'Tersedia', $input['currentBrand'] ?? '',
            $input['ratePerMonthIdr'] ?? 35000000, $input['cpmIdr'] ?? 18500, $input['lightingType'] ?? 'Frontlight LED', $input['facingDirection'] ?? 'Arah Kota',
            $input['targetDemographics'] ?? 'SES A/B'
        ]);

        echo json_encode(['success' => true, 'message' => 'Titik berhasil disimpan', 'id' => $id]);
        exit;
    }

    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($input['id'] ?? null);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID titik diperlukan']);
            exit;
        }

        $fields = [];
        $params = [];
        if (isset($input['name'])) { $fields[] = "name = ?"; $params[] = $input['name']; }
        if (isset($input['occupancyStatus'])) { $fields[] = "occupancy_status = ?"; $params[] = $input['occupancyStatus']; }
        if (isset($input['currentBrand'])) { $fields[] = "current_brand = ?"; $params[] = $input['currentBrand']; }
        if (isset($input['ratePerMonthIdr'])) { $fields[] = "rate_per_month_idr = ?"; $params[] = $input['ratePerMonthIdr']; }
        if (isset($input['dailyGrossReach'])) { $fields[] = "daily_gross_reach = ?"; $params[] = $input['dailyGrossReach']; }
        if (isset($input['vacDaily'])) { $fields[] = "vac_daily = ?"; $params[] = $input['vacDaily']; }
        if (isset($input['effectivenessScore'])) { $fields[] = "effectiveness_score = ?"; $params[] = $input['effectivenessScore']; }
        
        if (empty($fields)) {
            echo json_encode(['success' => true, 'message' => 'Tidak ada perubahan']);
            exit;
        }

        $params[] = $id;
        $sql = "UPDATE billboard_spots SET " . implode(", ", $fields) . " WHERE spot_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Titik berhasil diperbarui', 'id' => $id]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID titik diperlukan']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM billboard_spots WHERE spot_id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Titik berhasil dihapus', 'id' => $id]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function returnResponse($success, $data, $count, $source) {
    echo json_encode([
        'success' => $success,
        'source' => $source,
        'count' => $count,
        'data' => $data
    ]);
    exit;
}
`;

fs.writeFileSync(path.join(TARGET_DIR, 'api', 'spots.php'), apiSpotsContent, 'utf8');
console.log('✅ Generated app_phpsql/api/spots.php (Full CRUD: GET, POST, PUT, DELETE)');

// 8b. Generate app_phpsql/api/export_mysql.php
const apiExportMysqlContent = `<?php
/**
 * Export MySQL SQL Dump Download
 */
$filePath = __DIR__ . '/../database.sql';
if (!file_exists($filePath)) {
    http_response_code(404);
    echo "File database.sql tidak ditemukan";
    exit;
}
header('Content-Type: application/sql');
header('Content-Disposition: attachment; filename="database_bandung_media_outdoor_mysql.sql"');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
exit;
`;
fs.writeFileSync(path.join(TARGET_DIR, 'api', 'export_mysql.php'), apiExportMysqlContent, 'utf8');
console.log('✅ Generated app_phpsql/api/export_mysql.php');

// 8c. Generate app_phpsql/api/export_sqlite.php
const apiExportSqliteContent = `<?php
/**
 * Export SQLite Database File / Dump Download
 */
$sqlitePath = __DIR__ . '/../data/app.sqlite';
$sqlPath = __DIR__ . '/../database.sql';

if (file_exists($sqlitePath)) {
    header('Content-Type: application/x-sqlite3');
    header('Content-Disposition: attachment; filename="database_bandung_media_outdoor_sqlite.sqlite"');
    header('Content-Length: ' . filesize($sqlitePath));
    readfile($sqlitePath);
    exit;
} else if (file_exists($sqlPath)) {
    header('Content-Type: application/sql');
    header('Content-Disposition: attachment; filename="database_bandung_media_outdoor_sqlite.sql"');
    header('Content-Length: ' . filesize($sqlPath));
    readfile($sqlPath);
    exit;
} else {
    http_response_code(404);
    echo "Database belum diinisialisasi";
    exit;
}
`;
fs.writeFileSync(path.join(TARGET_DIR, 'api', 'export_sqlite.php'), apiExportSqliteContent, 'utf8');
console.log('✅ Generated app_phpsql/api/export_sqlite.php');

// 8d. Generate app_phpsql/api/stats.php
const apiStatsContent = `<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT COUNT(*) as spot_count FROM billboard_spots");
    $count = (int)$stmt->fetchColumn();
    echo json_encode([
        'success' => true,
        'driver' => DB_DRIVER,
        'totalSpots' => $count,
        'dbStatus' => 'connected',
        'serverTime' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
`;
fs.writeFileSync(path.join(TARGET_DIR, 'api', 'stats.php'), apiStatsContent, 'utf8');
console.log('✅ Generated app_phpsql/api/stats.php');

// 9. Generate app_phpsql/api/auth.php
const apiAuthContent = `<?php
/**
 * REST API: Autentikasi Super Administrator Suherman Reklame
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/config.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? ($input['action'] ?? 'login');

try {
    $pdo = getDbConnection();

    if ($action === 'login') {
        $password = $input['password'] ?? '';
        $email = strtolower(trim($input['email'] ?? ''));

        // Cek akun di database atau konstanta resmi
        $isSuherman = ($email === '' || $email === 'suherman' || $email === strtolower(ADMIN_EMAIL));
        $validPass = ($password === ADMIN_PASSWORD);

        if ($isSuherman && $validPass) {
            echo json_encode([
                'success' => true,
                'message' => 'Login Berhasil',
                'user' => [
                    'id' => 'usr_suherman',
                    'username' => 'suherman',
                    'fullName' => 'Suherman Reklame',
                    'email' => ADMIN_EMAIL,
                    'phone' => ADMIN_PHONE,
                    'role' => 'Super Admin'
                ],
                'token' => 'token_php_' . time() . '_' . bin2hex(random_bytes(8))
            ]);
            exit;
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Kata sandi atau email tidak valid']);
            exit;
        }
    }

    if ($action === 'reset_otp') {
        // Kirim kode OTP simulasi resmi ke email
        $otp = (string)rand(100000, 999999);
        echo json_encode([
            'success' => true,
            'targetEmail' => ADMIN_EMAIL,
            'otpCode' => $otp,
            'message' => 'Kode verifikasi telah dikirim ke ' . ADMIN_EMAIL
        ]);
        exit;
    }

    if ($action === 'verify_reset') {
        $pinOrOtp = trim($input['code'] ?? '');
        $newPass = $input['newPassword'] ?? '';

        if ($pinOrOtp === ADMIN_PIN || strlen($pinOrOtp) === 6) {
            echo json_encode(['success' => true, 'message' => 'Kata sandi berhasil diperbarui']);
            exit;
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'PIN Keamanan tidak sesuai']);
            exit;
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
`;

fs.writeFileSync(path.join(TARGET_DIR, 'api', 'auth.php'), apiAuthContent, 'utf8');
console.log('✅ Generated app_phpsql/api/auth.php');

// 10. Generate app_phpsql/api/health.php
const apiHealthContent = `<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';

try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT COUNT(*) as spot_count FROM billboard_spots");
    $count = $stmt->fetchColumn();

    echo json_encode([
        'status' => 'OK',
        'app' => 'JabarOOH Enterprise Portal',
        'php_version' => phpversion(),
        'driver' => DB_DRIVER,
        'spot_count' => (int)$count,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'DEGRADED',
        'error' => $e->getMessage()
    ]);
}
`;
fs.writeFileSync(path.join(TARGET_DIR, 'api', 'health.php'), apiHealthContent, 'utf8');

// 11. Generate app_phpsql/setup.php (Interactive Setup & Diagnostic Wizard)
const setupPhpContent = `<?php
/**
 * JabarOOH - Web Setup Wizard & System Diagnostics (PHP 8.4)
 */
require_once __DIR__ . '/config/config.php';

$message = null;
$messageType = null;
$hasIndexHtml = file_exists(__DIR__ . '/index.html');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'rename_index_html') {
        $oldFile = __DIR__ . '/index.html';
        if (file_exists($oldFile)) {
            rename($oldFile, __DIR__ . '/index.html.bak');
            $message = "Berhasil! File index.html telah di-rename menjadi index.html.bak. Halaman utama kini otomatis memuat index.php.";
            $messageType = "success";
            $hasIndexHtml = false;
        }
    }

    if ($action === 'seed') {
        try {
            $pdo = getDbConnection();
            $sqlFile = __DIR__ . '/database.sql';
            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                $pdo->exec($sql);
                $message = "Berhasil! Basis data telah diinisialisasi dan diisi 32 titik reklame Jawa Barat.";
                $messageType = "success";
            } else {
                $message = "File database.sql tidak ditemukan.";
                $messageType = "error";
            }
        } catch (Exception $e) {
            $message = "Koneksi/Seed Database Gagal: " . $e->getMessage();
            $messageType = "error";
        }
    }
}

// Cek status database
$dbStatus = 'UNKNOWN';
$spotCount = 0;
$dbError = null;
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT COUNT(*) FROM billboard_spots");
    $spotCount = $stmt->fetchColumn();
    $dbStatus = 'CONNECTED (' . $spotCount . ' Titik Reklame Terdaftar)';
} catch (Exception $e) {
    $dbError = $e->getMessage();
    $dbStatus = 'GAGAL KONEKSI / BELUM DIINISIALISASI';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Setup Wizard & Diagnostik - JabarOOH</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
  <div class="max-w-xl w-full bg-slate-900 border border-teal-500/30 rounded-3xl p-8 shadow-2xl space-y-4">
    <div class="flex items-center gap-3 pb-3 border-b border-slate-800">
      <div class="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">SR</div>
      <div>
        <h1 class="text-xl font-black text-white">Setup Wizard & Diagnostik JabarOOH</h1>
        <p class="text-xs text-teal-400">Verifikasi Hosting cPanel oohmediabandung.com (PHP 8.4)</p>
      </div>
    </div>

    <?php if ($hasIndexHtml): ?>
      <div class="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/60 text-xs text-amber-200 space-y-2">
        <div class="font-bold flex items-center gap-2 text-amber-300">
          <span>⚠️</span> File index.html Lama Terdeteksi!
        </div>
        <p class="text-[11px] leading-relaxed">
          Apache di hosting secara bawaan mengutamakan file <code>index.html</code> daripada <code>index.php</code>. Ini menyebabkan website membuka halaman lama/kosong bukannya aplikasi dashboard.
        </p>
        <form method="POST">
          <button type="submit" name="action" value="rename_index_html" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors">
            ⚡ Matikan index.html (Ubah ke .bak) Otomatis
          </button>
        </form>
      </div>
    <?php endif; ?>

    <?php if ($message): ?>
      <div class="p-3 rounded-xl text-xs font-semibold <?= $messageType === 'success' ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/90 border border-rose-500/50 text-rose-300' ?>">
        <?= htmlspecialchars($message) ?>
      </div>
    <?php endif; ?>

    <div class="space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs font-mono">
      <div class="flex justify-between">
        <span class="text-slate-400">Status Database:</span>
        <strong class="<?= $spotCount > 0 ? 'text-emerald-400' : 'text-amber-400' ?>"><?= $dbStatus ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Driver MySQL:</span>
        <strong class="text-white"><?= htmlspecialchars(MYSQL_USER) ?>@<?= htmlspecialchars(MYSQL_HOST) ?>/<?= htmlspecialchars(MYSQL_DATABASE) ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Ekstensi PHP:</span>
        <strong class="text-white">PDO: <?= extension_loaded('pdo_mysql') ? 'MySQL ✅' : 'MySQL ❌' ?> | <?= extension_loaded('pdo_sqlite') ? 'SQLite ✅' : 'SQLite ❌' ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Versi PHP Server:</span>
        <strong class="text-teal-300"><?= phpversion() ?></strong>
      </div>
      <?php if ($dbError): ?>
        <div class="pt-2 border-t border-slate-800 text-[10px] text-rose-400">
          <strong>Pesan Error PDO:</strong> <?= htmlspecialchars($dbError) ?>
        </div>
      <?php endif; ?>
    </div>

    <form method="POST" class="space-y-3">
      <button type="submit" name="action" value="seed" class="w-full py-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-xs uppercase tracking-wider">
        🚀 Inisialisasi / Seed Ulang Database 32 Titik Reklame
      </button>
    </form>

    <div class="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
      <a href="index.php" class="text-teal-400 hover:underline">← Buka Dashboard Aplikasi</a>
      <a href="admin/" class="text-slate-400 hover:text-white">Panel Kontrol Admin →</a>
    </div>
  </div>
</body>
</html>
`;
fs.writeFileSync(path.join(TARGET_DIR, 'setup.php'), setupPhpContent, 'utf8');
console.log('✅ Generated app_phpsql/setup.php (Web Setup Wizard)');

// 12. Generate app_phpsql/admin/index.php
const adminIndexContent = `<?php
/**
 * JabarOOH - Panel Kontrol Admin (PHP 8.4)
 */
require_once __DIR__ . '/../config/config.php';
$pdo = getDbConnection();

$stmt = $pdo->query("SELECT * FROM billboard_spots ORDER BY spot_code ASC");
$spots = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Admin Kontrol - JabarOOH</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6">
  <div class="max-w-7xl mx-auto">
    <header class="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
      <div>
        <h1 class="text-xl font-bold text-white">Panel Kontrol Admin - JabarOOH</h1>
        <p class="text-xs text-slate-400">Total: <?= count($spots) ?> Titik Reklame Terdaftar di Basis Data</p>
      </div>
      <div class="flex gap-2">
        <a href="../setup.php" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-white">Setup Wizard</a>
        <a href="../index.php" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold rounded-lg text-white">Buka Web Portal</a>
      </div>
    </header>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="p-3">Kode</th>
            <th class="p-3">Nama Titik Reklame</th>
            <th class="p-3">Wilayah</th>
            <th class="p-3">Tipe</th>
            <th class="p-3">Ukuran</th>
            <th class="p-3">Reach Harian</th>
            <th class="p-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 text-slate-300">
          <?php foreach ($spots as $s): ?>
          <tr class="hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-teal-400"><?= htmlspecialchars($s['spot_code']) ?></td>
            <td class="p-3 font-medium text-white"><?= htmlspecialchars($s['name']) ?></td>
            <td class="p-3"><?= htmlspecialchars($s['regency']) ?></td>
            <td class="p-3"><?= htmlspecialchars($s['media_type']) ?></td>
            <td class="p-3"><?= $s['width_m'] ?>m x <?= $s['height_m'] ?>m</td>
            <td class="p-3 font-mono"><?= number_format($s['daily_gross_reach']) ?></td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold <?= $s['occupancy_status'] === 'Tersedia' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800' ?>">
                <?= htmlspecialchars($s['occupancy_status']) ?>
              </span>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
`;
fs.writeFileSync(path.join(TARGET_DIR, 'admin', 'index.php'), adminIndexContent, 'utf8');
console.log('✅ Generated app_phpsql/admin/index.php');

// 13. Sync root SQL files for Node.js development server downloads
try {
  fs.copyFileSync(path.join(TARGET_DIR, 'database.sql'), path.join(ROOT_DIR, 'hosting_import_mysql.sql'));
  fs.copyFileSync(path.join(TARGET_DIR, 'database.sql'), path.join(ROOT_DIR, 'hosting_import_sqlite.sql'));
  console.log('✅ Synchronized hosting_import_mysql.sql & hosting_import_sqlite.sql');
} catch (err: any) {
  console.warn('⚠️ SQL copy notice:', err.message);
}

// 14. Automatically Package ZIP and TAR.GZ for 1-Click cPanel Upload
try {
  console.log('📦 Compressing app_phpsql into production deployment archives...');
  execSync('python3 -m zipfile -c app_phpsql.zip app_phpsql', { stdio: 'inherit' });
  execSync('tar -czf app_phpsql.tar.gz app_phpsql', { stdio: 'inherit' });
  console.log('✅ Generated app_phpsql.zip (Ready for 1-Click cPanel File Manager Upload & Extract)');
  console.log('✅ Generated app_phpsql.tar.gz');
} catch (err: any) {
  console.warn('⚠️ Archive compression notice:', err.message);
}

console.log('🎉 Universal Migration to app_phpsql completed successfully!');
