import { useState, useMemo } from 'react';
import { BillboardSpot, MobilityCorridorType } from '../types/ooh';
import { 
  BRAND_INDUSTRY_PROFILES, 
  BrandIndustryProfile, 
  evaluateSpotForBrand, 
  BrandPlacementEvaluation,
  getSpotPois
} from '../data/poiData';
import { 
  calculateOptimalTravelPath, 
  generateDominationJourney, 
  solveWeightedKnapsack, 
  getSpotMobilityCorridor,
  estimateRoadDistanceKm,
  calculateBearing,
  DATABASE_SCHEMA_SQL
} from '../utils/routeOptimizer';
import { CampaignRouteMap } from './CampaignRouteMap';
import { BudgetOptimizationTool } from './BudgetOptimizationTool';
import { BudgetOptimizationResult } from '../utils/budgetOptimizationHeuristics';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  ArrowRight,
  Layers,
  Building2,
  Users,
  Target,
  Clock,
  Compass,
  Car,
  Award,
  Check,
  Printer,
  ChevronRight,
  Navigation,
  Eye,
  Percent,
  Search,
  Zap,
  Briefcase,
  Share2,
  FileText,
  ShieldCheck,
  AlertCircle,
  Database,
  Route,
  Maximize2,
  Copy,
  CheckCheck,
  ClipboardCheck,
  Wrench
} from 'lucide-react';

interface CampaignPlannerProps {
  spots: BillboardSpot[];
  onOpenMapTab: (spot: BillboardSpot) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
}

// Brand preset suggestions for instant 1-click loading
const BRAND_PRESETS = [
  { name: 'Samsung Galaxy S25 Ultra', industryId: 'gadget_tech', budget: 350, goal: 'awareness' as const, corridor: 'Jalur Komersial & Retail (Premium Areas)' as MobilityCorridorType },
  { name: 'Bank BCA Prioritas', industryId: 'banking_fintech', budget: 450, goal: 'awareness' as const, corridor: 'Jalur Komuter (Daily Commuters)' as MobilityCorridorType },
  { name: 'BYD Sealion 7 EV', industryId: 'automotive_ev', budget: 500, goal: 'awareness' as const, corridor: 'Jalur Komuter (Daily Commuters)' as MobilityCorridorType },
  { name: 'Wisata Lembang Wonderland', industryId: 'tourism_leisure', budget: 280, goal: 'conversion' as const, corridor: 'Jalur Pariwisata (Leisure & Tourism)' as MobilityCorridorType },
  { name: 'Uniqlo Paris Van Java', industryId: 'fashion_beauty', budget: 320, goal: 'conversion' as const, corridor: 'Jalur Komersial & Retail (Premium Areas)' as MobilityCorridorType },
  { name: 'Logistik Cepat J&T Cargo', industryId: 'industrial_b2b', budget: 220, goal: 'awareness' as const, corridor: 'Jalur Logistik & Industri' as MobilityCorridorType }
];

/**
 * Result structure for the top effective billboard suggestion
 */
export interface TopEffectiveBillboardSuggestion {
  spot: BillboardSpot;
  rank: number;
  trafficDensityScore: number;         // 0-100 (volume, VAC, dwell time & congestion index)
  historicalConversionRatePct: number;   // % (derived from historical trend trafficIndex, occupancy, dwell time & effectiveness)
  compositeEffectivenessScore: number;   // 0-100 overall weighted score
  dailyTrafficVolume: number;           // DGR
  avgDwellTimeSec: number;              // Dwell time in seconds
  historicalOccupancyPct: number;       // %
  keyRecommendationRationale: string;
}

/**
 * Helper function within CampaignPlanner that suggests the top 5 most effective
 * billboard locations based on current traffic density and historical conversion rates.
 */
export function suggestTopEffectiveBillboards(
  spots: BillboardSpot[],
  limit: number = 5
): TopEffectiveBillboardSuggestion[] {
  if (!spots || spots.length === 0) return [];

  const evaluated = spots.map(spot => {
    // 1. Current Traffic Density Score (0 - 100)
    // Derived from daily traffic volume (DGR), visibility adjusted contacts (VAC),
    // and congestion index (higher dwell time + lower speed indicates dense bumper-to-bumper queue)
    const volumeFactor = Math.min(100, (spot.dailyGrossReach / 180000) * 100);
    const vacFactor = Math.min(100, (spot.vacDaily / 140000) * 100);
    const congestionFactor = Math.min(
      100,
      (spot.avgDwellTimeSec / 45) * 60 + Math.max(0, (40 - spot.avgSpeedKmh) * 1.5)
    );

    const trafficDensityScore = Math.min(
      99,
      Math.max(45, Math.round(volumeFactor * 0.40 + vacFactor * 0.35 + congestionFactor * 0.25))
    );

    // 2. Historical Conversion Rate (%)
    // Derived from historicalTrend (trafficIndex, occupancyPercent) + effectivenessScore + dwell boost
    const historicalRecords = spot.historicalTrend || [];
    const avgHistoricalTrafficIndex =
      historicalRecords.length > 0
        ? historicalRecords.reduce((acc, h) => acc + (h.trafficIndex || 100), 0) / historicalRecords.length
        : 100;

    const avgHistoricalOccupancy =
      historicalRecords.length > 0
        ? historicalRecords.reduce((acc, h) => acc + (h.occupancyPercent || 85), 0) / historicalRecords.length
        : 85;

    // Base conversion benchmark for prime outdoor media in Java Barat (2.2% - 9.4%)
    const baseConversionRate = (spot.effectivenessScore / 100) * 4.2;
    const dwellConversionMultiplier = 1 + (spot.avgDwellTimeSec / 45) * 0.45;
    const historicalTrendFactor = (avgHistoricalTrafficIndex / 100) * (avgHistoricalOccupancy / 100);

    const historicalConversionRatePct = parseFloat(
      Math.min(9.4, Math.max(2.1, baseConversionRate * dwellConversionMultiplier * historicalTrendFactor)).toFixed(2)
    );

    // 3. Composite Effectiveness Score (0 - 100)
    // Weighted combination: Traffic Density (45%) + Historical Conversion (40%) + Visibility Score (15%)
    const normalizedConversion = Math.min(100, (historicalConversionRatePct / 8.5) * 100);
    const compositeEffectivenessScore = Math.min(
      99,
      Math.max(
        50,
        Math.round(trafficDensityScore * 0.45 + normalizedConversion * 0.40 + spot.visibilityScore * 0.15)
      )
    );

    const rationale = `Densitas lalu lintas ${trafficDensityScore}/100 (${spot.dailyGrossReach.toLocaleString('id-ID')} DGR, dwell ${spot.avgDwellTimeSec}s) dengan konversi historis ${historicalConversionRatePct}% didukung okupansi ${avgHistoricalOccupancy.toFixed(0)}%.`;

    return {
      spot,
      rank: 0,
      trafficDensityScore,
      historicalConversionRatePct,
      compositeEffectivenessScore,
      dailyTrafficVolume: spot.dailyGrossReach,
      avgDwellTimeSec: spot.avgDwellTimeSec,
      historicalOccupancyPct: Math.round(avgHistoricalOccupancy),
      keyRecommendationRationale: rationale
    };
  });

  // Sort descending by composite effectiveness score
  evaluated.sort((a, b) => b.compositeEffectivenessScore - a.compositeEffectivenessScore);

  return evaluated.slice(0, limit).map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}

/**
 * Inspection leg structure detailing travel time, distance, and technical checklist
 */
export interface FieldInspectionLeg {
  legIndex: number;
  fromSpot: BillboardSpot;
  toSpot: BillboardSpot;
  distanceKm: number;
  drivingMinutes: number;
  inspectionMinutes: number;
  cumulativeMinutes: number;
  bearing: { degrees: number; text: string };
  auditChecklist: string[];
}

/**
 * Complete Field Inspection Plan generated by the route planning algorithm
 */
export interface FieldInspectionPlan {
  orderedSpots: BillboardSpot[];
  totalSpotsCount: number;
  totalDrivingKm: number;
  totalDrivingMinutes: number;
  totalInspectionMinutes: number;
  totalShiftHours: number;
  legs: FieldInspectionLeg[];
  inspectionRationale: string;
  routeData: import('../types/ooh').OptimizedTravelRoute;
}

/**
 * Route planning algorithm that calculates the most efficient visiting sequence
 * for a field team to inspect a set of selected billboard spots (TSP Nearest-Neighbor + 2-Opt)
 */
export function calculateFieldInspectionRoute(
  spots: BillboardSpot[],
  startSpotId?: string
): FieldInspectionPlan {
  if (!spots || spots.length === 0) {
    const emptyRoute: import('../types/ooh').OptimizedTravelRoute = {
      orderedSpots: [],
      legs: [],
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      pathCoordinates: [],
      isDominationJourney: false,
      repetitionMultiplier: 1,
      avgSpeedKmh: 28
    };
    return {
      orderedSpots: [],
      totalSpotsCount: 0,
      totalDrivingKm: 0,
      totalDrivingMinutes: 0,
      totalInspectionMinutes: 0,
      totalShiftHours: 0,
      legs: [],
      inspectionRationale: 'Pilih titik reklame terlebih dahulu untuk menyusun jadwal rute inspeksi tim lapangan.',
      routeData: emptyRoute
    };
  }

  // 1. TSP Optimal path algorithm using 2-Opt heuristic
  const travelPath = calculateOptimalTravelPath(spots, startSpotId, false);
  const orderedSpots = travelPath.orderedSpots;

  // 2. Build inspection legs with specific audit focus per spot type
  const legs: FieldInspectionLeg[] = [];
  let cumulativeDrivingMinutes = 0;
  let totalInspectionMinutes = 0;

  orderedSpots.forEach((spot, idx) => {
    const isLed = spot.type.includes('LED') || spot.type.includes('Mega');
    const isJpo = spot.type.includes('JPO');
    const spotInspectionTime = isLed ? 25 : isJpo ? 20 : 15;
    totalInspectionMinutes += spotInspectionTime;

    if (idx < orderedSpots.length - 1) {
      const fromSpot = spot;
      const toSpot = orderedSpots[idx + 1];
      const distanceKm = estimateRoadDistanceKm(
        fromSpot.coordinates.lat,
        fromSpot.coordinates.lng,
        toSpot.coordinates.lat,
        toSpot.coordinates.lng
      );
      const drivingMinutes = Math.max(5, Math.round((distanceKm / 28) * 60));
      cumulativeDrivingMinutes += drivingMinutes;

      const bearing = calculateBearing(
        fromSpot.coordinates.lat,
        fromSpot.coordinates.lng,
        toSpot.coordinates.lat,
        toSpot.coordinates.lng
      );

      const checklist = [
        isLed 
          ? 'Pemeriksaan modul kabinet LED, dead-pixel & kalibrasi sensor lux' 
          : 'Pemeriksaan ketegangan visual vinyl & fungsi lampu sorot malam (floodlight)',
        'Inspeksi kekokohan tiang monopole, baut angkur pondasi & grounding penangkal petir',
        'Verifikasi jarak pandang bebas dari dahan pohon, kabel PLN & rambu jalan',
        spot.occupancyStatus === 'Occupied' 
          ? `Audit kesesuaian materi iklan aktif klien (${spot.currentBrand || 'Klien'})` 
          : 'Audit stiker ketersediaan & nomor kontak pemasaran CV Bandung Media Outdoor'
      ];

      legs.push({
        legIndex: idx + 1,
        fromSpot,
        toSpot,
        distanceKm,
        drivingMinutes,
        inspectionMinutes: spotInspectionTime,
        cumulativeMinutes: cumulativeDrivingMinutes + totalInspectionMinutes,
        bearing,
        auditChecklist: checklist
      });
    }
  });

  const totalDrivingKm = travelPath.totalDistanceKm;
  const totalDrivingMinutes = travelPath.totalTravelMinutes;
  const totalShiftDurationMinutes = totalDrivingMinutes + totalInspectionMinutes;
  const totalShiftHours = parseFloat((totalShiftDurationMinutes / 60).toFixed(1));

  return {
    orderedSpots,
    totalSpotsCount: orderedSpots.length,
    totalDrivingKm,
    totalDrivingMinutes,
    totalInspectionMinutes,
    totalShiftHours,
    legs,
    inspectionRationale: `Jadwal efisien ${orderedSpots.length} titik inspeksi lapangan: ${totalDrivingKm} km berkendara (~${totalDrivingMinutes} mnt) + ${totalInspectionMinutes} mnt audit fisik = Total shift ${totalShiftHours} jam.`,
    routeData: travelPath
  };
}

export function CampaignPlanner({ spots, onOpenMapTab, onOpenDetailModal }: CampaignPlannerProps) {
  // Brand Profiling State
  const [brandName, setBrandName] = useState<string>('CV Bandung Media Outdoor - Client Showcase');
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('gadget_tech');
  const [campaignGoal, setCampaignGoal] = useState<'awareness' | 'conversion' | 'dwell' | 'cpm'>('awareness');
  
  // 1. FILTER JALUR MOBILITAS (CORRIDOR-BASED TARGETING)
  const [targetCorridor, setTargetCorridor] = useState<MobilityCorridorType | 'Semua Jalur'>('Semua Jalur');
  const [corridorPriorityWeight, setCorridorPriorityWeight] = useState<number>(1.8); // 1.0x - 2.5x bobot

  // 2. PEMETAAN PROFIL AUDIENS (DEMOGRAPHIC TAGGING SES)
  const [selectedSes, setSelectedSes] = useState<('SES A' | 'SES B' | 'SES C')[]>(['SES A', 'SES B']);
  const [sesWeightMultiplier, setSesWeightMultiplier] = useState<number>(1.5); // 1.0x - 2.0x bobot

  // Budget, Duration & Geography
  const [budgetMillions, setBudgetMillions] = useState<number>(350); // Millions IDR
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [geoZone, setGeoZone] = useState<string>('all');
  const [searchSpotQuery, setSearchSpotQuery] = useState<string>('');

  // 4. OPSI STRATEGI "DOMINATION JOURNEY"
  const [isDominationJourneyActive, setIsDominationJourneyActive] = useState<boolean>(false);
  const [dominationRationale, setDominationRationale] = useState<string>('');

  // 5. ROUTE-FINDING & ROUTE VISUALIZATION MAP TOGGLE
  const [showRoutePath, setShowRoutePath] = useState<boolean>(true); // Visual route path toggle
  const [startSpotId, setStartSpotId] = useState<string | undefined>(undefined);
  const [selectedSpotForMap, setSelectedSpotForMap] = useState<BillboardSpot | null>(null);

  // View Mode: 'cards' | 'route_map' | 'budget_optimization' | 'matrix' | 'proposal'
  const [viewMode, setViewMode] = useState<'cards' | 'route_map' | 'budget_optimization' | 'matrix' | 'proposal'>('route_map');
  const [isInspectionMode, setIsInspectionMode] = useState<boolean>(false);

  // Manual Overrides / Selected Spots
  const [manualSelectedSpotIds, setManualSelectedSpotIds] = useState<string[]>([]);
  const [isCustomizingSelection, setIsCustomizingSelection] = useState<boolean>(false);

  // Database Schema Modal
  const [showDbModal, setShowDbModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Active industry profile
  const currentIndustry = useMemo(() => {
    return BRAND_INDUSTRY_PROFILES.find(p => p.id === selectedIndustryId) || BRAND_INDUSTRY_PROFILES[0];
  }, [selectedIndustryId]);

  // Duration corporate discount factor
  const discountFactor = useMemo(() => {
    if (durationMonths >= 12) return 0.85; // 15% discount
    if (durationMonths >= 6) return 0.90;  // 10% discount
    if (durationMonths >= 3) return 0.95;  // 5% discount
    return 1.0;
  }, [durationMonths]);

  // Filter spots by geographical zone and mobility corridor
  const eligibleSpots = useMemo(() => {
    return spots.filter(s => {
      // Geo filter
      if (geoZone === 'bandung_raya' && !(s.regency.includes('Bandung') || s.regency.includes('Cimahi'))) return false;
      if (geoZone === 'bodebek' && !(s.regency.includes('Bekasi') || s.regency.includes('Bogor') || s.regency.includes('Depok'))) return false;
      if (geoZone === 'pantura' && !(s.regency.includes('Karawang') || s.regency.includes('Purwakarta') || s.regency.includes('Cirebon'))) return false;
      if (geoZone === 'priangan' && !(s.regency.includes('Garut') || s.regency.includes('Tasikmalaya') || s.regency.includes('Sukabumi') || s.regency.includes('Cianjur'))) return false;

      // Mobility corridor filter
      if (targetCorridor !== 'Semua Jalur') {
        const spotCorridor = getSpotMobilityCorridor(s);
        if (spotCorridor !== targetCorridor) return false;
      }

      return true;
    });
  }, [spots, geoZone, targetCorridor]);

  // Top 5 Most Effective Billboard Suggestions based on Traffic Density & Historical Conversion Rates
  const top5EffectiveSuggestions = useMemo(() => {
    return suggestTopEffectiveBillboards(spots, 5);
  }, [spots]);

  const [showTop5SuggestionsDrawer, setShowTop5SuggestionsDrawer] = useState<boolean>(true);

  const handleApplyTop5Suggestions = () => {
    const topIds = top5EffectiveSuggestions.map(s => s.spot.id);
    setManualSelectedSpotIds(topIds);
    setIsCustomizingSelection(true);
  };

  // Evaluate all eligible spots using the POI & Brand Matching Engine
  const allEvaluatedSpots = useMemo(() => {
    return eligibleSpots.map(spot => {
      return evaluateSpotForBrand(
        spot,
        selectedIndustryId,
        selectedSes.map(s => s === 'SES A' ? 'SES A+' : s),
        campaignGoal,
        durationMonths,
        discountFactor
      );
    }).sort((a, b) => b.overallMatchScore - a.overallMatchScore);
  }, [eligibleSpots, selectedIndustryId, selectedSes, campaignGoal, durationMonths, discountFactor]);

  // 3. ALGORITMA WEIGHTED KNAPSACK OPTIMIZATION RUNNER
  const knapsackResult = useMemo(() => {
    return solveWeightedKnapsack({
      spots: eligibleSpots.length > 0 ? eligibleSpots : spots,
      budgetMillions,
      durationMonths,
      targetCorridor,
      corridorPriorityWeight,
      targetSes: selectedSes,
      sesWeightMultiplier,
      campaignGoal,
      discountFactor
    });
  }, [
    eligibleSpots,
    spots,
    budgetMillions,
    durationMonths,
    targetCorridor,
    corridorPriorityWeight,
    selectedSes,
    sesWeightMultiplier,
    campaignGoal,
    discountFactor
  ]);

  // Active Selected Spots (Knapsack recommendation vs Domination Journey vs Manual)
  const activeSpots = useMemo(() => {
    if (isCustomizingSelection && manualSelectedSpotIds.length > 0) {
      return spots.filter(s => manualSelectedSpotIds.includes(s.id));
    }
    return knapsackResult.selectedSpots;
  }, [isCustomizingSelection, manualSelectedSpotIds, knapsackResult, spots]);

  // 5. ROUTE-FINDING UTILITY: Menghitung jalur perjalanan paling efisien menghubungkan titik-titik terpilih (TSP 2-opt)
  const calculatedTravelRoute = useMemo(() => {
    return calculateOptimalTravelPath(activeSpots, startSpotId, isDominationJourneyActive);
  }, [activeSpots, startSpotId, isDominationJourneyActive]);

  // Field Team Inspection Route Planning: Menghitung urutan kunjungan audit teknis paling efisien
  const fieldInspectionPlan = useMemo(() => {
    return calculateFieldInspectionRoute(activeSpots, startSpotId);
  }, [activeSpots, startSpotId]);

  // Aggregated campaign performance metrics
  const campaignSummaryMetrics = useMemo(() => {
    const totalSpent = activeSpots.reduce((acc, s) => {
      return acc + (s.ratePerMonthIdr * durationMonths * discountFactor);
    }, 0);
    const budgetTotal = budgetMillions * 1000000;
    const remainingBudget = Math.max(0, budgetTotal - totalSpent);
    
    // Aggregated Impressions & Reach
    const totalMonthlyGrossReach = activeSpots.reduce((acc, s) => acc + (s.dailyGrossReach * 30 * durationMonths), 0);
    const totalMonthlyVac = activeSpots.reduce((acc, s) => acc + (s.vacDaily * 30 * durationMonths), 0);
    
    const avgDwellTime = activeSpots.length > 0
      ? Math.round(activeSpots.reduce((acc, s) => acc + s.avgDwellTimeSec, 0) / activeSpots.length)
      : 0;

    const blendedCpm = totalMonthlyVac > 0
      ? Math.round((totalSpent / totalMonthlyVac) * 1000)
      : 0;

    // Deduplicated Net Unique Reach (applying Domination repetition multiplier)
    const rawUniqueSum = totalMonthlyGrossReach / (calculatedTravelRoute.isDominationJourney ? 3.8 : 2.6);
    const netUniqueReach = Math.round(rawUniqueSum);

    // GRP (Gross Rating Points)
    const grp = Math.round((totalMonthlyGrossReach / 15000000) * 100);
    const avgFrequency = calculatedTravelRoute.repetitionMultiplier;

    return {
      totalSpent,
      remainingBudget,
      totalMonthlyGrossReach,
      totalMonthlyVac,
      avgDwellTime,
      blendedCpm,
      netUniqueReach,
      grp,
      avgFrequency
    };
  }, [activeSpots, budgetMillions, durationMonths, discountFactor, calculatedTravelRoute]);

  // 4. ACTION: AKTIVASI DOMINATION JOURNEY
  const handleTriggerDominationJourney = () => {
    const corridorToUse = targetCorridor === 'Semua Jalur' ? 'Jalur Komuter (Daily Commuters)' : targetCorridor;
    const result = generateDominationJourney(spots, corridorToUse);
    
    setIsDominationJourneyActive(true);
    setDominationRationale(result.rationale);
    setIsCustomizingSelection(true);
    setManualSelectedSpotIds(result.selectedSpots.map(s => s.id));
    setViewMode('route_map');
    setShowRoutePath(true);
  };

  // Reset to auto recommendations
  const handleResetToAutoPackage = () => {
    setIsCustomizingSelection(false);
    setIsDominationJourneyActive(false);
    setManualSelectedSpotIds([]);
  };

  // Toggle Spot in Package
  const handleToggleSpotInPackage = (spotId: string) => {
    setIsCustomizingSelection(true);
    let nextIds: string[];
    if (isCustomizingSelection) {
      if (manualSelectedSpotIds.includes(spotId)) {
        nextIds = manualSelectedSpotIds.filter(id => id !== spotId);
      } else {
        nextIds = [...manualSelectedSpotIds, spotId];
      }
    } else {
      const currentIds = knapsackResult.selectedSpots.map(s => s.id);
      if (currentIds.includes(spotId)) {
        nextIds = currentIds.filter(id => id !== spotId);
      } else {
        nextIds = [...currentIds, spotId];
      }
    }
    setManualSelectedSpotIds(nextIds);
  };

  // Handle Preset Load
  const handleLoadPreset = (preset: typeof BRAND_PRESETS[0]) => {
    setBrandName(preset.name);
    setSelectedIndustryId(preset.industryId);
    setBudgetMillions(preset.budget);
    setCampaignGoal(preset.goal);
    setTargetCorridor(preset.corridor);
    setIsCustomizingSelection(false);
    setIsDominationJourneyActive(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(DATABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>CV Bandung Media Outdoor · OOH Strategic Planner</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sistem Perencanaan & Optimasi Rute Reklame Mobilitas
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Optimalkan penempatan reklame (Billboard & LED Videotron) berbasis <strong>jalur mobilitas komuter</strong>, pemetaan demografis SES, algoritma <strong>Weighted Knapsack Optimization</strong>, dan strategi perjalanan repetitif <strong>Domination Journey</strong> di koridor Jawa Barat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Database ERD Modal Trigger */}
            <button
              onClick={() => setShowDbModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Skema ERD / SQL</span>
            </button>

            {/* DOMINATION JOURNEY 1-CLICK STRATEGY */}
            <button
              onClick={handleTriggerDominationJourney}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
            >
              <Zap className="w-4 h-4" />
              <span>Paket Domination Journey</span>
            </button>

            <button
              onClick={() => setViewMode('proposal')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Proposal Media Plan</span>
            </button>
          </div>
        </div>

        {/* Quick Brand Presets Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            Preset Kampanye Klien:
          </span>
          {BRAND_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleLoadPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                brandName === preset.name
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Setup & Parameters Card (Fitur 1, 2, 3) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Parameter Algoritma Knapsack & Filter Koridor Mobilitas
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isDominationJourneyActive && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold font-mono">
                🚀 Domination Journey Aktif
              </span>
            )}
            {isCustomizingSelection && (
              <button
                onClick={handleResetToAutoPackage}
                className="px-2.5 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-400/40 rounded-lg transition-colors font-medium"
              >
                Reset ke Rekomendasi Algoritma
              </button>
            )}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* FITUR 1: FILTER JALUR MOBILITAS */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-amber-400" />
                Jalur Mobilitas (Corridor):
              </span>
            </label>
            <select
              value={targetCorridor}
              onChange={(e) => setTargetCorridor(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
            >
              <option value="Semua Jalur">🌐 Semua Jalur Mobilitas</option>
              <option value="Jalur Komuter (Daily Commuters)">🚗 Jalur Komuter (Tol Pasteur, Pasupati, Soetta)</option>
              <option value="Jalur Pariwisata (Leisure & Tourism)">🌲 Jalur Pariwisata (Rute Lembang, Ciwidey, Puncak)</option>
              <option value="Jalur Komersial & Retail (Premium Areas)">🛍️ Jalur Komersial & Retail (Dago, Riau, Braga)</option>
              <option value="Jalur Logistik & Industri">🚚 Jalur Logistik & Industri (Soetta Timur, Cimahi, KIIC)</option>
            </select>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Bobot Prioritas Jalur:</span>
              <span className="font-mono text-amber-400 font-bold">{corridorPriorityWeight}x Multiplier</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={corridorPriorityWeight}
              onChange={(e) => setCorridorPriorityWeight(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* FITUR 2: PEMETAAN PROFIL AUDIENS (SES) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Target Profil SES Audiens:
              </span>
              <span className="font-mono text-[11px] text-cyan-300">{sesWeightMultiplier}x Bobot</span>
            </label>
            
            <div className="flex items-center gap-2 pt-0.5">
              {(['SES A', 'SES B', 'SES C'] as const).map((tier) => {
                const isSelected = selectedSes.includes(tier);
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedSes.length > 1) {
                          setSelectedSes(selectedSes.filter(t => t !== tier));
                        }
                      } else {
                        setSelectedSes([...selectedSes, tier]);
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {tier}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Sensitivitas Demografi:</span>
              <span className="font-mono text-cyan-400 font-bold">{sesWeightMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={sesWeightMultiplier}
              onChange={(e) => setSesWeightMultiplier(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* FITUR 3: BUDGET & DURASI (KNAPSACK CAPACITY) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Anggaran Kampanye (Kapasitas):
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                Rp {budgetMillions} Juta
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="2000"
                step="25"
                value={budgetMillions}
                onChange={(e) => setBudgetMillions(Math.max(20, parseInt(e.target.value) || 50))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="1">1 Bln</option>
                <option value="3">3 Bln (5% Disc)</option>
                <option value="6">6 Bln (10% Disc)</option>
                <option value="12">1 Thn (15% Disc)</option>
              </select>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={budgetMillions}
              onChange={(e) => setBudgetMillions(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* TUJUAN KAMPANYE (KNAPSACK OBJECTIVE) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                Objektif Optimasi (Knapsack Goal):
              </span>
            </label>
            <select
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-medium"
            >
              <option value="awareness">🔥 Jangkauan Massal (Maksimal OTS & VAC)</option>
              <option value="conversion">🎯 Target Konversi (Dwell Time Lampu Merah)</option>
              <option value="cpm">💰 Efisiensi Anggaran (Blended CPM Termurah)</option>
              <option value="dwell">⏱️ Waktu Pandang Ekstrem (Kepadatan Simpang)</option>
            </select>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Dominasi Koridor Terpilih:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {knapsackResult.corridorDominancePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Domination Journey Banner when active */}
        {isDominationJourneyActive && dominationRationale && (
          <div className="p-4 bg-amber-400/10 border border-amber-400/40 rounded-xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 font-bold block mb-0.5">Strategi Domination Journey Aktif:</strong>
              {dominationRationale}
            </div>
          </div>
        )}
      </div>

      {/* Aggregate KPI Performance Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>TITIK TERPILIH</span>
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white">
            {activeSpots.length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {isCustomizingSelection ? 'Kustomisasi Rute' : 'Solusi Knapsack'}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>JARAK RUTE TOTAL</span>
            <Route className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-300">
            {calculatedTravelRoute.totalDistanceKm} <span className="text-sm">km</span>
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Estimasi: {calculatedTravelRoute.totalTravelMinutes} menit berkendara
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>TOTAL IMPRESI VAC</span>
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-cyan-300">
            {(campaignSummaryMetrics.totalMonthlyVac / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Kontak pandang / {durationMonths} bln
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>NET AUDIENS UNIK</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {(campaignSummaryMetrics.netUniqueReach / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Frekuensi: {campaignSummaryMetrics.avgFrequency}x repetisi
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>BLENDED CPM</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-purple-300">
            Rp {campaignSummaryMetrics.blendedCpm.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Biaya per 1.000 kontak
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>TOTAL INVESTASI</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold font-mono text-white">
            Rp {(campaignSummaryMetrics.totalSpent / 1000000).toFixed(0)} Jt
          </span>
          <span className="text-[10px] text-emerald-400/90 block mt-0.5">
            Sisa Budget: Rp {(campaignSummaryMetrics.remainingBudget / 1000000).toFixed(0)} Jt
          </span>
        </div>
      </div>

      {/* TOP 5 REKOMENDASI TITIK PALING EFEKTIF (Kepadatan Lalu Lintas & Konversi Historis) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                  Top 5 Titik Reklame Paling Efektif
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Traffic Density & Historical Conversion Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dihitung otomatis melalui fungsi pembantu kuantitatif berdasarkan kepadatan volume lalu lintas terkini, waktu pandang lampu merah (<em>dwell time</em>), dan rasio konversi historis pengiklan terdahulu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleApplyTop5Suggestions}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              title="Terapkan 5 titik rekomendasi ini ke rencana aktif"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terapkan 5 Titik Ini (1-Klik)</span>
            </button>
            <button
              onClick={() => setShowTop5SuggestionsDrawer(prev => !prev)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg text-xs"
              title={showTop5SuggestionsDrawer ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showTop5SuggestionsDrawer ? 'Tutup' : 'Lihat'}
            </button>
          </div>
        </div>

        {showTop5SuggestionsDrawer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {top5EffectiveSuggestions.map((suggestion) => {
              const isSelected = activeSpots.some(s => s.id === suggestion.spot.id);
              const rankColor =
                suggestion.rank === 1 ? 'border-amber-400/80 bg-amber-400/10 text-amber-300' :
                suggestion.rank === 2 ? 'border-slate-300/80 bg-slate-300/10 text-slate-200' :
                suggestion.rank === 3 ? 'border-amber-600/80 bg-amber-600/10 text-amber-500' :
                'border-slate-700 bg-slate-800/40 text-slate-400';

              return (
                <div
                  key={suggestion.spot.id}
                  className={`p-3.5 bg-slate-950/80 border rounded-xl flex flex-col justify-between transition-all hover:border-amber-400/50 ${
                    isSelected ? 'ring-2 ring-amber-400 border-amber-400 bg-slate-950' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${rankColor}`}>
                        #{suggestion.rank} {suggestion.rank === 1 ? '🏆 Top Pick' : suggestion.rank === 2 ? '🥈 Rank 2' : suggestion.rank === 3 ? '🥉 Rank 3' : `Peringkat ${suggestion.rank}`}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {suggestion.compositeEffectivenessScore}/100
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-white text-xs line-clamp-1" title={suggestion.spot.name}>
                        {suggestion.spot.name}
                      </h5>
                      <div className="text-[10px] text-slate-400 truncate">
                        {suggestion.spot.roadName}, {suggestion.spot.regency}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[10px] font-mono">
                      <div className="p-1.5 bg-slate-900 rounded-lg flex items-center justify-between">
                        <span className="text-slate-400">Kepadatan:</span>
                        <strong className="text-emerald-400">{suggestion.trafficDensityScore}/100</strong>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded-lg flex items-center justify-between">
                        <span className="text-slate-400">Konversi Hist:</span>
                        <strong className="text-amber-400">{suggestion.historicalConversionRatePct}%</strong>
                      </div>
                      <div className="text-[9px] text-slate-500 leading-tight">
                        {suggestion.dailyTrafficVolume.toLocaleString('id-ID')} DGR · {suggestion.avgDwellTimeSec}s dwell
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenDetailModal(suggestion.spot)}
                      className="flex-1 py-1 text-[10px] text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors font-medium"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpotForMap(suggestion.spot);
                        setViewMode('route_map');
                      }}
                      className="p-1 text-slate-300 hover:text-amber-400 bg-slate-900 border border-slate-800 rounded-lg"
                      title="Lihat di Peta Rute"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area: View Mode Navigation */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setViewMode('route_map');
                setIsInspectionMode(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'route_map' && !isInspectionMode
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Peta Rute OOH</span>
            </button>

            <button
              onClick={() => {
                setViewMode('budget_optimization');
                setIsInspectionMode(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
                viewMode === 'budget_optimization'
                  ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-950 text-amber-300 hover:text-amber-200 border-amber-400/40 hover:bg-slate-900'
              }`}
              title="Optimasi Alokasi Anggaran Belanja Media (OOH · Digital · BTL) berdasarkan Profil Target Audiens"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Budget Optimization (OOH·Digital·BTL)</span>
            </button>

            <button
              onClick={() => {
                setViewMode('route_map');
                setIsInspectionMode(true);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'route_map' && isInspectionMode
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md ring-2 ring-amber-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Urutan kunjungan tim lapangan paling efisien dengan rute polyline Google Maps"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Rute Inspeksi Tim Lapangan</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daftar Titik & POI</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matriks Knapsack</span>
            </button>

            <button
              onClick={() => setViewMode('proposal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'proposal'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Proposal Media Plan</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* ROUTE TOGGLE IN NAV BAR */}
            <button
              onClick={() => setShowRoutePath(prev => !prev)}
              className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors flex items-center gap-1.5 ${
                showRoutePath
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>{showRoutePath ? 'Polyline: ON' : 'Polyline: OFF'}</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: INTERACTIVE ROUTE MAP & TRAVEL PATH FINDER */}
        {viewMode === 'route_map' && (
          <div className="space-y-4">
            {/* Inspection KPI Ribbon when in Field Inspection Mode */}
            {isInspectionMode && (
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-400/40 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                        Jadwal & Urutan Kunjungan Tim Lapangan (Field Technical Inspection)
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                        TSP 2-Opt Algorithm
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                      {fieldInspectionPlan.inspectionRationale}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0">
                  <div className="p-2 px-3 bg-slate-950/90 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">Jarak Kemudi</span>
                    <strong className="text-amber-400">{fieldInspectionPlan.totalDrivingKm} km</strong>
                  </div>
                  <div className="p-2 px-3 bg-slate-950/90 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">Waktu Kemudi</span>
                    <strong className="text-cyan-400">{fieldInspectionPlan.totalDrivingMinutes} mnt</strong>
                  </div>
                  <div className="p-2 px-3 bg-slate-950/90 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">Audit Fisik</span>
                    <strong className="text-emerald-400">{fieldInspectionPlan.totalInspectionMinutes} mnt</strong>
                  </div>
                  <div className="p-2 px-3 bg-slate-950/90 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">Total Shift</span>
                    <strong className="text-purple-400">{fieldInspectionPlan.totalShiftHours} jam</strong>
                  </div>
                </div>
              </div>
            )}

            <CampaignRouteMap
              spots={activeSpots}
              route={isInspectionMode ? fieldInspectionPlan.routeData : calculatedTravelRoute}
              showRoutePath={showRoutePath}
              onToggleRoutePath={() => setShowRoutePath(prev => !prev)}
              selectedSpot={selectedSpotForMap}
              onSelectSpot={setSelectedSpotForMap}
              startSpotId={startSpotId}
              onChangeStartSpot={setStartSpotId}
              onOpenDetailModal={onOpenDetailModal}
              isFieldInspectionMode={isInspectionMode}
            />

            {/* Field Team Inspection Audit Checklist Cards */}
            {isInspectionMode && fieldInspectionPlan.orderedSpots.length > 0 && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lembar Panduan Checklist Inspeksi Fisik Lapangan
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {fieldInspectionPlan.totalSpotsCount} Titik Reklame Terjadwal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fieldInspectionPlan.orderedSpots.map((spot, idx) => {
                    const isLed = spot.type.includes('LED') || spot.type.includes('Mega');
                    return (
                      <div
                        key={spot.id}
                        className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 hover:border-amber-400/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                            Stop #{idx + 1} ({isLed ? '25 mnt audit' : '15 mnt audit'})
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {spot.code}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-bold text-xs text-white line-clamp-1">{spot.name}</h5>
                          <p className="text-[11px] text-slate-400 truncate">{spot.roadName}, {spot.regency}</p>
                        </div>

                        <ul className="text-[10px] space-y-1 text-slate-300 pt-1 border-t border-slate-800/60 font-mono">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{isLed ? 'Test Modul LED, dead-pixel & lux malam' : 'Cek ketegangan vinyl & lampu sorot'}</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>Kekokohan tiang monopole & baut angkur pondasi</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            <span>Bebas halangan ranting pohon & kabel udara PLN</span>
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: BUDGET OPTIMIZATION TOOL */}
        {viewMode === 'budget_optimization' && (
          <BudgetOptimizationTool
            spots={spots}
            initialBudgetMillions={budgetMillions}
            onApplyAllocationToPlanner={(optResult) => {
              // Apply recommended matching OOH spots to active selection
              const matchingIds = optResult.suggestedMatchingSpots.map(s => s.id);
              if (matchingIds.length > 0) {
                setManualSelectedSpotIds(matchingIds);
                setIsCustomizingSelection(true);
              }
            }}
            onSelectSpot={(spot) => {
              setSelectedSpotForMap(spot);
              onOpenDetailModal(spot);
            }}
          />
        )}

        {/* VIEW 2: CARDS LIST */}
        {viewMode === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Menampilkan <strong>{allEvaluatedSpots.length}</strong> titik yang sesuai kriteria penempatan.
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {activeSpots.length} Titik Masuk Rute
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEvaluatedSpots.map((evalItem) => {
                const isSelected = activeSpots.some(s => s.id === evalItem.spot.id);
                const corridor = getSpotMobilityCorridor(evalItem.spot);

                return (
                  <div
                    key={evalItem.spot.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400/60 shadow-xl shadow-amber-400/5 ring-1 ring-amber-400/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                          {evalItem.spot.code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                          {corridor}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base leading-snug">{evalItem.spot.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{evalItem.spot.roadName}, {evalItem.spot.regency}</p>

                      {/* POI Tagging */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                        <div className="text-[11px] text-slate-400">
                          POI Sekitar: <span className="text-slate-200">{evalItem.pois.map(p => `${p.name} (${p.distanceMeters}m)`).join(', ')}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Profil SES: <strong className="text-cyan-400">{evalItem.spot.targetDemographics}</strong>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-slate-950 rounded-xl text-center font-mono text-[10px]">
                        <div>
                          <span className="text-slate-500 block">VAC HARIAN</span>
                          <span className="text-emerald-400 font-bold">{evalItem.spot.vacDaily.toLocaleString('id-ID')}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">DWELL TIME</span>
                          <span className="text-amber-400 font-bold">{evalItem.spot.avgDwellTimeSec}s</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">CPM</span>
                          <span className="text-purple-400 font-bold">Rp {evalItem.effectiveCpmIdr.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Tarif Penempatan:</span>
                        <span className="text-sm font-bold font-mono text-white">
                          Rp {(evalItem.costEstimateIdr / 1000000).toFixed(1)} Jt
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenDetailModal(evalItem.spot)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleToggleSpotInPackage(evalItem.spot.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                          <span>{isSelected ? 'Terpilih' : '+ Masukkan'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: KNAPSACK & CORRIDOR COMPARISON MATRIX */}
        {viewMode === 'matrix' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Matriks Optimasi Knapsack & Profil Jalur Mobilitas
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluasi rasio efisiensi skor tertimbang terhadap biaya penempatan.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {knapsackResult.selectedSpots.length} Titik Direkomendasikan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Titik Reklame</th>
                    <th className="p-3">Klasifikasi Jalur Mobilitas</th>
                    <th className="p-3">Target Demografi SES</th>
                    <th className="p-3 text-right">VAC Harian</th>
                    <th className="p-3 text-right">Biaya (Jt)</th>
                    <th className="p-3 text-right">Bobot Koridor</th>
                    <th className="p-3 text-right">Bobot SES</th>
                    <th className="p-3 text-right">Skor Tertimbang</th>
                    <th className="p-3 text-right">Status Seleksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {knapsackResult.itemEvaluations.map((item) => {
                    const isSelected = activeSpots.some(s => s.id === item.spot.id);
                    return (
                      <tr key={item.spot.id} className={isSelected ? 'bg-amber-400/5' : 'hover:bg-slate-950/40'}>
                        <td className="p-3">
                          <div className="font-mono text-amber-400 font-bold">{item.spot.code}</div>
                          <div className="text-white font-semibold">{item.spot.name}</div>
                          <div className="text-slate-500 text-[11px]">{item.spot.roadName}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-medium">
                            {item.corridorType}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {item.spot.targetDemographics}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          {item.spot.vacDaily.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-white font-bold">
                          Rp {item.costMillions} Jt
                        </td>
                        <td className="p-3 text-right font-mono text-amber-400 font-bold">
                          {item.corridorBonus}x
                        </td>
                        <td className="p-3 text-right font-mono text-cyan-400 font-bold">
                          {item.sesBonus.toFixed(2)}x
                        </td>
                        <td className="p-3 text-right font-mono text-purple-300 font-bold">
                          {item.weightedScore}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isSelected ? '✓ Terpilih Knapsack' : 'Di Luar Kapasitas'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: EXECUTIVE MEDIA PLAN PROPOSAL & EXPORT FACTSHEET */}
        {viewMode === 'proposal' && (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6 text-slate-200 print:bg-white print:text-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  CV BANDUNG MEDIA OUTDOOR · OOH STRATEGIC FACTSHEET
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Proposal Rencana Penempatan Reklame Koridor Mobilitas
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Klien: {brandName}</span>
                  <span>·</span>
                  <span>Jalur Target: {targetCorridor}</span>
                  <span>·</span>
                  <span>Durasi: {durationMonths} Bulan</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-400/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Ekspor PDF Factsheet</span>
                </button>
              </div>
            </div>

            {/* Proposal Summary Metrics */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs leading-relaxed">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ringkasan Strategis Perjalanan Audien (Customer Journey)</span>
              </h4>
              <p className="text-slate-300">
                Paket media reklame ini dirancang khusus untuk menciptakan dominasi visual beruntun sepanjang jalur <strong>{targetCorridor}</strong> dengan total jarak rute <strong>{calculatedTravelRoute.totalDistanceKm} km</strong>. Dengan algoritma Knapsack teroptimasi, penempatan ini memastikan tingkat paparan (OTS/VAC) maksimal pada target profil <strong>{selectedSes.join(', ')}</strong> dengan efisiensi anggaran tertinggi.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-800 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">TOTAL IMPRESI MATA</span>
                  <span className="text-base font-bold text-cyan-400">
                    {campaignSummaryMetrics.totalMonthlyVac.toLocaleString('id-ID')} VAC
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TOTAL JARAK JALUR</span>
                  <span className="text-base font-bold text-amber-400">
                    {calculatedTravelRoute.totalDistanceKm} km
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">REPETISI EFEKTIF</span>
                  <span className="text-base font-bold text-emerald-400">
                    {campaignSummaryMetrics.avgFrequency}x Paparan
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TOTAL NILAI INVESTASI</span>
                  <span className="text-base font-bold text-white">
                    Rp {(campaignSummaryMetrics.totalSpent / 1000000).toFixed(1)} Juta
                  </span>
                </div>
              </div>
            </div>

            {/* Sequential Spots List */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                Urutan Penempatan Reklame Sepanjang Rute ({calculatedTravelRoute.orderedSpots.length} Titik)
              </h4>

              <div className="space-y-2">
                {calculatedTravelRoute.orderedSpots.map((spot, idx) => (
                  <div key={spot.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white">{spot.name} ({spot.code})</div>
                        <div className="text-slate-400 text-[11px]">{spot.roadName}, {spot.regency} · {spot.type}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <div className="text-emerald-400 font-bold">{spot.vacDaily.toLocaleString('id-ID')} VAC/hari</div>
                      <div className="text-white text-xs">Rp {(spot.ratePerMonthIdr / 1000000).toFixed(0)} Jt/bln</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Factsheet Signoff */}
            <div className="pt-6 border-t border-slate-800 flex justify-between items-end text-xs text-slate-400">
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">Diterbitkan Oleh:</span>
                <div>CV Bandung Media Outdoor</div>
                <div>Divisi Strategi & Perencanaan Media Luar Ruang</div>
              </div>
              <div className="text-right font-mono text-[11px]">
                Dokumen Resmi · Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: SKEMA ERD & STRUKTUR TABEL DATABASE (SQL & JSON) */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Arsitektur Database ERD & DDL SQL (PostgreSQL & PostGIS)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Struktur tabel relasional untuk CV Bandung Media Outdoor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedSql ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  onClick={() => setShowDbModal(false)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs">
                  Entitas Relasi Utama (Entity Relationship Model):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>mobility_corridors</strong>: Jalur mobilitas (Komuter, Pariwisata, Komersial, Logistik) dengan PostGIS LineString.</li>
                  <li><strong>billboard_spots</strong>: Titik reklame beserta orientasi, format, metrik VAC/OTS, tarif, dan relasi koridor.</li>
                  <li><strong>points_of_interest (POI)</strong>: Simpul komersial, kampus, gerbang tol, pusat wisata dengan koordinat PostGIS Point.</li>
                  <li><strong>spot_poi_distances</strong>: Relasi spasial jarak radius titik reklame ke POI terdekat.</li>
                  <li><strong>campaign_plans & campaign_route_waypoints</strong>: Penyimpanan rencana penempatan, hasil optimasi Knapsack, dan urutan waypoint rute (1, 2, 3...).</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  Skema DDL PostgreSQL (Siap Dijalankan di Supabase / Cloud SQL / Local):
                </span>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed select-all">
                  {DATABASE_SCHEMA_SQL}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
