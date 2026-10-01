import { INITIAL_BILLBOARD_SPOTS } from '../src/data/jabarData';
import { SPOT_POI_MAP } from '../src/data/poiData';
import { getSpotMobilityCorridor } from '../src/utils/routeOptimizer';
import fs from 'fs';
import path from 'path';

console.log('Generating MySQL and SQLite SQL files for', INITIAL_BILLBOARD_SPOTS.length, 'spots...');

const corridors = [
  { id: 'corridor-komuter', name: 'Jalur Komuter (Daily Commuters)', type: 'Jalur Komuter', start: 'Gerbang Tol Pasteur / Cileunyi', end: 'Pusat Kota Bandung & Wilayah Komuter', speed: 28.0, desc: 'Jalur pergerakan harian pekerja & pebisnis komuter antar-kota dan pusat kota' },
  { id: 'corridor-pariwisata', name: 'Jalur Pariwisata (Leisure & Tourism)', type: 'Jalur Pariwisata', start: 'Jl. Setiabudi / Tol Soreang', end: 'Kawasan Wisata Lembang & Ciwidey', speed: 20.0, desc: 'Jalur utama wisatawan domestik menuju objek wisata alam pegunungan' },
  { id: 'corridor-komersial', name: 'Jalur Komersial & Retail (Premium Areas)', type: 'Jalur Komersial & Retail', start: 'Jl. Ir. H. Djuanda (Dago)', end: 'Jl. R.E. Martadinata & Kawasan Bisnis Asia Afrika', speed: 16.0, desc: 'Jantung retail, pusat perbelanjaan, factory outlet, kafe & perbankan bergengsi' },
  { id: 'corridor-logistik', name: 'Jalur Logistik & Industri', type: 'Jalur Logistik & Industri', start: 'Kawasan Industri KIIC / Tol Cipularang', end: 'By-Pass Soekarno Hatta & Sentra Manufaktur', speed: 35.0, desc: 'Arteri distribusi barang, armada truk logistik nasional & pergudangan' }
];

function escapeSql(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''").replace(/\\/g, '\\\\');
}

// ----------------------------------------------------------------------------
// 1. GENERATE MYSQL / MARIADB SQL (FOR HOSTING / CPANEL / PHPMYADMIN)
// ----------------------------------------------------------------------------
let mysql = `-- ============================================================================
-- DATABASE DUMP: OOH STRATEGIC PLANNER (CV BANDUNG MEDIA OUTDOOR)
-- Format: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+ (Hosting / cPanel / phpMyAdmin)
-- Engine: InnoDB
-- Encoding: UTF-8 Unicode (utf8mb4)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+07:00';

-- ----------------------------------------------------------------------------
-- Struktur Tabel: mobility_corridors
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`mobility_corridors\`;
CREATE TABLE \`mobility_corridors\` (
  \`corridor_id\` varchar(50) NOT NULL,
  \`corridor_name\` varchar(150) NOT NULL,
  \`corridor_type\` varchar(60) NOT NULL,
  \`start_point_name\` varchar(150) DEFAULT NULL,
  \`end_point_name\` varchar(150) DEFAULT NULL,
  \`avg_speed_kmh\` decimal(5,2) DEFAULT '25.00',
  \`description\` text DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`corridor_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Struktur Tabel: points_of_interest
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`points_of_interest\`;
CREATE TABLE \`points_of_interest\` (
  \`poi_id\` varchar(50) NOT NULL,
  \`name\` varchar(200) NOT NULL,
  \`category\` varchar(100) NOT NULL,
  \`latitude\` decimal(10,8) NOT NULL,
  \`longitude\` decimal(11,8) NOT NULL,
  \`target_ses\` varchar(50) DEFAULT 'SES A/B',
  \`highlight_text\` text DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`poi_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Struktur Tabel: billboard_spots
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`billboard_spots\`;
CREATE TABLE \`billboard_spots\` (
  \`spot_id\` varchar(50) NOT NULL,
  \`spot_code\` varchar(50) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`regency\` varchar(100) NOT NULL,
  \`district\` varchar(100) DEFAULT NULL,
  \`address\` text NOT NULL,
  \`road_name\` varchar(150) NOT NULL,
  \`road_type\` varchar(100) NOT NULL,
  \`corridor_type\` varchar(100) NOT NULL,
  \`latitude\` decimal(10,8) NOT NULL,
  \`longitude\` decimal(11,8) NOT NULL,
  \`media_type\` varchar(50) NOT NULL,
  \`width_m\` decimal(6,2) NOT NULL,
  \`height_m\` decimal(6,2) NOT NULL,
  \`area_m2\` decimal(8,2) NOT NULL,
  \`sides\` int(11) DEFAULT '1',
  \`orientation\` varchar(100) DEFAULT NULL,
  \`viewing_distance_m\` int(11) DEFAULT '200',
  \`daily_gross_reach\` int(11) NOT NULL,
  \`vac_daily\` int(11) NOT NULL,
  \`avg_dwell_time_sec\` int(11) NOT NULL DEFAULT '40',
  \`avg_speed_kmh\` int(11) NOT NULL DEFAULT '25',
  \`visibility_score\` int(11) NOT NULL DEFAULT '90',
  \`effectiveness_score\` int(11) NOT NULL DEFAULT '90',
  \`clutter_level\` varchar(100) DEFAULT 'Sedang (Normal)',
  \`occupancy_status\` varchar(50) NOT NULL DEFAULT 'Available',
  \`current_brand\` varchar(150) DEFAULT NULL,
  \`rate_per_month_idr\` bigint(20) NOT NULL,
  \`cpm_idr\` int(11) NOT NULL,
  \`lighting_type\` varchar(150) DEFAULT NULL,
  \`facing_direction\` text DEFAULT NULL,
  \`target_demographics\` text DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`spot_id\`),
  UNIQUE KEY \`spot_code\` (\`spot_code\`),
  KEY \`idx_regency\` (\`regency\`),
  KEY \`idx_corridor\` (\`corridor_type\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Struktur Tabel: spot_poi_distances
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`spot_poi_distances\`;
CREATE TABLE \`spot_poi_distances\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`spot_id\` varchar(50) NOT NULL,
  \`poi_id\` varchar(50) NOT NULL,
  \`distance_meters\` int(11) NOT NULL,
  \`highlight_text\` text DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_spot_id\` (\`spot_id\`),
  KEY \`idx_poi_id\` (\`poi_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Struktur Tabel: campaign_plans
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`campaign_plans\`;
CREATE TABLE \`campaign_plans\` (
  \`plan_id\` varchar(50) NOT NULL,
  \`client_name\` varchar(150) NOT NULL,
  \`campaign_title\` varchar(200) NOT NULL,
  \`industry_category\` varchar(100) DEFAULT NULL,
  \`budget_millions\` int(11) NOT NULL,
  \`duration_months\` int(11) NOT NULL DEFAULT '1',
  \`target_corridor\` varchar(100) DEFAULT 'Semua Jalur',
  \`target_ses\` varchar(100) DEFAULT 'SES A, SES B',
  \`is_domination_journey\` tinyint(1) DEFAULT '0',
  \`total_cost_millions\` decimal(10,2) NOT NULL,
  \`total_monthly_vac\` bigint(20) NOT NULL,
  \`total_gross_reach\` bigint(20) NOT NULL,
  \`blended_cpm\` int(11) NOT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`plan_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Struktur Tabel: campaign_route_waypoints
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`campaign_route_waypoints\`;
CREATE TABLE \`campaign_route_waypoints\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`plan_id\` varchar(50) NOT NULL,
  \`spot_id\` varchar(50) NOT NULL,
  \`sequence_order\` int(11) NOT NULL,
  \`distance_from_prev_km\` decimal(6,2) DEFAULT '0.00',
  \`travel_time_from_prev_min\` int(11) DEFAULT '0',
  \`leg_road_name\` varchar(150) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_plan_id\` (\`plan_id\`),
  KEY \`idx_spot_id\` (\`spot_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATA INSERT: mobility_corridors
-- ============================================================================
`;

corridors.forEach(c => {
  mysql += `INSERT INTO \`mobility_corridors\` (\`corridor_id\`, \`corridor_name\`, \`corridor_type\`, \`start_point_name\`, \`end_point_name\`, \`avg_speed_kmh\`, \`description\`) VALUES ('${c.id}', '${escapeSql(c.name)}', '${c.type}', '${escapeSql(c.start)}', '${escapeSql(c.end)}', ${c.speed}, '${escapeSql(c.desc)}');\n`;
});

mysql += `\n-- ============================================================================
-- DATA INSERT: billboard_spots (${INITIAL_BILLBOARD_SPOTS.length} Titik Reklame)
-- ============================================================================\n`;

INITIAL_BILLBOARD_SPOTS.forEach(s => {
  const corridor = getSpotMobilityCorridor(s);
  mysql += `INSERT INTO \`billboard_spots\` (\`spot_id\`, \`spot_code\`, \`name\`, \`regency\`, \`district\`, \`address\`, \`road_name\`, \`road_type\`, \`corridor_type\`, \`latitude\`, \`longitude\`, \`media_type\`, \`width_m\`, \`height_m\`, \`area_m2\`, \`sides\`, \`orientation\`, \`viewing_distance_m\`, \`daily_gross_reach\`, \`vac_daily\`, \`avg_dwell_time_sec\`, \`avg_speed_kmh\`, \`visibility_score\`, \`effectiveness_score\`, \`clutter_level\`, \`occupancy_status\`, \`current_brand\`, \`rate_per_month_idr\`, \`cpm_idr\`, \`lighting_type\`, \`facing_direction\`, \`target_demographics\`) VALUES ('${s.id}', '${s.code}', '${escapeSql(s.name)}', '${escapeSql(s.regency)}', '${escapeSql(s.district)}', '${escapeSql(s.address)}', '${escapeSql(s.roadName)}', '${escapeSql(s.roadType)}', '${corridor}', ${s.coordinates.lat}, ${s.coordinates.lng}, '${s.type}', ${s.dimensions.width}, ${s.dimensions.height}, ${s.dimensions.areaM2}, ${s.dimensions.sides || 1}, '${escapeSql(s.orientation)}', ${s.viewingDistanceM}, ${s.dailyGrossReach}, ${s.vacDaily}, ${s.avgDwellTimeSec}, ${s.avgSpeedKmh}, ${s.visibilityScore}, ${s.effectivenessScore}, '${escapeSql(s.clutterLevel)}', '${s.occupancyStatus}', '${escapeSql(s.currentBrand)}', ${s.ratePerMonthIdr}, ${s.cpmIdr}, '${escapeSql(s.lightingType)}', '${escapeSql(s.facingDirection)}', '${escapeSql(s.targetDemographics)}');\n`;
});

mysql += `\n-- ============================================================================
-- DATA INSERT: points_of_interest & spot_poi_distances
-- ============================================================================\n`;

const insertedPoiIds = new Set<string>();

Object.keys(SPOT_POI_MAP).forEach(spotId => {
  const pois = SPOT_POI_MAP[spotId] || [];
  pois.forEach(poi => {
    if (!insertedPoiIds.has(poi.id)) {
      insertedPoiIds.add(poi.id);
      const spot = INITIAL_BILLBOARD_SPOTS.find(s => s.id === spotId);
      const lat = spot ? spot.coordinates.lat : -6.9175;
      const lng = spot ? spot.coordinates.lng : 107.6191;
      mysql += `INSERT IGNORE INTO \`points_of_interest\` (\`poi_id\`, \`name\`, \`category\`, \`latitude\`, \`longitude\`, \`target_ses\`, \`highlight_text\`) VALUES ('${poi.id}', '${escapeSql(poi.name)}', '${escapeSql(poi.category)}', ${lat}, ${lng}, 'SES A/B', '${escapeSql(poi.highlightText)}');\n`;
    }

    mysql += `INSERT INTO \`spot_poi_distances\` (\`spot_id\`, \`poi_id\`, \`distance_meters\`, \`highlight_text\`) VALUES ('${spotId}', '${poi.id}', ${poi.distanceMeters}, '${escapeSql(poi.highlightText)}');\n`;
  });
});

mysql += `\nSET FOREIGN_KEY_CHECKS = 1;
-- SELESAI: Database siap diimpor ke hosting MySQL / cPanel phpMyAdmin (CV Bandung Media Outdoor)\n`;

fs.writeFileSync(path.resolve('hosting_import_mysql.sql'), mysql);

// ----------------------------------------------------------------------------
// 2. GENERATE SQLITE SQL (FOR LOCAL SERVER-SIDE EMBEDDED SQLITE3)
// ----------------------------------------------------------------------------
let sqlite = `-- ============================================================================
-- DATABASE DUMP: OOH STRATEGIC PLANNER (CV BANDUNG MEDIA OUTDOOR)
-- Format: SQLite 3
-- Engine: Server-side Persistent Database
-- ============================================================================

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS mobility_corridors;
CREATE TABLE mobility_corridors (
  corridor_id TEXT PRIMARY KEY,
  corridor_name TEXT NOT NULL,
  corridor_type TEXT NOT NULL,
  start_point_name TEXT,
  end_point_name TEXT,
  avg_speed_kmh REAL DEFAULT 25.0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS points_of_interest;
CREATE TABLE points_of_interest (
  poi_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  target_ses TEXT DEFAULT 'SES A/B',
  highlight_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS billboard_spots;
CREATE TABLE billboard_spots (
  spot_id TEXT PRIMARY KEY,
  spot_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  regency TEXT NOT NULL,
  district TEXT,
  address TEXT NOT NULL,
  road_name TEXT NOT NULL,
  road_type TEXT NOT NULL,
  corridor_type TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  media_type TEXT NOT NULL,
  width_m REAL NOT NULL,
  height_m REAL NOT NULL,
  area_m2 REAL NOT NULL,
  sides INTEGER DEFAULT 1,
  orientation TEXT,
  viewing_distance_m INTEGER DEFAULT 200,
  daily_gross_reach INTEGER NOT NULL,
  vac_daily INTEGER NOT NULL,
  avg_dwell_time_sec INTEGER NOT NULL DEFAULT 40,
  avg_speed_kmh INTEGER NOT NULL DEFAULT 25,
  visibility_score INTEGER NOT NULL DEFAULT 90,
  effectiveness_score INTEGER NOT NULL DEFAULT 90,
  clutter_level TEXT DEFAULT 'Sedang (Normal)',
  occupancy_status TEXT NOT NULL DEFAULT 'Available',
  current_brand TEXT,
  rate_per_month_idr INTEGER NOT NULL,
  cpm_idr INTEGER NOT NULL,
  lighting_type TEXT,
  facing_direction TEXT,
  target_demographics TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS spot_poi_distances;
CREATE TABLE spot_poi_distances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id TEXT NOT NULL,
  poi_id TEXT NOT NULL,
  distance_meters INTEGER NOT NULL,
  highlight_text TEXT
);

DROP TABLE IF EXISTS campaign_plans;
CREATE TABLE campaign_plans (
  plan_id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  campaign_title TEXT NOT NULL,
  industry_category TEXT,
  budget_millions INTEGER NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1,
  target_corridor TEXT DEFAULT 'Semua Jalur',
  target_ses TEXT DEFAULT 'SES A, SES B',
  is_domination_journey INTEGER DEFAULT 0,
  total_cost_millions REAL NOT NULL,
  total_monthly_vac INTEGER NOT NULL,
  total_gross_reach INTEGER NOT NULL,
  blended_cpm INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS campaign_route_waypoints;
CREATE TABLE campaign_route_waypoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL,
  spot_id TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  distance_from_prev_km REAL DEFAULT 0.0,
  travel_time_from_prev_min INTEGER DEFAULT 0,
  leg_road_name TEXT
);
\n`;

corridors.forEach(c => {
  sqlite += `INSERT INTO mobility_corridors (corridor_id, corridor_name, corridor_type, start_point_name, end_point_name, avg_speed_kmh, description) VALUES ('${c.id}', '${escapeSql(c.name)}', '${c.type}', '${escapeSql(c.start)}', '${escapeSql(c.end)}', ${c.speed}, '${escapeSql(c.desc)}');\n`;
});

INITIAL_BILLBOARD_SPOTS.forEach(s => {
  const corridor = getSpotMobilityCorridor(s);
  sqlite += `INSERT INTO billboard_spots (spot_id, spot_code, name, regency, district, address, road_name, road_type, corridor_type, latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation, viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh, visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand, rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics) VALUES ('${s.id}', '${s.code}', '${escapeSql(s.name)}', '${escapeSql(s.regency)}', '${escapeSql(s.district)}', '${escapeSql(s.address)}', '${escapeSql(s.roadName)}', '${escapeSql(s.roadType)}', '${corridor}', ${s.coordinates.lat}, ${s.coordinates.lng}, '${s.type}', ${s.dimensions.width}, ${s.dimensions.height}, ${s.dimensions.areaM2}, ${s.dimensions.sides || 1}, '${escapeSql(s.orientation)}', ${s.viewingDistanceM}, ${s.dailyGrossReach}, ${s.vacDaily}, ${s.avgDwellTimeSec}, ${s.avgSpeedKmh}, ${s.visibilityScore}, ${s.effectivenessScore}, '${escapeSql(s.clutterLevel)}', '${s.occupancyStatus}', '${escapeSql(s.currentBrand)}', ${s.ratePerMonthIdr}, ${s.cpmIdr}, '${escapeSql(s.lightingType)}', '${escapeSql(s.facingDirection)}', '${escapeSql(s.targetDemographics)}');\n`;
});

insertedPoiIds.clear();
Object.keys(SPOT_POI_MAP).forEach(spotId => {
  const pois = SPOT_POI_MAP[spotId] || [];
  pois.forEach(poi => {
    if (!insertedPoiIds.has(poi.id)) {
      insertedPoiIds.add(poi.id);
      const spot = INITIAL_BILLBOARD_SPOTS.find(s => s.id === spotId);
      const lat = spot ? spot.coordinates.lat : -6.9175;
      const lng = spot ? spot.coordinates.lng : 107.6191;
      sqlite += `INSERT OR IGNORE INTO points_of_interest (poi_id, name, category, latitude, longitude, target_ses, highlight_text) VALUES ('${poi.id}', '${escapeSql(poi.name)}', '${escapeSql(poi.category)}', ${lat}, ${lng}, 'SES A/B', '${escapeSql(poi.highlightText)}');\n`;
    }
    sqlite += `INSERT INTO spot_poi_distances (spot_id, poi_id, distance_meters, highlight_text) VALUES ('${spotId}', '${poi.id}', ${poi.distanceMeters}, '${escapeSql(poi.highlightText)}');\n`;
  });
});

sqlite += `\nPRAGMA foreign_keys = ON;\n`;

fs.writeFileSync(path.resolve('hosting_import_sqlite.sql'), sqlite);

console.log('Successfully created hosting_import_mysql.sql (' + Math.round(mysql.length / 1024) + ' KB)');
console.log('Successfully created hosting_import_sqlite.sql (' + Math.round(sqlite.length / 1024) + ' KB)');
