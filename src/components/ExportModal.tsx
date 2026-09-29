import { useState } from 'react';
import { BillboardSpot } from '../types/ooh';
import { exportSpotsToCSV, exportSpotsToGeoJSON } from '../data/jabarData';
import { X, Download, Copy, Check, FileCode, Database, CheckCircle2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  spots: BillboardSpot[];
}

export function ExportModal({ isOpen, onClose, spots }: ExportModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadGeoJSON = () => {
    const geojson = exportSpotsToGeoJSON(spots);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ooh_database_jabar_${new Date().toISOString().slice(0, 10)}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const csv = exportSpotsToCSV(spots);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ooh_database_jabar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(spots, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ooh_database_jabar_raw_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (format: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Ekspor Basis Data Geospasial Jawa Barat</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih format ekspor data untuk integrasi pemetaan koordinat, GIS, atau analisis spreadsheet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Format 1: GeoJSON */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-white text-sm">GeoJSON FeatureCollection (WGS 84)</span>
                <p className="text-slate-400 text-xs mt-0.5">
                  Standar EPSG:4326 dengan geometri titik [lng, lat] dan metadata performa lengkap. Siap diimpor ke QGIS, ArcGIS, Mapbox, atau Leaflet.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 rounded text-[10px] font-mono font-bold">
                REKOMENDASI GIS
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleDownloadGeoJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File .geojson</span>
              </button>
              <button
                onClick={() => handleCopy('geojson', JSON.stringify(exportSpotsToGeoJSON(spots), null, 2))}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors"
              >
                {copiedFormat === 'geojson' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'geojson' ? 'Tersalin' : 'Salin JSON'}</span>
              </button>
            </div>
          </div>

          {/* Format 2: CSV Spreadsheet */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div>
              <span className="font-bold text-white text-sm">CSV Spreadsheet (Comma Separated)</span>
              <p className="text-slate-400 text-xs mt-0.5">
                Format tabel terstruktur untuk dianalisis di Microsoft Excel, Google Sheets, atau perangkat lunak analitik data.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File .csv</span>
              </button>
              <button
                onClick={() => handleCopy('csv', exportSpotsToCSV(spots))}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors"
              >
                {copiedFormat === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'csv' ? 'Tersalin' : 'Salin Teks CSV'}</span>
              </button>
            </div>
          </div>

          {/* Format 3: Raw JSON */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div>
              <span className="font-bold text-white text-sm">Raw JSON Object Array</span>
              <p className="text-slate-400 text-xs mt-0.5">
                Struktur payload JSON untuk integrasi API backend dan database NoSQL.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File .json</span>
              </button>
              <button
                onClick={() => handleCopy('json', JSON.stringify(spots, null, 2))}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors"
              >
                {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'json' ? 'Tersalin' : 'Salin JSON'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
