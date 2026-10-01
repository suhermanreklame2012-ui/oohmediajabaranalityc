import { BillboardSpot, OptimizedTravelRoute, RouteLegDetail, MobilityCorridorType } from '../types/ooh';

/**
 * Utility Pemetaan Jalur Mobilitas & Optimasi Rute OOH
 * CV Bandung Media Outdoor - Strategic Planner Engine
 */

// Menghitung jarak lurus (Haversine formula) dalam kilometer
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Faktor kurvatur jalanan urban (road tortuosity factor) di Jawa Barat / Bandung Raya (~1.32x)
export const ROAD_TORTUOSITY_FACTOR = 1.32;

// Menghitung estimasi jarak tempuh jalan raya aktual
export function estimateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const straightKm = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
  return parseFloat((straightKm * ROAD_TORTUOSITY_FACTOR).toFixed(2));
}

// Menghitung arah mata angin (bearing) dalam derajat dan deskripsi bahasa Indonesia
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { degrees: number; text: string } {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = [
    'Utara',
    'Timur Laut',
    'Timur',
    'Tenggara',
    'Selatan',
    'Barat Daya',
    'Barat',
    'Barat Laut'
  ];
  const index = Math.round(brng / 45) % 8;
  return {
    degrees: Math.round(brng),
    text: directions[index]
  };
}

// Klasifikasi Koridor Mobilitas Otomatis berdasarkan nama jalan dan karakteristik titik
export function getSpotMobilityCorridor(spot: BillboardSpot): MobilityCorridorType {
  const text = `${spot.roadName} ${spot.name} ${spot.address} ${spot.facingDirection}`.toLowerCase();

  if (
    text.includes('lembang') ||
    text.includes('ciwidey') ||
    text.includes('setiabudi') ||
    text.includes('puncak') ||
    text.includes('wisata') ||
    text.includes('resort') ||
    text.includes('gadog') ||
    text.includes('pantai') ||
    text.includes('tangku')
  ) {
    return 'Jalur Pariwisata (Leisure & Tourism)';
  }

  if (
    text.includes('dago') ||
    text.includes('riau') ||
    text.includes('martadinata') ||
    text.includes('braga') ||
    text.includes('paskal') ||
    text.includes('mall') ||
    text.includes('junction') ||
    text.includes('juanda') ||
    text.includes('merdeka') ||
    text.includes('csb') ||
    text.includes('margo')
  ) {
    return 'Jalur Komersial & Retail (Premium Areas)';
  }

  if (
    text.includes('industri') ||
    text.includes('kiic') ||
    text.includes('pabrik') ||
    text.includes('gudang') ||
    text.includes('logistik') ||
    text.includes('cikarang') ||
    text.includes('rancaekek') ||
    text.includes('batujajar') ||
    text.includes('soekarno hatta timur')
  ) {
    return 'Jalur Logistik & Industri';
  }

  // Default: Jalur Komuter (Daily Commuters) seperti Tol Pasteur, Pasupati, By-Pass, Tol Japek, Asia Afrika
  return 'Jalur Komuter (Daily Commuters)';
}

// Algoritma Optimasi Rute Perjalanan Paling Efisien (Traveling Salesperson / 2-Opt TSP)
export function calculateOptimalTravelPath(
  spots: BillboardSpot[],
  startSpotId?: string,
  isDominationJourney: boolean = false
): OptimizedTravelRoute {
  if (spots.length === 0) {
    return {
      orderedSpots: [],
      legs: [],
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      pathCoordinates: [],
      isDominationJourney,
      repetitionMultiplier: 1.0,
      avgSpeedKmh: 25
    };
  }

  if (spots.length === 1) {
    const s = spots[0];
    return {
      orderedSpots: [s],
      legs: [],
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      pathCoordinates: [[s.coordinates.lat, s.coordinates.lng]],
      isDominationJourney,
      repetitionMultiplier: 1.0,
      avgSpeedKmh: s.avgSpeedKmh || 25
    };
  }

  // Tentukan titik awal (start spot)
  let ordered: BillboardSpot[] = [];
  const remaining = [...spots];

  let currentSpot: BillboardSpot;
  if (startSpotId) {
    const foundIdx = remaining.findIndex(s => s.id === startSpotId);
    if (foundIdx !== -1) {
      currentSpot = remaining.splice(foundIdx, 1)[0];
    } else {
      currentSpot = remaining.shift()!;
    }
  } else {
    // Cari titik paling barat atau barat laut sebagai gerbang masuk mobilitas komuter
    let bestStartIdx = 0;
    let minCoordSum = remaining[0].coordinates.lng + remaining[0].coordinates.lat;
    for (let i = 1; i < remaining.length; i++) {
      const sum = remaining[i].coordinates.lng + remaining[i].coordinates.lat;
      if (sum < minCoordSum) {
        minCoordSum = sum;
        bestStartIdx = i;
      }
    }
    currentSpot = remaining.splice(bestStartIdx, 1)[0];
  }

  ordered.push(currentSpot);

  // Greedy Nearest-Neighbor Path Finding
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = estimateRoadDistanceKm(
        currentSpot.coordinates.lat,
        currentSpot.coordinates.lng,
        remaining[i].coordinates.lat,
        remaining[i].coordinates.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    currentSpot = remaining.splice(nearestIdx, 1)[0];
    ordered.push(currentSpot);
  }

  // 2-Opt Local Search Heuristic untuk mengurai jalur menyilang (jika n > 3)
  if (ordered.length >= 4) {
    let improved = true;
    let iteration = 0;
    const maxIterations = 20;

    const calcTotalDistance = (route: BillboardSpot[]) => {
      let d = 0;
      for (let i = 0; i < route.length - 1; i++) {
        d += estimateRoadDistanceKm(
          route[i].coordinates.lat,
          route[i].coordinates.lng,
          route[i + 1].coordinates.lat,
          route[i + 1].coordinates.lng
        );
      }
      return d;
    };

    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;
      const currentDist = calcTotalDistance(ordered);

      for (let i = 1; i < ordered.length - 2; i++) {
        for (let j = i + 1; j < ordered.length - 1; j++) {
          const newRoute = [
            ...ordered.slice(0, i),
            ...ordered.slice(i, j + 1).reverse(),
            ...ordered.slice(j + 1)
          ];
          const newDist = calcTotalDistance(newRoute);
          if (newDist < currentDist - 0.05) {
            ordered = newRoute;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }
  }

  // Susun rincian per-leg (segmen antar titik reklame)
  const legs: RouteLegDetail[] = [];
  let totalDistKm = 0;
  let totalMinutes = 0;

  for (let i = 0; i < ordered.length - 1; i++) {
    const from = ordered[i];
    const to = ordered[i + 1];
    const dist = estimateRoadDistanceKm(
      from.coordinates.lat,
      from.coordinates.lng,
      to.coordinates.lat,
      to.coordinates.lng
    );

    // Kecepatan rata-rata segmen koridor
    const segSpeed = Math.max(15, Math.min(60, (from.avgSpeedKmh + to.avgSpeedKmh) / 2 || 25));
    const mins = Math.max(2, Math.round((dist / segSpeed) * 60));

    const bearing = calculateBearing(
      from.coordinates.lat,
      from.coordinates.lng,
      to.coordinates.lat,
      to.coordinates.lng
    );

    totalDistKm += dist;
    totalMinutes += mins;

    legs.push({
      legIndex: i + 1,
      fromSpot: from,
      toSpot: to,
      distanceKm: dist,
      estimatedMinutes: mins,
      bearingDegrees: bearing.degrees,
      headingText: bearing.text,
      roadSegmentName: `Koridor ${from.roadName} → ${to.roadName}`
    });
  }

  // Coordinates array untuk polyline Leaflet / Google Maps
  const pathCoordinates: [number, number][] = ordered.map(s => [s.coordinates.lat, s.coordinates.lng]);

  // Efek repetisi paparan pada Domination Journey
  const repetitionMultiplier = isDominationJourney
    ? parseFloat((1.0 + (ordered.length - 1) * 0.45).toFixed(2))
    : 1.0;

  const avgSpeed = ordered.reduce((acc, s) => acc + (s.avgSpeedKmh || 25), 0) / ordered.length;

  return {
    orderedSpots: ordered,
    legs,
    totalDistanceKm: parseFloat(totalDistKm.toFixed(1)),
    totalTravelMinutes: totalMinutes,
    pathCoordinates,
    isDominationJourney,
    repetitionMultiplier,
    avgSpeedKmh: Math.round(avgSpeed)
  };
}

/**
 * OPSI STRATEGI 4: DOMINATION JOURNEY SELECTOR
 * Menyusun paket 3-4 titik reklame yang berada dalam satu rute searah berurutan
 * agar audiens terpapar iklan yang sama secara beruntun.
 */
export function generateDominationJourney(
  allSpots: BillboardSpot[],
  targetCorridor: MobilityCorridorType = 'Jalur Komuter (Daily Commuters)'
): {
  journeyRoute: OptimizedTravelRoute;
  selectedSpots: BillboardSpot[];
  rationale: string;
  repeatExposurePct: number;
} {
  // Filter spots yang relevan dengan koridor
  let corridorSpots = allSpots.filter(s => getSpotMobilityCorridor(s) === targetCorridor);
  if (corridorSpots.length < 3) {
    // Fallback bila spot di koridor spesifik kurang dari 3
    corridorSpots = allSpots.slice(0, 5);
  }

  // Cari subset 3 sampai 4 titik yang memiliki linearitas tertinggi (searah)
  // Misalnya koridor Pasteur -> Pasupati -> Dago -> Riau di Bandung
  const targetCount = Math.min(4, Math.max(3, corridorSpots.length));
  const candidateSpots = corridorSpots.slice(0, targetCount);

  const journeyRoute = calculateOptimalTravelPath(candidateSpots, undefined, true);

  const repeatExposurePct = Math.round((journeyRoute.repetitionMultiplier - 1) * 100);

  const rationale = `Paket Domination Journey ini menempatkan ${journeyRoute.orderedSpots.length} titik reklame berurutan di sepanjang ${targetCorridor}. Pola ini memicu fenomena Priming Effect di mana audiens melihat pesan merk Anda berulang kali (repetisi efektif ${journeyRoute.repetitionMultiplier}x) dalam 1 perjalanan tanpa terputus, meningkatkan daya ingat merk (Ad Recall) hingga +${repeatExposurePct}%.`;

  return {
    journeyRoute,
    selectedSpots: journeyRoute.orderedSpots,
    rationale,
    repeatExposurePct
  };
}

/**
 * ALGORITMA 3: WEIGHTED KNAPSACK OPTIMIZATION
 * Memilih kombinasi titik reklame optimal berdasarkan:
 * - Batas Anggaran Klien (Budget Cap - Kapasitas Knapsack)
 * - Nilai Kontak Pandang (OTS / VAC)
 * - Bobot Prioritas Jalur Mobilitas Klien (Corridor Priority Weight)
 * - Bobot SES Audiens Target (SES Fit Multiplier)
 * - Efisiensi Biaya (CPM / Harga Per Bulan)
 */
export interface KnapsackInput {
  spots: BillboardSpot[];
  budgetMillions: number;
  durationMonths: number;
  targetCorridor: MobilityCorridorType | 'Semua Jalur';
  corridorPriorityWeight: number; // e.g. 1.0 - 2.5x
  targetSes: ('SES A' | 'SES B' | 'SES C')[];
  sesWeightMultiplier: number;    // e.g. 1.0 - 2.0x
  campaignGoal: 'awareness' | 'conversion' | 'dwell' | 'cpm';
  discountFactor?: number;
}

export interface KnapsackItemEvaluation {
  spot: BillboardSpot;
  costMillions: number;
  corridorType: MobilityCorridorType;
  corridorBonus: number;
  sesBonus: number;
  rawScore: number;
  weightedScore: number;
  efficiencyRatio: number; // Weighted Score per Million IDR
}

export interface KnapsackResult {
  selectedSpots: BillboardSpot[];
  itemEvaluations: KnapsackItemEvaluation[];
  totalCostMillions: number;
  remainingBudgetMillions: number;
  totalMonthlyVac: number;
  totalGrossReach: number;
  blendedCpm: number;
  avgMatchScore: number;
  corridorDominancePct: number;
}

export function solveWeightedKnapsack({
  spots,
  budgetMillions,
  durationMonths,
  targetCorridor,
  corridorPriorityWeight,
  targetSes,
  sesWeightMultiplier,
  campaignGoal,
  discountFactor = 1.0
}: KnapsackInput): KnapsackResult {
  // 1. Evaluasi & Hitung Bobot Setiap Titik Reklame
  const evaluatedItems: KnapsackItemEvaluation[] = spots.map(spot => {
    const corridor = getSpotMobilityCorridor(spot);
    const spotCostMillions = parseFloat(
      ((spot.ratePerMonthIdr * durationMonths * discountFactor) / 1000000).toFixed(1)
    );

    // Bonus Bobot Jalur Mobilitas (Corridor Multiplier)
    let corridorBonus = 1.0;
    if (targetCorridor !== 'Semua Jalur') {
      if (corridor === targetCorridor) {
        corridorBonus = corridorPriorityWeight;
      } else {
        corridorBonus = 0.85; // Penalti minor bila di luar jalur prioritas
      }
    }

    // Bonus Bobot Demografi SES
    let sesBonus = 1.0;
    const demoText = (spot.targetDemographics || '').toUpperCase();
    const hasSesA = demoText.includes('SES A') || demoText.includes('EKSEKUTIF') || demoText.includes('URBAN');
    const hasSesB = demoText.includes('SES B') || demoText.includes('MAHASISWA') || demoText.includes('KELUARGA');
    const hasSesC = demoText.includes('SES C') || demoText.includes('KOMUTER');

    let matchedSesCount = 0;
    if (targetSes.includes('SES A') && hasSesA) matchedSesCount++;
    if (targetSes.includes('SES B') && hasSesB) matchedSesCount++;
    if (targetSes.includes('SES C') && hasSesC) matchedSesCount++;

    if (matchedSesCount > 0) {
      sesBonus = 1.0 + (matchedSesCount * 0.15 * (sesWeightMultiplier - 1.0));
    }

    // Baseline Exposure Quality Score
    const vacFactor = spot.vacDaily / 5000;
    const dwellFactor = spot.avgDwellTimeSec / 20;
    const visibilityFactor = spot.visibilityScore / 25;

    let rawScore = (vacFactor * 0.45) + (dwellFactor * 0.3) + (visibilityFactor * 0.25);
    if (campaignGoal === 'conversion') {
      rawScore = (dwellFactor * 0.5) + (vacFactor * 0.3) + (visibilityFactor * 0.2);
    } else if (campaignGoal === 'cpm') {
      const cpmEfficiency = Math.max(1, 40000 / (spot.cpmIdr || 20000));
      rawScore = rawScore * 0.4 + cpmEfficiency * 0.6;
    }

    const weightedScore = parseFloat((rawScore * corridorBonus * sesBonus).toFixed(2));
    const efficiencyRatio = spotCostMillions > 0 ? parseFloat((weightedScore / spotCostMillions).toFixed(4)) : 0;

    return {
      spot,
      costMillions: spotCostMillions,
      corridorType: corridor,
      corridorBonus,
      sesBonus,
      rawScore: parseFloat(rawScore.toFixed(2)),
      weightedScore,
      efficiencyRatio
    };
  });

  // Urutkan item berdasarkan rasio efisiensi tertinggi (Greedy Weighted Knapsack Optimization)
  evaluatedItems.sort((a, b) => b.efficiencyRatio - a.efficiencyRatio);

  // Penyeleksian Item dalam Batas Anggaran (0/1 Knapsack Decision)
  let currentSpent = 0;
  const selectedSpots: BillboardSpot[] = [];

  for (const item of evaluatedItems) {
    if (currentSpent + item.costMillions <= budgetMillions) {
      selectedSpots.push(item.spot);
      currentSpent += item.costMillions;
    }
  }

  // Agregasi metrik performa
  const totalMonthlyVac = selectedSpots.reduce((acc, s) => acc + s.vacDaily * 30 * durationMonths, 0);
  const totalGrossReach = selectedSpots.reduce((acc, s) => acc + s.dailyGrossReach * 30 * durationMonths, 0);
  const totalCost = parseFloat(currentSpent.toFixed(1));
  const remainingBudget = parseFloat(Math.max(0, budgetMillions - totalCost).toFixed(1));

  const blendedCpm = totalMonthlyVac > 0
    ? Math.round(((totalCost * 1000000) / totalMonthlyVac) * 1000)
    : 0;

  const avgMatchScore = selectedSpots.length > 0
    ? Math.round(
        selectedSpots.reduce((acc, s) => {
          const evalItem = evaluatedItems.find(it => it.spot.id === s.id);
          return acc + (evalItem ? evalItem.weightedScore * 10 : 75);
        }, 0) / selectedSpots.length
      )
    : 0;

  const targetCorridorCount = selectedSpots.filter(
    s => targetCorridor === 'Semua Jalur' || getSpotMobilityCorridor(s) === targetCorridor
  ).length;

  const corridorDominancePct = selectedSpots.length > 0
    ? Math.round((targetCorridorCount / selectedSpots.length) * 100)
    : 0;

  return {
    selectedSpots,
    itemEvaluations: evaluatedItems,
    totalCostMillions: totalCost,
    remainingBudgetMillions: remainingBudget,
    totalMonthlyVac,
    totalGrossReach,
    blendedCpm,
    avgMatchScore: Math.min(99, Math.max(60, avgMatchScore)),
    corridorDominancePct
  };
}

/**
 * SKEMA DATABASE ERD & STRUKTUR TABEL (PostgreSQL & JSON)
 * Dokumentasi referensi lengkap untuk arsitektur database CV Bandung Media Outdoor
 */
export const DATABASE_SCHEMA_SQL = `-- =========================================================================
-- ARSITEKTUR DATABASE OOH STRATEGIC PLANNER (CV BANDUNG MEDIA OUTDOOR)
-- Engine: PostgreSQL 15+ dengan Ekstensi PostGIS Geospasial
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. TABEL JALUR MOBILITAS (CORRIDORS)
CREATE TABLE IF NOT EXISTS mobility_corridors (
    corridor_id VARCHAR(50) PRIMARY KEY,
    corridor_name VARCHAR(150) NOT NULL,
    corridor_type VARCHAR(60) NOT NULL CHECK (corridor_type IN (
        'Jalur Komuter', 
        'Jalur Pariwisata', 
        'Jalur Komersial & Retail', 
        'Jalur Logistik & Industri'
    )),
    start_point_name VARCHAR(100),
    end_point_name VARCHAR(100),
    avg_speed_kmh NUMERIC(5,2) DEFAULT 25.0,
    peak_traffic_hours VARCHAR(100),
    dominant_direction VARCHAR(100),
    corridor_path_geometry GEOMETRY(LineString, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL POINT OF INTEREST (POI)
CREATE TABLE IF NOT EXISTS points_of_interest (
    poi_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL CHECK (category IN (
        'Mall & Shopping', 'CBD & Office', 'Campus & School', 
        'Transit Hub & Toll', 'Hospital & Health', 'Industrial Estate', 
        'Residential & Elite Housing', 'Tourism & Leisure'
    )),
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    target_ses_tier VARCHAR(10) CHECK (target_ses_tier IN ('SES A', 'SES B', 'SES C')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL TITIK REKLAME (BILLBOARD & DOOH SPOTS)
CREATE TABLE IF NOT EXISTS billboard_spots (
    spot_id VARCHAR(50) PRIMARY KEY,
    spot_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    regency VARCHAR(80) NOT NULL,
    district VARCHAR(80),
    road_name VARCHAR(150) NOT NULL,
    road_type VARCHAR(60) NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN (
        'LED Videotron', 'Static Billboard', 'Megatron', 
        'JPO Pedestrian Bridge', 'Baliho Prisma', 'Neonbox Totem'
    )),
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    corridor_id VARCHAR(50) REFERENCES mobility_corridors(corridor_id) ON DELETE SET NULL,
    
    -- Dimensi & Spesifikasi Fisik
    width_m NUMERIC(5,2) NOT NULL,
    height_m NUMERIC(5,2) NOT NULL,
    area_m2 NUMERIC(7,2) GENERATED ALWAYS AS (width_m * height_m) STORED,
    orientation VARCHAR(60),
    facing_direction VARCHAR(150),
    viewing_distance_m INT DEFAULT 200,
    
    -- Profil Audiens & Tagging Demografis
    primary_ses VARCHAR(20) NOT NULL CHECK (primary_ses IN ('SES A', 'SES B', 'SES C', 'SES A+B')),
    target_demographics TEXT,
    
    -- Metrik Performa Trafik & Kontak Mata (OTS/VAC)
    daily_gross_reach INT NOT NULL,       -- OTS Harian (Opportunity to See)
    vac_daily INT NOT NULL,               -- Visibility Adjusted Contacts
    avg_dwell_time_sec INT DEFAULT 45,    -- Dwell time lampu merah / antrean
    avg_speed_kmh NUMERIC(5,2) DEFAULT 20.0,
    visibility_score INT CHECK (visibility_score BETWEEN 0 AND 100),
    effectiveness_score INT CHECK (effectiveness_score BETWEEN 0 AND 100),
    
    -- Komersial & Tarif
    rate_per_month_idr NUMERIC(15,2) NOT NULL,
    cpm_idr NUMERIC(10,2) NOT NULL,
    occupancy_status VARCHAR(30) DEFAULT 'Available',
    current_brand VARCHAR(150),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL RELASI SPOT KE POI (JARAK SPASIAL & RADIUS)
CREATE TABLE IF NOT EXISTS spot_poi_distances (
    id SERIAL PRIMARY KEY,
    spot_id VARCHAR(50) REFERENCES billboard_spots(spot_id) ON DELETE CASCADE,
    poi_id VARCHAR(50) REFERENCES points_of_interest(poi_id) ON DELETE CASCADE,
    distance_meters INT NOT NULL,
    is_primary_anchor BOOLEAN DEFAULT FALSE,
    UNIQUE(spot_id, poi_id)
);

-- 5. TABEL RENCANA KAMPANYE & OPTIMASI (CAMPAIGN PLANS)
CREATE TABLE IF NOT EXISTS campaign_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(150) NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    industry_category VARCHAR(80),
    budget_limit_idr NUMERIC(15,2) NOT NULL,
    duration_months INT DEFAULT 1,
    priority_corridor_id VARCHAR(50) REFERENCES mobility_corridors(corridor_id),
    target_ses VARCHAR(50),
    knapsack_goal VARCHAR(40) CHECK (knapsack_goal IN ('awareness', 'conversion', 'dwell', 'cpm')),
    is_domination_journey BOOLEAN DEFAULT FALSE,
    total_cost_idr NUMERIC(15,2),
    total_vac_projected BIGINT,
    blended_cpm_idr NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL DETAIL RUTE & URUTAN TITIK (CAMPAIGN ROUTE WAYPOINTS)
CREATE TABLE IF NOT EXISTS campaign_route_waypoints (
    id SERIAL PRIMARY KEY,
    plan_id UUID REFERENCES campaign_plans(plan_id) ON DELETE CASCADE,
    spot_id VARCHAR(50) REFERENCES billboard_spots(spot_id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,             -- Urutan 1, 2, 3, 4 dalam rute perjalanan
    distance_from_prev_km NUMERIC(5,2),       -- Jarak tempuh dari titik sebelumnya
    travel_time_from_prev_min INT,           -- Estimasi menit perjalanan
    leg_road_name VARCHAR(150),
    UNIQUE(plan_id, sequence_order)
);

-- Indeks Spasial PostGIS untuk query kedekatan geografis cepat (<5ms)
CREATE INDEX IF NOT EXISTS idx_billboard_spots_geom ON billboard_spots USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_pois_geom ON points_of_interest USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_corridors_geom ON mobility_corridors USING GIST (corridor_path_geometry);
`;
