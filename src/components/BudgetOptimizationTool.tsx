import { useState, useMemo } from 'react';
import { BillboardSpot } from '../types/ooh';
import { 
  TargetAudienceProfile, 
  TargetAudienceAge, 
  TargetAudienceInterest, 
  TargetAudienceSes, 
  CampaignPrimaryObjective, 
  optimizeBudgetHeuristic, 
  BudgetOptimizationResult 
} from '../utils/budgetOptimizationHeuristics';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Calculator, 
  Sparkles, 
  DollarSign, 
  Users, 
  Target, 
  Maximize2, 
  Smartphone, 
  Store, 
  TrendingUp, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Layers, 
  Award, 
  Check, 
  Zap, 
  Eye, 
  HelpCircle 
} from 'lucide-react';

interface BudgetOptimizationToolProps {
  spots: BillboardSpot[];
  initialBudgetMillions?: number;
  onApplyAllocationToPlanner?: (result: BudgetOptimizationResult) => void;
  onSelectSpot?: (spot: BillboardSpot) => void;
}

const AUDIENCE_PRESETS = [
  {
    name: 'Gen-Z & Milenial Urban Tech',
    badge: 'Tech & Lifestyle',
    profile: {
      name: 'Gen-Z & Milenial Urban Tech',
      ageSegment: 'millennial_25_34' as TargetAudienceAge,
      primaryInterest: 'tech_gadget' as TargetAudienceInterest,
      sesTier: 'ses_b' as TargetAudienceSes,
      geoFocus: 'bandung_urban' as const,
      campaignObjective: 'balanced_omnichannel' as CampaignPrimaryObjective
    }
  },
  {
    name: 'Keluarga Mapan Wisata & Belanja',
    badge: 'Family & Tourism',
    profile: {
      name: 'Keluarga Mapan Wisata & Belanja',
      ageSegment: 'family_35_44' as TargetAudienceAge,
      primaryInterest: 'culinary_coffee' as TargetAudienceInterest,
      sesTier: 'ses_a' as TargetAudienceSes,
      geoFocus: 'bandung_urban' as const,
      campaignObjective: 'experiential_footfall' as CampaignPrimaryObjective
    }
  },
  {
    name: 'Eksekutif Komuter Tol Antar-Kota',
    badge: 'Commuter & B2B',
    profile: {
      name: 'Eksekutif Komuter Tol Antar-Kota',
      ageSegment: 'family_35_44' as TargetAudienceAge,
      primaryInterest: 'automotive_ev' as TargetAudienceInterest,
      sesTier: 'ses_a' as TargetAudienceSes,
      geoFocus: 'corridor_highways' as const,
      campaignObjective: 'awareness_dominance' as CampaignPrimaryObjective
    }
  },
  {
    name: 'Young Professional High-Conversion',
    badge: 'Direct Response',
    profile: {
      name: 'Young Professional High-Conversion',
      ageSegment: 'millennial_25_34' as TargetAudienceAge,
      primaryInterest: 'banking_finance' as TargetAudienceInterest,
      sesTier: 'ses_ab_mixed' as TargetAudienceSes,
      geoFocus: 'bandung_urban' as const,
      campaignObjective: 'direct_conversion_leads' as CampaignPrimaryObjective
    }
  }
];

export function BudgetOptimizationTool({
  spots,
  initialBudgetMillions = 350,
  onApplyAllocationToPlanner,
  onSelectSpot
}: BudgetOptimizationToolProps) {
  // 1. Budget State
  const [budgetMillions, setBudgetMillions] = useState<number>(initialBudgetMillions);

  // 2. Target Audience Profile State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [profile, setProfile] = useState<TargetAudienceProfile>(AUDIENCE_PRESETS[0].profile);

  // 3. Feedback toast
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Run Heuristic Optimization Algorithm whenever inputs change
  const optimizationResult: BudgetOptimizationResult = useMemo(() => {
    const totalIdr = budgetMillions * 1000000;
    return optimizeBudgetHeuristic(totalIdr, profile, spots);
  }, [budgetMillions, profile, spots]);

  // Donut chart data for Budget Share
  const pieChartData = useMemo(() => {
    const { ooh, digital, btl } = optimizationResult.allocations;
    return [
      { name: 'OOH (Outdoor Advertising)', value: ooh.allocatedBudget, pct: ooh.allocatedPct, color: '#3b82f6' },
      { name: 'Digital (Geofenced & Social)', value: digital.allocatedBudget, pct: digital.allocatedPct, color: '#a855f7' },
      { name: 'BTL (Experiential & Booth)', value: btl.allocatedBudget, pct: btl.allocatedPct, color: '#10b981' }
    ];
  }, [optimizationResult]);

  // Bar chart data for Gross Reach and Conversions
  const barChartData = useMemo(() => {
    const { ooh, digital, btl } = optimizationResult.allocations;
    return [
      {
        channel: 'OOH Advertising',
        reachJuta: parseFloat((ooh.estimatedGrossReach / 1000000).toFixed(2)),
        conversionsRibu: parseFloat((ooh.estimatedConversions / 1000).toFixed(1)),
        cpmRibu: Math.round(ooh.blendedCpmIdr / 1000),
        color: '#3b82f6'
      },
      {
        channel: 'Digital Geofencing',
        reachJuta: parseFloat((digital.estimatedGrossReach / 1000000).toFixed(2)),
        conversionsRibu: parseFloat((digital.estimatedConversions / 1000).toFixed(1)),
        cpmRibu: Math.round(digital.blendedCpmIdr / 1000),
        color: '#a855f7'
      },
      {
        channel: 'BTL Experiential',
        reachJuta: parseFloat((btl.estimatedGrossReach / 1000000).toFixed(2)),
        conversionsRibu: parseFloat((btl.estimatedConversions / 1000).toFixed(1)),
        cpmRibu: Math.round(btl.blendedCpmIdr / 1000),
        color: '#10b981'
      }
    ];
  }, [optimizationResult]);

  const handleApplyPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setProfile(AUDIENCE_PRESETS[index].profile);
    setIsApplied(false);
  };

  const handleApplyToPlan = () => {
    setIsApplied(true);
    if (onApplyAllocationToPlanner) {
      onApplyAllocationToPlanner(optimizationResult);
    }
    setTimeout(() => setIsApplied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Tool Purpose */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                BUDGET OPTIMIZATION ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800">
                Algoritma Heuristik Efisiensi Biaya
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Optimasi Alokasi Anggaran Belanja Media (OOH · Digital · BTL)
            </h3>

            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Memasukkan profil target audiens dan total plafon anggaran untuk menghitung secara otomatis distribusi belanja media yang menghasilkan rasio biaya-terhadap-jangkauan (*Cost Efficiency*) paling optimal tanpa kebocoran corong konversi.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div className="bg-slate-950 p-2 border border-slate-800 rounded-2xl shrink-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block px-1.5 mb-1.5">
              Pilihan Preset Audiens Cepat:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {AUDIENCE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(idx)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all text-left truncate ${
                    selectedPresetIndex === idx
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={preset.name}
                >
                  {preset.badge}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Input Panel: Target Audience & Total Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audience Profile Configurations (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Konfigurasi Profil Target Audiens</span>
            </h4>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              {profile.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Age Segment */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-mono font-semibold block">Kelompok Usia:</label>
              <select
                value={profile.ageSegment}
                onChange={(e) => setProfile(prev => ({ ...prev, ageSegment: e.target.value as TargetAudienceAge }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="gen_z_18_24">Gen Z (18 - 24 Tahun / Mahasiswa)</option>
                <option value="millennial_25_34">Milenial Muda (25 - 34 Tahun / Profesional)</option>
                <option value="family_35_44">Keluarga Mapan (35 - 44 Tahun / Head of House)</option>
                <option value="senior_45_plus">Eksekutif Senior (45+ Tahun / Decision Maker)</option>
                <option value="broad_all">Semua Kelompok Usia (Broad Audience)</option>
              </select>
            </div>

            {/* Primary Interest */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-mono font-semibold block">Afinitas Minat Utama:</label>
              <select
                value={profile.primaryInterest}
                onChange={(e) => setProfile(prev => ({ ...prev, primaryInterest: e.target.value as TargetAudienceInterest }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="tech_gadget">Teknologi & Gadget Terbaru</option>
                <option value="culinary_coffee">Kuliner, Kafe & F&B Modern</option>
                <option value="automotive_ev">Otomotif & Kendaraan Listrik (EV)</option>
                <option value="fashion_retail">Fashion, Kecantikan & Retail</option>
                <option value="banking_finance">Perbankan, Fintech & Investasi</option>
                <option value="travel_leisure">Pariwisata Akhir Pekan & Rekreasi</option>
                <option value="general">Kebutuhan Umum Ritel Konsumsi</option>
              </select>
            </div>

            {/* SES Tier */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-mono font-semibold block">Status Sosial Ekonomi (SES):</label>
              <select
                value={profile.sesTier}
                onChange={(e) => setProfile(prev => ({ ...prev, sesTier: e.target.value as TargetAudienceSes }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="ses_a">SES A (Upper Class &gt; Rp 10 Juta/bln)</option>
                <option value="ses_b">SES B (Middle-Upper Rp 5 - 10 Juta/bln)</option>
                <option value="ses_c">SES C (Middle Class Rp 2.5 - 5 Juta/bln)</option>
                <option value="ses_ab_mixed">SES A & B Terpadu (Kombinasi Produktif)</option>
              </select>
            </div>

            {/* Campaign Primary Objective */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-mono font-semibold block">Sasaran Utama Kampanye:</label>
              <select
                value={profile.campaignObjective}
                onChange={(e) => setProfile(prev => ({ ...prev, campaignObjective: e.target.value as CampaignPrimaryObjective }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="awareness_dominance">Dominasi Kesadaran Merek (Max Reach)</option>
                <option value="balanced_omnichannel">Sinergi Seimbang (Full-Funnel Flywheel)</option>
                <option value="direct_conversion_leads">Performa Konversi Langsung (ROI / CPL)</option>
                <option value="experiential_footfall">Aktivasi Uji Coba Fisik (Experiential Footfall)</option>
              </select>
            </div>
          </div>

          {/* Geo Focus Radio Selector */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
            <span className="text-slate-400 font-mono font-semibold block">Fokus Geografis Wilayah:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, geoFocus: 'bandung_urban' }))}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  profile.geoFocus === 'bandung_urban'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Pusat Kota Bandung
              </button>
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, geoFocus: 'jabar_wide' }))}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  profile.geoFocus === 'jabar_wide'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Jawa Barat Regional
              </button>
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, geoFocus: 'corridor_highways' }))}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  profile.geoFocus === 'corridor_highways'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Koridor Jalan Tol
              </button>
            </div>
          </div>
        </div>

        {/* Budget Controller & Efficiency Score (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Total Plafon Anggaran Belanja Media</span>
              </h4>
              <span className="font-mono font-black text-lg text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                Rp {budgetMillions.toLocaleString('id-ID')} Juta
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={budgetMillions}
                onChange={(e) => setBudgetMillions(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Rp 50 Jt</span>
                <span>Rp 500 Jt</span>
                <span>Rp 1.5 M</span>
                <span>Rp 2.5 M</span>
              </div>
            </div>

            {/* Quick Budget Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[150, 350, 650, 1200].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudgetMillions(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    budgetMillions === val
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Rp {val} Jt
                </button>
              ))}
            </div>

            {/* Efficiency KPI Badge */}
            <div className="p-4 bg-slate-950 border border-amber-400/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Skor Efisiensi Heuristik:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{Math.round((optimizationResult.synergyMultiplier - 1) * 100)}% Halo Effect
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {optimizationResult.overallEfficiencyScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100 Indeks Efisiensi</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Biaya rata-rata terdistribusi: <strong>Rp {optimizationResult.blendedOverallCpm.toLocaleString('id-ID')} / 1.000 kontak</strong>.
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={handleApplyToPlan}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
              isApplied
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-amber-400/20'
            }`}
          >
            {isApplied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Alokasi Berhasil Diterapkan ke Perencana!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Terapkan Rekomendasi Alokasi ke Rencana Kampanye</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Heuristic Rationale Narrative */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-mono text-[11px] uppercase tracking-wider mb-0.5">
            Analisis Rationale Algoritma Heuristik:
          </strong>
          <p>{optimizationResult.heuristicRationale}</p>
        </div>
      </div>

      {/* 4. Visual Media Share Breakdown (Donut & Bar Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Budget Allocation Share (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Pangsa Alokasi Anggaran Belanja Media (OOH · Digital · BTL)
            </h4>
            <span className="text-xs font-mono font-bold text-amber-400">
              100% Teroptimasi
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any, name: any, item: any) => [
                    `Rp ${Math.round(Number(val) / 1000000).toLocaleString('id-ID')} Juta (${item.payload.pct}%)`,
                    item.payload.name.split(' (')[0]
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(val: any) => <span className="text-xs text-slate-300 font-medium">{val.split(' (')[0]}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Gross Reach & Conversions (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Estimasi Kontak Tayang (Gross Reach) per Saluran Media
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total estimasi jangkauan: {(optimizationResult.totalGrossReach / 1000000).toFixed(2)} Juta impresi
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {(optimizationResult.totalEstimatedConversions).toLocaleString('id-ID')} Total Konversi
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 15, right: 25, left: -5, bottom: 5 }}>
                <XAxis dataKey="channel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="M" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} Juta Tayangan`, 'Estimasi Gross Reach']}
                />
                <Bar dataKey="reachJuta" name="Gross Reach (Juta)" radius={[8, 8, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Channel Breakdown Cards: OOH, Digital, BTL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* OOH Card */}
        <div className="p-6 bg-slate-900 border border-blue-500/40 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
              <span>OOH (OUTDOOR MEDIA)</span>
            </span>
            <span className="font-mono text-lg font-black text-blue-400">
              {optimizationResult.allocations.ooh.allocatedPct}%
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-white font-mono">
              Rp {Math.round(optimizationResult.allocations.ooh.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Jangkar reputasi visual 24/7 di koridor komuter strategis.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Gross Impressions:</span>
              <strong className="text-amber-400">{(optimizationResult.allocations.ooh.estimatedGrossReach / 1000000).toFixed(2)} Juta</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Unique Audience:</span>
              <strong className="text-cyan-400">{(optimizationResult.allocations.ooh.estimatedUniqueReach / 1000000).toFixed(2)} Juta</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blended CPM:</span>
              <strong className="text-slate-300">Rp {optimizationResult.allocations.ooh.blendedCpmIdr.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Langkah Eksekusi Taktis:</span>
            <ul className="text-xs text-slate-300 space-y-1">
              {optimizationResult.allocations.ooh.tacticalActionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Digital Card */}
        <div className="p-6 bg-slate-900 border border-purple-500/40 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>DIGITAL GEOFENCING</span>
            </span>
            <span className="font-mono text-lg font-black text-purple-400">
              {optimizationResult.allocations.digital.allocatedPct}%
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-white font-mono">
              Rp {Math.round(optimizationResult.allocations.digital.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Retargeting presisi radius 800m di sekitar titik reklame.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Digital Impressions:</span>
              <strong className="text-amber-400">{(optimizationResult.allocations.digital.estimatedGrossReach / 1000000).toFixed(2)} Juta</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Est. Leads Konversi:</span>
              <strong className="text-purple-400">{optimizationResult.allocations.digital.estimatedConversions.toLocaleString('id-ID')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Biaya per Akuisisi (CPA):</span>
              <strong className="text-slate-300">Rp {optimizationResult.allocations.digital.cpaEstimateIdr.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Langkah Eksekusi Taktis:</span>
            <ul className="text-xs text-slate-300 space-y-1">
              {optimizationResult.allocations.digital.tacticalActionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BTL Card */}
        <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>BTL (EXPERIENTIAL BOOTH)</span>
            </span>
            <span className="font-mono text-lg font-black text-emerald-400">
              {optimizationResult.allocations.btl.allocatedPct}%
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-white font-mono">
              Rp {Math.round(optimizationResult.allocations.btl.allocatedBudget / 1000000).toLocaleString('id-ID')} Juta
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interaksi tatap muka langsung, uji coba sampel, dan sampling.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Direct Footfall:</span>
              <strong className="text-amber-400">{(optimizationResult.allocations.btl.estimatedUniqueReach / 1000).toFixed(0)} Ribu orang</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">On-the-spot Trial:</span>
              <strong className="text-emerald-400">{optimizationResult.allocations.btl.estimatedConversions.toLocaleString('id-ID')} Sampel</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cost per Trial:</span>
              <strong className="text-slate-300">Rp {optimizationResult.allocations.btl.cpaEstimateIdr.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Langkah Eksekusi Taktis:</span>
            <ul className="text-xs text-slate-300 space-y-1">
              {optimizationResult.allocations.btl.tacticalActionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 6. Matching Billboard Spots from Database */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Titik Reklame Billboard Terpilih yang Paling Sesuai Profil Audiens</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Direkomendasikan dari basis data titik OOH aktif berdasarkan skor efektivitas dan koridor target
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {optimizationResult.suggestedMatchingSpots.length} Titik Rekomendasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {optimizationResult.suggestedMatchingSpots.map(spot => (
            <div
              key={spot.id}
              onClick={() => onSelectSpot && onSelectSpot(spot)}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-2xl cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-amber-400 font-bold">[{spot.code}]</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  {spot.type}
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {spot.name}
                </h5>
                <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                  {spot.roadName}, {spot.regency}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">VAC: {spot.vacDaily.toLocaleString('id-ID')}</span>
                <span className="text-emerald-400 font-bold">Skor {spot.effectivenessScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
