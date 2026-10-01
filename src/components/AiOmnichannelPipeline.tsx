import { useState, useMemo } from 'react';
import { 
  PipelineSimulationInput, 
  AiAutomationPipelineResponse, 
  GeospatialSiteRecommendation,
  PipelineStageMetric 
} from '../types/aiPipeline';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  MapPin, 
  TrendingUp, 
  Building2, 
  Package, 
  Sliders, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Zap, 
  RefreshCw, 
  FileText, 
  Share2, 
  ShieldCheck, 
  Eye, 
  Users, 
  Radio, 
  Target,
  BarChart3,
  Boxes,
  Database
} from 'lucide-react';

interface AiOmnichannelPipelineProps {
  onOpenMapTab?: (spotCoordinates: { lat: number; lng: number }) => void;
}

export function AiOmnichannelPipeline({ onOpenMapTab }: AiOmnichannelPipelineProps) {
  // Input State
  const [brandName, setBrandName] = useState<string>('Kopi Kenangan Mantan - Jabar Expansion');
  const [retailIndustry, setRetailIndustry] = useState<PipelineSimulationInput['retailIndustry']>('F&B Modern & Kafe');
  const [budgetTier, setBudgetTier] = useState<PipelineSimulationInput['budgetTier']>('Metropolitan Bandung Only');
  
  // ATL inputs
  const [atlBillboards, setAtlBillboards] = useState<number>(8);
  const [atlMonthlyVac, setAtlMonthlyVac] = useState<number>(4850000);
  
  // BTL inputs
  const [btlEvents, setBtlEvents] = useState<number>(4);
  const [btlSamplingFootfall, setBtlSamplingFootfall] = useState<number>(38500);
  const [btlConversionPct, setBtlConversionPct] = useState<number>(18.5);

  // Digital inputs
  const [digitalImpressions, setDigitalImpressions] = useState<number>(2400000);
  const [digitalCtr, setDigitalCtr] = useState<number>(3.2);
  const [digitalKeyword, setDigitalKeyword] = useState<string>('kopi terdekat bandung');

  // Execution & Output State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pipelineResult, setPipelineResult] = useState<AiAutomationPipelineResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'site_recommendations' | 'inventory_allocation' | 'architecture_spec'>('site_recommendations');
  const [selectedCluster, setSelectedCluster] = useState<GeospatialSiteRecommendation | null>(null);

  // Initial load simulation
  const handleExecutePipeline = async () => {
    setIsRunning(true);
    const payload: PipelineSimulationInput = {
      brandName,
      retailIndustry,
      budgetTier,
      atl: {
        totalBillboards: atlBillboards,
        monthlyVac: atlMonthlyVac,
        monthlyOts: atlMonthlyVac * 1.25,
        primaryCorridors: ['Jalur Komuter (Pasteur, Pasupati)', 'Jalur Komersial (Dago, Riau)'],
        broadcastGrpEstimate: 42
      },
      btl: {
        roadshowEventsCount: btlEvents,
        directSamplingFootfall: btlSamplingFootfall,
        boothConversionRatePct: btlConversionPct,
        activePopUpLocations: ['Gasibu Monju', '23 Paskal Atrium', 'Cihampelas Walk', 'Buah Batu Square']
      },
      digital: {
        geotargetedImpressions: digitalImpressions,
        clickThroughRatePct: digitalCtr,
        topTargetedDistricts: [
          { name: 'Coblong (Dago)', deviceDensity: 94, intentScore: 92 },
          { name: 'Andir (Pasirkaliki)', deviceDensity: 91, intentScore: 95 },
          { name: 'Bandung Kidul (Buah Batu)', deviceDensity: 88, intentScore: 89 }
        ],
        searchIntentKeyword: digitalKeyword
      }
    };

    try {
      const res = await fetch('/api/ai/omnichannel-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.result) {
        setPipelineResult(data.result);
        setSelectedCluster(data.result.spatialRecommendations[0] || null);
      }
    } catch (err) {
      console.error('Pipeline execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Run on mount if no result
  useState(() => {
    handleExecutePipeline();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
              <Cpu className="w-4 h-4" />
              <span>AI Work Automation & Omnichannel Data Pipeline Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sintesis Pipa Data Kampanye Terintegrasi (ATL · BTL · Digital)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Mengonversi aliran data eksposur media massal (reklame OOH), aktivasi lapangan (BTL), dan sinyal geofencing digital menjadi <strong>wawasan geospasial kuantitatif</strong> untuk pemilihan lokasi gerai ritel, ekspansi pasar, dan alokasi stok inventaris.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExecutePipeline}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-60"
            >
              <Zap className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Memproses Pipa Data...' : 'Jalankan Otomasi AI Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Omnichannel Channel Tiers Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 font-bold">
              ATL
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Above-The-Line</span>
              <span className="text-slate-200 font-semibold">{atlBillboards} Billboard · {(atlMonthlyVac / 1000000).toFixed(1)}M VAC</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
              BTL
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Below-The-Line</span>
              <span className="text-slate-200 font-semibold">{btlEvents} Event Lapangan · {(btlSamplingFootfall / 1000).toFixed(1)}k Sampling</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 font-bold">
              DIG
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Geotargeted Digital</span>
              <span className="text-slate-200 font-semibold">{(digitalImpressions / 1000000).toFixed(1)}M Impresi · CTR {digitalCtr}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Input Simulation Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Parameter Pipa Data Kampanye & Profil Sektor Ritel
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Gemini 3.8 Flash Agent Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Nama Merk & Kampanye:</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Sektor Industri Ritel:</label>
            <select
              value={retailIndustry}
              onChange={(e) => setRetailIndustry(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-medium"
            >
              <option value="F&B Modern & Kafe">☕ F&B Modern, Kafe & Resto Cepat Saji</option>
              <option value="Otomotif & EV Dealership">🚗 Otomotif, EV Dealer & Charging Hub</option>
              <option value="Fashion & Lifestyle Retail">👕 Fashion, Athleisure & Lifestyle Store</option>
              <option value="Minimarket & Grocery">🛒 Minimarket Modern & Supermarket</option>
              <option value="Elektronik & Gadget">📱 Gadget, Smartphone & Elektronik</option>
              <option value="Farmasi & Klinik Kesehatan">💊 Apotek, Klinik & Wellness Care</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Skala Wilayah Ekspansi:</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-medium"
            >
              <option value="Metropolitan Bandung Only">🏛️ Metropolitan Bandung Raya (Kota Bandung, Cimahi)</option>
              <option value="Regional Jabar Scale">⚡ Regional Jawa Barat (Bandung, Bodebek, Karawang)</option>
              <option value="Mega Multi-City Corridor">🌐 Koridor Lintas Pantura & Jalur Tol Cipularang</option>
            </select>
          </div>
        </div>

        {/* Detailed sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Titik Reklame ATL:</span>
              <span className="font-mono text-amber-400 font-bold">{atlBillboards} Titik ({(atlMonthlyVac / 1000000).toFixed(1)}M VAC)</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              value={atlBillboards}
              onChange={(e) => {
                const count = parseInt(e.target.value);
                setAtlBillboards(count);
                setAtlMonthlyVac(count * 600000);
              }}
              className="w-full h-1 bg-slate-800 rounded accent-amber-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Aktivasi Lapangan BTL:</span>
              <span className="font-mono text-emerald-400 font-bold">{btlEvents} Event ({(btlSamplingFootfall / 1000).toFixed(0)}k audiens)</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={btlEvents}
              onChange={(e) => {
                const count = parseInt(e.target.value);
                setBtlEvents(count);
                setBtlSamplingFootfall(count * 9500);
              }}
              className="w-full h-1 bg-slate-800 rounded accent-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Digital Geotargeting:</span>
              <span className="font-mono text-cyan-400 font-bold">{(digitalImpressions / 1000000).toFixed(1)}M Impresi (CTR {digitalCtr}%)</span>
            </div>
            <input
              type="range"
              min="500000"
              max="10000000"
              step="500000"
              value={digitalImpressions}
              onChange={(e) => setDigitalImpressions(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('site_recommendations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'site_recommendations'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Rekomendasi Titik Ritel & Ekspansi ({pipelineResult?.spatialRecommendations.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory_allocation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory_allocation'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Alokasi Inventaris & Prediksi Permintaan SKU</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'visualizer'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Visualisasi Arsitektur Pipa Data (Stages)</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture_spec')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture_spec'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Spesifikasi Arsitektur Sistem</span>
          </button>
        </div>

        {pipelineResult && (
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            ID Eksekusi: <strong className="text-cyan-300">{pipelineResult.pipelineExecutionId}</strong>
          </span>
        )}
      </div>

      {/* TAB 1: SITE RECOMMENDATIONS FOR SITE PLANNERS */}
      {activeTab === 'site_recommendations' && pipelineResult && (
        <div className="space-y-6">
          {/* Executive AI Summary Box */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Sintesis Eksekutif AI Work Automation ({pipelineResult.aiEngineModel})</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {pipelineResult.executiveSummary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-800 font-mono text-center text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl">
                <span className="text-[10px] text-slate-500 block">KONTRIBUSI ATL</span>
                <span className="text-base font-bold text-amber-400">
                  {pipelineResult.crossChannelAttribution.atlBillboardContributionPct}%
                </span>
                <span className="text-[9px] text-slate-600 block">Brand Resonance</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl">
                <span className="text-[10px] text-slate-500 block">KONTRIBUSI BTL</span>
                <span className="text-base font-bold text-emerald-400">
                  {pipelineResult.crossChannelAttribution.btlFieldActivationContributionPct}%
                </span>
                <span className="text-[9px] text-slate-600 block">Direct Engagement</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl">
                <span className="text-[10px] text-slate-500 block">DIGITAL GEOTARGET</span>
                <span className="text-base font-bold text-cyan-400">
                  {pipelineResult.crossChannelAttribution.digitalGeotargetedContributionPct}%
                </span>
                <span className="text-[9px] text-slate-600 block">Search & Retargeting</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl">
                <span className="text-[10px] text-slate-500 block">SINERGI CROSS-CHANNEL</span>
                <span className="text-base font-bold text-purple-300">
                  +{pipelineResult.crossChannelAttribution.crossChannelSynergyLiftPct}%
                </span>
                <span className="text-[9px] text-purple-400/80 block">Multiplier Footfall</span>
              </div>
            </div>
          </div>

          {/* Site Planner Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pipelineResult.spatialRecommendations.map((cluster) => {
              const isSelected = selectedCluster?.clusterId === cluster.clusterId;

              return (
                <div
                  key={cluster.clusterId}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-400/10 ring-1 ring-cyan-400/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {cluster.clusterId} · {cluster.regency}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                        Skor Peluang: {cluster.omnichannelOpportunityScore}/100
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base leading-snug">{cluster.clusterName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {cluster.siteCategoryAction}
                        </span>
                        <span className="text-[11px] text-slate-400">{cluster.retailSaturationLevel}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                      {cluster.geospatialRationale}
                    </p>

                    {/* Breakdown Scores */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950 rounded-xl text-center font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block">ATL SCORE</span>
                        <span className="text-amber-400 font-bold">{cluster.atlExposureScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">BTL ENGAGEMENT</span>
                        <span className="text-emerald-400 font-bold">{cluster.btlActivationScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">DIGITAL INTENT</span>
                        <span className="text-cyan-400 font-bold">{cluster.digitalIntentScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Footfall & Revenue Lift Projection */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Proyeksi Footfall:</span>
                      <strong className="text-emerald-400 text-sm">
                        {cluster.projectedMonthlyFootfall.toLocaleString('id-ID')} /bln
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Revenue Lift:</span>
                      <strong className="text-cyan-300 text-sm">
                        +{cluster.projectedRevenueLiftPct}%
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Directives for Site Planners */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Instruksi Strategis Site Planner & Akuisisi Titik Fisik (Actionable Directives)</span>
            </h4>
            <div className="space-y-2 text-xs">
              {pipelineResult.sitePlannerDirectives.map((directive, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-200 leading-relaxed">{directive}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY ALLOCATION & SKU DEMAND */}
      {activeTab === 'inventory_allocation' && pipelineResult && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <span>Matriks Alokasi Stok Inventaris Ritel Berdasarkan Momentum Kampanye</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribusi persediaan barang ke gudang dan gerai wilayah untuk mencegah <em>stockout</em> akibat lonjakan audiens pasca-kampanye terpadu.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Optimasi Ketersediaan Produk
              </span>
            </div>

            {/* Kluster Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-bold shrink-0">Pilih Kluster Wilayah:</span>
              {pipelineResult.spatialRecommendations.map((c) => (
                <button
                  key={c.clusterId}
                  onClick={() => setSelectedCluster(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold shrink-0 transition-colors border ${
                    selectedCluster?.clusterId === c.clusterId
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {c.clusterName}
                </button>
              ))}
            </div>

            {/* Inventory Table */}
            {selectedCluster && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Target Kluster:</span>
                    <strong className="text-white ml-1.5">{selectedCluster.clusterName}</strong>
                  </div>
                  <div className="font-mono">
                    <span className="text-slate-400">Proyeksi Footfall:</span>
                    <strong className="text-emerald-400 ml-1.5">{selectedCluster.projectedMonthlyFootfall.toLocaleString('id-ID')} pengunjung</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Kategori SKU Inventaris</th>
                        <th className="p-3 text-right">Rasio Alokasi Stok</th>
                        <th className="p-3">Urgensi Replenishment</th>
                        <th className="p-3">Justifikasi Permintaan Terintegrasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {selectedCluster.recommendedInventory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                          <td className="p-3 font-bold text-white">{item.skuCategory}</td>
                          <td className="p-3 text-right font-mono font-bold text-cyan-300 text-sm">
                            {item.targetStockRatioPct}%
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.replenishmentUrgency.includes('Segera')
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {item.replenishmentUrgency}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 max-w-md">{item.rationale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE STAGES VISUALIZER */}
      {activeTab === 'visualizer' && pipelineResult && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Tahapan Pemrosesan Pipa Data Geospasial Kuantitatif</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Alur data otomatis dari sensor telemetri fisik reklame, event lapangan, dan digital analytics menuju output keputusan site planning.
              </p>
            </div>

            <div className="space-y-3">
              {pipelineResult.pipelineStages.map((stage) => (
                <div
                  key={stage.stageId}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {stage.stepNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white text-sm">{stage.title}</h5>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {stage.component}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                      <div className="text-[11px] font-mono text-emerald-400 mt-1">
                        Output: {stage.dataOutputSample}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">THROUGHPUT</span>
                      <span className="text-white font-bold">{stage.recordsProcessed.toLocaleString('id-ID')} rec</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">LATENCY</span>
                      <span className="text-cyan-400 font-bold">{stage.latencyMs} ms</span>
                    </div>
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ✓ Selesai
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE SPECIFICATION */}
      {activeTab === 'architecture_spec' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-xs text-slate-300 leading-relaxed font-sans shadow-xl">
          <div className="pb-4 border-b border-slate-800">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Arsitektur Sistem Otomasi AI Pemasaran Terintegrasi & Site Planning</span>
            </h4>
            <p className="text-slate-400 mt-0.5">
              Dokumentasi teknis spesifikasi komponen data pipeline, orkestrasi AI, dan model geospasial kuantitatif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                <span>1. Lapisan Pipa Data Ingesti (Omnichannel Data Harvester)</span>
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong>ATL Connector</strong>: Ingesti metrik OTS, VAC, dwell time, dan sudut pandang dari 32 titik reklame billboard & videotron Jawa Barat.</li>
                <li><strong>BTL Connector</strong>: Ingesti log pengunjung booth lapangan, rasio sampling, dan kuesioner minat beli berbasis titik GPS.</li>
                <li><strong>Digital Geofencing</strong>: Ingesti data agregasi impresi Meta/Google Ads per kecamatan, CTR, dan volume kueri pencarian lokal.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                <span>2. Lapisan Normalisasi Spasial (H3 & PostGIS Engine)</span>
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong>Grid Spasial H3 Resolusi 8</strong>: Membagi wilayah urban menjadi sel heksagonal berdiameter ~460m untuk eliminasi bias batas administratif.</li>
                <li><strong>Gravity Decay Model</strong>: Menghitung daya tarik Point of Interest (Mall, Exit Tol, Kampus) dengan peluruhan jarak kuadratik.</li>
                <li><strong>Spatial Cross-Join</strong>: Memetakan korelasi antara posisi billboard, titik aktivasi BTL, dan density sinyal digital smartphone.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                <span>3. Lapisan Otomasi AI (Gemini 3.8 Flash Agent)</span>
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong>Attribution Weighting</strong>: Model Markov Chain multi-touch mengidentifikasi kontribusi OOH dalam menggerakkan pencarian digital dan kunjungan fisik.</li>
                <li><strong>Under-Served Gap Detector</strong>: Mengidentifikasi zona dengan eksposur audiens tinggi namun rasio gerai fisik rendah (ekspansi emas).</li>
                <li><strong>Directives Generation</strong>: Menghasilkan arahan tertulis spesifik untuk tim site selection dan manajer rantai pasok.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                <span>4. Lapisan Keputusan Site Planner & Supply Chain</span>
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong>Prioritisasi Titik Ritel</strong>: Klasifikasi gerai Flagship vs Express Store berdasarkan profil SES dan kecepatan arus jalan.</li>
                <li><strong>Alokasi Rasio Stok SKU</strong>: Penentuan persentase persediaan barang fast-moving dan buffer stock untuk antisipasi lonjakan permintaan.</li>
                <li><strong>Sinkronisasi OOH</strong>: Penambahan atau relokasi titik reklame di koridor yang paling produktif menghasilkan footfall.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
