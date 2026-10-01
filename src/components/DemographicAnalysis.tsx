import { useState, useEffect, useMemo } from 'react';
import { BillboardSpot } from '../types/ooh';
import { WEST_JAVA_TRAFFIC_HOTSPOTS, TrafficHeatPoint, findNearbyHotspotsForSpot } from '../data/trafficDensityData';
import { DemographicAiAnalysisResult } from '../types/demographics';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  Users, 
  Sparkles, 
  Activity, 
  Clock, 
  Car, 
  Target, 
  BrainCircuit, 
  TrendingUp, 
  Search, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  MapPin, 
  ChevronRight, 
  Printer, 
  ShieldCheck, 
  Briefcase, 
  Laptop, 
  Zap,
  Building2,
  PieChart as PieIcon
} from 'lucide-react';

interface DemographicAnalysisProps {
  spots: BillboardSpot[];
  initialSpotId?: string;
  onOpenDetailModal?: (spot: BillboardSpot) => void;
  onNavigateToMap?: (spot: BillboardSpot) => void;
}

export function DemographicAnalysis({
  spots,
  initialSpotId,
  onOpenDetailModal,
  onNavigateToMap
}: DemographicAnalysisProps) {
  // 1. Selected Billboard Spot
  const [selectedSpotId, setSelectedSpotId] = useState<string>(() => {
    if (initialSpotId && spots.some(s => s.id === initialSpotId)) return initialSpotId;
    return spots[0]?.id || '';
  });

  // Search filter for spots list
  const [spotSearchQuery, setSpotSearchQuery] = useState<string>('');
  const [selectedRegencyFilter, setSelectedRegencyFilter] = useState<string>('all');

  // 2. Analysis Configuration State
  const [timeOfDayContext, setTimeOfDayContext] = useState<'weekday_commute' | 'weekend_leisure' | 'daily_aggregate'>('daily_aggregate');
  const [targetIndustry, setTargetIndustry] = useState<string>('Semua Industri');

  // 3. Execution & Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DemographicAiAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Spot object
  const currentSpot = useMemo(() => {
    return spots.find(s => s.id === selectedSpotId) || spots[0];
  }, [spots, selectedSpotId]);

  // Detected Nearby Traffic Sensors for Current Spot
  const nearbySensors = useMemo(() => {
    if (!currentSpot) return [];
    return findNearbyHotspotsForSpot(currentSpot, WEST_JAVA_TRAFFIC_HOTSPOTS, 6.0);
  }, [currentSpot]);

  const primarySensor = nearbySensors[0]?.hotspot || null;

  // Filtered spots for dropdown selector
  const filteredSpotsList = useMemo(() => {
    return spots.filter(spot => {
      const matchSearch = spotSearchQuery === '' || 
        spot.name.toLowerCase().includes(spotSearchQuery.toLowerCase()) ||
        spot.roadName.toLowerCase().includes(spotSearchQuery.toLowerCase()) ||
        spot.code.toLowerCase().includes(spotSearchQuery.toLowerCase());
      
      const matchRegency = selectedRegencyFilter === 'all' || spot.regency === selectedRegencyFilter;
      return matchSearch && matchRegency;
    });
  }, [spots, spotSearchQuery, selectedRegencyFilter]);

  const uniqueRegencies = useMemo(() => {
    const set = new Set<string>();
    spots.forEach(s => set.add(s.regency));
    return Array.from(set).sort();
  }, [spots]);

  // Execute Gemini AI Demographic Analysis via Server Endpoint
  const handleRunAnalysis = async (spotToAnalyze = currentSpot) => {
    if (!spotToAnalyze) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/demographic-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spotId: spotToAnalyze.id,
          spot: spotToAnalyze,
          hotspot: primarySensor,
          timeOfDay: timeOfDayContext,
          targetBrandIndustry: targetIndustry !== 'Semua Industri' ? targetIndustry : undefined
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);
      } else {
        throw new Error(json.error || 'Gagal memproses analisis demografi.');
      }
    } catch (err: any) {
      console.error('Demographic AI analysis error:', err);
      setErrorMessage(err.message || 'Terjadi gangguan saat memanggil Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically trigger analysis on mount or when currentSpot changes
  useEffect(() => {
    if (currentSpot) {
      handleRunAnalysis(currentSpot);
    }
  }, [currentSpot?.id, timeOfDayContext]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* 1. Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                GEMINI AI DEMOGRAPHIC INTELLIGENCE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800">
                Sensor Telemetri Lalu Lintas Terintegrasi
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Analisis Profil Demografi & Preferensi Minat Audiens
            </h1>
            
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Memproses data telemetri kepadatan lalu lintas real-time, kecepatan arus, dan durasi paparan (*dwell time*) untuk memprediksi <strong>distribusi usia</strong>, <strong>rasio gender</strong>, <strong>status sosial-ekonomi (SES)</strong>, serta <strong>afinitas minat konsumen</strong> di setiap titik reklame Jawa Barat.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleRunAnalysis()}
              disabled={isLoading}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Menganalisis Telemetri...' : 'Segarkan Analisis AI'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
              title="Cetak Laporan Demografi"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Spot Selection & Context Bar */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Pilih Titik Reklame Billboard / Videotron:</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedSpotId}
                onChange={(e) => setSelectedSpotId(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400"
              >
                {filteredSpotsList.map(spot => (
                  <option key={spot.id} value={spot.id}>
                    [{spot.code}] {spot.name} - {spot.regency} ({spot.type})
                  </option>
                ))}
              </select>

              <select
                value={selectedRegencyFilter}
                onChange={(e) => setSelectedRegencyFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="all">Semua Wilayah ({spots.length})</option>
                {uniqueRegencies.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Context Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Waktu Arus Mobilitas:</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setTimeOfDayContext('daily_aggregate')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  timeOfDayContext === 'daily_aggregate' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                24 Jam
              </button>
              <button
                onClick={() => setTimeOfDayContext('weekday_commute')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  timeOfDayContext === 'weekday_commute' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Jam Sibuk
              </button>
              <button
                onClick={() => setTimeOfDayContext('weekend_leisure')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  timeOfDayContext === 'weekend_leisure' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekend
              </button>
            </div>
          </div>

          {/* Target Industry Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Industri Pengiklan:</span>
            </label>
            <select
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-400"
            >
              <option value="Semua Industri">Semua Industri</option>
              <option value="F&B Modern & Kafe">F&B Modern & Kafe</option>
              <option value="Otomotif & Kendaraan EV">Otomotif & EV</option>
              <option value="Fintech & Perbankan Digital">Fintech & Bank Digital</option>
              <option value="Gadget, Elektronik & Komputer">Gadget & Smartphone</option>
              <option value="Fashion, Kosmetik & Ritel">Fashion & Beauty</option>
              <option value="Properti & Real Estate">Properti & Hunian</option>
            </select>
          </div>
        </div>

        {/* Selected Spot Details & Primary Sensor Association */}
        {currentSpot && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">TIPE MEDIA & DIMENSI:</span>
              <strong className="text-white text-xs block">{currentSpot.type}</strong>
              <span className="text-amber-400 text-[11px]">{currentSpot.dimensions.width}m x {currentSpot.dimensions.height}m ({currentSpot.dimensions.width * currentSpot.dimensions.height} m²)</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">KONTAK EFEKTIF (VAC):</span>
              <strong className="text-emerald-400 text-sm block">{currentSpot.vacDaily.toLocaleString('id-ID')} / hari</strong>
              <span className="text-slate-400 text-[11px]">Gross: {currentSpot.dailyGrossReach.toLocaleString('id-ID')}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">DWELL TIME DI PERSIMPANGAN:</span>
              <strong className="text-amber-400 text-sm block">{currentSpot.avgDwellTimeSec} detik</strong>
              <span className="text-slate-400 text-[11px]">Arus: {currentSpot.roadType}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">SENSOR TELEMETRI TERDEKAT:</span>
              <strong className="text-cyan-400 text-xs block truncate" title={primarySensor?.name || 'Sensor Virtual'}>
                {primarySensor?.name || 'Sensor Arteri Virtual'}
              </strong>
              <span className="text-slate-400 text-[11px]">
                {primarySensor ? `Jarak ${nearbySensors[0]?.distanceKm} km (${primarySensor.congestionLevel})` : 'Sensor Arteri Terpadu'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <BrainCircuit className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Gemini AI Sedang Memproses Telemetri Spasial...</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Mengekstrak korelasi sensor lalu lintas di {currentSpot.roadName}, mengestimasi profil usia, gender, dan pola perilaku audiens.
            </p>
          </div>
        </div>
      )}

      {/* 3. Analysis Results View */}
      {analysisResult && !isLoading && (
        <div className="space-y-6">
          {/* Executive AI Intelligence Banner */}
          <div className="p-6 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ringkasan Eksekutif Demografi Gemini AI ({analysisResult.executionModel})
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold">
                  Tingkat Keyakinan AI: {analysisResult.confidenceScorePct}%
                </span>
                <span className="text-slate-500">
                  {new Date(analysisResult.analyzedAt).toLocaleTimeString('id-ID')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {analysisResult.strategicInsights.executiveSummary}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">Industri Paling Relevan:</span>
              {analysisResult.strategicInsights.idealAdvertiserIndustries.map((ind, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-slate-950 text-amber-300 border border-slate-800 rounded-md text-[11px] font-medium">
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Core Metrics Grid: Age & Gender */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Age Distribution Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Prediksi Komposisi Usia Audiens</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Distribusi kelompok umur yang melintasi titik {currentSpot.name}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Didominasi 18-34 Thn
                </span>
              </div>

              {/* Bar Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult.ageDistribution} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="bracket" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val: any) => [`${val}%`, 'Persentase Audiens']}
                    />
                    <Bar dataKey="percentage" name="Porsi (%)" radius={[8, 8, 0, 0]}>
                      {analysisResult.ageDistribution.map((entry, index) => (
                        <Cell key={`age-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Age Bracket Legends */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                {analysisResult.ageDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-mono">{item.bracket} Thn:</strong>
                        <span className="font-mono font-bold text-cyan-400">{item.percentage}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block leading-tight">{item.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Split & Socio-Economic Status (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Gender Split Card */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-emerald-400" />
                    <span>Rasio Gender Pengendara & Penumpang</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {analysisResult.genderSplit.dominantGender === 'Male' ? 'Dominasi Pria' : 'Dominasi Wanita'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="p-4 bg-slate-950 border border-blue-500/30 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">PRIA (MALE)</span>
                    <div className="text-3xl font-black text-blue-400 font-mono">
                      {analysisResult.genderSplit.malePct}%
                    </div>
                    <span className="text-[10px] text-slate-500 block">Mayoritas pengendara roda dua & komuter pagi</span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-rose-500/30 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">WANITA (FEMALE)</span>
                    <div className="text-3xl font-black text-rose-400 font-mono">
                      {analysisResult.genderSplit.femalePct}%
                    </div>
                    <span className="text-[10px] text-slate-500 block">Meningkat saat akhir pekan & pusat retail</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Distribusi Moda Transportasi:</span>
                  <p className="text-slate-300 font-mono text-[11px]">{analysisResult.genderSplit.genderDriverRatio}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{analysisResult.genderSplit.rationale}</p>
                </div>
              </div>

              {/* Socio-Economic Status (SES) Card */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Tingkat Ekonomi (Socio-Economic Status)</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-400">SES A & B = 75%</span>
                </div>

                <div className="space-y-2.5">
                  {analysisResult.socioEconomicStatus.map((ses, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ses.color }} />
                          {ses.tier}
                        </span>
                        <span className="font-mono font-black text-sm" style={{ color: ses.color }}>
                          {ses.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Pengeluaran: {ses.monthlyExpenditure}</span>
                        <span className="truncate max-w-[160px] text-right">{ses.typicalTransport}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Interests & Personas Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Interests Affinity (6 Cols) */}
            <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Peringkat Afinitas Minat Audiens (*Audience Interests*)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kategori topik dan produk yang paling relevan bagi audiens di koridor ini
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">Skor Indeks 0-100</span>
              </div>

              <div className="space-y-3">
                {analysisResult.topInterests.map((interest, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center">
                          #{interest.ranking}
                        </span>
                        <strong className="text-white">{interest.category}</strong>
                      </div>
                      <span className="font-mono font-black text-amber-400">{interest.affinityIndex} / 100</span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                        style={{ width: `${interest.affinityIndex}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight">
                      {interest.relevanceExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Personas (6 Cols) */}
            <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span>Profil Persona Pengunjung Terpilih</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gambaran konkret karakter individu konsumen yang melintasi titik reklame
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">Archetypes</span>
              </div>

              <div className="space-y-4">
                {analysisResult.personas.map((persona, pIdx) => (
                  <div key={pIdx} className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold">
                          {pIdx === 0 ? <Laptop className="w-5 h-5 text-purple-400" /> : <Car className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">{persona.name}</h5>
                          <span className="text-[11px] text-purple-300 block">{persona.segmentTitle} ({persona.ageRange})</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                        Porsi {persona.percentageShare}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[9px]">PROFESI:</span>
                        <span className="text-slate-300">{persona.occupation}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">MOTIVASI UTAMA:</span>
                        <span className="text-slate-300">{persona.topMotivation}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      {persona.quote}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Ad Creative & Media Execution Playbook */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-white uppercase tracking-wider">
                Panduan Kreatif Iklan & Jam Tayang Optimal (Creative Directive)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Creative Recommendations */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  1. Rekomendasi Desain & Tata Letak:
                </span>
                <ul className="text-xs text-slate-300 space-y-2">
                  {analysisResult.strategicInsights.creativeVisualRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dayparting Schedule */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  2. Jadwal Jam Tayang Prime (Dayparting):
                </span>
                <ul className="text-xs text-slate-300 space-y-2">
                  {analysisResult.strategicInsights.optimalDaypartingWindows.map((window, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{window}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dwell Time Opportunity */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  3. Optimalisasi Durasi Paparan (Dwell Time):
                </span>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed">
                  <p>{analysisResult.strategicInsights.dwellTimeOpportunity}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
