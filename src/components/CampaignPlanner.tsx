import { useState, useMemo } from 'react';
import { BillboardSpot } from '../types/ooh';
import { 
  BRAND_INDUSTRY_PROFILES, 
  BrandIndustryProfile, 
  evaluateSpotForBrand, 
  BrandPlacementEvaluation,
  getSpotPois
} from '../data/poiData';
import { WEST_JAVA_REGIONAL_CLUSTERS, WEST_JAVA_REGENCIES } from '../data/jabarData';
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
  AlertCircle
} from 'lucide-react';

interface CampaignPlannerProps {
  spots: BillboardSpot[];
  onOpenMapTab: (spot: BillboardSpot) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
}

// Brand preset suggestions for instant 1-click loading
const BRAND_PRESETS = [
  { name: 'Samsung Galaxy S25 Ultra', industryId: 'gadget_tech', budget: 350, goal: 'awareness' as const },
  { name: 'Bank BCA Prioritas', industryId: 'banking_fintech', budget: 450, goal: 'awareness' as const },
  { name: 'BYD Sealion 7 EV', industryId: 'automotive_ev', budget: 500, goal: 'awareness' as const },
  { name: 'Indomie Kuliner Nusantara', industryId: 'fmcg_food', budget: 280, goal: 'conversion' as const },
  { name: 'Uniqlo LifeWear Jabar', industryId: 'fashion_beauty', budget: 320, goal: 'conversion' as const },
  { name: 'Universitas Telkom Bandung', industryId: 'education_university', budget: 200, goal: 'dwell' as const },
  { name: 'Summarecon Crown Gading', industryId: 'property_living', budget: 400, goal: 'dwell' as const },
  { name: 'Mayapada Hospital Bandung', industryId: 'healthcare_pharma', budget: 250, goal: 'dwell' as const }
];

export function CampaignPlanner({ spots, onOpenMapTab, onOpenDetailModal }: CampaignPlannerProps) {
  // Brand Profiling State
  const [brandName, setBrandName] = useState<string>('Samsung Galaxy Flagship');
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('gadget_tech');
  const [campaignGoal, setCampaignGoal] = useState<'awareness' | 'conversion' | 'dwell' | 'cpm'>('awareness');
  const [selectedSes, setSelectedSes] = useState<string[]>(['SES A+', 'SES A', 'SES B']);
  
  // Budget, Duration & Geography
  const [budgetMillions, setBudgetMillions] = useState<number>(350); // Millions IDR
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [geoZone, setGeoZone] = useState<string>('all');
  const [searchSpotQuery, setSearchSpotQuery] = useState<string>('');

  // View Mode: 'cards' | 'spatial_map' | 'matrix' | 'proposal'
  const [viewMode, setViewMode] = useState<'cards' | 'spatial_map' | 'matrix' | 'proposal'>('cards');

  // Manual Overrides / Selected Spots
  const [manualSelectedSpotIds, setManualSelectedSpotIds] = useState<string[]>([]);
  const [isCustomizingSelection, setIsCustomizingSelection] = useState<boolean>(false);

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

  // Filter spots by geographical zone
  const eligibleSpots = useMemo(() => {
    return spots.filter(s => {
      if (geoZone === 'bandung_raya') return s.regency.includes('Bandung') || s.regency.includes('Cimahi');
      if (geoZone === 'bodebek') return s.regency.includes('Bekasi') || s.regency.includes('Bogor') || s.regency.includes('Depok');
      if (geoZone === 'pantura') return s.regency.includes('Karawang') || s.regency.includes('Purwakarta') || s.regency.includes('Cirebon');
      if (geoZone === 'priangan') return s.regency.includes('Garut') || s.regency.includes('Tasikmalaya') || s.regency.includes('Sukabumi') || s.regency.includes('Cianjur');
      return true;
    });
  }, [spots, geoZone]);

  // Evaluate all eligible spots using the POI & Brand Matching Engine
  const allEvaluatedSpots = useMemo(() => {
    return eligibleSpots.map(spot => {
      return evaluateSpotForBrand(
        spot,
        selectedIndustryId,
        selectedSes,
        campaignGoal,
        durationMonths,
        discountFactor
      );
    }).sort((a, b) => b.overallMatchScore - a.overallMatchScore);
  }, [eligibleSpots, selectedIndustryId, selectedSes, campaignGoal, durationMonths, discountFactor]);

  // Automatic greedy Knapsack package recommendation based on budget
  const recommendedPackage = useMemo(() => {
    const budgetTotal = budgetMillions * 1000000;
    let spent = 0;
    const selected: BrandPlacementEvaluation[] = [];

    // Greedy pick by overallMatchScore
    for (const item of allEvaluatedSpots) {
      if (spent + item.costEstimateIdr <= budgetTotal) {
        selected.push(item);
        spent += item.costEstimateIdr;
      }
    }

    return {
      selected,
      totalSpent: spent,
      remainingBudget: budgetTotal - spent
    };
  }, [allEvaluatedSpots, budgetMillions]);

  // Final active spots (either manual selection if customized or automatic package)
  const activeSpotEvaluations = useMemo(() => {
    if (isCustomizingSelection && manualSelectedSpotIds.length > 0) {
      return allEvaluatedSpots.filter(item => manualSelectedSpotIds.includes(item.spot.id));
    }
    return recommendedPackage.selected;
  }, [isCustomizingSelection, manualSelectedSpotIds, recommendedPackage, allEvaluatedSpots]);

  // Aggregated campaign performance metrics
  const campaignSummaryMetrics = useMemo(() => {
    const totalSpent = activeSpotEvaluations.reduce((acc, s) => acc + s.costEstimateIdr, 0);
    const budgetTotal = budgetMillions * 1000000;
    const remainingBudget = Math.max(0, budgetTotal - totalSpent);
    
    // Aggregated Impressions & Reach
    const totalMonthlyGrossReach = activeSpotEvaluations.reduce((acc, s) => acc + (s.monthlyGrossReach * durationMonths), 0);
    const totalMonthlyVac = activeSpotEvaluations.reduce((acc, s) => acc + (s.monthlyVac * durationMonths), 0);
    const totalGrossImpressions = activeSpotEvaluations.reduce((acc, s) => acc + (s.monthlyGrossImpressions * durationMonths), 0);
    
    // Average metrics
    const avgMatchScore = activeSpotEvaluations.length > 0
      ? Math.round(activeSpotEvaluations.reduce((acc, s) => acc + s.overallMatchScore, 0) / activeSpotEvaluations.length)
      : 0;
    
    const avgDwellTime = activeSpotEvaluations.length > 0
      ? Math.round(activeSpotEvaluations.reduce((acc, s) => acc + s.spot.avgDwellTimeSec, 0) / activeSpotEvaluations.length)
      : 0;

    const blendedCpm = totalMonthlyVac > 0
      ? Math.round((totalSpent / totalMonthlyVac) * 1000)
      : 0;

    // Deduplicated Net Unique Reach (assuming 25% overlap among multi-spot corridor commutes)
    const rawUniqueSum = activeSpotEvaluations.reduce((acc, s) => acc + s.estimatedUniqueReach, 0);
    const overlapFactor = activeSpotEvaluations.length > 1 ? 0.78 : 1.0;
    const netUniqueReach = Math.round(rawUniqueSum * overlapFactor);

    // GRP (Gross Rating Points) based on West Java target audience baseline (~15M target)
    const grp = Math.round((totalMonthlyGrossReach / 15000000) * 100);

    // Average frequency
    const avgFrequency = netUniqueReach > 0 ? parseFloat((totalMonthlyGrossReach / netUniqueReach).toFixed(1)) : 1.0;

    return {
      totalSpent,
      remainingBudget,
      totalMonthlyGrossReach,
      totalMonthlyVac,
      totalGrossImpressions,
      avgMatchScore,
      avgDwellTime,
      blendedCpm,
      netUniqueReach,
      grp,
      avgFrequency
    };
  }, [activeSpotEvaluations, budgetMillions, durationMonths]);

  // Handle Preset Load
  const handleLoadPreset = (preset: typeof BRAND_PRESETS[0]) => {
    setBrandName(preset.name);
    setSelectedIndustryId(preset.industryId);
    setBudgetMillions(preset.budget);
    setCampaignGoal(preset.goal);
    setIsCustomizingSelection(false);
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
      const currentIds = recommendedPackage.selected.map(s => s.spot.id);
      if (currentIds.includes(spotId)) {
        nextIds = currentIds.filter(id => id !== spotId);
      } else {
        nextIds = [...currentIds, spotId];
      }
    }
    setManualSelectedSpotIds(nextIds);
  };

  // Reset to auto recommendations
  const handleResetToAutoPackage = () => {
    setIsCustomizingSelection(false);
    setManualSelectedSpotIds([]);
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
              <span>Sistem Perencanaan & Pemetaan Penempatan Iklan Merk</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Brand Campaign & Spatial Media Placement Planner
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Rancang penempatan iklan luar ruang (OOH/DOOH) dengan pemetaan presisi berbasis <strong>Point of Interest (POI)</strong>, estimasi impresi kontak mata (VAC), demografi komuter, dan efisiensi anggaran di seluruh wilayah Jawa Barat.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode('proposal')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Lihat Proposal Media Plan</span>
            </button>
            <button
              onClick={() => {
                if (activeSpotEvaluations.length > 0) {
                  onOpenMapTab(activeSpotEvaluations[0].spot);
                }
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-400/20"
            >
              <Navigation className="w-4 h-4" />
              <span>Peta Google Maps ({activeSpotEvaluations.length} Titik)</span>
            </button>
          </div>
        </div>

        {/* Quick Brand Presets Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            Preset Merk Populer:
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

      {/* Control Setup & Parameters Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Parameter Profil Merk & Sasaran Kampanye
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {allEvaluatedSpots.length} Titik Reklame Terdaftar di Jabar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Brand Name & Identity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Nama Merk / Brand Campaign
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Contoh: Samsung, Bank BCA, Gojek..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <span className="text-[11px] text-slate-500 block">
              Merk akan disematkan di proposal & evaluasi POI.
            </span>
          </div>

          {/* Industry Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Kategori Industri & Sektor
            </label>
            <select
              value={selectedIndustryId}
              onChange={(e) => {
                setSelectedIndustryId(e.target.value);
                setIsCustomizingSelection(false);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
            >
              {BRAND_INDUSTRY_PROFILES.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.icon} {ind.name}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-amber-400/90 block truncate">
              Ideal POI: {currentIndustry.idealPoiCategories.join(', ')}
            </span>
          </div>

          {/* Campaign Placement Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Tujuan Penempatan Iklan (Objective)
            </label>
            <select
              value={campaignGoal}
              onChange={(e) => {
                setCampaignGoal(e.target.value as any);
                setIsCustomizingSelection(false);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
            >
              <option value="awareness">🚀 Jangkauan Massal (Brand Dominance & Reach)</option>
              <option value="conversion">🛍️ Konversi Ritel & Toko (Proximity to Malls)</option>
              <option value="dwell">⏱️ Durasi Pandang Tinggi (Traffic Dwell Time)</option>
              <option value="cpm">💰 Efisiensi Anggaran (Lowest CPM)</option>
            </select>
            <span className="text-[11px] text-slate-500 block truncate">
              {campaignGoal === 'awareness' && 'Fokus volume kontak mata terbesar di tol & arteri.'}
              {campaignGoal === 'conversion' && 'Fokus kedekatan dengan mall & pusat perbelanjaan.'}
              {campaignGoal === 'dwell' && 'Fokus durasi tatap lama di simpang lampu merah.'}
              {campaignGoal === 'cpm' && 'Fokus jumlah titik terbanyak per rupiah investasi.'}
            </span>
          </div>

          {/* Target Socio-Economic Status (SES) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Target Audiens (SES)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['SES A+', 'SES A', 'SES B', 'SES C'] as const).map((ses) => {
                const active = selectedSes.includes(ses);
                return (
                  <button
                    key={ses}
                    type="button"
                    onClick={() => {
                      if (active) {
                        if (selectedSes.length > 1) setSelectedSes(selectedSes.filter(s => s !== ses));
                      } else {
                        setSelectedSes([...selectedSes, ses]);
                      }
                      setIsCustomizingSelection(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-sm'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {ses}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Disesuaikan dengan daya beli produk merk.
            </span>
          </div>
        </div>

        {/* Budget, Duration & Region Filter Row */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Alokasi Anggaran Media:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                Rp {budgetMillions.toLocaleString('id-ID')} Juta
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={budgetMillions}
              onChange={(e) => {
                setBudgetMillions(parseInt(e.target.value, 10));
                setIsCustomizingSelection(false);
              }}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Rp 50 Jt</span>
              <span>Rp 500 Jt</span>
              <span>Rp 1.0 M</span>
              <span>Rp 1.5 M</span>
            </div>
          </div>

          {/* Duration Selector with Discount Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Durasi Kontrak Kampanye:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {durationMonths} Bulan {discountFactor < 1 && `(Diskon ${Math.round((1 - discountFactor) * 100)}%)`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { months: 1, label: '1 Bln', disc: '' },
                { months: 3, label: '3 Bln', disc: 'Disc 5%' },
                { months: 6, label: '6 Bln', disc: 'Disc 10%' },
                { months: 12, label: '12 Bln', disc: 'Disc 15%' }
              ].map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setDurationMonths(opt.months)}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    durationMonths === opt.months
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  {opt.disc && (
                    <div className={`text-[9px] ${durationMonths === opt.months ? 'text-slate-950 font-bold' : 'text-emerald-400'}`}>
                      {opt.disc}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Regional Geographic Focus */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Fokus Koridor Wilayah:</span>
              <span className="text-slate-400 text-[11px]">
                {geoZone === 'all' ? 'Seluruh Jawa Barat' : geoZone.toUpperCase()}
              </span>
            </div>
            <select
              value={geoZone}
              onChange={(e) => {
                setGeoZone(e.target.value);
                setIsCustomizingSelection(false);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
            >
              <option value="all">🗺️ Seluruh Jawa Barat (Semua Koridor)</option>
              <option value="bodebek">⚡ Bodebek Megapolitan (Bekasi, Bogor, Depok)</option>
              <option value="bandung_raya">🏛️ Bandung Raya (Kota Bandung, Cimahi, dsk)</option>
              <option value="pantura">🏭 Pantura & Industri (Karawang, Cirebon, Purwakarta)</option>
              <option value="priangan">🌄 Priangan & Jalur Selatan (Garut, Tasikmalaya, dsk)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Performance Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>TOTAL TITIK</span>
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white">
            {activeSpotEvaluations.length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {isCustomizingSelection ? 'Kustomisasi Pilihan' : 'Paket Terpilih'}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>KESELARASAN MERK</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {campaignSummaryMetrics.avgMatchScore}%
          </span>
          <span className="text-[10px] text-emerald-500/80 block mt-0.5">
            Skor Keselarasan POI
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
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400">
            {(campaignSummaryMetrics.netUniqueReach / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Komuter unik (Freq: {campaignSummaryMetrics.avgFrequency}x)
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
            Biaya per 1.000 pasang mata
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
            Sisa: Rp {(campaignSummaryMetrics.remainingBudget / 1000000).toFixed(0)} Jt
          </span>
        </div>
      </div>

      {/* Main Content Area: View Mode Navigation */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daftar Rekomendasi Titik & POI</span>
            </button>

            <button
              onClick={() => setViewMode('spatial_map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'spatial_map'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pemetaan Spasial Jawa Barat</span>
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
              <span>Matriks Analisis POI & Impresi</span>
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
              <span>Proposal Media Plan Eksekutif</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isCustomizingSelection && (
              <button
                onClick={handleResetToAutoPackage}
                className="px-2.5 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-400/40 rounded-lg transition-colors font-medium"
              >
                Reset ke Rekomendasi Otomatis
              </button>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari jalan atau POI..."
                value={searchSpotQuery}
                onChange={(e) => setSearchSpotQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* VIEW 1: Cards & POI Detail List */}
        {viewMode === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Menampilkan urutan titik berdasarkan <strong>Skor Keselarasan POI ({currentIndustry.name})</strong>:
              </span>
              <span className="font-mono text-emerald-400">
                {activeSpotEvaluations.length} Titik Masuk Paket Anggaran
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allEvaluatedSpots
                .filter(item => {
                  if (!searchSpotQuery.trim()) return true;
                  const q = searchSpotQuery.toLowerCase();
                  const matchName = item.spot.name.toLowerCase().includes(q);
                  const matchRoad = item.spot.roadName.toLowerCase().includes(q);
                  const matchReg = item.spot.regency.toLowerCase().includes(q);
                  const matchPoi = item.pois.some(p => p.name.toLowerCase().includes(q));
                  return matchName || matchRoad || matchReg || matchPoi;
                })
                .map((evalItem) => {
                  const isSelected = activeSpotEvaluations.some(s => s.spot.id === evalItem.spot.id);

                  return (
                    <div
                      key={evalItem.spot.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-amber-400/60 shadow-xl shadow-amber-400/5 ring-1 ring-amber-400/30'
                          : 'bg-slate-950/70 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-amber-400">{evalItem.spot.code}</span>
                              <span className="text-slate-600">·</span>
                              <span className="text-xs text-slate-300 font-semibold">{evalItem.spot.regency}</span>
                            </div>
                            <h4 className="text-base font-bold text-white mt-0.5 leading-snug">
                              {evalItem.spot.name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">{evalItem.spot.roadName}</p>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                              evalItem.overallMatchScore >= 90
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : evalItem.overallMatchScore >= 80
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            }`}>
                              🎯 {evalItem.overallMatchScore}% Match
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {evalItem.recommendedTag}
                            </span>
                          </div>
                        </div>

                        {/* Rationale Callout */}
                        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-300 mb-3.5 leading-relaxed">
                          <span className="font-semibold text-amber-400 block mb-0.5">Analisis Sasaran Merk:</span>
                          {evalItem.strategicRationale}
                        </div>

                        {/* Point of Interest (POI) Proximity Chips */}
                        <div className="space-y-1.5 mb-3.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Point of Interest (POI) Terdekat:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {evalItem.pois.slice(0, 4).map(poi => {
                              const isIdeal = currentIndustry.idealPoiCategories.includes(poi.category);
                              return (
                                <div
                                  key={poi.id}
                                  className={`p-2 rounded-lg border text-xs flex items-start gap-1.5 ${
                                    isIdeal
                                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                                      : 'bg-slate-950 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <MapPin className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isIdeal ? 'text-amber-400' : 'text-slate-500'}`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-slate-200 truncate text-[11px]">{poi.name}</span>
                                      <span className="font-mono text-[9px] text-amber-400 font-semibold shrink-0">{poi.distanceMeters}m</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 block truncate">{poi.category}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Impressions & Traffic Metrics */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-center font-mono mb-4">
                          <div>
                            <span className="text-[10px] text-slate-500 block">VAC HARIAN</span>
                            <span className="text-xs font-bold text-emerald-400">
                              {evalItem.spot.vacDaily.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[9px] text-slate-600 block">kontak mata</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">DWELL TIME</span>
                            <span className="text-xs font-bold text-amber-400">
                              {evalItem.spot.avgDwellTimeSec}s
                            </span>
                            <span className="text-[9px] text-slate-600 block">{evalItem.spot.avgSpeedKmh} km/jam</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">CPM EFENTIF</span>
                            <span className="text-xs font-bold text-purple-400">
                              Rp {evalItem.effectiveCpmIdr.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[9px] text-slate-600 block">per 1.000 VAC</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Biaya Penempatan ({durationMonths} bln):</span>
                          <span className="text-sm font-bold font-mono text-white">
                            Rp {(evalItem.costEstimateIdr / 1000000).toFixed(1)} Juta
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenDetailModal(evalItem.spot)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Detail
                          </button>

                          <button
                            onClick={() => handleToggleSpotInPackage(evalItem.spot.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                            <span>{isSelected ? 'Masuk Paket' : '+ Tambah'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* VIEW 2: Spatial Map Placement View */}
        {viewMode === 'spatial_map' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Pemetaan Persebaran Spasial Rekomendasi Titik Jawa Barat</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisasi koridor persebaran billboard yang dipilih untuk kampanye merk <strong>{brandName}</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  if (activeSpotEvaluations.length > 0) {
                    onOpenMapTab(activeSpotEvaluations[0].spot);
                  }
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-400/20"
              >
                <Navigation className="w-4 h-4" />
                <span>Buka di Google Maps Interaktif Penuh</span>
              </button>
            </div>

            {/* Spatial Grid Cards Map Representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSpotEvaluations.map((evalItem, idx) => (
                <div
                  key={evalItem.spot.id}
                  onClick={() => onOpenDetailModal(evalItem.spot)}
                  className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-xl cursor-pointer transition-all hover:bg-slate-950/80 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Titik #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      🎯 {evalItem.overallMatchScore}% Match
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {evalItem.spot.name}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">{evalItem.spot.roadName}, {evalItem.spot.regency}</p>

                  <div className="mt-3 pt-3 border-t border-slate-900 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>POI Kunci:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[180px]">
                        {evalItem.pois[0]?.name || 'Koridor Utama'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Impresi Bulanan:</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {evalItem.monthlyVac.toLocaleString('id-ID')} VAC
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Investasi:</span>
                      <span className="font-mono text-white font-bold">
                        Rp {(evalItem.costEstimateIdr / 1000000).toFixed(1)} Jt
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: POI & Metrics Comparison Matrix */}
        {viewMode === 'matrix' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Matriks Perbandingan Titik Reklame & Point of Interest (POI)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tinjauan komprehensif metrik performa OOH untuk kampanye {brandName}.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {activeSpotEvaluations.length} Titik Terseleksi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Kode & Nama Titik</th>
                    <th className="p-3">Wilayah & Jalan</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Point of Interest (POI) Sekitar</th>
                    <th className="p-3 text-right">VAC Harian</th>
                    <th className="p-3 text-right">Dwell Time</th>
                    <th className="p-3 text-right">CPM (IDR)</th>
                    <th className="p-3 text-right">Match</th>
                    <th className="p-3 text-right">Tarif Paket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {activeSpotEvaluations.map((item) => (
                    <tr key={item.spot.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="p-3 font-medium">
                        <div className="font-mono text-amber-400 font-bold">{item.spot.code}</div>
                        <div className="text-white font-semibold">{item.spot.name}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200">{item.spot.regency}</div>
                        <div className="text-slate-500 text-[11px]">{item.spot.roadName}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-medium">
                          {item.spot.type}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="space-y-0.5">
                          {item.pois.slice(0, 2).map(p => (
                            <div key={p.id} className="text-[11px] text-slate-300 truncate">
                              • <span className="text-amber-400">{p.name}</span> ({p.distanceMeters}m)
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {item.spot.vacDaily.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-400">
                        {item.spot.avgDwellTimeSec}s
                      </td>
                      <td className="p-3 text-right font-mono text-purple-400">
                        Rp {item.effectiveCpmIdr.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-cyan-400">
                        {item.overallMatchScore}%
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        Rp {(item.costEstimateIdr / 1000000).toFixed(1)} Jt
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: Executive Media Plan Proposal (Siap Cetak / Presentasi Klien) */}
        {viewMode === 'proposal' && (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6 text-slate-200 print:bg-white print:text-black">
            {/* Proposal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  OFFICIAL MEDIA PLANNING PROPOSAL · PROVINSI JAWA BARAT
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Rencana Penempatan Media Reklame Luar Ruang (OOH/DOOH)
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Klien Merk: {brandName}</span>
                  <span>·</span>
                  <span>Sektor: {currentIndustry.name}</span>
                  <span>·</span>
                  <span>Durasi: {durationMonths} Bulan</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>

            {/* Executive Summary Box */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs leading-relaxed">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ringkasan Eksekutif Penempatan</span>
              </h4>
              <p className="text-slate-300">
                Proposal ini dirancang khusus untuk memperkuat dominasi merk <strong>{brandName}</strong> di koridor-koridor paling strategis Jawa Barat. Pemilihan titik mengadopsi algoritma kedekatan <em>Point of Interest (POI)</em> ke pusat perbelanjaan, perkantoran, dan simpul transit dengan konsentrasi target audiens <strong>{selectedSes.join(', ')}</strong>.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-800/80 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">TOTAL IMPRESI MATA</span>
                  <span className="text-base font-bold text-cyan-400">
                    {campaignSummaryMetrics.totalMonthlyVac.toLocaleString('id-ID')} VAC
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">NET KOMUTER UNIK</span>
                  <span className="text-base font-bold text-amber-400">
                    {campaignSummaryMetrics.netUniqueReach.toLocaleString('id-ID')} Jiwa
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">GROSS RATING POINTS (GRP)</span>
                  <span className="text-base font-bold text-emerald-400">
                    {campaignSummaryMetrics.grp} GRP
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

            {/* Selected Spots Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                Daftar Lokasi Rekomendasi Terpilih ({activeSpotEvaluations.length} Titik)
              </h4>

              <div className="space-y-2.5">
                {activeSpotEvaluations.map((item, idx) => (
                  <div key={item.spot.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">#{idx + 1} {item.spot.code}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">{item.spot.type}</span>
                        <span className="text-emerald-400 font-mono font-bold">🎯 {item.overallMatchScore}% Match</span>
                      </div>
                      <h5 className="font-bold text-white mt-0.5">{item.spot.name}</h5>
                      <p className="text-slate-400 text-[11px]">{item.spot.roadName}, {item.spot.regency}</p>
                      <div className="text-slate-500 text-[11px] mt-1">
                        POI Terdekat: <span className="text-slate-300">{item.pois.map(p => `${p.name} (${p.distanceMeters}m)`).join(', ')}</span>
                      </div>
                    </div>

                    <div className="sm:text-right font-mono shrink-0">
                      <div className="text-slate-400 text-[11px]">VAC Harian: <strong className="text-emerald-400">{item.spot.vacDaily.toLocaleString('id-ID')}</strong></div>
                      <div className="text-slate-400 text-[11px]">Dwell Time: <strong className="text-amber-400">{item.spot.avgDwellTimeSec} detik</strong></div>
                      <div className="text-white font-bold text-sm mt-0.5">
                        Rp {(item.costEstimateIdr / 1000000).toFixed(1)} Juta ({durationMonths} bln)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Acceptance Footer */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-400">
              <div>
                <span className="font-bold text-slate-200 block mb-1">Ketentuan & Jaminan Penempatan:</span>
                <p className="max-w-xl leading-relaxed text-[11px]">
                  Semua titik reklame telah memiliki izin penyelenggaraan reklame daerah (IPR) yang sah dari dinas perizinan terkait di Jawa Barat. Pemasangan materi visual, pencahayaan malam, monitoring operasional dan laporan audit tayang digital dijamin 100%.
                </p>
              </div>

              <div className="text-center sm:text-right min-w-[200px]">
                <div className="text-[11px] text-slate-500">Disusun oleh:</div>
                <div className="font-bold text-white mt-1">Divisi Perencanaan Media Jabar OOH</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
