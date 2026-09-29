import { useState } from 'react';
import { BillboardSpot } from '../types/ooh';
import { 
  Target, 
  BarChart2, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';

interface EffectivenessAnalysisProps {
  spots: BillboardSpot[];
  onSelectSpot: (spot: BillboardSpot) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
}

export function EffectivenessAnalysis({
  spots,
  onSelectSpot,
  onOpenDetailModal
}: EffectivenessAnalysisProps) {
  // Spot comparator selection
  const [spotAId, setSpotAId] = useState<string>(spots[0]?.id || '');
  const [spotBId, setSpotBId] = useState<string>(spots[1]?.id || '');

  // Matrix filter
  const [matrixFilter, setMatrixFilter] = useState<'all' | 'videotron' | 'megatron' | 'billboard'>('all');

  const spotA = spots.find(s => s.id === spotAId) || spots[0];
  const spotB = spots.find(s => s.id === spotBId) || spots[1];

  const filteredSpotsForMatrix = spots.filter(s => {
    if (matrixFilter === 'videotron') return s.type === 'LED Videotron';
    if (matrixFilter === 'megatron') return s.type === 'Megatron';
    if (matrixFilter === 'billboard') return s.type === 'Static Billboard';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Description */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Target className="w-4 h-4" />
              <span>Metodologi Evaluasi Titik Reklame</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Analisis Efektivitas Lokasi Penempatan Media Iklan Luar Ruang
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Pengukuran multi-variabel untuk menentukan nilai investasi media OOH/DOOH di koridor strategis Jawa Barat berdasarkan kombinasi volume arus, durasi pandang audiens, sudut pandang bebas rintangan, dan kepadatan kompetisi.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Indeks Efektivitas Jabar</span>
              <span className="text-lg font-mono font-bold text-cyan-400">
                {(spots.reduce((a, b) => a + b.effectivenessScore, 0) / spots.length).toFixed(1)} / 100
              </span>
            </div>
          </div>
        </div>

        {/* 5-Factor Evaluation Formula Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">1. Gross Reach</span>
              <span className="font-mono text-amber-400 font-bold">30%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Volume total kendaraan dan pejalan kaki harian melintasi lokasi.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">2. Dwell Time</span>
              <span className="font-mono text-amber-400 font-bold">25%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Durasi kontak visual audiens akibat lampu merah, simpang, atau antrean tol.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">3. Line-of-Sight</span>
              <span className="font-mono text-amber-400 font-bold">20%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sudut hadap tegak lurus, elevasi, dan nihil halangan pohon/tiang.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">4. Clutter Index</span>
              <span className="font-mono text-amber-400 font-bold">15%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tingkat kepadatan papan reklame pesaing dalam radius 200 meter.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">5. Zona Komersial</span>
              <span className="font-mono text-amber-400 font-bold">10%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tingkat konsumsi audiens dan kedekatan pusat belanja/bisnis premium.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: 4-Quadrant Strategic Placement Matrix */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Matriks Kuadran Efektivitas Penempatan</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pemetaan posisi setiap titik reklame berdasarkan Rasio Volume (Reach) terhadap Durasi Pandang (Dwell Time).
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setMatrixFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                matrixFilter === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({spots.length})
            </button>
            <button
              onClick={() => setMatrixFilter('videotron')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                matrixFilter === 'videotron' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Videotron LED
            </button>
            <button
              onClick={() => setMatrixFilter('megatron')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                matrixFilter === 'megatron' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Megatron Tol
            </button>
            <button
              onClick={() => setMatrixFilter('billboard')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                matrixFilter === 'billboard' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Billboard Statis
            </button>
          </div>
        </div>

        {/* 4 Quadrants Visual Diagram */}
        <div className="relative w-full h-96 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden p-4">
          {/* Axis Labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
            ▲ Durasi Pandang Tinggi (Dwell Time &gt; 45s)
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
            ▼ Kecepatan Cepat (Dwell Time &lt; 30s)
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 -rotate-90 origin-center">
            Jangkauan Terfokus
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 rotate-90 origin-center">
            Jangkauan Masif (&gt; 250k)
          </div>

          {/* Quadrant Divider Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-800/80 border-r border-dashed border-slate-700/60" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-800/80 border-b border-dashed border-slate-700/60" />

          {/* Quadrant Labels */}
          <div className="absolute top-6 left-6 text-xs pointer-events-none">
            <span className="font-bold text-amber-400/90 block">KUADRAN III: FOCUSED ATTENTION</span>
            <span className="text-[11px] text-slate-500">Dwell Tinggi · Audiens Terpusat (Kafe/Retail Dago/Riau)</span>
          </div>

          <div className="absolute top-6 right-6 text-xs text-right pointer-events-none">
            <span className="font-bold text-cyan-400 block">KUADRAN I: PRIME HIGH-IMPACT</span>
            <span className="text-[11px] text-slate-500">Reach Masif + Dwell Lama (Simpang Lima, Margonda, Pasteur)</span>
          </div>

          <div className="absolute bottom-6 left-6 text-xs pointer-events-none">
            <span className="font-bold text-slate-500 block">KUADRAN IV: SECONDARY EXPANSION</span>
            <span className="text-[11px] text-slate-600">Arteri Sekunder Penyangga (Garut, Sukabumi, Cirebon)</span>
          </div>

          <div className="absolute bottom-6 right-6 text-xs text-right pointer-events-none">
            <span className="font-bold text-purple-400 block">KUADRAN II: TRANSIT VELOCITY</span>
            <span className="text-[11px] text-slate-500">Reach Ekstrem Tinggi + Kecepatan Tol Cepat (Tol Japek, Cipali)</span>
          </div>

          {/* Plot Billboard Points */}
          {filteredSpotsForMatrix.map((spot) => {
            // Normalize X: Reach 100k to 440k => 8% to 92%
            const minReach = 100000;
            const maxReach = 440000;
            const leftPct = Math.min(92, Math.max(8, ((spot.dailyGrossReach - minReach) / (maxReach - minReach)) * 100));

            // Normalize Y: Dwell 15s to 75s => 10% to 90% (Invert because top is 0%)
            const minDwell = 15;
            const maxDwell = 75;
            const bottomPct = Math.min(88, Math.max(10, ((spot.avgDwellTimeSec - minDwell) / (maxDwell - minDwell)) * 100));
            const topPct = 100 - bottomPct;

            const isPrime = spot.effectivenessScore >= 92;

            return (
              <div
                key={spot.id}
                onClick={() => onSelectSpot(spot)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 hover:z-30"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-transform duration-200 group-hover:scale-150 ${
                    isPrime 
                      ? 'bg-cyan-400 border-white ring-2 ring-cyan-400/50' 
                      : spot.dailyGrossReach > 260000 
                      ? 'bg-purple-500 border-white' 
                      : 'bg-amber-400 border-slate-900'
                  }`}
                />
                
                {/* Micro tooltip */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 text-white text-[10px] px-2.5 py-1.5 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                  <div className="font-bold text-amber-400">{spot.name}</div>
                  <div className="text-slate-300 font-mono text-[9px]">
                    Reach: {spot.dailyGrossReach.toLocaleString('id-ID')} · Dwell: {spot.avgDwellTimeSec}s · Indeks: {spot.effectivenessScore}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40"></span>
              <span>Kuadran I: Brand Launch & Dominasi Maksimal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>Kuadran II: Slogan & Awareness Komuter Tol</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Kuadran III: Pesan Detail & Engagement Gaya Hidup</span>
            </span>
          </div>
          <span className="font-mono text-slate-500">Klik titik untuk melihat analisis spesifik</span>
        </div>
      </div>

      {/* Section 3: Head-to-Head Spot Comparator */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white">Komparator Efektivitas Antar Lokasi (Head-to-Head)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Bandingkan 2 lokasi billboard berbeda di Jawa Barat untuk menentukan alokasi media plan yang paling efisien.
          </p>
        </div>

        {/* Spot Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <label className="text-xs font-semibold text-amber-400 block mb-2">Lokasi A (Benchmark Primer)</label>
            <select
              value={spotAId}
              onChange={(e) => setSpotAId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
            >
              {spots.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name} ({s.regency})</option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <label className="text-xs font-semibold text-cyan-400 block mb-2">Lokasi B (Komparasi Alternatif)</label>
            <select
              value={spotBId}
              onChange={(e) => setSpotBId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              {spots.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name} ({s.regency})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Metric Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Parameter Analisis</th>
                <th className="py-2.5 px-3 font-bold text-amber-400">{spotA.name}</th>
                <th className="py-2.5 px-3 font-bold text-cyan-400">{spotB.name}</th>
                <th className="py-2.5 px-3 font-semibold text-right">Analisis Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300">Wilayah & Koridor Jalan</td>
                <td className="py-2.5 px-3 text-slate-200">{spotA.regency} · {spotA.roadType}</td>
                <td className="py-2.5 px-3 text-slate-200">{spotB.regency} · {spotB.roadType}</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-sans">-</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300">Tipe Media & Dimensi</td>
                <td className="py-2.5 px-3 text-slate-200">{spotA.type} ({spotA.dimensions.areaM2} m²)</td>
                <td className="py-2.5 px-3 text-slate-200">{spotB.type} ({spotB.dimensions.areaM2} m²)</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-sans">
                  {spotA.dimensions.areaM2 > spotB.dimensions.areaM2 ? 'Spot A Lebih Besar' : 'Spot B Lebih Besar'}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300">Gross Reach Harian (DGR)</td>
                <td className="py-2.5 px-3 text-amber-400 font-bold tabular-nums">
                  {spotA.dailyGrossReach.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-cyan-400 font-bold tabular-nums">
                  {spotB.dailyGrossReach.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {spotA.dailyGrossReach >= spotB.dailyGrossReach ? (
                    <span className="text-amber-400">+{((spotA.dailyGrossReach - spotB.dailyGrossReach) / spotB.dailyGrossReach * 100).toFixed(0)}% (A Unggul)</span>
                  ) : (
                    <span className="text-cyan-400">+{((spotB.dailyGrossReach - spotA.dailyGrossReach) / spotA.dailyGrossReach * 100).toFixed(0)}% (B Unggul)</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300">Visibility Adjusted Contacts (VAC)</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">{spotA.vacDaily.toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">{spotB.vacDaily.toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                  Selisih {Math.abs(spotA.vacDaily - spotB.vacDaily).toLocaleString('id-ID')} kontak
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300">Rata-rata Durasi Pandang (Dwell)</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">{spotA.avgDwellTimeSec} detik</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">{spotB.avgDwellTimeSec} detik</td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {spotA.avgDwellTimeSec > spotB.avgDwellTimeSec ? (
                    <span className="text-amber-400">Spot A +{spotA.avgDwellTimeSec - spotB.avgDwellTimeSec}s lebih lama</span>
                  ) : (
                    <span className="text-cyan-400">Spot B +{spotB.avgDwellTimeSec - spotA.avgDwellTimeSec}s lebih lama</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300">Cost Per Mille (CPM Efektif)</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">Rp {spotA.cpmIdr.toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">Rp {spotB.cpmIdr.toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-sans">
                  {spotA.cpmIdr < spotB.cpmIdr ? (
                    <span className="text-emerald-400">Spot A Lebih Ekonomis (-Rp {(spotB.cpmIdr - spotA.cpmIdr).toLocaleString('id-ID')})</span>
                  ) : (
                    <span className="text-emerald-400">Spot B Lebih Ekonomis (-Rp {(spotA.cpmIdr - spotB.cpmIdr).toLocaleString('id-ID')})</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300">Tarif Sewa Bulanan (IDR)</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">Rp {(spotA.ratePerMonthIdr / 1000000).toFixed(0)} Juta</td>
                <td className="py-2.5 px-3 text-slate-200 tabular-nums">Rp {(spotB.ratePerMonthIdr / 1000000).toFixed(0)} Juta</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-400 font-sans">
                  Selisih Rp {Math.abs(spotA.ratePerMonthIdr - spotB.ratePerMonthIdr) / 1000000} Juta
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 font-bold bg-slate-950/60">
                <td className="py-3 px-3 font-sans text-white">Indeks Efektivitas Komposit</td>
                <td className="py-3 px-3 text-amber-400 text-sm tabular-nums">{spotA.effectivenessScore} / 100</td>
                <td className="py-3 px-3 text-cyan-400 text-sm tabular-nums">{spotB.effectivenessScore} / 100</td>
                <td className="py-3 px-3 text-right text-xs font-sans">
                  {spotA.effectivenessScore >= spotB.effectivenessScore ? (
                    <span className="text-amber-400">Spot A Rekomendasi Unggul</span>
                  ) : (
                    <span className="text-cyan-400">Spot B Rekomendasi Unggul</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Strategic Recommendation Box */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Rekomendasi Strategis Penempatan Kampanye:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {spotA.dailyGrossReach > spotB.dailyGrossReach ? (
              <>
                Pilihlah <strong>{spotA.name}</strong> jika tujuan kampanye adalah <em>Mass Reach & Awareness Skala Besar</em> untuk menjangkau {spotA.dailyGrossReach.toLocaleString('id-ID')} audiens komuter harian. 
                Sebaliknya, pilihlah <strong>{spotB.name}</strong> jika prioritas brand adalah <em>Dwell Time / Attention Span</em> yang lebih panjang dengan efisiensi CPM yang lebih terukur.
              </>
            ) : (
              <>
                Pilihlah <strong>{spotB.name}</strong> untuk skala jangkauan kontak tertinggi ({spotB.dailyGrossReach.toLocaleString('id-ID')} audiens harian). Gunakan format visual dengan kontras tinggi dan headline ringkas agar terbaca maksimal oleh pengendara.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
