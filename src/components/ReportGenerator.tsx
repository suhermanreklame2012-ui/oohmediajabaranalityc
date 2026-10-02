import { useState, useMemo, useRef } from 'react';
import { BillboardSpot, ReportConfig } from '../types/ooh';
import { compilePerformanceReport, WEST_JAVA_REGENCIES } from '../data/jabarData';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Filter, 
  Building2, 
  Users, 
  Eye, 
  Clock, 
  DollarSign, 
  ShieldCheck,
  Check
} from 'lucide-react';

interface ReportGeneratorProps {
  spots: BillboardSpot[];
  onOpenDetailModal: (spot: BillboardSpot) => void;
}

export function ReportGenerator({ spots, onOpenDetailModal }: ReportGeneratorProps) {
  const [campaignName, setCampaignName] = useState<string>('Audit & Evaluasi Kinerja Media Luar Ruang Jawa Barat');
  const [brandClient, setBrandClient] = useState<string>('PT Telekomunikasi Seluler / Brand Korporat');
  const [timeRange, setTimeRange] = useState<ReportConfig['timeRange']>('monthly');
  const [selectedRegencyFilter, setSelectedRegencyFilter] = useState<string>('Semua');
  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>(() => spots.map(s => s.id));
  const [includeFrequency, setIncludeFrequency] = useState<boolean>(true);
  const [includeCostEfficiency, setIncludeCostEfficiency] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Laporan ini disusun menggunakan verifikasi data sensor titik OOH Jawa Barat dengan metodologi Visibility Adjusted Contacts (VAC) standar industri.');
  const [isCopiedCSV, setIsCopiedCSV] = useState<boolean>(false);

  const printableRef = useRef<HTMLDivElement>(null);

  // Filter spot IDs by regency if selected
  const activeSpotIds = useMemo(() => {
    if (selectedRegencyFilter === 'Semua') return spots.map(s => s.id);
    return spots.filter(s => s.regency === selectedRegencyFilter).map(s => s.id);
  }, [spots, selectedRegencyFilter]);

  // Compile report data
  const reportData = useMemo(() => {
    return compilePerformanceReport(spots, {
      campaignName,
      brandClient,
      timeRange,
      datePeriodLabel: '',
      selectedSpots: activeSpotIds,
      includeFrequency,
      includeDemographics: true,
      includeCostEfficiency,
      notes
    });
  }, [spots, campaignName, brandClient, timeRange, activeSpotIds, includeFrequency, includeCostEfficiency, notes]);

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Kode Titik', 'Nama Titik', 'Wilayah', 'Koridor Jalan', 'Tipe Media', 
      'Jangkauan Kontak (Gross Reach)', 'Kontak Tertarget (VAC)', 'Frekuensi Rata-rata', 
      'Dwell Time (detik)', 'Indeks Efektivitas', 'Estimasi Biaya Periode (IDR)', 'CPM Efektif (IDR)'
    ];

    const rows = reportData.spotsDetail.map(s => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.regency}"`,
      `"${s.roadName}"`,
      `"${s.type}"`,
      s.reach,
      s.vac,
      s.frequency,
      s.dwell,
      s.effectiveness,
      s.cost,
      s.cpm
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Performa_OOH_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Control Configuration Header (Hidden on print) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <FileText className="w-4 h-4" />
              <span>Generator Laporan Otomatis</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Laporan Kinerja & Pengukuran Performa Iklan Luar Ruang
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Hasilkan laporan performa formal dengan metrik jangkauan (gross & net unique reach), frekuensi paparan, dan efektivitas per titik lokasi di Jawa Barat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Configuration Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-800">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Kampanye / Periode</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Brand Klien</label>
            <input
              type="text"
              value={brandClient}
              onChange={(e) => setBrandClient(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Rentang Waktu Laporan</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'daily', label: 'Harian' },
                { id: 'weekly', label: 'Mingguan' },
                { id: 'monthly', label: 'Bulanan' },
                { id: 'quarterly', label: 'Triwulan' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`py-1.5 text-center font-medium rounded text-xs transition-colors ${
                    timeRange === t.id
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Cakupan Wilayah</label>
            <select
              value={selectedRegencyFilter}
              onChange={(e) => setSelectedRegencyFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Semua">Seluruh Jawa Barat ({spots.length} Titik)</option>
              {WEST_JAVA_REGENCIES.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div 
        ref={printableRef}
        className="p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6 text-slate-100 print:bg-white print:text-black print:border-none print:p-0 print:shadow-none"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-gray-300">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 print:text-amber-700">
              OOH & DOOH Performance Audit Report
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white print:text-black mt-1">
              {reportData.meta.campaignName}
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
              Klien: <strong className="text-white print:text-black">{reportData.meta.brandClient}</strong> · Wilayah: <strong className="text-white print:text-black">Provinsi Jawa Barat</strong>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-gray-600 font-mono">
            <div>Periode: <strong className="text-amber-400 print:text-amber-700">{reportData.meta.periodLabel}</strong></div>
            <div className="text-[11px] text-slate-500 print:text-gray-500 mt-0.5">Dibuat: {reportData.meta.generatedAt}</div>
            <div className="text-[11px] text-slate-500 print:text-gray-500">{reportData.meta.totalSpotsCount} Titik Reklame Terpantau</div>
          </div>
        </div>

        {/* Executive KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl print:bg-gray-50 print:border-gray-200">
            <span className="text-xs text-slate-400 print:text-gray-600 block mb-1">Jangkauan Kotor (Gross Reach)</span>
            <span className="text-2xl font-bold font-mono text-white print:text-black tabular-nums">
              {(reportData.metrics.totalGrossReach / 1000000).toFixed(2)} Juta
            </span>
            <span className="text-[11px] text-slate-500 print:text-gray-500 block mt-1">
              {reportData.metrics.totalGrossReach.toLocaleString('id-ID')} kontak
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl print:bg-gray-50 print:border-gray-200">
            <span className="text-xs text-slate-400 print:text-gray-600 block mb-1">Jangkauan Unik (Net Reach)</span>
            <span className="text-2xl font-bold font-mono text-cyan-400 print:text-blue-700 tabular-nums">
              {(reportData.metrics.netUniqueReach / 1000000).toFixed(2)} Juta
            </span>
            <span className="text-[11px] text-slate-500 print:text-gray-500 block mt-1">
              Frekuensi rata-rata: {reportData.metrics.avgFrequency}x / periode
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl print:bg-gray-50 print:border-gray-200">
            <span className="text-xs text-slate-400 print:text-gray-600 block mb-1">Kontak Tertarget (VAC)</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 print:text-green-700 tabular-nums">
              {(reportData.metrics.totalVac / 1000000).toFixed(2)} Juta
            </span>
            <span className="text-[11px] text-slate-500 print:text-gray-500 block mt-1">
              88.2% rasio keterlihatan efektif
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl print:bg-gray-50 print:border-gray-200">
            <span className="text-xs text-slate-400 print:text-gray-600 block mb-1">Rata-rata Efektivitas Lokasi</span>
            <span className="text-2xl font-bold font-mono text-amber-400 print:text-amber-700 tabular-nums">
              {reportData.metrics.avgEffectiveness} / 100
            </span>
            <span className="text-[11px] text-slate-500 print:text-gray-500 block mt-1">
              Dwell Time: {reportData.metrics.avgDwell} detik
            </span>
          </div>
        </div>

        {/* Section 2: Regional Reach Distribution */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black">
            Distribusi Jangkauan per Wilayah (Kota & Kabupaten)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {reportData.regionalBreakdown.slice(0, 6).map((reg) => (
              <div key={reg.regency} className="p-3 bg-slate-950 border border-slate-800 rounded-lg print:bg-gray-50 print:border-gray-200 text-xs">
                <span className="font-semibold text-slate-200 print:text-black block truncate">{reg.regency}</span>
                <span className="text-[11px] font-mono text-emerald-400 print:text-green-700 block mt-1 tabular-nums">
                  {(reg.vac / 1000000).toFixed(2)}M VAC
                </span>
                <span className="text-[10px] text-slate-500 print:text-gray-500 block font-mono">
                  {reg.sharePct}% pangsa ({reg.spotCount} titik)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Detailed Per-Spot Performance Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white print:text-black">
            Rincian Kinerja per Titik Penempatan Reklame
          </h3>
          <div className="overflow-x-auto border border-slate-800 print:border-gray-300 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 print:bg-gray-100 border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Kode & Lokasi</th>
                  <th className="py-2.5 px-3 font-semibold">Wilayah</th>
                  <th className="py-2.5 px-3 font-semibold">Tipe Media</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Gross Reach</th>
                  <th className="py-2.5 px-3 font-semibold text-right">VAC Tertarget</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Frekuensi</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Dwell Time</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Indeks</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Est. Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 print:divide-gray-200 font-mono text-slate-200 print:text-black">
                {reportData.spotsDetail.map((spot) => (
                  <tr key={spot.code} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                    <td className="py-2 px-3 font-sans">
                      <div className="font-bold">{spot.name}</div>
                      <div className="text-[10px] font-mono text-amber-400 print:text-amber-700">{spot.code}</div>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-300 print:text-gray-800">{spot.regency}</td>
                    <td className="py-2 px-3 font-sans text-slate-400 print:text-gray-600">{spot.type}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{spot.reach.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 print:text-green-700 font-bold tabular-nums">
                      {spot.vac.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{spot.frequency}x</td>
                    <td className="py-2 px-3 text-right tabular-nums">{spot.dwell}s</td>
                    <td className="py-2 px-3 text-right font-bold text-cyan-400 print:text-blue-700 tabular-nums">
                      {spot.effectiveness}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      Rp {(spot.cost / 1000000).toFixed(1)} Jt
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Audit & Methodology Notes */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl print:bg-gray-50 print:border-gray-200 text-xs space-y-2">
          <span className="font-bold text-slate-200 print:text-black block">Catatan Metodologi & Verifikasi:</span>
          <p className="text-slate-400 print:text-gray-600 leading-relaxed text-[11px]">
            {reportData.meta.notes}
          </p>
        </div>

        {/* Signatures & Corporate Approval Block */}
        <div className="pt-6 border-t border-slate-800 print:border-gray-300 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          <div>
            <span className="text-slate-400 print:text-gray-600 block mb-10">Disiapkan Oleh (Tim Analitik OOH):</span>
            <div className="font-bold text-slate-200 print:text-black">Lead OOH Data Scientist</div>
            <div className="text-[11px] text-slate-500 print:text-gray-500">JabarOOH Analytics & Measurement Division</div>
          </div>

          <div className="text-center p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl print:bg-white print:border-gray-300">
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">Status Hak Akses & Otorisasi:</span>
            <div className="font-black text-sm text-teal-300 print:text-teal-800">DISETUJUI & DIOTORISASI PENUH</div>
            <div className="font-semibold text-white print:text-black mt-1">Suherman Reklame</div>
            <div className="font-mono text-[10px] text-teal-200 print:text-gray-600">suherman.reklame2012@gmail.com</div>
            <div className="text-[9px] text-slate-400 print:text-gray-400 mt-1">Super Administrator & Pengelola OOH Jabar</div>
          </div>

          <div className="text-right">
            <span className="text-slate-400 print:text-gray-600 block mb-10">Diterima Oleh (Klien / Brand Executive):</span>
            <div className="font-bold text-slate-200 print:text-black">{reportData.meta.brandClient}</div>
            <div className="text-[11px] text-slate-500 print:text-gray-500">Media Planning & Procurement Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
}
