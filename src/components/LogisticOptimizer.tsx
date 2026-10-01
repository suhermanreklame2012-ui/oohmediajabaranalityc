import { useState, useMemo } from 'react';
import { BillboardSpot } from '../types/ooh';
import { 
  BANDUNG_BASE_LOCATIONS, 
  BaseLocation, 
  calculateLogisticRoute, 
  getSpotMaintenanceDetail, 
  LogisticRouteResult, 
  LogisticRouteStep 
} from '../utils/maintenanceAndLogistics';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Fuel, 
  Calendar, 
  Printer, 
  ChevronRight, 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  FileText, 
  Layers 
} from 'lucide-react';
import { Map, AdvancedMarker, APIProvider } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_cErEKUXi76tGidnv0ke-zhMtgGYyq-A';

interface LogisticOptimizerProps {
  spots: BillboardSpot[];
  onOpenDetailModal: (spot: BillboardSpot) => void;
  onNavigateToInteractiveMap?: (spot: BillboardSpot) => void;
}

export function LogisticOptimizer({
  spots,
  onOpenDetailModal,
  onNavigateToInteractiveMap
}: LogisticOptimizerProps) {
  // 1. Base location in Bandung
  const [selectedBaseId, setSelectedBaseId] = useState<string>(BANDUNG_BASE_LOCATIONS[0].id);
  const currentBase = useMemo(() => {
    return BANDUNG_BASE_LOCATIONS.find(b => b.id === selectedBaseId) || BANDUNG_BASE_LOCATIONS[0];
  }, [selectedBaseId]);

  // 2. Vehicle type
  const [vehicleType, setVehicleType] = useState<'pickup_crew' | 'skylift_truck' | 'patrol_motorcycle'>('pickup_crew');

  // 3. Round-trip toggle
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);

  // 4. Start time
  const [startTime, setStartTime] = useState<string>('08:00');

  // 5. Selected spots to visit
  // Default to spots with critical status or repair required
  const initialSelectedSpotIds = useMemo(() => {
    return spots.filter(s => {
      const maint = getSpotMaintenanceDetail(s);
      return maint.urgencyLevel === 'High' || maint.permitStatus === 'Expired';
    }).map(s => s.id);
  }, [spots]);

  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>(initialSelectedSpotIds);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterCategory, setActiveFilterCategory] = useState<'all' | 'critical' | 'bandung' | 'highways'>('critical');

  // Filtered spots list for selector
  const spotsWithMaintenance = useMemo(() => {
    return spots.map(s => ({
      spot: s,
      maintenance: getSpotMaintenanceDetail(s)
    }));
  }, [spots]);

  const displayedSpots = useMemo(() => {
    return spotsWithMaintenance.filter(({ spot, maintenance }) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = spot.name.toLowerCase().includes(query) ||
          spot.code.toLowerCase().includes(query) ||
          spot.roadName.toLowerCase().includes(query) ||
          spot.regency.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (activeFilterCategory === 'critical') {
        return maintenance.urgencyLevel === 'High' || maintenance.permitStatus === 'Expired';
      }
      if (activeFilterCategory === 'bandung') {
        return spot.regency.includes('Bandung') || spot.regency.includes('Cimahi');
      }
      if (activeFilterCategory === 'highways') {
        return spot.roadType.toLowerCase().includes('tol');
      }
      return true;
    });
  }, [spotsWithMaintenance, searchQuery, activeFilterCategory]);

  // Toggle selection
  const handleToggleSpot = (id: string) => {
    setSelectedSpotIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const ids = displayedSpots.map(d => d.spot.id);
    setSelectedSpotIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    setSelectedSpotIds([]);
  };

  // Run Route Optimization
  const routeResult: LogisticRouteResult = useMemo(() => {
    const spotsToVisit = spots.filter(s => selectedSpotIds.includes(s.id));
    return calculateLogisticRoute(currentBase, spotsToVisit, isRoundTrip, vehicleType, startTime);
  }, [currentBase, spots, selectedSpotIds, isRoundTrip, vehicleType, startTime]);

  // Quick print/manifest action
  const handlePrintWorkOrder = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              LOGISTIC & INSPECTION OPTIMIZER
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800">
              Heuristik TSP Bandung Multi-Titik
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Optimasi Rute Logistik Pemeliharaan & Inspeksi Fisik Reklame
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Menghitung urutan rute kunjungan paling efisien dan hemat bahan bakar untuk armada teknisi lapangan, berawal dari pangkalan operasional di Bandung ke seluruh titik reklame yang memerlukan perbaikan, servis berkala, maupun audit legalitas izin.
          </p>
        </div>

        <button
          onClick={handlePrintWorkOrder}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-400/40 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-lg"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Surat Tugas Teknisi</span>
        </button>
      </div>

      {/* 2. Parameters Configuration: Base Bandung, Vehicle, Time, Roundtrip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Base Location in Bandung (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Titik Awal Pangkalan Operasional (Base Bandung)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Pusat Logistik</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BANDUNG_BASE_LOCATIONS.map((base) => {
              const isSelected = selectedBaseId === base.id;
              return (
                <div
                  key={base.id}
                  onClick={() => setSelectedBaseId(base.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400/60 ring-1 ring-amber-400/30'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white leading-tight">{base.name}</h4>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{base.address}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                    Lat: {base.lat.toFixed(4)}, Lng: {base.lng.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicle & Mission Settings (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Konfigurasi Armada & Jadwal Keberangkatan</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">Parameter Rute</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Vehicle Type */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-mono font-semibold block">Jenis Armada Lapangan:</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="pickup_crew">Mobil Pick-up Tim Teknisi (Standar)</option>
                <option value="skylift_truck">Truk Crane Skylift 16m (Ketinggian / Modul)</option>
                <option value="patrol_motorcycle">Motor Patroli Reaksi Cepat (Audit Legal)</option>
              </select>
            </div>

            {/* Departure Clock */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-mono font-semibold block">Jam Keberangkatan Pagi:</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="07:00">07:00 WIB (Hindari Macet Pagi)</option>
                <option value="08:00">08:00 WIB (Standar Jam Kerja)</option>
                <option value="09:30">09:30 WIB (Pasca Peak Pagi)</option>
                <option value="21:00">21:00 WIB (Shift Malam / Khusus Tol)</option>
              </select>
            </div>
          </div>

          {/* Round-trip checkbox & summary */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isRoundTrip}
                onChange={(e) => setIsRoundTrip(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-400 focus:ring-0 cursor-pointer"
              />
              <span>Rute Sirkular: <strong>Kembali ke Base Bandung</strong> setelah selesai semua titik</span>
            </label>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {routeResult.totalSpotsToVisit} Titik Terpilih
            </span>
          </div>
        </div>
      </div>

      {/* 3. Spot Selection Drawer / Checkbox Grid */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Pilih Titik Reklame yang Hendak Dikunjungi & Diperiksa</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Klik kotak centang pada setiap titik untuk memasukkannya ke dalam kalkulator urutan rute logistik
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Cari nama titik / jalan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-40"
              />
            </div>

            <button
              onClick={handleSelectAllFiltered}
              className="px-2.5 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg font-medium"
            >
              Pilih Semua ({displayedSpots.length})
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-2.5 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-lg font-medium"
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilterCategory('critical')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeFilterCategory === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ⚠️ Kritis (Izin Expired / Butuh Perbaikan)
          </button>
          <button
            onClick={() => setActiveFilterCategory('bandung')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeFilterCategory === 'bandung'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🏙️ Wilayah Bandung Raya
          </button>
          <button
            onClick={() => setActiveFilterCategory('highways')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeFilterCategory === 'highways'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🛣️ Koridor Jalan Tol
          </button>
          <button
            onClick={() => setActiveFilterCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeFilterCategory === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua Titik ({spots.length})
          </button>
        </div>

        {/* Spot Checkbox Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
          {displayedSpots.map(({ spot, maintenance }) => {
            const isChecked = selectedSpotIds.includes(spot.id);
            const isExpired = maintenance.permitStatus === 'Expired';
            const isRepairNeeded = maintenance.maintenanceStatus === 'Repair Required' || maintenance.maintenanceStatus === 'Under Repair';

            return (
              <div
                key={spot.id}
                onClick={() => handleToggleSpot(spot.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'bg-slate-950 border-amber-400/60 ring-1 ring-amber-400/30'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // handled by parent div onClick
                  className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0 cursor-pointer shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400">[{spot.code}]</span>
                    {isExpired && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Izin Expired
                      </span>
                    )}
                    {isRepairNeeded && !isExpired && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Perlu Perbaikan
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-white truncate mt-0.5">{spot.name}</h5>
                  <p className="text-[10px] text-slate-400 truncate">{spot.roadName}, {spot.regency}</p>

                  <div className="mt-2 text-[10px] text-slate-300 flex items-center justify-between font-mono">
                    <span className="text-slate-400">Integritas: {maintenance.structuralIntegrityScore}%</span>
                    <span className={isExpired ? 'text-rose-400' : 'text-slate-400'}>
                      Izin: {maintenance.permitExpiryDate}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. KPI Performance Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>TOTAL JARAK TEMPUH</span>
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white">
            {routeResult.totalDistanceKm} km
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Optimal terpendek TSP
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>DURASI OPERASI</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-cyan-300">
            {routeResult.totalMissionDurationHours} Jam
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Perjalanan + durasi servis
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ESTIMASI BIAYA BBM</span>
            <Fuel className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-300">
            Rp {(routeResult.estimatedFuelCostIdr).toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Bahan bakar armada operasional
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>TOTAL TITIK INSPEKSI</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-purple-300">
            {routeResult.totalSpotsToVisit} Titik
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Pangkalan: {currentBase.name.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* 5. Google Map Route Viewer & Step-by-Step Waypoint Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Visualization (6 cols) */}
        <div className="lg:col-span-6 p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>Peta Rute Google Maps Berurutan</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Base Lat: {currentBase.lat.toFixed(3)}, Lng: {currentBase.lng.toFixed(3)}
            </span>
          </div>

          <div className="w-full h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
            <APIProvider
              apiKey={GOOGLE_MAPS_API_KEY}
              language="id"
              region="ID"
              libraries={['marker', 'visualization', 'places', 'geometry']}
            >
              <Map
                defaultCenter={{ lat: currentBase.lat, lng: currentBase.lng }}
                defaultZoom={11}
                gestureHandling="greedy"
                disableDefaultUI={true}
                mapId="logistic_optimizer_map"
                className="w-full h-full"
              >
                {/* Bandung Base Location Pin */}
                <AdvancedMarker position={{ lat: currentBase.lat, lng: currentBase.lng }}>
                  <div className="flex flex-col items-center cursor-pointer group">
                    <div className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md shadow-lg border border-white whitespace-nowrap">
                      BASE BANDUNG
                    </div>
                    <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 font-black text-xs shadow-xl">
                      HQ
                    </div>
                  </div>
                </AdvancedMarker>

                {/* Waypoint Billboard Spot Pins */}
                {routeResult.steps.filter(s => s.type === 'spot_inspection').map((step, idx) => (
                  <AdvancedMarker
                    key={`step-${step.stepIndex}`}
                    position={{ lat: step.lat, lng: step.lng }}
                    onClick={() => step.spot && onOpenDetailModal(step.spot)}
                  >
                    <div className="flex flex-col items-center cursor-pointer group">
                      <div className="px-1.5 py-0.5 bg-slate-950 text-white font-mono text-[9px] rounded border border-slate-700 shadow-md whitespace-nowrap group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        #{idx + 1} {step.locationName.split(' ')[0]}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-xl group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        {idx + 1}
                      </div>
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        </div>

        {/* Step-by-Step Waypoint Itinerary (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Manifest & Jadwal Urutan Kunjungan Teknisi</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {routeResult.steps.length} Titik Perhentian
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {routeResult.steps.map((step) => {
              const isBase = step.type === 'base_start' || step.type === 'base_return';

              return (
                <div
                  key={step.stepIndex}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isBase
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                        isBase ? 'bg-amber-400 text-slate-950' : 'bg-blue-600 text-white'
                      }`}>
                        {isBase ? (step.type === 'base_start' ? 'S' : 'F') : step.stepIndex}
                      </span>
                      <strong className="text-white text-xs font-bold leading-tight">
                        {step.locationName}
                      </strong>
                    </div>

                    <span className="font-mono text-xs text-amber-300 font-bold">
                      {step.suggestedArrivalClock}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 pl-7">{step.address}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-850 pl-7 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span>Jarak: <strong>{step.distanceFromPrevKm} km</strong></span>
                      <span>Travel: <strong>{step.travelTimeMinutes} mnt</strong></span>
                      <span>Servis: <strong>{step.serviceDurationMinutes} mnt</strong></span>
                    </div>

                    {step.spot && (
                      <button
                        onClick={() => onOpenDetailModal(step.spot!)}
                        className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        Detail Titik <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="mt-2 pl-7 text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                    <Wrench className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Tugas:</strong> {step.actionRequired}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed">
            {routeResult.routeSummaryNarrative}
          </div>
        </div>
      </div>
    </div>
  );
}
