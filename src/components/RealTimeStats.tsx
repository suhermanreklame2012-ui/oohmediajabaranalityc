import { useState, useEffect } from 'react';
import { BillboardSpot } from '../types/ooh';
import { WEST_JAVA_REGENCIES } from '../data/jabarData';
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  CloudRain, 
  Sun, 
  Car, 
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface RealTimeStatsProps {
  spots: BillboardSpot[];
  onSelectSpot: (spot: BillboardSpot) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
}

export function RealTimeStats({ spots, onSelectSpot, onOpenDetailModal }: RealTimeStatsProps) {
  // Live ticker simulation
  const [liveGrossReach, setLiveGrossReach] = useState<number>(() => {
    return spots.reduce((acc, s) => acc + s.dailyGrossReach, 0);
  });
  const [liveVac, setLiveVac] = useState<number>(() => {
    return spots.reduce((acc, s) => acc + s.vacDaily, 0);
  });
  const [tickerPulse, setTickerPulse] = useState<boolean>(false);

  // Weather condition simulation
  const [weatherIndex, setWeatherIndex] = useState<number>(0);
  const weatherStates = [
    { city: 'Kota Bandung', condition: 'Cerah Berawan', temp: 24, factor: 1.0, icon: Sun, text: 'Arus Dago & Asia Afrika lancar, jarak pandang optimal hingga 350m' },
    { city: 'Bekasi - Cikampek', condition: 'Padat Merayap', temp: 31, factor: 1.15, icon: AlertTriangle, text: 'Kepadatan KM 14 - KM 19 meningkatkan Dwell Time pengendara +22%' },
    { city: 'Kota Bogor', condition: 'Hujan Ringan', temp: 23, factor: 0.94, icon: CloudRain, text: 'Kecepatan kendaraan menurun di Simpang Tugu Kujang, perhatian billboard tetap tinggi' }
  ];

  // Dynamic heartbeat interval
  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 85) + 35;
      setLiveGrossReach(prev => prev + increment);
      setLiveVac(prev => prev + Math.floor(increment * 0.88));
      setTickerPulse(true);
      setTimeout(() => setTickerPulse(false), 400);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Weather rotate
  useEffect(() => {
    const weatherTimer = setInterval(() => {
      setWeatherIndex(prev => (prev + 1) % weatherStates.length);
    }, 6000);
    return () => clearInterval(weatherTimer);
  }, [weatherStates.length]);

  // Aggregate metrics
  const totalSpots = spots.length;
  const occupiedSpots = spots.filter(s => s.occupancyStatus === 'Occupied').length;
  const occupancyRate = totalSpots > 0 ? (occupiedSpots / totalSpots) * 100 : 0;
  const avgDwellTime = totalSpots > 0 ? Math.round(spots.reduce((acc, s) => acc + s.avgDwellTimeSec, 0) / totalSpots) : 0;
  const avgCpm = totalSpots > 0 ? Math.round(spots.reduce((acc, s) => acc + s.cpmIdr, 0) / totalSpots) : 0;

  // Hourly curve data (24 hours)
  const hourlyData = [
    { hour: '00:00', traffic: 12 },
    { hour: '02:00', traffic: 8 },
    { hour: '04:00', traffic: 15 },
    { hour: '06:00', traffic: 54 },
    { hour: '07:30', traffic: 98, note: 'Peak Pagi (Komuter Tol & Kantor)' },
    { hour: '09:00', traffic: 76 },
    { hour: '11:00', traffic: 68 },
    { hour: '12:30', traffic: 82, note: 'Makan Siang & Niaga' },
    { hour: '14:00', traffic: 70 },
    { hour: '16:00', traffic: 85 },
    { hour: '17:30', traffic: 100, note: 'Peak Sore (Macet Arteri & Tol Exit)' },
    { hour: '19:30', traffic: 92, note: 'Aktivitas Malam & Kuliner' },
    { hour: '21:00', traffic: 64 },
    { hour: '22:30', traffic: 38 }
  ];

  // Top 5 Highest Performing Spots
  const topSpots = [...spots].sort((a, b) => b.effectivenessScore - a.effectivenessScore).slice(0, 5);

  const currentWeather = weatherStates[weatherIndex];
  const WeatherIcon = currentWeather.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Real-Time Stream Status & Weather Advisory */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <Zap className={`w-5 h-5 transition-transform duration-300 ${tickerPulse ? 'scale-125 text-amber-300' : 'scale-100'}`} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">Live Telemetry Pulse</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">Jaringan Sensor OOH Jawa Barat</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Pemantauan arus pergerakan kendaraan dan estimasi kontak mata audiens terhubung langsung ke {totalSpots} titik reklame.
            </p>
          </div>
        </div>

        {/* Live Weather / Corridor Advisory pill */}
        <div className="flex items-center gap-3 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg w-full md:w-auto">
          <WeatherIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{currentWeather.city}</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400">{currentWeather.condition} ({currentWeather.temp}°C)</span>
            </div>
            <p className="text-slate-400 text-[11px] line-clamp-1">{currentWeather.text}</p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (High density, tabular figures, no pill enclosures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Gross Reach Hari Ini (DGR)</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {liveGrossReach.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <span className="text-emerald-400 font-mono font-medium">+14.2%</span>
            <span>vs pekan lalu</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Kontak Tertarget (VAC)</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {liveVac.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <span className="font-mono text-slate-300">88.4%</span>
            <span>rasio visibilitas bersih</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Rata-rata Dwell Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
              {avgDwellTime}
            </span>
            <span className="text-xs text-slate-400">detik</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <span className="text-slate-300">Simpang Arteri: 52s</span>
            <span>·</span>
            <span className="text-slate-400">Tol: 24s</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Tingkat Keterisian</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-300 tabular-nums">
              {occupancyRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <span className="font-mono text-slate-200">{occupiedSpots} Terisi</span>
            <span>/</span>
            <span className="font-mono text-slate-400">{totalSpots - occupiedSpots} Tersedia</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Rata-rata CPM Jabar</span>
            <span className="text-xs font-mono text-amber-400">IDR</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-400">Rp</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {avgCpm.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <span>per 1.000 tayangan terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Section 2: Hourly Traffic Distribution & Modality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Traffic Flow Curve */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Distribusi Arus Lalu Lintas 24 Jam (Jawa Barat)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pola kepadatan kendaraan komuter pada koridor arteri primer dan jalan tol Trans Jawa.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
                <span>Peak Traffic Index</span>
              </span>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="mt-4 pt-2">
            <div className="h-48 w-full flex items-end justify-between gap-1.5 sm:gap-2 px-2">
              {hourlyData.map((d, i) => {
                const heightPct = d.traffic;
                const isPeak = d.traffic >= 90;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 bg-slate-950 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      <span className="font-bold">{d.hour}</span>: {d.traffic}% Beban
                      {d.note && <span className="block text-amber-400 font-sans">{d.note}</span>}
                    </div>

                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isPeak 
                          ? 'bg-gradient-to-t from-amber-500/80 to-amber-300 hover:from-amber-400 hover:to-amber-200' 
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-500 mt-2 rotate-45 sm:rotate-0 origin-left">
                      {d.hour.slice(0, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3 mt-4">
              <span>00:00 (Dini Hari)</span>
              <span>07:30 (Rush Hour Pagi)</span>
              <span>12:30 (Siang)</span>
              <span>17:30 (Rush Hour Pulang)</span>
              <span>23:00 (Malam)</span>
            </div>
          </div>
        </div>

        {/* Modality & Demographics Share */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Komposisi Moda Kendaraan Jawa Barat</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rata-rata proporsi audiens bergerak berdasarkan survei titik OOH.
            </p>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-cyan-400"></span>
                    Sepeda Motor (Roda Dua)
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">58.4%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '58.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-amber-400"></span>
                    Mobil Penumpang Pribadi
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">31.8%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '31.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-purple-400"></span>
                    Angkutan Umum & Bus
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">5.6%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: '5.6%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-emerald-400"></span>
                    Truk Komersial & Logistik
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">4.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '4.2%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 mt-6">
            <span className="font-semibold text-slate-200 block mb-0.5">Analisis Audiens:</span>
            Pangsa pengendara roda dua mendominasi koridor dalam kota (Dago, Margonda, HZ Mustofa), sedangkan mobil pribadi dan armada logistik mendominasi koridor tol Jakarta-Cikampek, Pasteur, dan Cipali.
          </div>
        </div>
      </div>

      {/* Section 3: Top Performing Billboard Spots */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">5 Titik Reklame Berkinerja Tertinggi di Jawa Barat</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Diurutkan berdasarkan komposit Indeks Efektivitas Penempatan (Jangkauan, Dwell Time, Visibilitas).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Q3-2026 Audit</span>
        </div>

        <div className="divide-y divide-slate-800">
          {topSpots.map((spot, index) => (
            <div
              key={spot.id}
              onClick={() => onSelectSpot(spot)}
              className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 font-mono font-bold text-xs text-amber-400 border border-slate-800">
                  #{index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {spot.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">{spot.code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
                    <span>{spot.regency}</span>
                    <span>·</span>
                    <span>{spot.roadName}</span>
                    <span>·</span>
                    <span className="text-slate-300">{spot.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs sm:self-center ml-10 sm:ml-0">
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Daily Reach</span>
                  <span className="font-mono font-semibold text-white tabular-nums">
                    {spot.dailyGrossReach.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Dwell Time</span>
                  <span className="font-mono font-semibold text-amber-400 tabular-nums">
                    {spot.avgDwellTimeSec}s
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Indeks Efektivitas</span>
                  <span className="font-mono font-bold text-cyan-400 tabular-nums">
                    {spot.effectivenessScore}/100
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetailModal(spot);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded hover:bg-slate-800"
                  title="Lihat Detail Analisis"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
