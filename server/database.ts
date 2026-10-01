import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('database.sqlite');
const SQLITE_DUMP_PATH = path.resolve('hosting_import_sqlite.sql');

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    const isNew = !fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size === 0;
    dbInstance = new DatabaseSync(DB_PATH);

    if (isNew) {
      console.log('Initializing SQLite database from hosting_import_sqlite.sql...');
      if (fs.existsSync(SQLITE_DUMP_PATH)) {
        const dumpSql = fs.readFileSync(SQLITE_DUMP_PATH, 'utf8');
        dbInstance.exec(dumpSql);
        console.log('SQLite database initialized and seeded successfully!');
      }
    }
  }
  return dbInstance;
}

export interface DbSpotRow {
  spot_id: string;
  spot_code: string;
  name: string;
  regency: string;
  district: string;
  address: string;
  road_name: string;
  road_type: string;
  corridor_type: string;
  latitude: number;
  longitude: number;
  media_type: string;
  width_m: number;
  height_m: number;
  area_m2: number;
  sides: number;
  orientation: string;
  viewing_distance_m: number;
  daily_gross_reach: number;
  vac_daily: number;
  avg_dwell_time_sec: number;
  avg_speed_kmh: number;
  visibility_score: number;
  effectiveness_score: number;
  clutter_level: string;
  occupancy_status: string;
  current_brand: string;
  rate_per_month_idr: number;
  cpm_idr: number;
  lighting_type: string;
  facing_direction: string;
  target_demographics: string;
}

export function rowToBillboardSpot(row: DbSpotRow): any {
  return {
    id: row.spot_id,
    code: row.spot_code,
    name: row.name,
    regency: row.regency,
    district: row.district || '',
    address: row.address,
    roadName: row.road_name,
    roadType: row.road_type,
    corridorType: row.corridor_type,
    coordinates: {
      lat: Number(row.latitude),
      lng: Number(row.longitude)
    },
    type: row.media_type,
    dimensions: {
      width: Number(row.width_m),
      height: Number(row.height_m),
      areaM2: Number(row.area_m2),
      sides: Number(row.sides || 1)
    },
    orientation: row.orientation,
    heightAboveGroundM: 9.0,
    viewingDistanceM: Number(row.viewing_distance_m),
    dailyGrossReach: Number(row.daily_gross_reach),
    vacDaily: Number(row.vac_daily),
    avgDwellTimeSec: Number(row.avg_dwell_time_sec),
    avgSpeedKmh: Number(row.avg_speed_kmh),
    trafficBreakdown: {
      motorcycles: 55,
      privateCars: 35,
      publicTransport: 7,
      commercialTrucks: 3
    },
    visibilityScore: Number(row.visibility_score),
    clutterLevel: row.clutter_level,
    effectivenessScore: Number(row.effectiveness_score),
    occupancyStatus: row.occupancy_status,
    currentBrand: row.current_brand || '',
    ratePerMonthIdr: Number(row.rate_per_month_idr),
    cpmIdr: Number(row.cpm_idr),
    lightingType: row.lighting_type,
    powerConsumptionKw: 15,
    facingDirection: row.facing_direction,
    targetDemographics: row.target_demographics
  };
}

export function getAllSpotsFromDb(): any[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM billboard_spots ORDER BY regency, name');
  const rows = stmt.all() as unknown as DbSpotRow[];
  return rows.map(rowToBillboardSpot);
}

export function insertSpotToDb(spot: any): any {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO billboard_spots (
      spot_id, spot_code, name, regency, district, address, road_name, road_type,
      corridor_type, latitude, longitude, media_type, width_m, height_m, area_m2,
      sides, orientation, viewing_distance_m, daily_gross_reach, vac_daily,
      avg_dwell_time_sec, avg_speed_kmh, visibility_score, effectiveness_score,
      clutter_level, occupancy_status, current_brand, rate_per_month_idr, cpm_idr,
      lighting_type, facing_direction, target_demographics
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const id = spot.id || `spot-${Date.now()}`;
  const width = Number(spot.dimensions?.width || 12);
  const height = Number(spot.dimensions?.height || 6);
  const area = Number(spot.dimensions?.areaM2 || width * height);

  stmt.run(
    id,
    spot.code || `JBR-${Date.now().toString().slice(-4)}`,
    spot.name,
    spot.regency || 'Kota Bandung',
    spot.district || '',
    spot.address || spot.roadName,
    spot.roadName,
    spot.roadType || 'Arteri Primer',
    spot.corridorType || 'Jalur Komuter',
    Number(spot.coordinates?.lat || -6.9175),
    Number(spot.coordinates?.lng || 107.6191),
    spot.type || 'Static Billboard',
    width,
    height,
    area,
    Number(spot.dimensions?.sides || 1),
    spot.orientation || 'Front Facing (Tegak Lurus)',
    Number(spot.viewingDistanceM || 200),
    Number(spot.dailyGrossReach || 150000),
    Number(spot.vacDaily || 125000),
    Number(spot.avgDwellTimeSec || 40),
    Number(spot.avgSpeedKmh || 25),
    Number(spot.visibilityScore || 90),
    Number(spot.effectivenessScore || 88),
    spot.clutterLevel || 'Sedang (Normal)',
    spot.occupancyStatus || 'Available',
    spot.currentBrand || '',
    Number(spot.ratePerMonthIdr || 60000000),
    Number(spot.cpmIdr || 16000),
    spot.lightingType || 'High-Lumen Floodlight',
    spot.facingDirection || '',
    spot.targetDemographics || 'Komuter Umum'
  );

  return { ...spot, id };
}

export function updateSpotInDb(id: string, updates: any): boolean {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.occupancyStatus !== undefined) { fields.push('occupancy_status = ?'); values.push(updates.occupancyStatus); }
  if (updates.currentBrand !== undefined) { fields.push('current_brand = ?'); values.push(updates.currentBrand); }
  if (updates.ratePerMonthIdr !== undefined) { fields.push('rate_per_month_idr = ?'); values.push(Number(updates.ratePerMonthIdr)); }

  if (fields.length === 0) return false;

  values.push(id);
  const sql = `UPDATE billboard_spots SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE spot_id = ?`;
  const stmt = db.prepare(sql);
  const result = stmt.run(...values);
  return (result as any).changes > 0;
}

export function deleteSpotFromDb(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM billboard_spots WHERE spot_id = ?');
  const result = stmt.run(id);
  return (result as any).changes > 0;
}

export function getDatabaseStats() {
  const db = getDatabase();
  const spotsCount = (db.prepare('SELECT count(*) as c FROM billboard_spots').get() as any)?.c || 0;
  const corridorsCount = (db.prepare('SELECT count(*) as c FROM mobility_corridors').get() as any)?.c || 0;
  const poisCount = (db.prepare('SELECT count(*) as c FROM points_of_interest').get() as any)?.c || 0;
  const distancesCount = (db.prepare('SELECT count(*) as c FROM spot_poi_distances').get() as any)?.c || 0;

  const fileSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;
  const mysqlDumpSize = fs.existsSync(path.resolve('hosting_import_mysql.sql')) 
    ? fs.statSync(path.resolve('hosting_import_mysql.sql')).size 
    : 0;

  return {
    engine: 'SQLite 3 (Server-Side Persistent) + MySQL 8.0/MariaDB Ready',
    databaseFile: 'database.sqlite',
    fileSizeBytes: fileSize,
    fileSizeKb: Math.round(fileSize / 1024),
    mysqlDumpSizeBytes: mysqlDumpSize,
    mysqlDumpSizeKb: Math.round(mysqlDumpSize / 1024),
    tables: {
      billboard_spots: spotsCount,
      mobility_corridors: corridorsCount,
      points_of_interest: poisCount,
      spot_poi_distances: distancesCount
    },
    clientStorageUsed: false,
    localStorageStatus: 'DISABLED (Menggunakan Server SQLite & MySQL REST API)'
  };
}
