import { useState, useMemo } from 'react';
import { BillboardSpot, PredictiveScenario } from '../types/ooh';
import { runPredictiveLocationAnalysis, WEST_JAVA_REGENCIES } from '../data/jabarData';
import { 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Car, 
  ShieldCheck, 
  ArrowUpRight, 
  Sliders, 
  BarChart3, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PredictiveAnalyticsProps {
  spots: BillboardSpot[];
  onOpenMapTab: (spot: BillboardSpot) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
}

export function PredictiveAnalytics({
  spots,
  onOpenMapTab,
  onOpenDetailModal
}: PredictiveAnalyticsProps) {
  // Scenario inputs
  const [targetIndustry, setTargetIndustry] = useState<string>('Otomotif & Transportasi');
  const [seasonality, setSeasonality] = useState<PredictiveScenario['seasonality']>('Mudik & Libur Lebaran');
  const [trafficGrowthRatePct, setTrafficGrowthRatePct] = useState<number>(6.5);
  const [timeHorizon, setTimeHorizon] = useState<PredictiveScenario['timeHorizon']>('Q1 2027');
  const [infrastructureImpact, setInfrastructureImpact] = useState<PredictiveScenario['infrastructureImpact']>('Aktivasi Tol Baru / LRT');
  const [selectedRegencyFilter, setSelectedRegencyFilter] = useState<string>('Semua');

  // Run predictive model
  const scenario: PredictiveScenario = useMemo(() => ({
    targetIndustry,
    seasonality,
    trafficGrowthRatePct,
    timeHorizon,
    infrastructureImpact
  }), [targetIndustry, seasonality, trafficGrowthRatePct, timeHorizon, infrastructureImpact]);

  const allPredictions = useMemo(() => {
    return runPredictiveLocationAnalysis(spots, scenario);
  }, [spots, scenario]);

  const filteredPredictions = useMemo(() => {
    if (selectedRegencyFilter === 'Semua') return allPredictions;
    return allPredictions.filter(p => p.spot.regency === selectedRegencyFilter);
  }, [allPredictions, selectedRegencyFilter]);

  // Summary forecast aggregates
  const avgGrowthDelta = Math.round(allPredictions.reduce((acc, p) => acc + p.growthDeltaPct, 0) / (allPredictions.length || 1));
  const topRecommendedSpot = allPredictions[0]?.spot;
  const avgConfidence = Math.round(allPredictions.reduce((acc, p) => acc + p.confidenceScore, 0) / (allPredictions.length || 1));

  // Historical vs Forecast comparison chart data (Monthly index)
  const forecastCurve = [
    { period: 'Historis Jan 2026', index: 94, type: 'hist' },
    { period: 'Historis Apr 2026 (Lebaran)', index: 138, type: 'hist' },
    { period: 'Historis Jul 2026', index: 110, type: 'hist' },
    { period: 'Historis Sep 2026', index: 104, type: 'hist' },
    { period: 'Prediksi Q4 2026', index: 118, type: 'pred' },
    { period: 'Prediksi Q1 2027', index: 142, type: 'pred' },
    { period: 'Prediksi Q2 2027', index: 125, type: 'pred' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Modul Analisis Prediktif & Proyeksi Tren</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Rekomendasi Penempatan Iklan Optimal di Masa Mendatang
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Memadukan data historis kinerja OOH, tren pertumbuhan volume lalu lintas per wilayah, profil demografis Jawa Barat, dan faktor musiman untuk memproyeksikan efektivitas penempatan titik reklame pada masa mendatang.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-right">
              <span className="text-[11px] text-slate-400 block">Tingkat Keyakinan Model</span>
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {avgConfidence}% Confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Input Configuration Grid */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Konfigurasi Skenario Simulasi Prediktif</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Parameter Dinamis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Target Industry */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Sektor Industri Klien</span>
            </label>
            <select
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Otomotif & Transportasi">Otomotif & Transportasi</option>
              <option value="FMCG & F&B">FMCG & Makanan/Minuman</option>
              <option value="Perbankan & Fintech">Perbankan & Fintech</option>
              <option value="E-Commerce & Digital Tech">E-Commerce & Digital Tech</option>
              <option value="Properti & Residensial">Properti & Kawasan Residensial</option>
            </select>
          </div>

          {/* Seasonality */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Faktor Musiman (Seasonality)</span>
            </label>
            <select
              value={seasonality}
              onChange={(e) => setSeasonality(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Reguler">Reguler / Non-Musiman</option>
              <option value="Mudik & Libur Lebaran">Mudik & Libur Lebaran</option>
              <option value="Liburan Sekolah / Akhir Tahun">Liburan Sekolah / Akhir Tahun</option>
              <option value="Festival Belanja Q4">Festival Belanja Q4 (Harbolnas)</option>
            </select>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Horizon Target Waktu</span>
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="Q4 2026">Kuartal 4 (Q4 2026)</option>
              <option value="Q1 2027">Kuartal 1 (Q1 2027)</option>
              <option value="Q2 2027">Kuartal 2 (Q2 2027)</option>
              <option value="Q3 2027">Kuartal 3 (Q3 2027)</option>
            </select>
          </div>

          {/* Infrastructure Factor */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-purple-400" />
              <span>Faktor Infrastruktur Jabar</span>
            </label>
            <select
              value={infrastructureImpact}
              onChange={(e) => setInfrastructureImpact(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option value="Biasa">Tren Pertumbuhan Normal</option>
              <option value="Aktivasi Tol Baru / LRT">Aktivasi Tol Baru / LRT / Kereta Cepat</option>
              <option value="Perluasan Pusat Niaga">Perluasan Pusat Niaga & Mall Baru</option>
            </select>
          </div>
        </div>

        {/* Traffic Growth Slider */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">
              Asumsi Laju Pertumbuhan Lalu Lintas Tahunan Jawa Barat:
            </span>
            <span className="font-mono font-bold text-amber-400">
              +{trafficGrowthRatePct}% per tahun
            </span>
          </div>
          <input
            type="range"
            min={2.0}
            max={14.0}
            step={0.5}
            value={trafficGrowthRatePct}
            onChange={(e) => setTrafficGrowthRatePct(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>+2.0% (Konservatif)</span>
            <span>+6.5% (Baseline BPS/Dishub Jabar)</span>
            <span>+14.0% (Ekspansi Agresif)</span>
          </div>
        </div>
      </div>

      {/* Aggregate Macro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Rata-rata Lonjakan Kontak (VAC)</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            +{avgGrowthDelta}%
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Dipicu tren musiman {seasonality}</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Rekomendasi Lokasi Teratas</span>
          <span className="text-sm font-bold text-white line-clamp-1 mt-1">
            {topRecommendedSpot ? topRecommendedSpot.name : 'Simpang Lima Asia Afrika'}
          </span>
          <span className="text-[11px] text-amber-400 font-mono block mt-1">
            Indeks Proyeksi: {allPredictions[0]?.predictedEffectiveness} / 100
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Potensi Multiplier ROI</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {allPredictions[0]?.projectedRoiScore}x
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">vs penempatan reguler</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Titik Berkinerja Prima</span>
          <span className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
            {allPredictions.filter(p => p.recommendedCategory === 'Top Priority Future Placement').length} Titik
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Rekomendasi booking prioritas</span>
        </div>
      </div>

      {/* Historical vs Forecast Comparison Chart */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Tren Historis & Kurva Proyeksi Efektivitas (Jawa Barat)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pola pergerakan indeks kontak audiens dari data historis menuju horizon {timeHorizon}.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-600"></span>
              <span>Historis 2026</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
              <span>Proyeksi Model</span>
            </span>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 px-2 pt-4">
          {forecastCurve.map((item, idx) => {
            const heightPct = Math.min(100, Math.max(20, (item.index / 160) * 100));
            const isPred = item.type === 'pred';

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="absolute -top-8 bg-slate-950 border border-slate-700 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                  Indeks: {item.index} ({isPred ? 'Prediksi' : 'Historis'})
                </div>

                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPred 
                      ? 'bg-gradient-to-t from-amber-500/80 to-amber-300 hover:from-amber-400 hover:to-amber-200' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                <span className="text-[10px] font-mono text-slate-400 mt-2 text-center line-clamp-1">
                  {item.period.replace('Historis ', '').replace('Prediksi ', '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Predictive Placement Ranked Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Daftar Rekomendasi Lokasi Berdasarkan Analisis Prediktif</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Diurutkan berdasarkan perkiraan skor efektivitas tertinggi untuk skenario {targetIndustry} ({timeHorizon}).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Wilayah:</span>
            <select
              value={selectedRegencyFilter}
              onChange={(e) => setSelectedRegencyFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="Semua">Semua Wilayah ({allPredictions.length})</option>
              {WEST_JAVA_REGENCIES.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredPredictions.map((pred, index) => {
            const { spot, predictedEffectiveness, currentEffectiveness, growthDeltaPct, projectedVac, strategicRationale, recommendedCategory, projectedRoiScore } = pred;

            return (
              <div
                key={spot.id}
                className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-800/40 px-3 rounded-xl transition-colors group"
              >
                {/* Spot Info */}
                <div className="flex items-start gap-3 max-w-xl">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 font-mono font-bold text-xs text-amber-400 border border-slate-800 shrink-0 mt-0.5">
                    #{index + 1}
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {spot.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">{spot.code}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        recommendedCategory === 'Top Priority Future Placement'
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                          : recommendedCategory === 'High Growth Transit'
                          ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {recommendedCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                      <span>{spot.regency}</span>
                      <span>·</span>
                      <span>{spot.roadName}</span>
                      <span>·</span>
                      <span className="text-slate-300">{spot.type}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 bg-slate-950/70 p-2 rounded border border-slate-800/70 leading-relaxed">
                      {strategicRationale}
                    </p>
                  </div>
                </div>

                {/* Performance Metrics Forecast */}
                <div className="flex items-center gap-6 text-xs self-end lg:self-center ml-10 lg:ml-0">
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Efektivitas Saat Ini → Prediksi</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="font-mono text-slate-400">{currentEffectiveness}</span>
                      <span className="text-slate-600">→</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {predictedEffectiveness} / 100
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Proyeksi VAC</span>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      {projectedVac.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-emerald-500 block font-mono">
                      +{growthDeltaPct}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">ROI Multiplier</span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums">
                      {projectedRoiScore}x
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenMapTab(spot)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800 rounded hover:bg-slate-800"
                      title="Lihat Titik di Peta"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenDetailModal(spot)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded hover:bg-slate-800"
                      title="Detail Lengkap"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
