import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Activity, 
  Sparkles, 
  BarChart3, 
  Database, 
  Calculator, 
  FileText, 
  Plus, 
  TrendingUp, 
  Cpu, 
  Layers, 
  Users, 
  Truck, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { UserAccount } from '../types/auth';

export type NavTabType = 
  | 'map' 
  | 'realtime' 
  | 'traffic-insights' 
  | 'predictive' 
  | 'effectiveness' 
  | 'demographic' 
  | 'database' 
  | 'planner' 
  | 'omnichannel-planner' 
  | 'ai-pipeline' 
  | 'logistic-optimizer' 
  | 'reports';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  totalSpotsCount: number;
  isSyncing?: boolean;
  lastSyncTime?: Date;
  currentUser?: UserAccount | null;
  onLockScreen?: () => void;
  onLogout?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenExportModal,
  totalSpotsCount,
  isSyncing = false,
  lastSyncTime,
  currentUser,
  onLockScreen,
  onLogout
}: NavbarProps) {
  const [isAnalyticsMenuOpen, setIsAnalyticsMenuOpen] = useState(false);
  const [isStrategyMenuOpen, setIsStrategyMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const analyticsRef = useRef<HTMLDivElement>(null);
  const strategyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (analyticsRef.current && !analyticsRef.current.contains(event.target as Node)) {
        setIsAnalyticsMenuOpen(false);
      }
      if (strategyRef.current && !strategyRef.current.contains(event.target as Node)) {
        setIsStrategyMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAnalyticsActive = [
    'realtime',
    'traffic-insights',
    'predictive',
    'effectiveness',
    'demographic',
    'ai-pipeline'
  ].includes(activeTab);

  const isStrategyActive = [
    'planner',
    'omnichannel-planner',
    'logistic-optimizer'
  ].includes(activeTab);

  const getAnalyticsLabel = () => {
    switch (activeTab) {
      case 'realtime': return 'Real-Time';
      case 'traffic-insights': return 'Traffic Insights';
      case 'predictive': return 'Prediktif AI';
      case 'effectiveness': return 'Efektivitas Lokasi';
      case 'demographic': return 'Demografi AI';
      case 'ai-pipeline': return 'AI Pipeline';
      default: return 'Analitik & AI';
    }
  };

  const getStrategyLabel = () => {
    switch (activeTab) {
      case 'planner': return 'Rencana Merk & POI';
      case 'omnichannel-planner': return 'Strategi (ATL·BTL·DTL)';
      case 'logistic-optimizer': return 'Logistik & Pemeliharaan';
      default: return 'Perencanaan & Strategi';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Identity & Live Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <span className="font-black text-slate-950 text-sm tracking-tighter">JB</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  JabarOOH
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  GIS Pro
                </span>
              </div>
            </div>
          </button>

          {/* Sync & Count Indicators */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
            <span className="font-mono text-slate-400 text-[11px]">
              {totalSpotsCount} Titik
            </span>
            <span className="text-slate-600">·</span>
            <div 
              className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400"
              title={lastSyncTime ? `Sinkronisasi terakhir: ${lastSyncTime.toLocaleTimeString('id-ID')}` : 'Auto-Sync 60s aktif'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="hidden xl:inline">{isSyncing ? 'Syncing...' : 'Live'}</span>
            </div>
          </div>
        </div>

        {/* Center: Clean Modular Navigation System */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          {/* 1. Peta Interaktif */}
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'map'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Peta Interaktif</span>
          </button>

          {/* 2. Analitik & AI Dropdown */}
          <div className="relative" ref={analyticsRef}>
            <button
              onClick={() => {
                setIsAnalyticsMenuOpen(!isAnalyticsMenuOpen);
                setIsStrategyMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isAnalyticsActive
                  ? 'bg-slate-800 text-amber-400 border border-slate-700 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAnalyticsActive ? getAnalyticsLabel() : 'Analitik & AI'}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isAnalyticsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAnalyticsMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 backdrop-blur-xl animate-in fade-in-50 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Trafik & Audiens
                </div>
                
                <button
                  onClick={() => {
                    setActiveTab('realtime');
                    setIsAnalyticsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'realtime' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-medium">Real-Time Traffic</div>
                    <div className="text-[10px] text-slate-400">Live VAC & sensor volume</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('traffic-insights');
                    setIsAnalyticsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'traffic-insights' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-medium">Traffic Insights</div>
                    <div className="text-[10px] text-slate-400">Koridor macet & kepadatan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('demographic');
                    setIsAnalyticsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'demographic' ? 'bg-cyan-500/15 text-cyan-300 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-medium text-cyan-300">Demografi Audiens AI</div>
                    <div className="text-[10px] text-slate-400">Gender, usia, & minat pembeli</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-800" />
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Prediksi & Evaluasi
                </div>

                <button
                  onClick={() => {
                    setActiveTab('predictive');
                    setIsAnalyticsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'predictive' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-medium">Analisis Prediktif AI</div>
                    <div className="text-[10px] text-slate-400">Forecasting impresi & cuaca</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('effectiveness');
                    setIsAnalyticsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'effectiveness' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-medium">Efektivitas Lokasi</div>
                    <div className="text-[10px] text-slate-400">ROI, CPM, & visibility score</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('ai-pipeline');
                    setIsAnalyticsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'ai-pipeline' ? 'bg-cyan-500/15 text-cyan-300 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-medium">AI Pipeline Architecture</div>
                    <div className="text-[10px] text-slate-400">Model status & automation</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 3. Perencanaan & Strategi Dropdown */}
          <div className="relative" ref={strategyRef}>
            <button
              onClick={() => {
                setIsStrategyMenuOpen(!isStrategyMenuOpen);
                setIsAnalyticsMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isStrategyActive
                  ? 'bg-slate-800 text-amber-400 border border-slate-700 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{isStrategyActive ? getStrategyLabel() : 'Perencanaan & Strategi'}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isStrategyMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStrategyMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 backdrop-blur-xl animate-in fade-in-50 duration-150">
                <button
                  onClick={() => {
                    setActiveTab('planner');
                    setIsStrategyMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'planner' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-medium">Rencana Merk & POI</div>
                    <div className="text-[10px] text-slate-400">Alokasi anggaran & POI target</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('omnichannel-planner');
                    setIsStrategyMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'omnichannel-planner' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-medium">Strategi (ATL · BTL · DTL)</div>
                    <div className="text-[10px] text-slate-400">Media mix & omnichannel sync</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('logistic-optimizer');
                    setIsStrategyMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    activeTab === 'logistic-optimizer' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-medium">Logistik & Pemeliharaan</div>
                    <div className="text-[10px] text-slate-400">Rute inspeksi dari base Bandung</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 4. Basis Data GIS */}
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'database'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Basis Data</span>
          </button>
        </nav>

        {/* Right: Actions, Laporan, & User Account */}
        <div className="flex items-center gap-2">
          {/* Laporan Otomatis Button */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                : 'text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title="Laporan Performa & PDF Export"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Laporan</span>
          </button>

          {/* Primary Action: Tambah Titik */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="font-bold">Tambah Titik</span>
          </button>

          {/* User Account & Security Controls */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <div 
                className="hidden xl:flex items-center gap-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                title={`Akun: ${currentUser.email} (${currentUser.role})`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold text-[10px]">
                  SR
                </div>
                <span className="font-medium text-slate-200 text-[11px] truncate max-w-[90px]">
                  Suherman
                </span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>

              {onLockScreen && (
                <button
                  onClick={onLockScreen}
                  className="p-1.5 text-amber-400/90 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                  title="Kunci Sistem"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-300 bg-slate-900 border border-slate-800 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { setActiveTab('map'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'map' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <MapPin className="w-4 h-4" /> Peta Interaktif
            </button>
            <button
              onClick={() => { setActiveTab('realtime'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'realtime' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <Activity className="w-4 h-4" /> Real-Time
            </button>
            <button
              onClick={() => { setActiveTab('traffic-insights'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'traffic-insights' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <TrendingUp className="w-4 h-4" /> Traffic Insights
            </button>
            <button
              onClick={() => { setActiveTab('demographic'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'demographic' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-cyan-300'}`}
            >
              <Users className="w-4 h-4" /> Demografi AI
            </button>
            <button
              onClick={() => { setActiveTab('predictive'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'predictive' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <Sparkles className="w-4 h-4" /> Prediktif AI
            </button>
            <button
              onClick={() => { setActiveTab('effectiveness'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'effectiveness' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <BarChart3 className="w-4 h-4" /> Efektivitas
            </button>
            <button
              onClick={() => { setActiveTab('planner'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'planner' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <Calculator className="w-4 h-4" /> Rencana Merk
            </button>
            <button
              onClick={() => { setActiveTab('omnichannel-planner'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'omnichannel-planner' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <Layers className="w-4 h-4" /> Strategi Media
            </button>
            <button
              onClick={() => { setActiveTab('logistic-optimizer'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'logistic-optimizer' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <Truck className="w-4 h-4" /> Logistik Rute
            </button>
            <button
              onClick={() => { setActiveTab('database'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-left flex items-center gap-2 ${activeTab === 'database' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'}`}
            >
              <Database className="w-4 h-4" /> Basis Data GIS
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
