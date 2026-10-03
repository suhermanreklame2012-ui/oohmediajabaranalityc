-- ============================================================================
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
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-01', 'JBR-BDG-001', 'Simpang Lima Asia Afrika Curved LED', 'jbr-bdg-001-simpang-lima-asia-afrika-curved-led', 'Kota Bandung', 'Sumur Bandung',
    'Jl. Asia Afrika No. 120 (Simpang Lima Sunda - Asia Afrika)', 'Jl. Asia Afrika / Simpang Lima', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.9213, 107.6186, 'LED Videotron',
    24, 12, 288, 1, 'Curved Corner (Sudut Simpang)',
    220, 245000, 218000, 52, 14,
    96, 94, 'Sedang (Normal)', 'Occupied', 'Bank BJB Digital Banking',
    165000000, 22400, 'P6 Ultra-Bright SMD LED Full RGB', 'Arus Sudirman & Gatot Subroto menuju Alun-Alun Bandung',
    'Urban Professionals, Eksekutif Finansial, Wisatawan Domestik'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-02', 'JBR-BDG-002', 'Gerbang Tol Pasteur Exit Gateway', 'jbr-bdg-002-gerbang-tol-pasteur-exit-gateway', 'Kota Bandung', 'Sukajadi',
    'Jl. Dr. Djunjunan (Pasteur) KM 0.5 Arah Pusat Kota', 'Jl. Dr. Djunjunan (Pasteur Exit Tol)', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.8924, 107.5794, 'Megatron',
    20, 10, 200, 1, 'Front Facing (Tegak Lurus)',
    350, 285000, 259000, 42, 28,
    98, 96, 'Rendah (Unobstructed)', 'Occupied', 'Telkomsel 5G Hypernet',
    195000000, 22800, 'P8 Outdoor High-Contrast Videotron', 'Keluar Gerbang Tol Pasteur menuju Jl. Layang Pasupati & Gasibu',
    'Wisatawan Jakarta-Bandung, Pebisnis Komuter, Pemilik Mobil Pribadi'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-03', 'JBR-BDG-003', 'Dago Simpang McDonald Landmark LED', 'jbr-bdg-003-dago-simpang-mcdonald-landmark-led', 'Kota Bandung', 'Coblong',
    'Jl. Ir. H. Juanda No. 154 (Simpang Dago Cikapayang Bawah)', 'Jl. Ir. H. Juanda (Dago)', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.8863, 107.6149, 'LED Videotron',
    16, 8, 128, 1, 'Front Facing (Tegak Lurus)',
    180, 178000, 156000, 48, 16,
    93, 91, 'Sedang (Normal)', 'Occupied', 'Shopee Garansi Tepat Waktu',
    120000000, 22400, 'P6 SMD LED 6500 nits', 'Arus Dago Atas & Cikapayang Flyover',
    'Gen-Z, Mahasiswa ITB/UNPAD, Komunitas Gaya Hidup & Kafe'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-04', 'JBR-BDG-004', 'Riau Junction Simpang Trunojoyo Billboard', 'jbr-bdg-004-riau-junction-simpang-trunojoyo-billboard', 'Kota Bandung', 'Bandung Wetan',
    'Jl. R.E. Martadinata (Riau) No. 42', 'Jl. R.E. Martadinata', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.9084, 107.6138, 'Static Billboard',
    12, 6, 72, 2, 'Double Sided (Dua Sisi)',
    150, 142000, 118000, 36, 18,
    89, 86, 'Sedang (Normal)', 'Available', '',
    65000000, 15200, 'Frontlite High-Lumen Metal Halide 8x400W', 'Dua arah Jl. Riau (Factory Outlet & Heritage Zone)',
    'Shoppers, Wisata Belanja, Family Dining'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-05', 'JBR-BDG-005', 'Simpang Buah Batu Exit Tol Purbaleunyi', 'jbr-bdg-005-simpang-buah-batu-exit-tol-purbaleunyi', 'Kota Bandung', 'Bandung Kidul',
    'Jl. Buah Batu Dekat Gerbang Tol KM 142', 'Jl. Terusan Buah Batu', 'Arteri Sekunder', 'Jalur Komersial & Retail',
    -6.9632, 107.6394, 'Static Billboard',
    16, 8, 128, 1, 'Front Facing (Tegak Lurus)',
    260, 195000, 168000, 58, 12,
    92, 89, 'Sedang (Normal)', 'Occupied', 'Gojek Pasti Ada Jalan',
    85000000, 14500, 'Backlite LED Uniform Grid 120W x 10', 'Keluar Exit Tol Buah Batu menuju Pusat Kota & Dayeuhkolot',
    'Komuter Bandung Selatan, Mahasiswa Telkom University, Residensial'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-06', 'JBR-BDG-006', 'Pasirkaliki 23 Paskal Mall Vertical LED', 'jbr-bdg-006-pasirkaliki-23-paskal-mall-vertical-led', 'Kota Bandung', 'Andir',
    'Jl. Pasirkaliki No. 25-27 (Akses Utama 23 Paskal)', 'Jl. Pasirkaliki', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.9149, 107.5996, 'LED Videotron',
    8, 16, 128, 1, 'Front Facing (Tegak Lurus)',
    140, 162000, 144000, 46, 15,
    94, 88, 'Tinggi (Kompetitif)', 'Reserved', 'Samsung Galaxy Z Fold',
    135000000, 27700, 'P4 Indoor/Outdoor High Definition LED', 'Arus Stasiun Bandung menuju PVJ & Sukajadi',
    'Middle-Up Urbanites, Mall Visitors, Gadget Enthusiasts'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-07', 'JBR-BDG-007', 'Flyover Pasupati Cikapayang Iconic Bridge JPO', 'jbr-bdg-007-flyover-pasupati-cikapayang-iconic-bridge-jpo', 'Kota Bandung', 'Coblong',
    'Jl. Layang Prof. Mochtar Kusumaatmadja (Pasupati)', 'Flyover Pasupati', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.8996, 107.6105, 'JPO Pedestrian Bridge',
    28, 4, 112, 2, 'Cantilever Overhead',
    300, 230000, 205000, 25, 45,
    97, 93, 'Rendah (Unobstructed)', 'Occupied', 'Indosat Ooredoo Hutchison',
    110000000, 16000, 'LED Strip Contour + Floodlight 500W', 'Arus Timur-Barat & Barat-Timur Layang Pasupati',
    'Komuter Lintas Kota Bandung, Penglaju Pasteur-Surapati'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-08', 'JBR-BDG-008', 'Jl. Soekarno Hatta MTC Metro Indah Megatron', 'jbr-bdg-008-jl-soekarno-hatta-mtc-metro-indah-megatron', 'Kota Bandung', 'Rancasari',
    'Jl. Soekarno Hatta No. 590 (Depan Kawasan Bisnis MTC)', 'By-Pass Jl. Soekarno Hatta', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.9421, 107.6622, 'Megatron',
    18, 9, 162, 1, 'Front Facing (Tegak Lurus)',
    280, 215000, 182000, 38, 35,
    91, 87, 'Sedang (Normal)', 'Available', '',
    95000000, 14700, 'P8 Outdoor High-Res Videotron', 'Arus By-Pass Kiaracondong menuju Cibiru & Cileunyi',
    'Komuter Bandung Timur, Pengguna Jalur Antarkota, Pekerja Kawasan Bisnis'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-09', 'JBR-BKS-001', 'Flyover Summarecon Bekasi Iconic Videotron', 'jbr-bks-001-flyover-summarecon-bekasi-iconic-videotron', 'Kota Bekasi', 'Bekasi Utara',
    'Jl. Jendral Ahmad Yani - Flyover KH Noer Ali Summarecon', 'Jl. Jend. Ahmad Yani', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.2285, 106.9992, 'LED Videotron',
    25, 10, 250, 1, 'Curved Corner (Sudut Simpang)',
    320, 310000, 285000, 62, 18,
    98, 97, 'Sedang (Normal)', 'Occupied', 'Hyundai IONIQ 5 Electric',
    210000000, 22500, 'P6 Ultra Dynamic Curve Display', 'Keluar Pintu Tol Bekasi Barat menuju Summarecon & Harapan Baru',
    'Keluarga Mapan, Executive Jabodetabek, Automotive Buyers'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-10', 'JBR-BKS-002', 'Tol Jakarta - Cikampek KM 14 Gantry Megatron', 'jbr-bks-002-tol-jakarta-cikampek-km-14-gantry-megatron', 'Kota Bekasi', 'Bekasi Barat',
    'Ruas Jalan Tol Jakarta-Cikampek KM 14+200', 'Jalan Tol Jakarta - Cikampek', 'Jalan Tol Bebas Hambatan', 'Jalur Komersial & Retail',
    -6.252, 106.984, 'Megatron',
    30, 12, 360, 2, 'Cantilever Overhead',
    500, 430000, 395000, 22, 65,
    99, 95, 'Rendah (Unobstructed)', 'Occupied', 'Pertamax Green 95 Energy',
    275000000, 21300, 'P10 Highway Rugged LED Display', 'Dua arah Tol Japek: Arah Cikampek/Jawa & Arah Cawang/Jakarta',
    'Pebisnis Tol Trans Jawa, Logistik Nasional, Turis Liburan'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-11', 'JBR-BKS-003', 'Kalimalang Metropolitan Mall JPO Display', 'jbr-bks-003-kalimalang-metropolitan-mall-jpo-display', 'Kota Bekasi', 'Bekasi Selatan',
    'Jl. KH. Noer Ali (Kalimalang) Simpang MM Mall', 'Jl. KH. Noer Ali (Kalimalang)', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.2483, 106.9922, 'JPO Pedestrian Bridge',
    22, 4.5, 99, 2, 'Cantilever Overhead',
    200, 225000, 195000, 44, 20,
    92, 89, 'Tinggi (Kompetitif)', 'Available', '',
    88000000, 13000, 'Backlight LED Module 960W Total', 'Arus Becakayu & Kalimalang menuju Tol Bekasi Barat',
    'Pekerja Komuter Jakarta-Bekasi, Pengunjung Mall'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-12', 'JBR-BKS-004', 'Boulevard Harapan Indah Gateway Billboard', 'jbr-bks-004-boulevard-harapan-indah-gateway-billboard', 'Kota Bekasi', 'Medan Satria',
    'Bundaran Gerbang Utama Kota Harapan Indah', 'Jl. Boulevard Harapan Indah', 'Kolektor Perkotaan', 'Jalur Komersial & Retail',
    -6.184, 106.9772, 'Static Billboard',
    14, 7, 98, 1, 'Front Facing (Tegak Lurus)',
    240, 155000, 132000, 35, 25,
    88, 85, 'Rendah (Unobstructed)', 'Occupied', 'Mayora Kopi Kenangan',
    58000000, 12500, 'Spotlight LED Lumileds 6x200W', 'Pintu Gerbang Harapan Indah dari Jl. Raya Sultan Agung',
    'Keluarga Residensial Modern, Konsumen FMCG'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-13', 'JBR-BGR-001', 'Tugu Kujang Baranangsiang Iconic Landmark LED', 'jbr-bgr-001-tugu-kujang-baranangsiang-iconic-landmark-led', 'Kota Bogor', 'Bogor Tengah',
    'Simpang Tugu Kujang - Jl. Pajajaran / Jl. Otto Iskandardinata', 'Jl. Pajajaran (Simpang Tugu Kujang)', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.6015, 106.8049, 'LED Videotron',
    18, 9, 162, 1, 'Curved Corner (Sudut Simpang)',
    250, 240000, 215000, 54, 15,
    97, 95, 'Sedang (Normal)', 'Occupied', 'Bank Mandiri Livin',
    145000000, 20100, 'P6 SMD LED Vivid 7000 nits', 'Keluar Terminal Baranangsiang & Tol Jagorawi arah Istana Bogor',
    'Wisatawan Kebun Raya, Komuter Kereta/Tol, Mahasiswa IPB'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-14', 'JBR-BGR-002', 'Ciawi Exit Tol Jagorawi Pintu Masuk Puncak', 'jbr-bgr-002-ciawi-exit-tol-jagorawi-pintu-masuk-puncak', 'Kabupaten Bogor', 'Ciawi',
    'Simpang Ciawi Simpang Gadog KM 45', 'Jl. Raya Ciawi - Puncak', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.6631, 106.8574, 'Megatron',
    22, 10, 220, 1, 'Front Facing (Tegak Lurus)',
    380, 260000, 232000, 72, 10,
    95, 94, 'Tinggi (Kompetitif)', 'Occupied', 'Teh Botol Sosro Nusantara',
    155000000, 19800, 'P8 Outdoor Anti-Fog Videotron', 'Kendaraan dari Exit Tol Jagorawi Ciawi mendaki jalur Puncak',
    'Wisatawan Akhir Pekan Jabodetabek, Turis Keluarga, Kuliner'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-15', 'JBR-BGR-003', 'Botani Square Pajajaran Premium Billboard', 'jbr-bgr-003-botani-square-pajajaran-premium-billboard', 'Kota Bogor', 'Bogor Timur',
    'Jl. Pajajaran Dekat Akses Botani Square Mall & IPB Baranangsiang', 'Jl. Raya Pajajaran', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.5982, 106.8088, 'Static Billboard',
    14, 7, 98, 1, 'Front Facing (Tegak Lurus)',
    190, 172000, 148000, 38, 20,
    91, 88, 'Sedang (Normal)', 'Available', '',
    68000000, 13200, 'Metal Halide Floodlight 6x400W', 'Arus Pajajaran dari Warung Jambu menuju Sukasari',
    'Mall Visitors, Akademisi IPB, Komunitas Kafe Pajajaran'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-16', 'JBR-BGR-004', 'Sholeh Iskandar Flyover Yasmin JPO', 'jbr-bgr-004-sholeh-iskandar-flyover-yasmin-jpo', 'Kota Bogor', 'Tanah Sareal',
    'Jl. KH. R. Abdullah Bin Nuh (Taman Yasmin)', 'Jl. Sholeh Iskandar (BORR Outer Ring Road)', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.5562, 106.7794, 'JPO Pedestrian Bridge',
    24, 4, 96, 2, 'Cantilever Overhead',
    260, 198000, 174000, 30, 35,
    90, 86, 'Sedang (Normal)', 'Occupied', 'Daihatsu Sahabat Petualang',
    72000000, 12100, 'Backlite LED Uniform Strip', 'Arus Parung-Bogor & Akses Tol BORR Sentul',
    'Penglaju Parung/Bogor Barat, Pengguna Tol BORR'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-17', 'JBR-DPK-001', 'Margonda Raya Margo City LED Spectacular', 'jbr-dpk-001-margonda-raya-margo-city-led-spectacular', 'Kota Depok', 'Beji',
    'Jl. Margonda Raya No. 358 (Depan Margo City & Detos)', 'Jl. Margonda Raya', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.3725, 106.8322, 'LED Videotron',
    20, 10, 200, 1, 'Front Facing (Tegak Lurus)',
    240, 265000, 238000, 58, 12,
    96, 92, 'Tinggi (Kompetitif)', 'Occupied', 'Gopay Pinjam Finansial',
    150000000, 18900, 'P6 Ultra Vibrant LED 6800 nits', 'Arus Jakarta/Pasar Minggu menuju Balai Kota Depok & Sawangan',
    'Mahasiswa UI, Gunadarma, Komuter KRL & Mall Shoppers'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-18', 'JBR-DPK-002', 'Jl. Ir. H. Juanda Simpang Margonda Billboard', 'jbr-dpk-002-jl-ir-h-juanda-simpang-margonda-billboard', 'Kota Depok', 'Sukmajaya',
    'Jl. Ir. H. Juanda (Akses Tol Cijago KM 1.2)', 'Jl. Ir. H. Juanda', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.3842, 106.8405, 'Static Billboard',
    16, 8, 128, 1, 'Front Facing (Tegak Lurus)',
    280, 182000, 154000, 40, 30,
    92, 87, 'Sedang (Normal)', 'Available', '',
    68000000, 12400, 'LED Floodlight 8x250W', 'Keluar Gerbang Tol Kukusan/Cijago menuju Jl. Raya Bogor',
    'Pengguna Tol Cinere-Jagorawi, Residensial Depok Timur'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-19', 'JBR-CRB-001', 'Kartini CSB Mall Curved Videotron', 'jbr-crb-001-kartini-csb-mall-curved-videotron', 'Kota Cirebon', 'Kesambi',
    'Jl. Dr. Cipto Mangunkusumo - Simpang CSB Mall', 'Jl. Dr. Cipto Mangunkusumo', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.7214, 108.5492, 'LED Videotron',
    16, 8, 128, 1, 'Curved Corner (Sudut Simpang)',
    180, 155000, 135000, 50, 16,
    94, 91, 'Sedang (Normal)', 'Occupied', 'Djarum Super Kretek',
    85000000, 18300, 'P6 SMD LED HD Display', 'Arus simpang Cipto menuju Kartini & Grage Mall',
    'Masyarakat Pantura, Pebisnis Cirebon-Kuningan, Mall Goers'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-20', 'JBR-CRB-002', 'Tuparev Arteri Cirebon-Kedawung Billboard', 'jbr-crb-002-tuparev-arteri-cirebon-kedawung-billboard', 'Kabupaten Cirebon', 'Kedawung',
    'Jl. Tuparev No. 88 (Pusat Kuliner Empal Gentong & Hotel)', 'Jl. Raya Tuparev', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.7163, 108.534, 'Static Billboard',
    12, 6, 72, 2, 'Double Sided (Dua Sisi)',
    200, 128000, 105000, 36, 24,
    89, 84, 'Sedang (Normal)', 'Available', '',
    42000000, 10900, 'Frontlite Spotlight LED 6x200W', 'Dua arah: Kota Cirebon ke Kedawung & Exit Tol Plumbon',
    'Wisatawan Kuliner, Tamu Hotel Tuparev, Komuter Lokal'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-21', 'JBR-CRB-003', 'Tol Palimanan - Kanci KM 208 Gantry Megatron', 'jbr-crb-003-tol-palimanan-kanci-km-208-gantry-megatron', 'Kabupaten Cirebon', 'Astanajapura',
    'Ruas Tol Palikanci KM 208+400', 'Jalan Tol Palimanan - Kanci', 'Jalan Tol Bebas Hambatan', 'Jalur Komersial & Retail',
    -6.7725, 108.618, 'Megatron',
    24, 10, 240, 2, 'Cantilever Overhead',
    450, 240000, 216000, 20, 75,
    97, 90, 'Rendah (Unobstructed)', 'Occupied', 'Oppo Reno Series 5G',
    125000000, 17400, 'P10 Rugged Weatherproof LED', 'Arah Jakarta ke Jawa Tengah / Surabaya & Arah Sebaliknya',
    'Pemudik & Pelintas Trans Jawa, Armada Ekspedisi, Wisatawan'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-22', 'JBR-KRW-001', 'Tol Jakarta-Cikampek KM 54 Karawang Timur Megatron', 'jbr-krw-001-tol-jakarta-cikampek-km-54-karawang-timur-megatron', 'Kabupaten Karawang', 'Klari',
    'Rest Area KM 57 / KM 54 Akses Industri', 'Jalan Tol Jakarta - Cikampek', 'Jalan Tol Bebas Hambatan', 'Jalur Komersial & Retail',
    -6.3685, 107.3512, 'Megatron',
    28, 12, 336, 2, 'Front Facing (Tegak Lurus)',
    480, 360000, 325000, 25, 60,
    98, 94, 'Rendah (Unobstructed)', 'Occupied', 'Toyota Innova Zenix Hybrid',
    185000000, 17100, 'P10 High-Luminance Highway Board', 'Arus Tol Japek arah Cikampek / Tol Cipali & Purbaleunyi',
    'Pebisnis Industri Karawang, Wisatawan Lintas Jawa'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-23', 'JBR-KRW-002', 'Bundaran Badami Karawang Barat Videotron', 'jbr-krw-002-bundaran-badami-karawang-barat-videotron', 'Kabupaten Karawang', 'Telukjambe Timur',
    'Jl. Interchange Tol Karawang Barat (Kawasan KIIC)', 'Jl. Interchange Karawang Barat', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.3328, 107.2842, 'LED Videotron',
    16, 8, 128, 1, 'Curved Corner (Sudut Simpang)',
    220, 175000, 152000, 52, 18,
    93, 90, 'Rendah (Unobstructed)', 'Available', '',
    92000000, 17500, 'P6 Outdoor IP65 Certified LED', 'Keluar Tol Karawang Barat menuju Kawasan Industri KIIC & Sedana',
    'Ekspatriat Industri Jepang/Korea, Direksi Pabrik, Pekerja Manufaktur'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-24', 'JBR-TSM-001', 'Jl. HZ Mustofa Pusat Bisnis Videotron', 'jbr-tsm-001-jl-hz-mustofa-pusat-bisnis-videotron', 'Kota Tasikmalaya', 'Cihideung',
    'Jl. HZ. Mustofa No. 115 (Pusat Retail & Perbankan)', 'Jl. HZ. Mustofa', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -7.3315, 108.2198, 'LED Videotron',
    14, 7, 98, 1, 'Front Facing (Tegak Lurus)',
    160, 135000, 118000, 46, 15,
    92, 88, 'Sedang (Normal)', 'Occupied', 'Yamaha NMAX Turbo',
    65000000, 16000, 'P6 SMD LED Crisp Display', 'Arus utama pusat pertokoan HZ Mustofa arah Simpang Padayungan',
    'Konsumen Priangan Timur, Pelaku UMKM Bordir/Batik, Keluarga'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-25', 'JBR-TSM-002', 'Simpang Lima Tasikmalaya Megatron Arteri', 'jbr-tsm-002-simpang-lima-tasikmalaya-megatron-arteri', 'Kota Tasikmalaya', 'Cipedes',
    'Simpang Lima (Pertemuan Jl. Djuanda, RE Martadinata, Mitrabatik)', 'Simpang Lima Tasikmalaya', 'Arteri Primer', 'Jalur Komersial & Retail',
    -7.3192, 108.2235, 'Static Billboard',
    16, 8, 128, 1, 'Curved Corner (Sudut Simpang)',
    220, 148000, 122000, 55, 14,
    91, 86, 'Sedang (Normal)', 'Available', '',
    45000000, 10100, 'High-Power LED Floodlights 6x300W', 'Pertemuan arus dari arah Bandung/Ciawi & Ciamis/Pangandaran',
    'Pelintas Jalur Selatan Jabar, Warga Kota Tasikmalaya'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-26', 'JBR-SKB-001', 'Jl. Siliwangi Alun-Alun Sukabumi LED', 'jbr-skb-001-jl-siliwangi-alun-alun-sukabumi-led', 'Kota Sukabumi', 'Cikole',
    'Jl. Siliwangi No. 45 (Dekat Lapang Merdeka)', 'Jl. Siliwangi', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.9248, 106.9284, 'LED Videotron',
    12, 6, 72, 1, 'Front Facing (Tegak Lurus)',
    150, 115000, 98000, 42, 16,
    90, 85, 'Sedang (Normal)', 'Occupied', 'Aqua Danone Konservasi Jabar',
    52000000, 15100, 'P6 SMD LED Outdoor 6000 nits', 'Pusat kota Sukabumi arah Salabintana & Balai Kota',
    'Masyarakat Sukabumi Kota, Wisatawan Salabintana'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-27', 'JBR-SKB-002', 'Tol Bocimi Exit Cigombong / Parungkuda Billboard', 'jbr-skb-002-tol-bocimi-exit-cigombong-parungkuda-billboard', 'Kabupaten Sukabumi', 'Cicurug',
    'Akses Keluar Tol Bocimi Ruas Cigombong - Cibadak', 'Jalan Tol Bogor-Ciawi-Sukabumi (Bocimi)', 'Jalan Tol Bebas Hambatan', 'Jalur Komersial & Retail',
    -6.829, 106.821, 'Static Billboard',
    18, 8, 144, 1, 'Front Facing (Tegak Lurus)',
    320, 145000, 126000, 32, 50,
    94, 89, 'Rendah (Unobstructed)', 'Available', '',
    55000000, 12600, 'LED Floodlight 6x250W Solar Supported', 'Kendaraan keluar Tol Bocimi menuju Sukabumi & Pelabuhan Ratu',
    'Wisatawan Geopark Ciletuh, Truk Pabrik Air Minum & Garmen'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-28', 'JBR-CMH-001', 'Baros Exit Tol Purbaleunyi Cimahi Videotron', 'jbr-cmh-001-baros-exit-tol-purbaleunyi-cimahi-videotron', 'Kota Cimahi', 'Cimahi Tengah',
    'Jl. HMS Mintaredja SH Simpang Baros', 'Jl. Baros (Exit Tol Cimahi)', 'Arteri Primer', 'Jalur Komersial & Retail',
    -6.8925, 107.5385, 'LED Videotron',
    14, 7, 98, 1, 'Curved Corner (Sudut Simpang)',
    200, 168000, 146000, 52, 15,
    93, 89, 'Sedang (Normal)', 'Occupied', 'Wardah Cosmetics Nature',
    78000000, 15500, 'P6 SMD LED Screen', 'Keluar Exit Tol Baros menuju Alun-alun Cimahi & Padalarang',
    'Pekerja Industri Kreatif Cimahi, Personel Militer, Komuter'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-29', 'JBR-PWK-001', 'Tol Cipularang KM 88 Rest Area Megatron', 'jbr-pwk-001-tol-cipularang-km-88-rest-area-megatron', 'Kabupaten Purwakarta', 'Sukatani',
    'Rest Area Tol Cipularang KM 88+200 Arah Bandung', 'Jalan Tol Cikampek - Purwakarta - Padalarang (Cipularang)', 'Jalan Tol Bebas Hambatan', 'Jalur Komersial & Retail',
    -6.643, 107.411, 'Megatron',
    24, 10, 240, 1, 'Front Facing (Tegak Lurus)',
    420, 275000, 248000, 45, 40,
    97, 93, 'Rendah (Unobstructed)', 'Occupied', 'Kopi Kenangan Rest Area',
    140000000, 17000, 'P10 Weather-Resistant LED', 'Memasuki Rest Area KM 88 Arah Bandung & Arus Tol Utama',
    'Wisatawan Jakarta ke Bandung, Keluarga, Pebisnis Komuter'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-30', 'JBR-SBG-001', 'Tol Cipali KM 92 Subang Gateway Billboard', 'jbr-sbg-001-tol-cipali-km-92-subang-gateway-billboard', 'Kabupaten Subang', 'Kalijati',
    'Tol Cikopo - Palimanan KM 92', 'Jalan Tol Cipali (Trans Jawa)', 'Jalan Tol Bebas Hambatan', 'Jalur Komersial & Retail',
    -6.495, 107.674, 'Static Billboard',
    20, 8, 160, 2, 'Double Sided (Dua Sisi)',
    400, 210000, 185000, 20, 80,
    95, 87, 'Rendah (Unobstructed)', 'Available', '',
    75000000, 11900, 'Solar Powered LED Floodlights 8x150W', 'Dua arah Tol Cipali: Menuju Cirebon/Jawa & Menuju Jakarta',
    'Pengendara Jarak Jauh Trans Jawa, Sopir Bus & Truk Logistik'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-31', 'JBR-SMD-001', 'Jatinangor ITB / UNPAD Campus Corridor LED', 'jbr-smd-001-jatinangor-itb-unpad-campus-corridor-led', 'Kabupaten Sumedang', 'Jatinangor',
    'Jl. Raya Bandung-Sumedang KM 21 (Depan Jatos & Kampus)', 'Jl. Raya Jatinangor', 'Kawasan Komersial & Pusat Bisnis', 'Jalur Komersial & Retail',
    -6.9315, 107.7735, 'LED Videotron',
    14, 7, 98, 1, 'Front Facing (Tegak Lurus)',
    170, 145000, 128000, 48, 14,
    92, 89, 'Sedang (Normal)', 'Occupied', 'By.U Telkomsel Anak Muda',
    68000000, 15600, 'P6 Full HD LED Display', 'Keluar Gerbang Tol Cileunyi/Cisumdawu menuju Kampus Unpad/ITB',
    'Mahasiswa, Civitas Akademika Unpad/ITB/IPDN, Remaja'
) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO spots (
    id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
    latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
    viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
    visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
    rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
) VALUES (
    'spot-32', 'JBR-GRT-001', 'Jl. Cimanuk Simpang Tarogong Garut Billboard', 'jbr-grt-001-jl-cimanuk-simpang-tarogong-garut-billboard', 'Kabupaten Garut', 'Tarogong Kidul',
    'Jl. Cimanuk Simpang Bunderan Tarogong', 'Jl. Cimanuk', 'Arteri Primer', 'Jalur Komersial & Retail',
    -7.2185, 107.892, 'Static Billboard',
    14, 7, 98, 1, 'Curved Corner (Sudut Simpang)',
    200, 118000, 96000, 45, 18,
    89, 84, 'Rendah (Unobstructed)', 'Available', '',
    38000000, 10700, 'LED Spotlight 6x200W', 'Pintu masuk kota Garut dari arah Kadungora/Bandung',
    'Wisatawan Cipanas Garut, Penikmat Dodol, Warga Priangan'
) ON DUPLICATE KEY UPDATE name=VALUES(name);

SET FOREIGN_KEY_CHECKS = 1;
