import { MapPin, Activity, Sparkles, BarChart3, Database, Calculator, FileText, Plus, TrendingUp } from 'lucide-react';

export type NavTabType = 'map' | 'realtime' | 'traffic-insights' | 'predictive' | 'effectiveness' | 'database' | 'planner' | 'reports';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  totalSpotsCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenExportModal,
  totalSpotsCount
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('map');
            }}
            className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors"
          >
            JabarOOH Analytics
          </a>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 tabular-nums">
            {totalSpotsCount} Titik Terdata
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Peta Interaktif</span>
          </button>

          <button
            onClick={() => setActiveTab('realtime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'realtime'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time</span>
          </button>

          <button
            onClick={() => setActiveTab('traffic-insights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'traffic-insights'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Traffic Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'predictive'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Analisis Prediktif</span>
          </button>

          <button
            onClick={() => setActiveTab('effectiveness')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'effectiveness'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Efektivitas Lokasi</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Basis Data GIS</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Perencanaan Merk & POI</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/50'
                : 'text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title="Buat Laporan Performa Otomatis"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Laporan Otomatis</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Titik</span>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet navigation tab strip */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'map' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Peta
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'realtime' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Real-Time
        </button>
        <button
          onClick={() => setActiveTab('traffic-insights')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'traffic-insights' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Traffic Insights
        </button>
        <button
          onClick={() => setActiveTab('predictive')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'predictive' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Prediktif AI
        </button>
        <button
          onClick={() => setActiveTab('effectiveness')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'effectiveness' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Efektivitas
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'database' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Basis Data
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'planner' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Rencana Merk & POI
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            activeTab === 'reports' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Laporan
        </button>
      </div>
    </header>
  );
}

