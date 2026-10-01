import { useState, useMemo } from 'react';
import { BillboardSpot } from '../types/ooh';
import { exportSpotsToCSV, exportSpotsToGeoJSON, WEST_JAVA_REGENCIES } from '../data/jabarData';
import { 
  Search, 
  Download, 
  Copy, 
  Check, 
  MapPin, 
  ExternalLink, 
  Filter, 
  Plus, 
  ArrowUpDown, 
  FileCode, 
  Table as TableIcon
} from 'lucide-react';

interface DatabaseTableProps {
  spots: BillboardSpot[];
  onSelectSpot: (spot: BillboardSpot) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
  onOpenAddModal: () => void;
  onOpenMapTab: (spot: BillboardSpot) => void;
}

export function DatabaseTable({
  spots,
  onSelectSpot,
  onOpenDetailModal,
  onOpenAddModal,
  onOpenMapTab
}: DatabaseTableProps) {
  const [search, setSearch] = useState<string>('');
  const [selectedRegency, setSelectedRegency] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGeoJson, setCopiedGeoJson] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof BillboardSpot>('dailyGrossReach');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtered and Sorted list
  const filteredSpots = useMemo(() => {
    return spots.filter(s => {
      if (selectedRegency !== 'Semua' && s.regency !== selectedRegency) return false;
      if (selectedType !== 'Semua' && s.type !== selectedType) return false;
      if (selectedStatus !== 'Semua' && s.occupancyStatus !== selectedStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = s.name.toLowerCase().includes(q);
        const mCode = s.code.toLowerCase().includes(q);
        const mRoad = s.roadName.toLowerCase().includes(q);
        const mBrand = (s.currentBrand || '').toLowerCase().includes(q);
        const mReg = s.regency.toLowerCase().includes(q);
        if (!mName && !mCode && !mRoad && !mBrand && !mReg) return false;
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [spots, search, selectedRegency, selectedType, selectedStatus, sortField, sortDirection]);

  const handleSort = (field: keyof BillboardSpot) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleCopyCoord = (spot: BillboardSpot, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${spot.coordinates.lat.toFixed(6)}, ${spot.coordinates.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedId(spot.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyGeoJson = () => {
    const geojson = exportSpotsToGeoJSON(filteredSpots);
    navigator.clipboard.writeText(JSON.stringify(geojson, null, 2));
    setCopiedGeoJson(true);
    setTimeout(() => setCopiedGeoJson(false), 2000);
  };

  const handleDownloadGeoJson = () => {
    const geojson = exportSpotsToGeoJSON(filteredSpots);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ooh_database_jabar_${new Date().toISOString().slice(0, 10)}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const csv = exportSpotsToCSV(filteredSpots);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ooh_database_jabar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & GIS Integration Callout */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <FileCode className="w-4 h-4" />
              <span>Struktur Data Geospasial Jawa Barat</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Basis Data Terstruktur & Integrasi Koordinat Reklame
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Skema data spasial standar WGS 84 (EPSG:4326) untuk pemetaan koridor arteri, jalan tol, dan titik billboard di Jawa Barat. Siap diekspor ke format GeoJSON, GIS (ArcGIS / QGIS), Mapbox, dan Leaflet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/database/export/mysql"
              download="database_bandung_media_outdoor_mysql.sql"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-md"
              title="Unduh file dump SQL untuk MySQL / MariaDB / cPanel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh MySQL (.sql)</span>
            </a>

            <a
              href="/api/database/export/sqlite"
              download="database_bandung_media_outdoor_sqlite.sql"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/60 rounded-lg transition-colors"
              title="Unduh file dump SQL untuk SQLite"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh SQLite (.sql)</span>
            </a>

            <button
              onClick={handleCopyGeoJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {copiedGeoJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedGeoJson ? 'Tersalin!' : 'Salin GeoJSON'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Titik</span>
            </button>
          </div>
        </div>

        {/* Data Schema Specs Preview */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-mono text-amber-400">Skema Titik:</span>
          <span><strong className="text-slate-300">GeoPoint:</strong> [Lat, Lng]</span>
          <span><strong className="text-slate-300">DGR:</strong> Daily Gross Reach</span>
          <span><strong className="text-slate-300">VAC:</strong> Visibility Adjusted Contacts</span>
          <span><strong className="text-slate-300">Dwell:</strong> Detik Durasi Paparan</span>
          <span><strong className="text-slate-300">CPM:</strong> Biaya per 1.000 Tayang</span>
          <span><strong className="text-slate-300">Index:</strong> 0-100 Efektivitas</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari kode, nama jalan, brand, atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-white bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedRegency}
            onChange={(e) => setSelectedRegency(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="Semua">Semua Wilayah ({spots.length})</option>
            {WEST_JAVA_REGENCIES.map(r => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="Semua">Semua Tipe Media</option>
            <option value="LED Videotron">LED Videotron</option>
            <option value="Megatron">Megatron</option>
            <option value="Static Billboard">Static Billboard</option>
            <option value="JPO Pedestrian Bridge">JPO Bridge</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="Semua">Semua Status</option>
            <option value="Occupied">Terisi (Occupied)</option>
            <option value="Available">Tersedia (Available)</option>
            <option value="Reserved">Reserved</option>
          </select>

          <span className="text-slate-500 font-mono text-xs pl-2">
            {filteredSpots.length} baris
          </span>
        </div>
      </div>

      {/* Main Structured Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Kode & Titik Lokasi</th>
                <th className="py-3 px-3 font-semibold">Wilayah & Koridor</th>
                <th className="py-3 px-3 font-semibold">Koordinat GPS</th>
                <th className="py-3 px-3 font-semibold">Tipe & Ukuran</th>
                <th 
                  onClick={() => handleSort('dailyGrossReach')} 
                  className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Gross Reach</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('vacDaily')} 
                  className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>VAC Harian</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('avgDwellTimeSec')} 
                  className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Dwell</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('effectivenessScore')} 
                  className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Indeks</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('cpmIdr')} 
                  className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CPM (IDR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Status / Brand</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredSpots.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-sans">
                    Tidak ada titik reklame yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredSpots.map((spot) => {
                  const isCopied = copiedId === spot.id;

                  return (
                    <tr
                      key={spot.id}
                      onClick={() => onOpenDetailModal(spot)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Code & Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors font-sans">
                          {spot.name}
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                          {spot.code}
                        </div>
                      </td>

                      {/* Regency & Road */}
                      <td className="py-3 px-3 font-sans">
                        <div className="text-slate-200">{spot.regency}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{spot.roadName}</div>
                      </td>

                      {/* Coordinates */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-[11px] tabular-nums">
                            {spot.coordinates.lat.toFixed(4)}, {spot.coordinates.lng.toFixed(4)}
                          </span>
                          <button
                            onClick={(e) => handleCopyCoord(spot, e)}
                            className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800"
                            title="Salin Koordinat (Lat, Lng)"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Type & Size */}
                      <td className="py-3 px-3 font-sans">
                        <div className="text-slate-200">{spot.type}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {spot.dimensions.width}x{spot.dimensions.height}m ({spot.dimensions.areaM2}m²)
                        </div>
                      </td>

                      {/* Gross Reach */}
                      <td className="py-3 px-3 text-right font-bold text-white tabular-nums">
                        {spot.dailyGrossReach.toLocaleString('id-ID')}
                      </td>

                      {/* VAC */}
                      <td className="py-3 px-3 text-right text-emerald-400 font-semibold tabular-nums">
                        {spot.vacDaily.toLocaleString('id-ID')}
                      </td>

                      {/* Dwell Time */}
                      <td className="py-3 px-3 text-right text-amber-400 tabular-nums">
                        {spot.avgDwellTimeSec}s
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-right font-bold text-cyan-400 tabular-nums">
                        {spot.effectivenessScore}
                      </td>

                      {/* CPM */}
                      <td className="py-3 px-3 text-right text-slate-200 tabular-nums">
                        Rp {spot.cpmIdr.toLocaleString('id-ID')}
                      </td>

                      {/* Status & Brand */}
                      <td className="py-3 px-3 font-sans">
                        <div className={`font-semibold ${
                          spot.occupancyStatus === 'Occupied' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {spot.occupancyStatus === 'Occupied' ? 'Terisi' : 'Tersedia'}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {spot.currentBrand || 'Siap Kontrak'}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenMapTab(spot)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800 rounded hover:bg-slate-800"
                            title="Tampilkan di Peta Interaktif"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${spot.coordinates.lat}&mlon=${spot.coordinates.lng}#map=16/${spot.coordinates.lat}/${spot.coordinates.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-950 border border-slate-800 rounded hover:bg-slate-800"
                            title="Buka Koordinat di OpenStreetMap (Bebas API Key)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
