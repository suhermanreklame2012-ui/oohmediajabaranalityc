export interface AtlDataInput {
  totalBillboards: number;
  monthlyVac: number;
  monthlyOts: number;
  primaryCorridors: string[];
  broadcastGrpEstimate?: number;
}

export interface BtlDataInput {
  roadshowEventsCount: number;
  directSamplingFootfall: number;
  boothConversionRatePct: number;
  activePopUpLocations: string[];
}

export interface DigitalDataInput {
  geotargetedImpressions: number;
  clickThroughRatePct: number;
  topTargetedDistricts: { name: string; deviceDensity: number; intentScore: number }[];
  searchIntentKeyword: string;
}

export interface PipelineSimulationInput {
  brandName: string;
  retailIndustry: 'F&B Modern & Kafe' | 'Otomotif & EV Dealership' | 'Fashion & Lifestyle Retail' | 'Minimarket & Grocery' | 'Elektronik & Gadget' | 'Farmasi & Klinik Kesehatan';
  budgetTier: 'Regional Jabar Scale' | 'Metropolitan Bandung Only' | 'Mega Multi-City Corridor';
  atl: AtlDataInput;
  btl: BtlDataInput;
  digital: DigitalDataInput;
}

export interface RecommendedInventoryAllocation {
  skuCategory: string;
  targetStockRatioPct: number;
  replenishmentUrgency: 'Segera (High Priority)' | 'Reguler' | 'Buffer Stock Tambahan';
  rationale: string;
}

export interface GeospatialSiteRecommendation {
  clusterId: string;
  clusterName: string;
  regency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  omnichannelOpportunityScore: number; // 0 - 100
  atlExposureScore: number;            // 0 - 100
  btlActivationScore: number;          // 0 - 100
  digitalIntentScore: number;          // 0 - 100
  retailSaturationLevel: 'Rendah (Peluang Ekspansi Emas)' | 'Sedang (Potensi Terbuka)' | 'Tinggi (Kompetitif)';
  siteCategoryAction: 'Buka Gerai Flagship / Experience Store' | 'Buka Titik Ritel Satelit / Express' | 'Tingkatkan Alokasi Stok Gudang Wilayah' | 'Aktivasi Billboard Dukungan Baru';
  projectedMonthlyFootfall: number;
  projectedRevenueLiftPct: number;
  recommendedInventory: RecommendedInventoryAllocation[];
  geospatialRationale: string;
}

export interface PipelineStageMetric {
  stageId: string;
  stepNumber: number;
  title: string;
  component: string;
  status: 'completed' | 'processing' | 'queued';
  latencyMs: number;
  recordsProcessed: number;
  description: string;
  dataOutputSample: string;
}

export interface AiAutomationPipelineResponse {
  pipelineExecutionId: string;
  analyzedAt: string;
  aiEngineModel: string;
  executiveSummary: string;
  pipelineStages: PipelineStageMetric[];
  spatialRecommendations: GeospatialSiteRecommendation[];
  crossChannelAttribution: {
    atlBillboardContributionPct: number;
    btlFieldActivationContributionPct: number;
    digitalGeotargetedContributionPct: number;
    crossChannelSynergyLiftPct: number;
  };
  sitePlannerDirectives: string[];
}
