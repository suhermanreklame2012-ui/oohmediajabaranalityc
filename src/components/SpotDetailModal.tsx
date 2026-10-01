import { useState } from 'react';
import { BillboardSpot } from '../types/ooh';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass, 
  Users, 
  Clock, 
  Eye, 
  Zap, 
  DollarSign,
  Maximize2,
  Sparkles,
  Building2,
  BrainCircuit
} from 'lucide-react';
import { getSpotPois } from '../data/poiData';

interface SpotDetailModalProps {
  spot: BillboardSpot | null;
  onClose: () => void;
  onViewOnMap: (spot: BillboardSpot) => void;
  onOpenDemographics?: (spot: BillboardSpot) => void;
}

export function SpotDetailModal({ spot, onClose, onViewOnMap, onOpenDemographics }: SpotDetailModalProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (!spot) return null;

  const handleCopyCoord = () => {
    const text = `${spot.coordinates.lat.toFixed(6)}, ${spot.coordinates.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">{spot.code}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{spot.regency}</span>
              <span className="text-slate-600">·</span>
              <span className={`text-xs font-semibold ${
                spot.occupancyStatus === 'Occupied' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {spot.occupancyStatus === 'Occupied' ? `Terisi (${spot.currentBrand})` : 'Tersedia'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{spot.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{spot.address}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Billboard Visual Mockup Stage */}
          <div className="relative w-full h-48 sm:h-56 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Visual Screen Simulator */}
            <div className="relative w-full max-w-md h-32 sm:h-36 bg-slate-900 border-4 border-slate-800 rounded-lg shadow-2xl flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-purple-500/10 opacity-70"></div>
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                  {spot.type} Simulator
                </span>
                <h4 className="text-base sm:text-lg font-extrabold text-white">
                  {spot.currentBrand || 'Available For Brand Placement'}
                </h4>
                <p className="text-[11px] text-slate-300">
                  {spot.roadName} — Arah {spot.facingDirection}
                </p>
              </div>
              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
                {spot.dimensions.width}m × {spot.dimensions.height}m ({spot.dimensions.areaM2} m²)
              </div>
            </div>

            {/* Stand pole */}
            <div className="w-4 h-8 bg-slate-800 border-x border-slate-700"></div>
            <div className="w-16 h-2 bg-slate-800 rounded-full"></div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-slate-200">
                {spot.coordinates.lat.toFixed(6)}, {spot.coordinates.lng.toFixed(6)}
              </span>
              <button
                onClick={handleCopyCoord}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 ml-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Koordinat'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onViewOnMap(spot);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold rounded-md border border-slate-800 transition-colors"
              >
                Tampilkan di Peta
              </button>
              <a
                href={`https://www.openstreetmap.org/?mlat=${spot.coordinates.lat}&mlon=${spot.coordinates.lng}#map=16/${spot.coordinates.lat}/${spot.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-md border border-slate-800 transition-colors"
                title="Buka titik di OpenStreetMap (Bebas API Key)"
              >
                <span>OpenStreetMap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://www.google.com/maps?q=${spot.coordinates.lat},${spot.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-800 transition-colors"
                title="Navigasi Koordinat Google Maps"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Gross Reach (DGR)</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {spot.dailyGrossReach.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-500 block">kontak harian</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Visibility Adjusted (VAC)</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {spot.vacDaily.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-500 block">kontak terfokus</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Durasi Pandang (Dwell)</span>
              <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                {spot.avgDwellTimeSec} detik
              </span>
              <span className="text-[10px] text-slate-500 block">kecepatan {spot.avgSpeedKmh} km/jam</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Indeks Efektivitas</span>
              <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                {spot.effectivenessScore} / 100
              </span>
              <span className="text-[10px] text-slate-500 block">evaluasi multi-faktor</span>
            </div>
          </div>

          {/* Specifications Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <span className="font-semibold text-slate-200 block border-b border-slate-800 pb-1.5">
                Spesifikasi Fisik & Konstruksi
              </span>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe Media:</span>
                <span className="text-white font-medium">{spot.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dimensi & Luas:</span>
                <span className="text-white font-mono">{spot.dimensions.width}m × {spot.dimensions.height}m ({spot.dimensions.areaM2} m²)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ketinggian Konstruksi:</span>
                <span className="text-white font-mono">{spot.heightAboveGroundM} meter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jarak Pandang Optimal:</span>
                <span className="text-white font-mono">{spot.viewingDistanceM} meter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Orientasi Sudut Hadap:</span>
                <span className="text-slate-200">{spot.orientation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tingkat Halangan / Clutter:</span>
                <span className="text-slate-200">{spot.clutterLevel}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <span className="font-semibold text-slate-200 block border-b border-slate-800 pb-1.5">
                Komersial & Operasional
              </span>
              <div className="flex justify-between">
                <span className="text-slate-400">Tarif Sewa Publik:</span>
                <span className="text-amber-400 font-mono font-bold">
                  Rp {(spot.ratePerMonthIdr / 1000000).toFixed(0)} Juta / Bulan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cost Per Mille (CPM):</span>
                <span className="text-white font-mono">
                  Rp {spot.cpmIdr.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sistem Pencahayaan:</span>
                <span className="text-slate-200">{spot.lightingType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Konsumsi Daya Listrik:</span>
                <span className="text-slate-200 font-mono">{spot.powerConsumptionKw} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Brand Terpasang Saat Ini:</span>
                <span className="text-slate-200 font-medium">{spot.currentBrand || 'Tersedia untuk Kontrak'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Klasifikasi Jalan:</span>
                <span className="text-slate-200">{spot.roadType}</span>
              </div>
            </div>
          </div>

          {/* Traffic Breakdown Distribution */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <span className="font-semibold text-slate-200 block">
              Distribusi Moda Lalu Lintas Melintasi Titik
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sepeda Motor</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {spot.trafficBreakdown.motorcycles}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Mobil Pribadi</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {spot.trafficBreakdown.privateCars}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Angkutan Umum</span>
                <span className="text-sm font-bold font-mono text-purple-400">
                  {spot.trafficBreakdown.publicTransport}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Truk & Niaga</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {spot.trafficBreakdown.commercialTrucks}%
                </span>
              </div>
            </div>
          </div>

          {/* Target Demographics */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="font-semibold text-slate-200 block mb-1">
              Profil Persona Audiens & Target Segmen
            </span>
            <p className="text-slate-300 leading-relaxed">
              {spot.targetDemographics}. Lokasi ini sangat efektif untuk produk dengan target pasar komuter produktif, pengambil keputusan keluarga, serta pelintas antarkota di koridor Jawa Barat.
            </p>
          </div>

          {/* Point of Interest (POI) Proximity Section */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                  Point of Interest (POI) Sekitar Lokasi Reklame
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Radius &le; 2.0 km</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {getSpotPois(spot).map((poi) => (
                <div key={poi.id} className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-400/10 border border-amber-400/20 rounded-md text-amber-400 shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{poi.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                        {poi.distanceMeters}m
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-400 block font-medium mt-0.5">{poi.category}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">{poi.highlightText}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/80">
          {onOpenDemographics ? (
            <button
              onClick={() => {
                onClose();
                onOpenDemographics(spot);
              }}
              className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Buka Analisis Profil Demografi & Minat Audiens dengan AI Gemini"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analisis Demografi AI</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewOnMap(spot);
              }}
              className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Lihat di Peta</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
