import { useState } from 'react';
import { BillboardSpot, BillboardType, OccupancyStatus, OrientationType, RoadType } from '../types/ooh';
import { WEST_JAVA_REGENCIES, calculateLocationEffectiveness } from '../data/jabarData';
import { X, Plus, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpot: (spot: BillboardSpot) => void;
}

export function AddSpotModal({ isOpen, onClose, onAddSpot }: AddSpotModalProps) {
  const [name, setName] = useState('');
  const [regency, setRegency] = useState(WEST_JAVA_REGENCIES[0].name);
  const [district, setDistrict] = useState('Pusat Kota');
  const [roadName, setRoadName] = useState('');
  const [roadType, setRoadType] = useState<RoadType>('Arteri Primer');
  const [type, setType] = useState<BillboardType>('LED Videotron');
  const [width, setWidth] = useState<number>(16);
  const [height, setHeight] = useState<number>(8);
  const [orientation, setOrientation] = useState<OrientationType>('Front Facing (Tegak Lurus)');
  const [lat, setLat] = useState<string>('-6.9175');
  const [lng, setLng] = useState<string>('107.6191');
  const [dailyReach, setDailyReach] = useState<number>(180000);
  const [dwellSec, setDwellSec] = useState<number>(45);
  const [rateJuta, setRateJuta] = useState<number>(95);
  const [brand, setBrand] = useState<string>('');
  const [status, setStatus] = useState<OccupancyStatus>('Occupied');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Handle Regency change to automatically suggest center coordinates
  const handleRegencyChange = (regName: string) => {
    setRegency(regName);
    const reg = WEST_JAVA_REGENCIES.find(r => r.name === regName);
    if (reg) {
      // Add slight random offset so multiple spots in same city don't completely overlap
      const offsetLat = (Math.random() - 0.5) * 0.02;
      const offsetLng = (Math.random() - 0.5) * 0.02;
      setLat((reg.center[0] + offsetLat).toFixed(4));
      setLng((reg.center[1] + offsetLng).toFixed(4));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    // Validate coordinates are within West Java approximate boundary
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setErrorMsg('Koordinat Latitude dan Longitude harus berupa angka desimal.');
      return;
    }

    if (parsedLat < -8.2 || parsedLat > -5.7 || parsedLng < 106.0 || parsedLng > 109.0) {
      setErrorMsg('Koordinat berada di luar batas geografis Provinsi Jawa Barat (Lat: -5.7 s/d -8.2, Lng: 106.0 s/d 109.0).');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Nama titik reklame wajib diisi.');
      return;
    }

    if (!roadName.trim()) {
      setErrorMsg('Nama jalan atau koridor penempatan wajib diisi.');
      return;
    }

    const areaM2 = width * height;
    const vacDaily = Math.round(dailyReach * 0.88);
    const visibilityScore = orientation.includes('Front') ? 95 : orientation.includes('Curved') ? 94 : 88;
    const clutterLevel = 'Sedang (Normal)';
    const effectivenessScore = calculateLocationEffectiveness(
      dailyReach,
      dwellSec,
      visibilityScore,
      clutterLevel,
      roadType
    );

    const cpmIdr = vacDaily > 0 ? Math.round(((rateJuta * 1000000) / (vacDaily * 30)) * 1000) : 15000;

    const newSpot: BillboardSpot = {
      id: `spot-custom-${Date.now()}`,
      code: `JBR-${regency.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      regency,
      district: district.trim() || 'Kecamatan Utama',
      address: `${roadName.trim()}, ${district.trim()}, ${regency}`,
      roadName: roadName.trim(),
      roadType,
      coordinates: {
        lat: parsedLat,
        lng: parsedLng
      },
      type,
      dimensions: {
        width,
        height,
        areaM2,
        sides: orientation.includes('Double') ? 2 : 1
      },
      orientation,
      heightAboveGroundM: 9,
      viewingDistanceM: Math.round(width * 15),
      dailyGrossReach: dailyReach,
      vacDaily,
      avgDwellTimeSec: dwellSec,
      avgSpeedKmh: roadType.includes('Tol') ? 65 : 20,
      trafficBreakdown: {
        motorcycles: roadType.includes('Tol') ? 0 : 58,
        privateCars: roadType.includes('Tol') ? 70 : 32,
        publicTransport: roadType.includes('Tol') ? 10 : 6,
        commercialTrucks: roadType.includes('Tol') ? 20 : 4
      },
      visibilityScore,
      clutterLevel,
      effectivenessScore,
      occupancyStatus: status,
      currentBrand: brand.trim() || undefined,
      ratePerMonthIdr: rateJuta * 1000000,
      cpmIdr,
      lightingType: type.includes('LED') ? 'P6 SMD LED HD Display' : 'LED Floodlight 6x250W',
      powerConsumptionKw: type.includes('LED') ? 14.5 : 2.4,
      facingDirection: `Arus utama koridor ${roadName.trim()}`,
      targetDemographics: 'Audiens Komuter & Pengguna Jalan Koridor Jawa Barat'
    };

    onAddSpot(newSpot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Tambah Titik Reklame Baru (Jawa Barat)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Masukkan data geospasial dan spesifikasi teknis billboard untuk integrasi database.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section: Name & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Titik / Landmark</label>
              <input
                type="text"
                required
                placeholder="Contoh: Simpang Dago Cikapayang LED"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kota / Kabupaten (Jabar)</label>
              <select
                value={regency}
                onChange={(e) => handleRegencyChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
              >
                {WEST_JAVA_REGENCIES.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Road & Road Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Nama Jalan / Koridor</label>
              <input
                type="text"
                required
                placeholder="Contoh: Jl. Ir. H. Juanda No. 120"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kecamatan</label>
              <input
                type="text"
                placeholder="Contoh: Coblong"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Klasifikasi Koridor Jalan</label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value as RoadType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Arteri Primer">Arteri Primer</option>
                <option value="Jalan Tol Bebas Hambatan">Jalan Tol Bebas Hambatan</option>
                <option value="Kawasan Komersial & Pusat Bisnis">Kawasan Komersial & Pusat Bisnis</option>
                <option value="Arteri Sekunder">Arteri Sekunder</option>
                <option value="Kolektor Perkotaan">Kolektor Perkotaan</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipe Media Reklame</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as BillboardType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
              >
                <option value="LED Videotron">LED Videotron</option>
                <option value="Megatron">Megatron</option>
                <option value="Static Billboard">Static Billboard</option>
                <option value="JPO Pedestrian Bridge">JPO Pedestrian Bridge</option>
                <option value="Baliho Prisma">Baliho Prisma</option>
              </select>
            </div>
          </div>

          {/* Section: GPS Coordinates */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Koordinat Geospasial WGS84 (EPSG:4326)</span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Latitude (Lintang)</label>
                <input
                  type="text"
                  required
                  placeholder="-6.9175"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Longitude (Bujur)</label>
                <input
                  type="text"
                  required
                  placeholder="107.6191"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Dimensions & Orientation */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lebar (Meter)</label>
              <input
                type="number"
                min={2}
                max={50}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tinggi (Meter)</label>
              <input
                type="number"
                min={2}
                max={30}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Luas Konstruksi</label>
              <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-amber-400 font-mono font-bold">
                {width * height} m²
              </div>
            </div>
          </div>

          {/* Section: Metrics Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Est. Daily Reach (DGR)</label>
              <input
                type="number"
                step={5000}
                min={20000}
                max={600000}
                value={dailyReach}
                onChange={(e) => setDailyReach(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dwell Time (Detik)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={dwellSec}
                onChange={(e) => setDwellSec(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tarif Sewa (Juta/Bulan)</label>
              <input
                type="number"
                min={10}
                max={500}
                value={rateJuta}
                onChange={(e) => setRateJuta(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-white font-mono"
              />
            </div>
          </div>

          {/* Section: Status & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status Keterisian</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OccupancyStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="Occupied">Terisi (Occupied)</option>
                <option value="Available">Tersedia (Available)</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Brand Terpasang (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Bank BJB / Kosong jika tersedia"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors shadow-md"
            >
              Simpan Titik Reklame
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
