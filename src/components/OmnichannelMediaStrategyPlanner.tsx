import { useState, useMemo } from 'react';
import { BillboardSpot } from '../types/ooh';
import { 
  GeographicScope, 
  AREA_PROFILES, 
  STRATEGY_PRESETS, 
  calculateOmnichannelPlanComparison,
  CalculatedPlanComparison,
  MediaClass
} from '../data/omnichannelMediaData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Clock, 
  Car, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Tv, 
  Radio, 
  Store, 
  Truck, 
  ShoppingBag, 
  Smartphone, 
  Search, 
  MessageSquare, 
  Maximize2, 
  FileText, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Award, 
  ChevronRight, 
  Zap, 
  HelpCircle 
} from 'lucide-react';

interface OmnichannelMediaStrategyPlannerProps {
  spots: BillboardSpot[];
  onOpenDetailModal?: (spot: BillboardSpot) => void;
  onNavigateToMap?: () => void;
}

export function OmnichannelMediaStrategyPlanner({
  spots,
  onOpenDetailModal,
  onNavigateToMap
}: OmnichannelMediaStrategyPlannerProps) {
  // 1. Geographic Scope: 'bandung' | 'jabar' | 'nasional'
  const [scope, setScope] = useState<GeographicScope>('bandung');

  // 2. Budget and Duration
  const [budgetMillions, setBudgetMillions] = useState<number>(450); // Millions IDR
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [brandName, setBrandName] = useState<string>('Kampanye Peluncuran Brand - Jawa Barat & Nasional');

  // 3. Strategy Presets or Custom Allocation
  const [selectedPresetId, setSelectedPresetId] = useState<string>('balanced');
  const [customAtlPct, setCustomAtlPct] = useState<number>(45);
  const [customBtlPct, setCustomBtlPct] = useState<number>(25);
  const [customDtlPct, setCustomDtlPct] = useState<number>(30);

  // 4. Active Analytics Tab: 'overview' | 'matrix' | 'charts' | 'playbook' | 'proposal'
  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'matrix' | 'charts' | 'playbook' | 'proposal'>('overview');

  // Active Preset definition
  const activePreset = useMemo(() => {
    return STRATEGY_PRESETS.find(p => p.id === selectedPresetId) || STRATEGY_PRESETS[0];
  }, [selectedPresetId]);

  // Current percentage allocation
  const currentAllocation = useMemo(() => {
    if (selectedPresetId === 'custom') {
      return {
        atl: customAtlPct,
        btl: customBtlPct,
        dtl: customDtlPct
      };
    }
    return {
      atl: activePreset.atlPct,
      btl: activePreset.btlPct,
      dtl: activePreset.dtlPct
    };
  }, [selectedPresetId, activePreset, customAtlPct, customBtlPct, customDtlPct]);

  // Calculated Plan Comparison Simulation
  const planComparison: CalculatedPlanComparison = useMemo(() => {
    const totalIdr = budgetMillions * 1000000;
    return calculateOmnichannelPlanComparison(
      scope,
      totalIdr,
      durationMonths,
      currentAllocation.atl,
      currentAllocation.btl,
      currentAllocation.dtl,
      selectedPresetId
    );
  }, [scope, budgetMillions, durationMonths, currentAllocation, selectedPresetId]);

  // Chart data: Budget Breakdown & Impressions
  const chartDataPillars = useMemo(() => {
    const { atl, btl, dtl } = planComparison.pillars;
    return [
      {
        name: 'ATL (Above The Line)',
        budgetJuta: Math.round(atl.allocatedBudget / 1000000),
        reachJuta: parseFloat((atl.estimatedGrossReach / 1000000).toFixed(2)),
        conversionsRibu: parseFloat((atl.estimatedConversions / 1000).toFixed(1)),
        cpmRibu: Math.round(atl.blendedCpmIdr / 1000),
        color: '#3b82f6'
      },
      {
        name: 'BTL (Below The Line)',
        budgetJuta: Math.round(btl.allocatedBudget / 1000000),
        reachJuta: parseFloat((btl.estimatedGrossReach / 1000000).toFixed(2)),
        conversionsRibu: parseFloat((btl.estimatedConversions / 1000).toFixed(1)),
        cpmRibu: Math.round(btl.blendedCpmIdr / 1000),
        color: '#10b981'
      },
      {
        name: 'DTL (Digital Direct)',
        budgetJuta: Math.round(dtl.allocatedBudget / 1000000),
        reachJuta: parseFloat((dtl.estimatedGrossReach / 1000000).toFixed(2)),
        conversionsRibu: parseFloat((dtl.estimatedConversions / 1000).toFixed(1)),
        cpmRibu: Math.round(dtl.blendedCpmIdr / 1000),
        color: '#a855f7'
      }
    ];
  }, [planComparison]);

  const pieChartBudgetData = useMemo(() => {
    return [
      { name: 'ATL (Massa & OOH)', value: planComparison.pillars.atl.allocatedBudget, color: '#3b82f6' },
      { name: 'BTL (Aktivasi & Booth)', value: planComparison.pillars.btl.allocatedBudget, color: '#10b981' },
      { name: 'DTL (Mobile & Retargeting)', value: planComparison.pillars.dtl.allocatedBudget, color: '#a855f7' }
    ];
  }, [planComparison]);

  // Radar 5-dimension chart data
  const radarChartData = useMemo(() => {
    return [
      {
        dimension: 'Jangkauan Massal (Mass Reach)',
        ATL: 95,
        BTL: 45,
        DTL: 82
      },
      {
        dimension: 'Kedalaman Interaksi (Engagement)',
        ATL: 55,
        BTL: 95,
        DTL: 75
      },
      {
        dimension: 'Kecepatan Konversi Langsung',
        ATL: 40,
        BTL: 92,
        DTL: 85
      },
      {
        dimension: 'Efisiensi Biaya (Low CPM)',
        ATL: 88,
        BTL: 52,
        DTL: 90
      },
      {
        dimension: 'Prestise & Otoritas Merek',
        ATL: 98,
        BTL: 70,
        DTL: 60
      }
    ];
  }, []);

  // Quick preset button click handler
  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId !== 'custom') {
      const p = STRATEGY_PRESETS.find(pr => pr.id === presetId);
      if (p) {
        setCustomAtlPct(p.atlPct);
        setCustomBtlPct(p.btlPct);
        setCustomDtlPct(p.dtlPct);
      }
    }
  };

  const handleCustomSliderChange = (pillar: 'atl' | 'btl' | 'dtl', val: number) => {
    setSelectedPresetId('custom');
    if (pillar === 'atl') {
      setCustomAtlPct(val);
      const rem = 100 - val;
      const btlRatio = customBtlPct / Math.max(1, customBtlPct + customDtlPct);
      const newBtl = Math.round(rem * btlRatio);
      setCustomBtlPct(newBtl);
      setCustomDtlPct(rem - newBtl);
    } else if (pillar === 'btl') {
      setCustomBtlPct(val);
      const rem = 100 - val;
      const atlRatio = customAtlPct / Math.max(1, customAtlPct + customDtlPct);
      const newAtl = Math.round(rem * atlRatio);
      setCustomAtlPct(newAtl);
      setCustomDtlPct(rem - newAtl);
    } else {
      setCustomDtlPct(val);
      const rem = 100 - val;
      const atlRatio = customAtlPct / Math.max(1, customAtlPct + customBtlPct);
      const newAtl = Math.round(rem * atlRatio);
      setCustomAtlPct(newAtl);
      setCustomBtlPct(rem - newAtl);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* 1. Header Banner & Area Scope Selector */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-400/20 text-amber-300 border border-amber-400/40">
                OMNICHANNEL MEDIA STRATEGY PLANNER
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800">
                ATL · BTL · DTL
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Perbandingan Alokasi Media & Skenario Penempatan Iklan
            </h1>
            
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Simulasi komprehensif penempatan iklan lintas jalur <strong>Above The Line (OOH/Billboard/TV)</strong>, <strong>Below The Line (Experiential/Booth/Roadshow)</strong>, dan <strong>Digital-Through-The-Line (Meta/Google Ads/CRM)</strong> untuk wilayah Kota Bandung, Jawa Barat, dan Nasional Indonesia.
            </p>
          </div>

          {/* GEOGRAPHIC SCOPE SELECTOR */}
          <div className="bg-slate-950 p-2 border border-slate-800 rounded-2xl shadow-xl shrink-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
              Pilih Cakupan Wilayah (Geographic Scope):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                onClick={() => setScope('bandung')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                  scope === 'bandung'
                    ? 'bg-amber-400 text-slate-950 shadow-lg font-black'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Kota Bandung</span>
                </div>
                <span className={`text-[10px] font-mono mt-0.5 ${scope === 'bandung' ? 'text-slate-800' : 'text-slate-500'}`}>
                  Bandung Raya · 8.8 Jt
                </span>
              </button>

              <button
                onClick={() => setScope('jabar')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                  scope === 'jabar'
                    ? 'bg-amber-400 text-slate-950 shadow-lg font-black'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Jawa Barat</span>
                </div>
                <span className={`text-[10px] font-mono mt-0.5 ${scope === 'jabar' ? 'text-slate-800' : 'text-slate-500'}`}>
                  27 Kab/Kota · 49.9 Jt
                </span>
              </button>

              <button
                onClick={() => setScope('nasional')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                  scope === 'nasional'
                    ? 'bg-amber-400 text-slate-950 shadow-lg font-black'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Nasional</span>
                </div>
                <span className={`text-[10px] font-mono mt-0.5 ${scope === 'nasional' ? 'text-slate-800' : 'text-slate-500'}`}>
                  Indonesia · 278.5 Jt
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Scope Contextual Intelligence Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Profil Konsumen Wilayah
            </span>
            <p className="text-slate-300 leading-snug">
              {planComparison.scopeMeta.demographicProfile}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Pola Mobilitas & Konsumsi
            </span>
            <p className="text-slate-300 leading-snug">
              {planComparison.scopeMeta.dominantConsumerHabits}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Koridor & Titik Pertumbuhan Kunci
            </span>
            <div className="flex flex-wrap gap-1">
              {planComparison.scopeMeta.topCorridorsOrNodes.slice(0, 3).map((node, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] font-mono border border-slate-800">
                  {node.split(' (')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Simulation Controller (Budget, Presets, Sliders) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Pengaturan Anggaran & Model Strategi Alokasi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesuaikan total anggaran kampanye dan pilih skenario distribusi media mix untuk melihat perbandingan proyeksi performa.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {STRATEGY_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedPresetId === preset.id
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {preset.name.split(' (')[0]}
              </button>
            ))}
            <button
              onClick={() => setSelectedPresetId('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedPresetId === 'custom'
                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Kustom Slider
            </button>
          </div>
        </div>

        {/* Budget & Duration Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Total Budget Slider */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Total Anggaran Kampanye:</span>
              </label>
              <div className="font-mono font-black text-lg text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                Rp {budgetMillions.toLocaleString('id-ID')} Juta
              </div>
            </div>

            <input
              type="range"
              min="50"
              max="3500"
              step="25"
              value={budgetMillions}
              onChange={(e) => setBudgetMillions(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Rp 50 Jt</span>
              <span>Rp 500 Jt</span>
              <span>Rp 1.5 M</span>
              <span>Rp 3.5 M</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Durasi Kampanye:</span>
            </label>
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[1, 3, 6, 12].map(m => (
                <button
                  key={m}
                  onClick={() => setDurationMonths(m)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                    durationMonths === m
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m} Bln
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {durationMonths >= 6 ? 'Diskon korporasi durasi panjang aktif (10-15%)' : 'Durasi standar komersial'}
            </span>
          </div>

          {/* Synergy Multiplier Badge */}
          <div className="md:col-span-3 p-4 bg-gradient-to-br from-amber-500/10 via-slate-950 to-emerald-500/10 border border-amber-400/30 rounded-2xl">
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
              Omnichannel Halo Lift:
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {planComparison.overallSynergyMultiplier}x
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                +{Math.round((planComparison.overallSynergyMultiplier - 1) * 100)}% Efisiensi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Cross-reinforcement antara OOH dan Digital Retargeting.
            </p>
          </div>
        </div>

        {/* Custom Allocation Sliders (Interactive Bar & Percentage Distribution) */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Proporsi Alokasi Belanja Media (ATL vs BTL vs DTL):</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Model: <strong>{activePreset.name}</strong> · {activePreset.tagline}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-blue-400 font-bold">ATL: {currentAllocation.atl}%</span>
              <span className="text-emerald-400 font-bold">BTL: {currentAllocation.btl}%</span>
              <span className="text-purple-400 font-bold">DTL: {currentAllocation.dtl}%</span>
              <span className="text-slate-500">| Total: 100%</span>
            </div>
          </div>

          {/* Visual Color-Coded Progress Bar */}
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${currentAllocation.atl}%` }} 
              className="bg-blue-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300"
              title={`ATL: ${currentAllocation.atl}%`}
            >
              {currentAllocation.atl >= 15 && `ATL ${currentAllocation.atl}%`}
            </div>
            <div 
              style={{ width: `${currentAllocation.btl}%` }} 
              className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all duration-300"
              title={`BTL: ${currentAllocation.btl}%`}
            >
              {currentAllocation.btl >= 15 && `BTL ${currentAllocation.btl}%`}
            </div>
            <div 
              style={{ width: `${currentAllocation.dtl}%` }} 
              className="bg-purple-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300"
              title={`DTL: ${currentAllocation.dtl}%`}
            >
              {currentAllocation.dtl >= 15 && `DTL ${currentAllocation.dtl}%`}
            </div>
          </div>

          {/* Manual Range Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-blue-400 font-bold">1. Above The Line (ATL)</span>
                <span className="font-mono text-white font-bold">{currentAllocation.atl}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={currentAllocation.atl}
                onChange={(e) => handleCustomSliderChange('atl', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Rp {Math.round(planComparison.pillars.atl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 font-bold">2. Below The Line (BTL)</span>
                <span className="font-mono text-white font-bold">{currentAllocation.btl}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={currentAllocation.btl}
                onChange={(e) => handleCustomSliderChange('btl', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Rp {Math.round(planComparison.pillars.btl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-purple-400 font-bold">3. Digital Direct (DTL)</span>
                <span className="font-mono text-white font-bold">{currentAllocation.dtl}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={currentAllocation.dtl}
                onChange={(e) => handleCustomSliderChange('dtl', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Rp {Math.round(planComparison.pillars.dtl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Metric Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Gross Impressions
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
            {parseFloat((planComparison.totalGrossReach / 1000000).toFixed(2))} Jt
          </div>
          <span className="text-[10px] text-slate-500">Total kontak tayang</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Net Unique Reach
          </span>
          <div className="text-lg sm:text-xl font-black text-white font-mono">
            {parseFloat((planComparison.totalUniqueReach / 1000000).toFixed(2))} Jt
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            {((planComparison.totalUniqueReach / planComparison.scopeMeta.populationTotal) * 100).toFixed(1)}% Penetrasi
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Blended CPM
          </span>
          <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono">
            Rp {planComparison.blendedOverallCpm.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-500">Biaya per 1.000 kontak</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Est. Total Konversi
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
            {planComparison.totalConversions.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-500">Leads / Transaksi Aksi</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Acquisition Cost (CPA)
          </span>
          <div className="text-lg sm:text-xl font-black text-purple-400 font-mono">
            Rp {planComparison.overallCpaIdr.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-500">Per konversi leads</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Cross-Media Lift
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
            +{Math.round((planComparison.overallSynergyMultiplier - 1) * 100)}%
          </div>
          <span className="text-[10px] text-amber-300 font-semibold">Efek Halo Omnichannel</span>
        </div>
      </div>

      {/* 4. Navigation View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveViewTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeViewTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ringkasan Eksekutif</span>
          </button>

          <button
            onClick={() => setActiveViewTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeViewTab === 'matrix'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Matriks Perbandingan (ATL vs BTL vs DTL)</span>
          </button>

          <button
            onClick={() => setActiveViewTab('charts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeViewTab === 'charts'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Visual Grafis & Radar 5-Dimensi</span>
          </button>

          <button
            onClick={() => setActiveViewTab('playbook')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeViewTab === 'playbook'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Playbook Taktis Media Wilayah</span>
          </button>

          <button
            onClick={() => setActiveViewTab('proposal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeViewTab === 'proposal'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Proposal Siap Cetak (Executive Format)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            Skala: <strong className="text-amber-400">{planComparison.scopeMeta.name}</strong>
          </span>
        </div>
      </div>

      {/* 5. TAB CONTENT RENDERING */}

      {/* TAB 1: OVERVIEW */}
      {activeViewTab === 'overview' && (
        <div className="space-y-6">
          {/* 3 Pillar Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ATL Card */}
            <div className="p-6 bg-slate-900 border border-blue-500/40 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  ATL · ABOVE THE LINE
                </span>
                <span className="font-mono text-lg font-black text-blue-400">
                  {currentAllocation.atl}% Anggaran
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Massa, Reputasi & OOH Dominasi</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Membangun kesadaran merk massal tanpa gangguan (un-skippable) di koridor arteri dan persimpangan utama.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alokasi Dana:</span>
                  <strong className="text-white">Rp {Math.round(planComparison.pillars.atl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Impressions:</span>
                  <strong className="text-amber-400">{(planComparison.pillars.atl.estimatedGrossReach / 1000000).toFixed(2)} Juta</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unique Reach:</span>
                  <strong className="text-cyan-400">{(planComparison.pillars.atl.estimatedUniqueReach / 1000000).toFixed(2)} Juta</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blended CPM:</span>
                  <strong className="text-slate-300">Rp {planComparison.pillars.atl.blendedCpmIdr.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Format Rekomendasi di {planComparison.scopeMeta.name}:
                </span>
                <ul className="text-xs text-slate-300 space-y-1">
                  {planComparison.pillars.atl.channels[0].recommendedFormats[scope].map((fmt, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span>{fmt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* BTL Card */}
            <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  BTL · BELOW THE LINE
                </span>
                <span className="font-mono text-lg font-black text-emerald-400">
                  {currentAllocation.btl}% Anggaran
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Aktivasi, Uji Coba & Sampling</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Interaksi langsung tatap muka dengan calon konsumen di pusat perbelanjaan, CFD, dan titik keputusan belanja.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alokasi Dana:</span>
                  <strong className="text-white">Rp {Math.round(planComparison.pillars.btl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Impressions:</span>
                  <strong className="text-amber-400">{(planComparison.pillars.btl.estimatedGrossReach / 1000000).toFixed(2)} Juta</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Direct Footfall:</span>
                  <strong className="text-emerald-400">{(planComparison.pillars.btl.estimatedUniqueReach / 1000).toFixed(0)} Ribu orang</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rasio Konversi Aksi:</span>
                  <strong className="text-emerald-300">{planComparison.pillars.btl.avgEngagementRatePct}% (Tinggi)</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Format Rekomendasi di {planComparison.scopeMeta.name}:
                </span>
                <ul className="text-xs text-slate-300 space-y-1">
                  {planComparison.pillars.btl.channels[0].recommendedFormats[scope].map((fmt, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{fmt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* DTL Card */}
            <div className="p-6 bg-slate-900 border border-purple-500/40 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  DTL · DIGITAL THROUGH-THE-LINE
                </span>
                <span className="font-mono text-lg font-black text-purple-400">
                  {currentAllocation.dtl}% Anggaran
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Retargeting, Geofencing & CRM</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mengepung smartphone audiens di sekitar titik reklame dengan Meta Ads, Google Intent Capture, dan WhatsApp.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alokasi Dana:</span>
                  <strong className="text-white">Rp {Math.round(planComparison.pillars.dtl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Digital Impressions:</span>
                  <strong className="text-amber-400">{(planComparison.pillars.dtl.estimatedGrossReach / 1000000).toFixed(2)} Juta</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Leads Terbuka:</span>
                  <strong className="text-purple-400">{planComparison.pillars.dtl.estimatedConversions.toLocaleString('id-ID')} Leads</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost Per Acquisition:</span>
                  <strong className="text-slate-300">Rp {planComparison.pillars.dtl.blendedCpaIdr.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Format Rekomendasi di {planComparison.scopeMeta.name}:
                </span>
                <ul className="text-xs text-slate-300 space-y-1">
                  {planComparison.pillars.dtl.channels[0].recommendedFormats[scope].map((fmt, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>{fmt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Omnichannel Customer Journey Funnel Narrative */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-white uppercase tracking-wider">
                Alur Perjalanan Konsumen Lintas Saluran (The Omnichannel Flywheel)
              </h4>
            </div>

            <p className="text-xs text-slate-400">
              {planComparison.synergyNarrative}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-950 border border-blue-500/30 rounded-2xl space-y-2">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white font-mono font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h5 className="text-sm font-bold text-white">Tahap Stimulasi (ATL)</h5>
                <p className="text-xs text-slate-400">
                  Calon konsumen terpapar Megatron LED & Baliho di koridor komuter utama ({planComparison.scopeMeta.topCorridorsOrNodes[0]}). Menumbuhkan rasa penasaran dan pengenalan nama merek.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h5 className="text-sm font-bold text-white">Tahap Pengalaman Fisik (BTL)</h5>
                <p className="text-xs text-slate-400">
                  Saat berkunjung ke pusat perbelanjaan, audiens menjumpai booth aktivasi interaktif, mencoba produk langsung (*sampling*), dan mendapatkan voucher fisik.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-2">
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white font-mono font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h5 className="text-sm font-bold text-white">Tahap Penutupan Transaksi (DTL)</h5>
                <p className="text-xs text-slate-400">
                  Iklan geofencing Meta & Google Search memicu klik langsung ke WhatsApp Sales CS atau toko online untuk transaksi akhir (*closing sales*) dan pendaftaran program loyalitas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE MATRIX COMPARISON */}
      {activeViewTab === 'matrix' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl overflow-hidden">
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Matriks Komparasi Karakteristik & Performa Antar-Media</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Perbandingan kuantitatif dan kualitatif antara ATL, BTL, dan DTL untuk anggaran Rp {budgetMillions.toLocaleString('id-ID')} Juta ({durationMonths} Bulan) di {planComparison.scopeMeta.name}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-3 px-4 bg-slate-950/80">PARAMETER PENGUKURAN</th>
                  <th className="py-3 px-4 bg-blue-950/40 text-blue-300 font-bold border-l border-slate-800">
                    ATL (ABOVE THE LINE)
                  </th>
                  <th className="py-3 px-4 bg-emerald-950/40 text-emerald-300 font-bold border-l border-slate-800">
                    BTL (BELOW THE LINE)
                  </th>
                  <th className="py-3 px-4 bg-purple-950/40 text-purple-300 font-bold border-l border-slate-800">
                    DTL (DIGITAL THROUGH-THE-LINE)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {/* 1. Alokasi Dana */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Alokasi Anggaran (Budget)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-400 border-l border-slate-800">
                    Rp {Math.round(planComparison.pillars.atl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta ({currentAllocation.atl}%)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 border-l border-slate-800">
                    Rp {Math.round(planComparison.pillars.btl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta ({currentAllocation.btl}%)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-purple-400 border-l border-slate-800">
                    Rp {Math.round(planComparison.pillars.dtl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta ({currentAllocation.dtl}%)
                  </td>
                </tr>

                {/* 2. Estimasi Gross Reach */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Estimasi Gross Impressions
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400 border-l border-slate-800">
                    {(planComparison.pillars.atl.estimatedGrossReach / 1000000).toFixed(2)} Juta Tayangan
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400 border-l border-slate-800">
                    {(planComparison.pillars.btl.estimatedGrossReach / 1000000).toFixed(2)} Juta Kontak
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400 border-l border-slate-800">
                    {(planComparison.pillars.dtl.estimatedGrossReach / 1000000).toFixed(2)} Juta Impresi
                  </td>
                </tr>

                {/* 3. Unique Audience */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Estimasi Unique Audience
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 border-l border-slate-800">
                    {(planComparison.pillars.atl.estimatedUniqueReach / 1000000).toFixed(2)} Juta Jiwa
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 border-l border-slate-800">
                    {(planComparison.pillars.btl.estimatedUniqueReach / 1000).toFixed(0)} Ribu Pengunjung
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 border-l border-slate-800">
                    {(planComparison.pillars.dtl.estimatedUniqueReach / 1000000).toFixed(2)} Juta Akun Unik
                  </td>
                </tr>

                {/* 4. Blended CPM */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Blended CPM (Biaya / 1.000 Kontak)
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-300 border-l border-slate-800">
                    Rp {planComparison.pillars.atl.blendedCpmIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-300 border-l border-slate-800">
                    Rp {planComparison.pillars.btl.blendedCpmIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-300 border-l border-slate-800">
                    Rp {planComparison.pillars.dtl.blendedCpmIdr.toLocaleString('id-ID')}
                  </td>
                </tr>

                {/* 5. Dwell Time */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Durasi Paparan (Dwell Time)
                  </td>
                  <td className="py-3 px-4 text-slate-300 border-l border-slate-800">
                    {planComparison.pillars.atl.avgDwellTime}
                  </td>
                  <td className="py-3 px-4 text-slate-300 border-l border-slate-800">
                    {planComparison.pillars.btl.avgDwellTime}
                  </td>
                  <td className="py-3 px-4 text-slate-300 border-l border-slate-800">
                    {planComparison.pillars.dtl.avgDwellTime}
                  </td>
                </tr>

                {/* 6. Engagement Rate */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Tingkat Keterlibatan (Engagement Rate)
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 border-l border-slate-800">
                    {planComparison.pillars.atl.avgEngagementRatePct}% (Visual Exposure)
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold border-l border-slate-800">
                    {planComparison.pillars.btl.avgEngagementRatePct}% (Interaksi Langsung)
                  </td>
                  <td className="py-3 px-4 font-mono text-purple-400 font-bold border-l border-slate-800">
                    {planComparison.pillars.dtl.avgEngagementRatePct}% (Klik & Interaksi)
                  </td>
                </tr>

                {/* 7. Est. Conversions */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Estimasi Konversi Aksi Nyata
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white border-l border-slate-800">
                    {planComparison.pillars.atl.estimatedConversions.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 border-l border-slate-800">
                    {planComparison.pillars.btl.estimatedConversions.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-purple-400 border-l border-slate-800">
                    {planComparison.pillars.dtl.estimatedConversions.toLocaleString('id-ID')}
                  </td>
                </tr>

                {/* 8. Cost Per Acquisition */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Biaya per Akuisisi (CPA / CPL)
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 border-l border-slate-800">
                    Rp {planComparison.pillars.atl.blendedCpaIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 border-l border-slate-800">
                    Rp {planComparison.pillars.btl.blendedCpaIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 border-l border-slate-800">
                    Rp {planComparison.pillars.dtl.blendedCpaIdr.toLocaleString('id-ID')}
                  </td>
                </tr>

                {/* 9. Kekuatan Utama */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Keunggulan Strategis Utama
                  </td>
                  <td className="py-3 px-4 text-slate-300 border-l border-slate-800">
                    Dominasi prestise visual 24/7, tak bisa di-skip/block, menciptakan reputasi instan di arteri utama.
                  </td>
                  <td className="py-3 px-4 text-slate-300 border-l border-slate-800">
                    Uji coba produk langsung di tempat (hands-on trial), rasio closing penjualan spontan tertinggi.
                  </td>
                  <td className="py-3 px-4 text-slate-300 border-l border-slate-800">
                    Penargetan hiper-lokal geofencing di sekitar billboard, pelacakan atribusi akurat, dan closing via WhatsApp.
                  </td>
                </tr>

                {/* 10. Tantangan */}
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    Tantangan / Limitasi
                  </td>
                  <td className="py-3 px-4 text-slate-400 border-l border-slate-800">
                    Atribusi klik langsung membutuhkan bantuan jembatan digital (QR Code atau URL promosi).
                  </td>
                  <td className="py-3 px-4 text-slate-400 border-l border-slate-800">
                    Biaya operasional SPG/logistik booth lebih tinggi per kontak, jangkauan terbatas pada area mall.
                  </td>
                  <td className="py-3 px-4 text-slate-400 border-l border-slate-800">
                    Tingkat kejenuhan iklan tinggi (*ad fatigue*), butuh pergantian materi visual dinamis secara berkala.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VISUAL CHARTS & 5-DIMENSION RADAR */}
      {activeViewTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Gross Reach & Conversions */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Perbandingan Gross Reach (Juta Kontak)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total volume paparan audiens yang dihasilkan masing-masing pilar media
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Total: {(planComparison.totalGrossReach / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataPillars} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val: any, name: any) => [`${val} Juta`, name === 'reachJuta' ? 'Gross Reach' : name]}
                    />
                    <Bar dataKey="reachJuta" name="Gross Reach (Juta)" radius={[8, 8, 0, 0]}>
                      {chartDataPillars.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Budget Distribution Donut */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Proporsi Anggaran Belanja Media (Media Mix Share)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Distribusi alokasi dana kampanye Rp {budgetMillions.toLocaleString('id-ID')} Juta
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  100% Terdistribusi
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartBudgetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartBudgetData.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val: any) => [`Rp ${Math.round(Number(val) / 1000000).toLocaleString('id-ID')} Juta`, 'Alokasi']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      formatter={(val: any) => <span className="text-xs text-slate-300 font-medium">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3: Radar 5 Dimensions */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Evaluasi Kekuatan Komparatif 5-Dimensi (The Strategic Radar)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Memetakan keunggulan relatif masing-masing pilar media pada skala skor 0 - 100
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  ATL
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  BTL
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  DTL
                </span>
              </div>
            </div>

            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                  <Radar name="ATL (Massa & OOH)" dataKey="ATL" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Radar name="BTL (Aktivasi & Booth)" dataKey="BTL" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                  <Radar name="DTL (Digital Direct)" dataKey="DTL" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLAYBOOK TAKTIS REGIONAL */}
      {activeViewTab === 'playbook' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Daftar Saluran Media Spesifik Wilayah: {planComparison.scopeMeta.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rincian penempatan taktis untuk setiap media pada cakupan wilayah yang aktif dipilih.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {planComparison.scopeMeta.titleBadge}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* ATL Channels Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-500/40">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <h5 className="font-bold text-sm text-white">Saluran ATL (Above The Line)</h5>
                </div>

                {planComparison.pillars.atl.channels.map(channel => (
                  <div key={channel.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-blue-400/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-300">{channel.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">CPM ~Rp {(channel.typicalCpmIdr * planComparison.scopeMeta.costIndexMultiplier).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{channel.description}</p>
                    
                    <div className="pt-2 border-t border-slate-850 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Format Utama:</span>
                      <div className="flex flex-wrap gap-1">
                        {channel.recommendedFormats[scope].map((fmt, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 text-[10px] font-mono border border-blue-800/40">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BTL Channels Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/40">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h5 className="font-bold text-sm text-white">Saluran BTL (Below The Line)</h5>
                </div>

                {planComparison.pillars.btl.channels.map(channel => (
                  <div key={channel.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-emerald-400/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-300">{channel.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">CPM ~Rp {(channel.typicalCpmIdr * planComparison.scopeMeta.costIndexMultiplier).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{channel.description}</p>
                    
                    <div className="pt-2 border-t border-slate-850 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Format Utama:</span>
                      <div className="flex flex-wrap gap-1">
                        {channel.recommendedFormats[scope].map((fmt, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] font-mono border border-emerald-800/40">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DTL Channels Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-500/40">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <h5 className="font-bold text-sm text-white">Saluran DTL (Digital Direct)</h5>
                </div>

                {planComparison.pillars.dtl.channels.map(channel => (
                  <div key={channel.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-purple-400/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-300">{channel.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">CPM ~Rp {(channel.typicalCpmIdr * planComparison.scopeMeta.costIndexMultiplier).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{channel.description}</p>
                    
                    <div className="pt-2 border-t border-slate-850 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Format Utama:</span>
                      <div className="flex flex-wrap gap-1">
                        {channel.recommendedFormats[scope].map((fmt, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 text-[10px] font-mono border border-purple-800/40">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRINT-READY EXECUTIVE PROPOSAL */}
      {activeViewTab === 'proposal' && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase block">
                CV BANDUNG MEDIA OUTDOOR · OMNICHANNEL STRATEGIC PLANNING
              </span>
              <h3 className="text-2xl font-black text-white">
                PROPOSAL STRATEGI PENEMPATAN MEDIA IKLAN LINTAS JALUR
              </h3>
              <p className="text-xs text-slate-400">
                Dokumen Rekomendasi Media Mix: ATL · BTL · DTL ({planComparison.scopeMeta.name})
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shrink-0 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>

          {/* Proposal Meta Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">KLIEN / KAMPANYE:</span>
              <strong className="text-white text-sm">{brandName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CAKUPAN WILAYAH:</span>
              <strong className="text-amber-400 text-sm">{planComparison.scopeMeta.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL ANGGARAN:</span>
              <strong className="text-emerald-400 text-sm">Rp {budgetMillions.toLocaleString('id-ID')} Juta ({durationMonths} Bln)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">MODEL DISTRIBUSI:</span>
              <strong className="text-cyan-400 text-sm">{activePreset.name.split(' (')[0]}</strong>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              1. Ringkasan Eksekutif & Rasional Penempatan
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Berdasarkan analisis karakteristik demografi dan mobilitas konsumen di <strong>{planComparison.scopeMeta.name}</strong>, strategi omnichannel yang diusulkan mengalokasikan <strong>{currentAllocation.atl}% pada media Above The Line (ATL)</strong>, <strong>{currentAllocation.btl}% pada media Below The Line (BTL)</strong>, dan <strong>{currentAllocation.dtl}% pada media Digital Direct (DTL)</strong>.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Integrasi ketiga pilar menghasilkan estimasi <strong>{(planComparison.totalGrossReach / 1000000).toFixed(2)} Juta impresi kotor</strong> dengan jangkauan unik mencapai <strong>{(planComparison.totalUniqueReach / 1000000).toFixed(2)} Juta jiwa</strong> (penetrasi {((planComparison.totalUniqueReach / planComparison.scopeMeta.populationTotal) * 100).toFixed(1)}% populasi). Sinergi lintas media memicu efek pengali (*halo effect*) sebesar <strong>+{Math.round((planComparison.overallSynergyMultiplier - 1) * 100)}%</strong> efisiensi akuisisi.
            </p>
          </div>

          {/* Budget Allocation Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              2. Rincian Alokasi Anggaran & Target Performa
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">PILAR MEDIA</th>
                    <th className="py-2.5 px-4">PORSI (%)</th>
                    <th className="py-2.5 px-4">ANGGARAN (IDR)</th>
                    <th className="py-2.5 px-4">GROSS REACH</th>
                    <th className="py-2.5 px-4">EST. KONVERSI</th>
                    <th className="py-2.5 px-4">BLENDED CPM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-blue-400">Above The Line (ATL)</td>
                    <td className="py-2.5 px-4">{currentAllocation.atl}%</td>
                    <td className="py-2.5 px-4">Rp {Math.round(planComparison.pillars.atl.allocatedBudget / 1000000).toLocaleString('id-ID')} Jt</td>
                    <td className="py-2.5 px-4">{(planComparison.pillars.atl.estimatedGrossReach / 1000000).toFixed(2)} M</td>
                    <td className="py-2.5 px-4">{planComparison.pillars.atl.estimatedConversions.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-4">Rp {planComparison.pillars.atl.blendedCpmIdr.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">Below The Line (BTL)</td>
                    <td className="py-2.5 px-4">{currentAllocation.btl}%</td>
                    <td className="py-2.5 px-4">Rp {Math.round(planComparison.pillars.btl.allocatedBudget / 1000000).toLocaleString('id-ID')} Jt</td>
                    <td className="py-2.5 px-4">{(planComparison.pillars.btl.estimatedGrossReach / 1000000).toFixed(2)} M</td>
                    <td className="py-2.5 px-4">{planComparison.pillars.btl.estimatedConversions.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-4">Rp {planComparison.pillars.btl.blendedCpmIdr.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-purple-400">Digital Direct (DTL)</td>
                    <td className="py-2.5 px-4">{currentAllocation.dtl}%</td>
                    <td className="py-2.5 px-4">Rp {Math.round(planComparison.pillars.dtl.allocatedBudget / 1000000).toLocaleString('id-ID')} Jt</td>
                    <td className="py-2.5 px-4">{(planComparison.pillars.dtl.estimatedGrossReach / 1000000).toFixed(2)} M</td>
                    <td className="py-2.5 px-4">{planComparison.pillars.dtl.estimatedConversions.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-4">Rp {planComparison.pillars.dtl.blendedCpmIdr.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr className="bg-slate-950 font-bold text-amber-400">
                    <td className="py-3 px-4">TOTAL KONSOLIDASI</td>
                    <td className="py-3 px-4">100%</td>
                    <td className="py-3 px-4">Rp {budgetMillions.toLocaleString('id-ID')} Jt</td>
                    <td className="py-3 px-4">{(planComparison.totalGrossReach / 1000000).toFixed(2)} M</td>
                    <td className="py-3 px-4">{planComparison.totalConversions.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4">Rp {planComparison.blendedOverallCpm.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="pt-8 border-t border-slate-800 flex justify-between items-end text-xs text-slate-400">
            <div>
              <p className="font-bold text-white">Disiapkan oleh:</p>
              <p>CV Bandung Media Outdoor - Strategic Planning & Media Division</p>
              <p className="font-mono text-[10px] text-slate-500 mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-amber-400">DISETUJUI OLEH CLIENT REPRESENTATIVE</p>
              <div className="h-16" />
              <p className="border-t border-slate-700 pt-1 font-mono">( ______________________________ )</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
