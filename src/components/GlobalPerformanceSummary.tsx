import { useState } from 'react';
import { 
  Eye, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Banknote,
  Activity,
  Layers,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';
import { BillboardSpot } from '../types/ooh';

interface GlobalPerformanceSummaryProps {
  spots: BillboardSpot[];
  lastSyncTime?: Date;
  onOpenAvailableSpots?: () => void;
  onNavigateToAnalytics?: () => void;
}

export function GlobalPerformanceSummary({
  spots,
  lastSyncTime,
  onOpenAvailableSpots,
  onNavigateToAnalytics
}: GlobalPerformanceSummaryProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 1. Total Impressions Metrics
  const totalDailyGrossReach = spots.reduce((acc, s) => acc + (s.dailyGrossReach || 0), 0);
  const totalDailyVac = spots.reduce((acc, s) => acc + (s.vacDaily || 0), 0);
  const totalMonthlyGrossReach = totalDailyGrossReach * 30;
  const vacRatePct = totalDailyGrossReach > 0 
    ? ((totalDailyVac / totalDailyGrossReach) * 100).toFixed(1) 
    : '0';

  // 2. Revenue Forecast Metrics
  const realizedMonthlyRevenue = spots
    .filter(s => s.occupancyStatus === 'Occupied')
    .reduce((acc, s) => acc + (s.ratePerMonthIdr || 0), 0);
  
  const potentialMonthlyRevenue = spots
    .reduce((acc, s) => acc + (s.ratePerMonthIdr || 0), 0);

  const reservedPipelineRevenue = spots
    .filter(s => s.occupancyStatus === 'Reserved')
    .reduce((acc, s) => acc + (s.ratePerMonthIdr || 0), 0);

  const annualProjectedRevenue = realizedMonthlyRevenue * 12;

  const avgCpm = spots.length > 0 
    ? Math.round(spots.reduce((acc, s) => acc + (s.cpmIdr || 0), 0) / spots.length) 
    : 0;

  // 3. Occupancy Rate Metrics
  const totalSpots = spots.length;
  const occupiedSpots = spots.filter(s => s.occupancyStatus === 'Occupied').length;
  const availableSpots = spots.filter(s => s.occupancyStatus === 'Available').length;
  const reservedSpots = spots.filter(s => s.occupancyStatus === 'Reserved').length;
  const maintenanceSpots = spots.filter(s => s.occupancyStatus === 'Maintenance').length;
  
  const occupancyRatePct = totalSpots > 0 
    ? ((occupiedSpots / totalSpots) * 100).toFixed(1) 
    : '0';

  // 4. Network Reach & Quality Metrics
  const avgEffectiveness = totalSpots > 0 
    ? (spots.reduce((acc, s) => acc + (s.effectivenessScore || 0), 0) / totalSpots).toFixed(1) 
    : '0';

  const uniqueRegenciesCount = new Set(spots.map(s => s.regency)).size;
  const digitalLedCount = spots.filter(s => s.type === 'LED Videotron' || s.type === 'Megatron').length;
  const staticBalihoCount = totalSpots - digitalLedCount;

  // Currency Formatter
  const formatMiliar = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toFixed(2)} M`;
    }
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  };

  const formatJuta = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(2)}M`;
    }
    return amount.toLocaleString('id-ID');
  };

  return (
    <section 
      aria-label="Global Performance Summary"
      className="w-full bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md transition-all duration-200 select-none z-30"
    >
      {/* Header Bar with Toggle & Live Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white uppercase text-[11px]">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400">Global Performance</span>
            <span className="hidden sm:inline text-slate-500 font-normal">|</span>
            <span className="hidden sm:inline text-slate-400 font-medium normal-case">
              Executive KPI Billboard Jawa Barat
            </span>
          </div>

          {/* Quick inline highlights when collapsed */}
          {!isExpanded && (
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-800 font-mono text-[11px] text-slate-300">
              <span>
                <strong className="text-white">{formatJuta(totalDailyGrossReach)}</strong> DGR/hari
              </span>
              <span className="text-slate-600">·</span>
              <span>
                Forecast: <strong className="text-amber-400">{formatMiliar(realizedMonthlyRevenue)}/bln</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                Occupancy: <strong className="text-emerald-400">{occupancyRatePct}%</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{totalSpots} Titik Aktif</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {lastSyncTime && (
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Clock className="w-3 h-3 text-slate-600" />
              <span>Sinkron: {lastSyncTime.toLocaleTimeString('id-ID')}</span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={isExpanded ? 'Sembunyikan Kartu KPI' : 'Tampilkan Kartu KPI'}
          >
            <span>{isExpanded ? 'Ringkas' : 'Rincian KPI'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded 4 KPI Cards Grid */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* Card 1: Total Impressions (DGR & VAC) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
              
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Total Impressions
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  DGR Daily
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums">
                  {formatJuta(totalDailyGrossReach)}
                </span>
                <span className="text-xs text-slate-400 font-medium">kontak/hari</span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px]">VAC: </span>
                  <span className="text-emerald-400 font-semibold">{formatJuta(totalDailyVac)}</span>
                  <span className="text-[10px] text-slate-500"> ({vacRatePct}%)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Bln: </span>
                  <span className="text-slate-200 font-semibold">{formatJuta(totalMonthlyGrossReach)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Revenue Forecast (Monthly & ARR) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
              
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-amber-400" />
                  Revenue Forecast
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Monthly Run
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-400 tabular-nums">
                  {formatMiliar(realizedMonthlyRevenue)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/bulan</span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px]">ARR: </span>
                  <span className="text-white font-semibold">{formatMiliar(annualProjectedRevenue)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Avg CPM: </span>
                  <span className="text-amber-300 font-semibold">Rp {avgCpm.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Occupancy Rate */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
              
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Occupancy Rate
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {occupiedSpots} / {totalSpots} Terisi
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-400 tabular-nums">
                  {occupancyRatePct}%
                </span>
                <span className="text-xs text-slate-400 font-medium">terisi aktif</span>
              </div>

              {/* Progress Mini Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden flex">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-500" 
                  style={{ width: `${occupancyRatePct}%` }}
                  title={`${occupiedSpots} Titik Terisi`}
                />
                <div 
                  className="bg-amber-400 h-full transition-all duration-500" 
                  style={{ width: `${totalSpots > 0 ? (reservedSpots / totalSpots) * 100 : 0}%` }}
                  title={`${reservedSpots} Titik Terpesan`}
                />
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">
                  <strong className="text-emerald-400">{occupiedSpots}</strong> Terisi
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">
                  <strong className="text-slate-200">{availableSpots}</strong> Tersedia
                </span>
                {reservedSpots > 0 && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="text-amber-400">
                      <strong>{reservedSpots}</strong> Booked
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Card 4: Network Reach & Effectiveness Score */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
              
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  Efektivitas Jaringan
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                  Score / 100
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-purple-300 tabular-nums">
                  {avgEffectiveness}
                </span>
                <span className="text-xs text-slate-400 font-medium">indeks kualitas</span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px]">Cakupan: </span>
                  <span className="text-white font-semibold">{uniqueRegenciesCount} Kab/Kota</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Format: </span>
                  <span className="text-amber-400 font-semibold">{digitalLedCount} LED</span>
                  <span className="text-slate-500"> / {staticBalihoCount} Static</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
