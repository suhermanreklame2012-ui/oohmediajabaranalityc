import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ComposedChart 
} from 'recharts';
import { BillboardSpot } from '../types/ooh';
import { 
  WEST_JAVA_HISTORICAL_TRAFFIC, 
  RegionTrafficInsight, 
  getAggregateTrafficTrend, 
  getComparativeMonthlyTrend 
} from '../data/historicalTrafficData';
import { WEST_JAVA_REGIONAL_CLUSTERS } from '../data/jabarData';
import { 
  TrendingUp, 
  Car, 
  Clock, 
  Eye, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  ShieldCheck, 
  Compass, 
  Sliders, 
  Filter, 
  Info,
  CheckCircle2,
  Zap,
  Building2,
  RotateCcw
} from 'lucide-react';

interface TrafficInsightsProps {
  spots: BillboardSpot[];
  onOpenMapTab?: (spot: BillboardSpot) => void;
}

type MetricViewMode = 'volume_vac' | 'multi_region' | 'hourly_diurnal' | 'speed_dwell' | 'vehicle_modality';
type HorizonFilter = 'all_18m' | 'last_12m' | 'last_6m';

export function TrafficInsights({ spots, onOpenMapTab }: TrafficInsightsProps) {
  // Region Selection
  const [selectedRegionName, setSelectedRegionName] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<MetricViewMode>('volume_vac');
  const [horizon, setHorizon] = useState<HorizonFilter>('all_18m');
  
  // Selected comparison regions for Multi-Region Comparison chart
  const [comparedRegions, setComparedRegions] = useState<string[]>([
    'Kota Bandung', 
    'Kota Bekasi', 
    'Kota Bogor', 
    'Kabupaten Karawang'
  ]);

  // Selected region metadata & trends
  const currentRegionInsight: RegionTrafficInsight | null = useMemo(() => {
    if (selectedRegionName === 'Semua') return null;
    return WEST_JAVA_HISTORICAL_TRAFFIC.find(r => r.regencyName === selectedRegionName) || null;
  }, [selectedRegionName]);

  // Active monthly data (either aggregate or specific region)
  const rawMonthlyData = useMemo(() => {
    if (selectedRegionName === 'Semua') {
      return getAggregateTrafficTrend();
    }
    return currentRegionInsight ? currentRegionInsight.historicalMonthly : getAggregateTrafficTrend();
  }, [selectedRegionName, currentRegionInsight]);

  // Horizon filtered monthly points
  const monthlyData = useMemo(() => {
    if (horizon === 'last_6m') {
      return rawMonthlyData.slice(-6);
    }
    if (horizon === 'last_12m') {
      return rawMonthlyData.slice(-12);
    }
    return rawMonthlyData;
  }, [rawMonthlyData, horizon]);

  // Hourly diurnal profile
  const hourlyData = useMemo(() => {
    if (currentRegionInsight) {
      return currentRegionInsight.hourlyDiurnal;
    }
    // Aggregate hourly profile based on Bandung and Bekasi averages
    const ref = WEST_JAVA_HISTORICAL_TRAFFIC[0].hourlyDiurnal;
    const ref2 = WEST_JAVA_HISTORICAL_TRAFFIC[1].hourlyDiurnal;
    return ref.map((pt, idx) => ({
      ...pt,
      weekdayVolume: Math.round((pt.weekdayVolume + ref2[idx].weekdayVolume) / 2),
      weekendVolume: Math.round((pt.weekendVolume + ref2[idx].weekendVolume) / 2)
    }));
  }, [currentRegionInsight]);

  // Multi-region comparison trend
  const comparisonData = useMemo(() => {
    const data = getComparativeMonthlyTrend(comparedRegions);
    if (horizon === 'last_6m') return data.slice(-6);
    if (horizon === 'last_12m') return data.slice(-12);
    return data;
  }, [comparedRegions, horizon]);

  // KPI Calculations
  const latestMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2] || latestMonth;
  const monthOverMonthChange = Math.round(((latestMonth.dailyAvgVolume - previousMonth.dailyAvgVolume) / previousMonth.dailyAvgVolume) * 1000) / 10;

  // Matching spots in the selected region
  const regionSpots = useMemo(() => {
    if (selectedRegionName === 'Semua') return spots;
    return spots.filter(s => s.regency === selectedRegionName);
  }, [spots, selectedRegionName]);

  // Comparison toggle helper
  const toggleComparedRegion = (regName: string) => {
    if (comparedRegions.includes(regName)) {
      if (comparedRegions.length > 1) {
        setComparedRegions(comparedRegions.filter(r => r !== regName));
      }
    } else {
      setComparedRegions([...comparedRegions, regName]);
    }
  };

  // Color palette for multiple lines
  const regionColorMap: Record<string, string> = {
    Bandung: '#f59e0b',   // Amber
    Bekasi: '#06b6d4',    // Cyan
    Bogor: '#10b981',     // Emerald
    Depok: '#8b5cf6',     // Violet
    Karawang: '#ef4444',  // Rose/Red
    Cirebon: '#ec4899',   // Pink
    'Kab. Bogor': '#38bdf8',
    Cimahi: '#eab308',
    'Kab. Bandung': '#14b8a6',
    Tasikmalaya: '#f97316'
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Intelijen Tren Lalu Lintas Jawa Barat
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <Calendar className="w-3 h-3" /> Periode 2025 - 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Traffic Insights & Tren Mobilitas Regional
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Visualisasi historis volume kendaraan, indeks kemacetan, durasi pandang iklan (dwell time), dan proyeksi impresi VAC di seluruh simpul arteri Jawa Barat berbasis grafik interaktif Recharts.
          </p>
        </div>

        {/* Time Horizon Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0 self-start md:self-center">
          <button
            onClick={() => setHorizon('all_18m')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              horizon === 'all_18m'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            18 Bulan
          </button>
          <button
            onClick={() => setHorizon('last_12m')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              horizon === 'last_12m'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            12 Bulan Terakhir
          </button>
          <button
            onClick={() => setHorizon('last_6m')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              horizon === 'last_6m'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            6 Bulan Terakhir
          </button>
        </div>
      </div>

      {/* Region Filter Bar (Bandung, Bekasi, Bogor, Depok, Karawang, Cirebon, dll) */}
      <div className="flex flex-col gap-2 p-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Pilih Wilayah Analisis:
            </span>
          </div>

          {/* Quick cluster preset jumps */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 hidden sm:inline">Aglomerasi:</span>
            {WEST_JAVA_REGIONAL_CLUSTERS.map(cluster => (
              <button
                key={cluster.id}
                onClick={() => {
                  setSelectedRegionName(cluster.regencies[0]);
                }}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 rounded-md transition-colors"
                title={`${cluster.name}: ${cluster.description}`}
              >
                {cluster.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Region Pills Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setSelectedRegionName('Semua')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 border ${
              selectedRegionName === 'Semua'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-400/20'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
            }`}
          >
            <span>Seluruh Jawa Barat (Agregat)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedRegionName === 'Semua' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'
            }`}>
              27 Wilayah
            </span>
          </button>

          {WEST_JAVA_HISTORICAL_TRAFFIC.map(r => {
            const isSelected = selectedRegionName === r.regencyName;
            return (
              <button
                key={r.regencyName}
                onClick={() => setSelectedRegionName(r.regencyName)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl shrink-0 transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                <span>{r.shortName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  +{r.annualGrowthPct}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Meta Profile Summary Banner (If single region selected) */}
      {currentRegionInsight && (
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{currentRegionInsight.regencyName}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {currentRegionInsight.classification}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Koridor Utama: <strong className="text-slate-200">{currentRegionInsight.busiestCorridor}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">JAM SIBUK PAGI</span>
              <span className="text-amber-400 font-bold">{currentRegionInsight.peakHourMorning} WIB</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">JAM SIBUK SORE</span>
              <span className="text-amber-400 font-bold">{currentRegionInsight.peakHourEvening} WIB</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">TITIK BILLBOARD</span>
              <span className="text-emerald-400 font-bold">{regionSpots.length} Titik</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Volume Kendaraan Harian */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Volume Rata-rata Harian</span>
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {latestMonth.dailyAvgVolume.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className={`flex items-center font-bold font-mono ${monthOverMonthChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {monthOverMonthChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {monthOverMonthChange >= 0 ? `+${monthOverMonthChange}%` : `${monthOverMonthChange}%`}
              </span>
              <span className="text-slate-500 text-[11px]">vs bulan sebelumnya</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Impresi VAC Bulanan */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Impresi Tertarget (VAC Bulanan)</span>
            <div className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {(latestMonth.vacImpressions / 1000000).toFixed(2)} Juta
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span className="text-slate-300 font-semibold font-mono">
                {(latestMonth.volume / 1000000).toFixed(2)}M
              </span>
              <span>total gross reach / bulan</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Rata-rata Dwell Time */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Rata-rata Dwell Time Reklame</span>
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {latestMonth.avgDwellTimeSec} detik
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>Kecepatan rata-rata:</span>
              <span className="text-slate-300 font-mono font-semibold">{latestMonth.avgSpeedKmh} km/jam</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Indeks Trafik & Pertumbuhan YoY */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Indeks Trafik & Laju YoY</span>
            <div className="p-1.5 rounded-lg bg-purple-400/10 text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-400 tracking-tight">
              {latestMonth.trafficIndex}
              <span className="text-xs text-slate-500 font-normal font-sans ml-1">(Base 100)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>Pertumbuhan YoY:</span>
              <span className="text-emerald-400 font-mono font-bold">+{latestMonth.growthYoY}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setViewMode('volume_vac')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            viewMode === 'volume_vac'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Volume Lalu Lintas & Impresi VAC</span>
        </button>

        <button
          onClick={() => setViewMode('multi_region')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            viewMode === 'multi_region'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Komparasi Antar-Wilayah Jabar</span>
        </button>

        <button
          onClick={() => setViewMode('hourly_diurnal')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            viewMode === 'hourly_diurnal'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Profil Diurnal 24 Jam (Weekday vs Weekend)</span>
        </button>

        <button
          onClick={() => setViewMode('speed_dwell')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            viewMode === 'speed_dwell'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Kecepatan vs Durasi Dwell Time</span>
        </button>

        <button
          onClick={() => setViewMode('vehicle_modality')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            viewMode === 'vehicle_modality'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Komposisi Moda Kendaraan</span>
        </button>
      </div>

      {/* Main Chart Canvas Container */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl space-y-4">
        
        {/* CHART 1: Volume Lalu Lintas & Impresi VAC */}
        {viewMode === 'volume_vac' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Tren Historis Volume Lalu Lintas & Impresi VAC ({selectedRegionName})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menampilkan kurva tren volume kendaraan per bulan dan estimasi kontak audiens terverifikasi (VAC).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span> Volume Harian
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-3 rounded-full bg-cyan-400"></span> Impresi VAC
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="gradientVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="gradientVac" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="shortMonth" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#090d16', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)'
                    }}
                    formatter={(val: any, name: any) => {
                      if (name === 'Volume Harian') return [`${Number(val).toLocaleString('id-ID')} kend/hari`, name];
                      if (name === 'Impresi VAC Bulanan') return [`${Number(val).toLocaleString('id-ID')} kontak`, name];
                      return [val, name];
                    }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="dailyAvgVolume" 
                    name="Volume Harian" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#gradientVolume)" 
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="vacImpressions" 
                    name="Impresi VAC Bulanan" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#gradientVac)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Multi-Region Comparison */}
        {viewMode === 'multi_region' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Komparasi Pertumbuhan Trafik Antar-Wilayah Jawa Barat (Ribu Kendaraan / Hari)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bandingkan pola lonjakan lalu lintas antar koridor utama Jawa Barat dalam rentang waktu yang sama.
                </p>
              </div>

              {/* Toggles for compared regions */}
              <div className="flex flex-wrap items-center gap-1.5">
                {WEST_JAVA_HISTORICAL_TRAFFIC.map(r => {
                  const isChecked = comparedRegions.includes(r.regencyName);
                  const color = regionColorMap[r.shortName] || '#94a3b8';
                  return (
                    <button
                      key={r.regencyName}
                      onClick={() => toggleComparedRegion(r.regencyName)}
                      className={`px-2 py-1 text-[11px] rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                        isChecked 
                          ? 'bg-slate-900 border-slate-700 text-white font-bold' 
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-400'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span>{r.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="shortMonth" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${val}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#090d16', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [`${val} ribu kend/hari`, name]}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }} 
                    formatter={(value) => <span className="text-slate-300 text-xs font-semibold">{value}</span>}
                  />
                  {comparedRegions.map(regFullName => {
                    const r = WEST_JAVA_HISTORICAL_TRAFFIC.find(item => item.regencyName === regFullName);
                    if (!r) return null;
                    const color = regionColorMap[r.shortName] || '#94a3b8';
                    return (
                      <Line
                        key={r.shortName}
                        type="monotone"
                        dataKey={r.shortName}
                        name={`${r.shortName}`}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: color }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: Hourly Diurnal Profile */}
        {viewMode === 'hourly_diurnal' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Profil Fluktuasi 24 Jam: Hari Kerja (Weekday) vs Akhir Pekan (Weekend)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Volume kendaraan per jam dari pukul 00:00 hingga 23:00 untuk memetakan jendela waktu tayang iklan paling efektif.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span> Hari Kerja (Senin-Jumat)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Akhir Pekan (Sabtu-Minggu)
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="gradientWeekday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="gradientWeekend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#090d16', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [`${Number(val).toLocaleString('id-ID')} kend/jam`, name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weekdayVolume" 
                    name="Volume Hari Kerja" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#gradientWeekday)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weekendVolume" 
                    name="Volume Akhir Pekan" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#gradientWeekend)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Rush Hour Insights Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-amber-400/10 text-amber-400 shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Jendela Puncak Pagi (07:00 - 09:30 WIB)</h4>
                  <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                    Didominasi komuter kantor dan pelajar dengan laju 14-18 km/jam. Sangat ideal untuk kampanye *Dayparting Videotron* sektor perbankan, kopi/F&B, dan telekomunikasi.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-red-400/10 text-red-400 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Jendela Puncak Sore & Malam (17:00 - 20:00 WIB)</h4>
                  <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                    Arus kepulangan dan kuliner malam dengan durasi pandang *dwell time* terpanjang (45 - 75 detik per siklus lampu merah), memaksimalkan *ad recall* hingga 84%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHART 4: Kecepatan vs Dwell Time */}
        {viewMode === 'speed_dwell' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Korelasi Kecepatan Kendaraan vs Durasi Pandang (Dwell Time)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hubungan terbalik antara kemacetan lalu lintas dengan peluang audiens mengamati materi iklan billboard secara mendalam.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-3 h-3 rounded bg-blue-500"></span> Kecepatan Rata-rata (km/jam)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span> Dwell Time (detik)
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="shortMonth" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    yAxisId="speed"
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    domain={[0, 60]}
                    tickFormatter={(val) => `${val} km/h`}
                  />
                  <YAxis 
                    yAxisId="dwell" 
                    orientation="right"
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    domain={[0, 80]}
                    tickFormatter={(val) => `${val}s`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#090d16', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => {
                      if (name === 'Kecepatan Rata-rata') return [`${val} km/jam`, name];
                      if (name === 'Dwell Time') return [`${val} detik`, name];
                      return [val, name];
                    }}
                  />
                  <Bar 
                    yAxisId="speed" 
                    dataKey="avgSpeedKmh" 
                    name="Kecepatan Rata-rata" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={18}
                  />
                  <Line 
                    yAxisId="dwell" 
                    type="monotone" 
                    dataKey="avgDwellTimeSec" 
                    name="Dwell Time" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#f59e0b' }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 5: Vehicle Modality Breakdown */}
        {viewMode === 'vehicle_modality' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Komposisi Moda Kendaraan Jawa Barat ({selectedRegionName})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proporsi jenis kendaraan pengguna jalan untuk memandu target audiens materi iklan.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Motor ({latestMonth.motorcyclePct}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Mobil ({latestMonth.privateCarPct}%)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Angkutan Umum ({latestMonth.publicTransitPct}%)
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Truk Niaga ({latestMonth.freightTruckPct}%)
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="shortMonth" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#090d16', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="motorcyclePct" 
                    name="Sepeda Motor" 
                    stackId="1" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="privateCarPct" 
                    name="Mobil Pribadi" 
                    stackId="1" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="publicTransitPct" 
                    name="Angkutan Umum" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="freightTruckPct" 
                    name="Truk & Niaga" 
                    stackId="1" 
                    stroke="#a855f7" 
                    fill="#a855f7" 
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Strategic Regional Traffic Recommendations & Billboard Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Regional Bottleneck Corridors */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Simpul Kemacetan Utama</h4>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Lokasi dengan volume tertinggi dan hambatan lalu lintas paling menguntungkan bagi durasi paparan reklame:
            </p>

            <ul className="space-y-2 text-xs">
              {(currentRegionInsight ? currentRegionInsight.topHotspots : [
                'Gerbang Tol Pasteur Exit Corridor (Bandung)',
                'Gerbang Tol Bekasi Barat - Jl. Ahmad Yani (Bekasi)',
                'Simpang Gadog - Ciawi Puncak Bottleneck (Bogor)',
                'Tol Japek KM 48 - MBZ Descent (Karawang)'
              ]).map((spotName, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-mono text-[10px] text-amber-400 font-bold mt-0.5">#{idx + 1}</span>
                  <span className="text-slate-200 text-xs">{spotName}</span>
                </li>
              ))}
            </ul>
          </div>

          {onOpenMapTab && regionSpots.length > 0 && (
            <button
              onClick={() => onOpenMapTab(regionSpots[0])}
              className="mt-4 w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tinjau Titik Reklame di Peta Interaktif</span>
            </button>
          )}
        </div>

        {/* Card 2: Seasonal Spike & Multiplier Index */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Indeks Musiman & Momentum</h4>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Faktor pengali lonjakan audiens berdasarkan periode tahunan:
          </p>

          <div className="space-y-2 text-xs">
            {(currentRegionInsight?.seasonalIndices || [
              { season: 'Weekend Wisata & Kuliner', indexMultiplier: 1.35, description: 'Lonjakan wisatawan plat B dari Jakarta via Tol Cipularang/Jagorawi' },
              { season: 'Mudik Lebaran & Hari Raya', indexMultiplier: 1.60, description: 'Puncak mobilitas di koridor tol dan arteri Pantura & Jalur Selatan' },
              { season: 'Hari Kerja Normal (Weekday)', indexMultiplier: 1.00, description: 'Volume komuter harian perkantoran dan sentra bisnis' }
            ]).map((s, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">{s.season}</span>
                  <span className="font-mono text-amber-400 font-bold text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">
                    ×{s.indexMultiplier} Index
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: OOH Placement Recommendation */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Rekomendasi Strategis Media</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  FORMAT PALING EFISIEN
                </span>
                <p className="font-bold text-cyan-300">
                  {selectedRegionName.includes('Bandung') || selectedRegionName.includes('Bekasi')
                    ? 'LED Videotron Curved & Megatron Gantry'
                    : selectedRegionName.includes('Karawang') || selectedRegionName.includes('Purwakarta')
                    ? 'Double Sided Static Billboard Unipole & JPO'
                    : 'Large Format LED Videotron 6500 nits'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Menjangkau multi-jalur kendaraan dengan sudut pandang tegak lurus (*front facing*) meminimalkan sudut buta pengemudi.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  OPTIMASI DAYPARTING (JAM TAYANG)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Fokuskan 65% slot rotasi dinamis pada pukul <strong className="text-amber-400 font-mono">07:00 - 09:30</strong> dan <strong className="text-amber-400 font-mono">16:45 - 20:00</strong> untuk menghasilkan CPM terendah dan VAC tertinggi per IDR yang diinvestasikan.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Data Terkalibrasi Recharts
            </span>
            <span>Update Q1 2026</span>
          </div>
        </div>

      </div>

    </div>
  );
}
