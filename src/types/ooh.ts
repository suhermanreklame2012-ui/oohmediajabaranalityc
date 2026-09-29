export type BillboardType = 
  | 'LED Videotron' 
  | 'Static Billboard' 
  | 'Megatron' 
  | 'JPO Pedestrian Bridge' 
  | 'Baliho Prisma' 
  | 'Neonbox Totem';

export type OccupancyStatus = 'Occupied' | 'Available' | 'Maintenance' | 'Reserved';

export type RoadType = 
  | 'Jalan Tol Bebas Hambatan' 
  | 'Arteri Primer' 
  | 'Arteri Sekunder' 
  | 'Kolektor Perkotaan' 
  | 'Kawasan Komersial & Pusat Bisnis';

export type OrientationType = 
  | 'Front Facing (Tegak Lurus)' 
  | 'Parallel / Side (Sejajar)' 
  | 'Cantilever Overhead' 
  | 'Curved Corner (Sudut Simpang)' 
  | 'Double Sided (Dua Sisi)';

export type ClutterLevel = 'Rendah (Unobstructed)' | 'Sedang (Normal)' | 'Tinggi (Kompetitif)';

export interface TrafficBreakdown {
  motorcycles: number;      // % percentage
  privateCars: number;      // % percentage
  publicTransport: number;  // % percentage
  commercialTrucks: number; // % percentage
}

export interface HistoricalPerformanceRecord {
  month: string;
  year: number;
  grossReach: number;
  vac: number;
  trafficIndex: number; // base 100
  occupancyPercent: number;
}

export interface BillboardSpot {
  id: string;
  code: string;
  name: string;
  regency: string; // Kota / Kabupaten
  district: string; // Kecamatan
  address: string;
  roadName: string;
  roadType: RoadType;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: BillboardType;
  dimensions: {
    width: number;
    height: number;
    areaM2: number;
    sides: number;
  };
  orientation: OrientationType;
  heightAboveGroundM: number;
  viewingDistanceM: number;
  
  // Performance Metrics
  dailyGrossReach: number;        // DGR - Total daily vehicles + pedestrians
  vacDaily: number;               // Visibility Adjusted Contacts
  avgFrequency?: number;          // Frekuensi paparan mingguan per komuter (e.g. 3.4x)
  avgDwellTimeSec: number;        // Durasi pandang rata-rata (detik)
  avgSpeedKmh: number;            // Kecepatan rata-rata kendaraan
  trafficBreakdown: TrafficBreakdown;
  visibilityScore: number;        // 0 - 100
  clutterLevel: ClutterLevel;
  effectivenessScore: number;     // 0 - 100 (Indeks Efektivitas Penempatan)
  
  // Historical data for predictive modeling
  historicalTrend?: HistoricalPerformanceRecord[];

  // Commercial & Operations
  occupancyStatus: OccupancyStatus;
  currentBrand?: string;
  ratePerMonthIdr: number;
  cpmIdr: number;                 // Cost per Thousand Impressions (IDR)
  lightingType: string;
  powerConsumptionKw: number;
  facingDirection: string;        // Arah hadap
  targetDemographics: string;
  featuredImageUrl?: string;
}

export interface WestJavaRegencyMeta {
  name: string;
  type: 'Kota' | 'Kabupaten';
  center: [number, number];
  zoom: number;
  totalPopulation: number;
  totalSpots: number;
  avgDailyTraffic: number;
  projectedAnnualGrowthPct: number;
  dominantEconomy: string;
}

export interface PredictiveScenario {
  targetIndustry: string;
  seasonality: 'Reguler' | 'Mudik & Libur Lebaran' | 'Liburan Sekolah / Akhir Tahun' | 'Festival Belanja Q4';
  trafficGrowthRatePct: number; // e.g. 6.5%
  timeHorizon: 'Q4 2026' | 'Q1 2027' | 'Q2 2027' | 'Q3 2027';
  infrastructureImpact: 'Biasa' | 'Aktivasi Tol Baru / LRT' | 'Perluasan Pusat Niaga';
}

export interface PredictiveSpotResult {
  spot: BillboardSpot;
  currentEffectiveness: number;
  predictedEffectiveness: number;
  projectedVac: number;
  projectedReach: number;
  projectedRoiScore: number;
  growthDeltaPct: number;
  confidenceScore: number;
  strategicRationale: string;
  recommendedCategory: 'Top Priority Future Placement' | 'High Growth Transit' | 'Stable Sustained Performer';
}

export interface ReportConfig {
  campaignName: string;
  brandClient: string;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  datePeriodLabel: string;
  selectedSpots: string[]; // spot IDs
  includeFrequency: boolean;
  includeDemographics: boolean;
  includeCostEfficiency: boolean;
  notes: string;
}

