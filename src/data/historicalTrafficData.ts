import { WEST_JAVA_REGENCIES, WEST_JAVA_REGIONAL_CLUSTERS } from './jabarData';

export interface MonthlyTrafficPoint {
  month: string;
  shortMonth: string;
  year: number;
  dateKey: string;
  volume: number; // monthly vehicle count
  dailyAvgVolume: number;
  vacImpressions: number;
  trafficIndex: number; // base 100
  avgSpeedKmh: number;
  avgDwellTimeSec: number;
  congestionHoursPerDay: number;
  motorcyclePct: number;
  privateCarPct: number;
  publicTransitPct: number;
  freightTruckPct: number;
  growthYoY: number; // %
}

export interface HourlyTrafficPoint {
  hour: string; // e.g. "07:00"
  hourNum: number;
  weekdayVolume: number;
  weekendVolume: number;
  avgSpeedWeekday: number;
  avgSpeedWeekend: number;
  congestionScore: number; // 0-100
  isRushHour: boolean;
}

export interface RegionTrafficInsight {
  regencyName: string;
  shortName: string;
  cluster: string;
  classification: 'Metropolitan Komuter' | 'Pariwisata & Budaya' | 'Kawasan Industri & Manufaktur' | 'Pusat Pemerintahan & Agraria';
  avgDailyVolume: number;
  annualGrowthPct: number;
  peakHourMorning: string;
  peakHourEvening: string;
  busiestCorridor: string;
  topHotspots: string[];
  historicalMonthly: MonthlyTrafficPoint[];
  hourlyDiurnal: HourlyTrafficPoint[];
  seasonalIndices: { season: string; indexMultiplier: number; description: string }[];
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

// Helper to generate realistic historical monthly traffic for a region
function generateMonthlyData(
  baseDailyTraffic: number,
  baseSpeed: number,
  growthRate: number,
  modalSplit: { mc: number; car: number; pt: number; truck: number },
  isTouristHeavy: boolean = false,
  isIndustrialHeavy: boolean = false
): MonthlyTrafficPoint[] {
  const points: MonthlyTrafficPoint[] = [];
  
  // 18-month historical trend: Jan 2025 to Jun 2026
  const startYear = 2025;
  const totalMonths = 18;

  for (let i = 0; i < totalMonths; i++) {
    const year = startYear + Math.floor(i / 12);
    const monthIndex = i % 12;
    const monthName = MONTH_NAMES[monthIndex];
    const shortMonth = `${SHORT_MONTHS[monthIndex]} '${year.toString().slice(-2)}`;

    // Monthly seasonality multiplier (e.g. Lebaran mudik in March/April, Holiday in June/Dec)
    let seasonalMult = 1.0;
    if (monthIndex === 2 || monthIndex === 3) {
      // March / April: Mudik Lebaran & Ramadan shift
      seasonalMult = isTouristHeavy ? 1.28 : (isIndustrialHeavy ? 0.92 : 1.18);
    } else if (monthIndex === 5 || monthIndex === 6) {
      // June / July: Libur Sekolah & Musim Liburan
      seasonalMult = isTouristHeavy ? 1.22 : 1.04;
    } else if (monthIndex === 11) {
      // December: Libur Natal & Tahun Baru
      seasonalMult = isTouristHeavy ? 1.32 : 1.12;
    } else if (monthIndex === 0) {
      seasonalMult = 0.94; // Post holiday dip
    } else {
      seasonalMult = 0.98 + (Math.sin(i * 0.7) * 0.04);
    }

    // Compound organic growth over 18 months
    const growthFactor = 1 + (growthRate / 100) * (i / 12);
    const dailyAvg = Math.round(baseDailyTraffic * seasonalMult * growthFactor);
    const monthlyTotal = dailyAvg * 30;
    const vac = Math.round(monthlyTotal * 0.82);

    // Speed drops when volume is high
    const congestionFactor = Math.max(0.65, 1.4 - (dailyAvg / (baseDailyTraffic * 1.15)));
    const avgSpeed = Math.round(baseSpeed * congestionFactor * 10) / 10;
    const avgDwell = Math.round((280 / Math.max(12, avgSpeed)) * 10) / 10;
    const congestionHours = Math.round((4.5 + (dailyAvg / baseDailyTraffic) * 2.5) * 10) / 10;
    const trafficIndex = Math.round(100 * (dailyAvg / baseDailyTraffic));

    // Dynamic YoY growth
    const growthYoY = Math.round((growthRate + (Math.sin(i) * 1.2)) * 10) / 10;

    points.push({
      month: `${monthName} ${year}`,
      shortMonth,
      year,
      dateKey: `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`,
      volume: monthlyTotal,
      dailyAvgVolume: dailyAvg,
      vacImpressions: vac,
      trafficIndex,
      avgSpeedKmh: avgSpeed,
      avgDwellTimeSec: avgDwell,
      congestionHoursPerDay: congestionHours,
      motorcyclePct: modalSplit.mc,
      privateCarPct: modalSplit.car,
      publicTransitPct: modalSplit.pt,
      freightTruckPct: modalSplit.truck,
      growthYoY
    });
  }

  return points;
}

// Generate 24-hour diurnal profile for a region
function generateHourlyProfile(
  peakMorningHour: number,
  peakEveningHour: number,
  baseVolume: number,
  isTouristHeavy: boolean = false
): HourlyTrafficPoint[] {
  const hours: HourlyTrafficPoint[] = [];

  for (let h = 0; h < 24; h++) {
    const hourStr = `${h.toString().padStart(2, '0')}:00`;
    
    // Weekday profile
    let weekdayFactor = 0.15;
    if (h >= 0 && h < 5) {
      weekdayFactor = 0.08 + (h * 0.03);
    } else if (h >= 6 && h <= 9) {
      // Morning rush
      const dist = Math.abs(h - peakMorningHour);
      weekdayFactor = dist === 0 ? 1.0 : (dist === 1 ? 0.88 : 0.65);
    } else if (h >= 10 && h <= 15) {
      // Midday steady
      weekdayFactor = 0.62 + (Math.sin(h) * 0.05);
    } else if (h >= 16 && h <= 20) {
      // Evening rush
      const dist = Math.abs(h - peakEveningHour);
      weekdayFactor = dist === 0 ? 1.08 : (dist === 1 ? 0.94 : 0.72);
    } else {
      // Night wind down
      weekdayFactor = 0.45 - ((h - 20) * 0.1);
    }

    // Weekend profile (shifts later, tourist corridors surge midday to night)
    let weekendFactor = 0.12;
    if (h >= 0 && h < 6) {
      weekendFactor = 0.10 + (h * 0.02);
    } else if (h >= 7 && h <= 11) {
      weekendFactor = 0.55 + ((h - 7) * 0.08);
    } else if (h >= 12 && h <= 19) {
      weekendFactor = isTouristHeavy ? (1.05 + (Math.sin(h) * 0.08)) : 0.82;
    } else if (h >= 20 && h <= 23) {
      weekendFactor = isTouristHeavy ? 0.68 : 0.45;
    }

    const weekdayVol = Math.round((baseVolume / 14) * weekdayFactor);
    const weekendVol = Math.round((baseVolume / 14) * weekendFactor);

    const isRush = (h >= 7 && h <= 9) || (h >= 17 && h <= 19);
    const congestionScore = Math.min(100, Math.round(weekdayFactor * 92));
    const avgSpeedWd = Math.max(12, Math.round(48 - (congestionScore * 0.35)));
    const avgSpeedWe = Math.max(14, Math.round(48 - (weekendFactor * 28)));

    hours.push({
      hour: hourStr,
      hourNum: h,
      weekdayVolume: weekdayVol,
      weekendVolume: weekendVol,
      avgSpeedWeekday: avgSpeedWd,
      avgSpeedWeekend: avgSpeedWe,
      congestionScore,
      isRushHour: isRush
    });
  }

  return hours;
}

// Master Historical Traffic Database for West Java Regions
export const WEST_JAVA_HISTORICAL_TRAFFIC: RegionTrafficInsight[] = [
  {
    regencyName: 'Kota Bandung',
    shortName: 'Bandung',
    cluster: 'cluster_bandung_raya',
    classification: 'Pariwisata & Budaya',
    avgDailyVolume: 345000,
    annualGrowthPct: 5.8,
    peakHourMorning: '07:30',
    peakHourEvening: '17:30',
    busiestCorridor: 'Jl. Pasteur (Tol Exit) - Flyover Pasupati - Asia Afrika',
    topHotspots: ['Gerbang Tol Pasteur Exit Corridor', 'Flyover Pasupati - Cikapayang Intersection', 'Simpang Lima Asia Afrika - Sunda Hub', 'Dago Simpang Juanda Landmark'],
    historicalMonthly: generateMonthlyData(345000, 24, 5.8, { mc: 58, car: 32, pt: 8, truck: 2 }, true, false),
    hourlyDiurnal: generateHourlyProfile(7, 18, 345000, true),
    seasonalIndices: [
      { season: 'Weekend Wisata Reguler', indexMultiplier: 1.35, description: 'Lonjakan wisatawan plat B dari Jakarta via Tol Cipularang' },
      { season: 'Libur Akhir Tahun / Lebaran', indexMultiplier: 1.48, description: 'Kepadatan puncak di arteri pusat kota, Dago, dan FO' },
      { season: 'Hari Kerja Normal', indexMultiplier: 1.00, description: 'Komuter lokal pendidikan dan perkantoran' }
    ]
  },
  {
    regencyName: 'Kota Bekasi',
    shortName: 'Bekasi',
    cluster: 'cluster_bodebek',
    classification: 'Metropolitan Komuter',
    avgDailyVolume: 425000,
    annualGrowthPct: 6.4,
    peakHourMorning: '07:00',
    peakHourEvening: '18:00',
    busiestCorridor: 'Jl. Ahmad Yani (Summarecon) - Tol Jakarta-Cikampek KM 14',
    topHotspots: ['Gerbang Tol Bekasi Barat - Jl. Ahmad Yani Corridor', 'Simpang Mall Metropolitan - Kalimalang Exit', 'Flyover Summarecon Bekasi Mega Landmark'],
    historicalMonthly: generateMonthlyData(425000, 22, 6.4, { mc: 62, car: 26, pt: 9, truck: 3 }, false, false),
    hourlyDiurnal: generateHourlyProfile(7, 18, 425000, false),
    seasonalIndices: [
      { season: 'Weekday Komuter Jakarta', indexMultiplier: 1.25, description: 'Volume arus puncak harian pekerja pulang-pergi Bekasi-Jakarta' },
      { season: 'Musim Hujan & Banjir Arteri', indexMultiplier: 0.95, description: 'Kecepatan anjlok drastis ke 8-12 km/jam, dwell time iklan naik 2x' },
      { season: 'Weekend Belanja & Santai', indexMultiplier: 1.05, description: 'Pergerakan di pusat perbelanjaan Ahmad Yani & Harapan Indah' }
    ]
  },
  {
    regencyName: 'Kota Bogor',
    shortName: 'Bogor',
    cluster: 'cluster_bodebek',
    classification: 'Pusat Pemerintahan & Agraria',
    avgDailyVolume: 285000,
    annualGrowthPct: 5.2,
    peakHourMorning: '07:15',
    peakHourEvening: '17:45',
    busiestCorridor: 'Jl. Pajajaran (Baranangsiang Tol Exit) - Jalur SSA Kebun Raya',
    topHotspots: ['Gerbang Tol Baranangsiang Exit Corridor', 'Jalur SSA Kebun Raya Bogor (Tugu Kujang Circle)', 'Simpang Warung Jambu - BORR Exit Gateway'],
    historicalMonthly: generateMonthlyData(285000, 21, 5.2, { mc: 55, car: 33, pt: 10, truck: 2 }, true, false),
    hourlyDiurnal: generateHourlyProfile(7, 17, 285000, true),
    seasonalIndices: [
      { season: 'Wisata Kuliner Akhir Pekan', indexMultiplier: 1.40, description: 'Arus wisatawan dari Jakarta & Depok menuju Pajajaran & Surya Kencana' },
      { season: 'Hari Kerja Normal', indexMultiplier: 1.00, description: 'Komuter KRL & kendaraan pribadi via Jagorawi' }
    ]
  },
  {
    regencyName: 'Kota Depok',
    shortName: 'Depok',
    cluster: 'cluster_bodebek',
    classification: 'Metropolitan Komuter',
    avgDailyVolume: 315000,
    annualGrowthPct: 5.9,
    peakHourMorning: '07:00',
    peakHourEvening: '18:15',
    busiestCorridor: 'Jl. Margonda Raya (Sentra Pendidikan & Bisnis UI)',
    topHotspots: ['Simpang UI Margonda - Flyover Kelapa Dua Corridor', 'Margonda Raya Simpang Juanda Junction'],
    historicalMonthly: generateMonthlyData(315000, 20, 5.9, { mc: 66, car: 22, pt: 11, truck: 1 }, false, false),
    hourlyDiurnal: generateHourlyProfile(7, 18, 315000, false),
    seasonalIndices: [
      { season: 'Masa Perkuliahan Aktif (UI/Gunadarma)', indexMultiplier: 1.15, description: 'Aktivitas mahasiswa dan residensial sangat padat' },
      { season: 'Libur Semester / Lebaran', indexMultiplier: 0.85, description: 'Penurunan signifikan arus Margonda' }
    ]
  },
  {
    regencyName: 'Kabupaten Karawang',
    shortName: 'Karawang',
    cluster: 'cluster_pantura_industri',
    classification: 'Kawasan Industri & Manufaktur',
    avgDailyVolume: 295000,
    annualGrowthPct: 7.2,
    peakHourMorning: '06:45',
    peakHourEvening: '17:00',
    busiestCorridor: 'Tol Jakarta-Cikampek KM 48-54 & Akses KIIC / Galuh Mas',
    topHotspots: ['Tol Japek KM 48 - Simpang Susun MBZ Elevated Descent', 'Akses Tol Karawang Barat KM 47 - KIIC Industrial Entrance', 'Simpang Galuh Mas Mall Intersection'],
    historicalMonthly: generateMonthlyData(295000, 36, 7.2, { mc: 42, car: 28, pt: 6, truck: 24 }, false, true),
    hourlyDiurnal: generateHourlyProfile(7, 17, 295000, false),
    seasonalIndices: [
      { season: 'Operasional Penuh Industri', indexMultiplier: 1.10, description: 'Logistik kontainer dan shift pergantian karyawan pabrik' },
      { season: 'Arus Mudik Tol Cikampek', indexMultiplier: 1.95, description: 'Kepadatan luar biasa jalur arteri dan jalan tol' }
    ]
  },
  {
    regencyName: 'Kota Cirebon',
    shortName: 'Cirebon',
    cluster: 'cluster_pantura_industri',
    classification: 'Pusat Pemerintahan & Agraria',
    avgDailyVolume: 172000,
    annualGrowthPct: 6.1,
    peakHourMorning: '07:30',
    peakHourEvening: '17:15',
    busiestCorridor: 'Jl. Dr. Cipto Mangunkusumo (CSB Mall) - Kartini - Siliwangi',
    topHotspots: ['Jl. Dr. Cipto Mangunkusumo - CSB Mall Prime Corridor', 'Simpang Tiga Gunung Sari - Kartini Junction'],
    historicalMonthly: generateMonthlyData(172000, 26, 6.1, { mc: 60, car: 28, pt: 8, truck: 4 }, true, false),
    hourlyDiurnal: generateHourlyProfile(7, 17, 172000, true),
    seasonalIndices: [
      { season: 'Libur Budaya & Kuliner Pantura', indexMultiplier: 1.30, description: 'Wisata kuliner empal gentong & batik Trusmi' }
    ]
  },
  {
    regencyName: 'Kabupaten Bogor',
    shortName: 'Kab. Bogor',
    cluster: 'cluster_bodebek',
    classification: 'Pariwisata & Budaya',
    avgDailyVolume: 388000,
    annualGrowthPct: 6.0,
    peakHourMorning: '07:30',
    peakHourEvening: '18:00',
    busiestCorridor: 'Simpang Gadog - Ciawi Exit & Jalur Utama Wisata Puncak',
    topHotspots: ['Simpang Gadog - Ciawi Puncak Bottleneck Gateway', 'Sentul City Circuit Toll Exit Interchange'],
    historicalMonthly: generateMonthlyData(388000, 22, 6.0, { mc: 52, car: 38, pt: 6, truck: 4 }, true, false),
    hourlyDiurnal: generateHourlyProfile(8, 17, 388000, true),
    seasonalIndices: [
      { season: 'Weekend Puncak Ganjil-Genap / One Way', indexMultiplier: 1.65, description: 'Dwell time iklan mencapai 120+ detik karena antrean panjang' }
    ]
  },
  {
    regencyName: 'Kota Cimahi',
    shortName: 'Cimahi',
    cluster: 'cluster_bandung_raya',
    classification: 'Metropolitan Komuter',
    avgDailyVolume: 198000,
    annualGrowthPct: 4.8,
    peakHourMorning: '07:15',
    peakHourEvening: '17:30',
    busiestCorridor: 'Jl. Amir Machmud (Flyover Cimindi) - Alun-Alun',
    topHotspots: ['Flyover Cimindi - Jl. Amir Machmud Arterial Hub'],
    historicalMonthly: generateMonthlyData(198000, 21, 4.8, { mc: 68, car: 22, pt: 8, truck: 2 }, false, false),
    hourlyDiurnal: generateHourlyProfile(7, 17, 198000, false),
    seasonalIndices: [
      { season: 'Hari Kerja Komuter Bandung-Cimahi', indexMultiplier: 1.12, description: 'Arus harian padat merayap jam kantor' }
    ]
  },
  {
    regencyName: 'Kabupaten Bandung',
    shortName: 'Kab. Bandung',
    cluster: 'cluster_bandung_raya',
    classification: 'Pariwisata & Budaya',
    avgDailyVolume: 235000,
    annualGrowthPct: 5.1,
    peakHourMorning: '07:00',
    peakHourEvening: '17:15',
    busiestCorridor: 'Jl. Terusan Buah Batu Exit Tol KM 142 & Jalur Kopo Soreang',
    topHotspots: ['Simpang Buah Batu Exit Tol Purbaleunyi', 'Kopo Sayati Arterial Corridor'],
    historicalMonthly: generateMonthlyData(235000, 23, 5.1, { mc: 63, car: 27, pt: 6, truck: 4 }, true, false),
    hourlyDiurnal: generateHourlyProfile(7, 17, 235000, true),
    seasonalIndices: [
      { season: 'Wisata Alam Ciwidey & Pangalengan', indexMultiplier: 1.42, description: 'Lonjakan akhir pekan menuju objek wisata pegunungan' }
    ]
  },
  {
    regencyName: 'Kota Tasikmalaya',
    shortName: 'Tasikmalaya',
    cluster: 'cluster_priangan',
    classification: 'Pusat Pemerintahan & Agraria',
    avgDailyVolume: 144000,
    annualGrowthPct: 4.6,
    peakHourMorning: '07:30',
    peakHourEvening: '16:45',
    busiestCorridor: 'Jl. HZ Mustofa (Pusat Perbelanjaan & UMKM Priangan Timur)',
    topHotspots: ['Jl. HZ Mustofa Sentra Bisnis Priangan'],
    historicalMonthly: generateMonthlyData(144000, 27, 4.6, { mc: 65, car: 24, pt: 8, truck: 3 }, false, false),
    hourlyDiurnal: generateHourlyProfile(7, 17, 144000, false),
    seasonalIndices: [
      { season: 'Bulan Ramadan & Lebaran', indexMultiplier: 1.45, description: 'Pusat belanja busana muslim & bordir Priangan Timur' }
    ]
  },
  {
    regencyName: 'Kabupaten Purwakarta',
    shortName: 'Purwakarta',
    cluster: 'cluster_pantura_industri',
    classification: 'Kawasan Industri & Manufaktur',
    avgDailyVolume: 212000,
    annualGrowthPct: 5.4,
    peakHourMorning: '07:00',
    peakHourEvening: '17:15',
    busiestCorridor: 'Tol Cipularang KM 82-88 & Simpang Sadang',
    topHotspots: ['Simpang Sadang Purwakarta Arterial Gate'],
    historicalMonthly: generateMonthlyData(212000, 38, 5.4, { mc: 45, car: 33, pt: 6, truck: 16 }, false, true),
    hourlyDiurnal: generateHourlyProfile(7, 17, 212000, false),
    seasonalIndices: [
      { season: 'Akhir Pekan Wisata Kuliner Sate Maranggi', indexMultiplier: 1.30, description: 'Pengunjung transit dari Jakarta menuju Bandung' }
    ]
  },
  {
    regencyName: 'Kabupaten Subang',
    shortName: 'Subang',
    cluster: 'cluster_pantura_industri',
    classification: 'Kawasan Industri & Manufaktur',
    avgDailyVolume: 182000,
    annualGrowthPct: 7.5,
    peakHourMorning: '07:00',
    peakHourEvening: '17:00',
    busiestCorridor: 'Akses Tol Cipali KM 109 & Koridor Pelabuhan Patimban',
    topHotspots: ['Akses Tol Cipali KM 109 Subang'],
    historicalMonthly: generateMonthlyData(182000, 39, 7.5, { mc: 48, car: 30, pt: 6, truck: 16 }, false, true),
    hourlyDiurnal: generateHourlyProfile(7, 17, 182000, false),
    seasonalIndices: [
      { season: 'Ekspansi Patimban & Musim Mudik Cipali', indexMultiplier: 1.70, description: 'Lonjakan lalu lintas koridor pantura dan jalur logistik' }
    ]
  }
];

// Helper function to get aggregate statistics across all regions or a filtered set
export function getAggregateTrafficTrend(regencyNames?: string[]): MonthlyTrafficPoint[] {
  const filtered = (!regencyNames || regencyNames.length === 0 || regencyNames.includes('Semua'))
    ? WEST_JAVA_HISTORICAL_TRAFFIC
    : WEST_JAVA_HISTORICAL_TRAFFIC.filter(r => regencyNames.includes(r.regencyName));

  if (filtered.length === 0) return WEST_JAVA_HISTORICAL_TRAFFIC[0].historicalMonthly;

  const monthCount = filtered[0].historicalMonthly.length;
  const aggregate: MonthlyTrafficPoint[] = [];

  for (let i = 0; i < monthCount; i++) {
    const template = filtered[0].historicalMonthly[i];
    let totalVolume = 0;
    let totalDaily = 0;
    let totalVac = 0;
    let sumSpeed = 0;
    let sumDwell = 0;
    let sumCongestionHours = 0;
    let sumIndex = 0;
    let sumGrowth = 0;
    let sumMc = 0;
    let sumCar = 0;
    let sumPt = 0;
    let sumTruck = 0;

    filtered.forEach(r => {
      const p = r.historicalMonthly[i];
      totalVolume += p.volume;
      totalDaily += p.dailyAvgVolume;
      totalVac += p.vacImpressions;
      sumSpeed += p.avgSpeedKmh;
      sumDwell += p.avgDwellTimeSec;
      sumCongestionHours += p.congestionHoursPerDay;
      sumIndex += p.trafficIndex;
      sumGrowth += p.growthYoY;
      sumMc += p.motorcyclePct;
      sumCar += p.privateCarPct;
      sumPt += p.publicTransitPct;
      sumTruck += p.freightTruckPct;
    });

    const count = filtered.length;

    aggregate.push({
      month: template.month,
      shortMonth: template.shortMonth,
      year: template.year,
      dateKey: template.dateKey,
      volume: totalVolume,
      dailyAvgVolume: totalDaily,
      vacImpressions: totalVac,
      trafficIndex: Math.round(sumIndex / count),
      avgSpeedKmh: Math.round((sumSpeed / count) * 10) / 10,
      avgDwellTimeSec: Math.round((sumDwell / count) * 10) / 10,
      congestionHoursPerDay: Math.round((sumCongestionHours / count) * 10) / 10,
      motorcyclePct: Math.round(sumMc / count),
      privateCarPct: Math.round(sumCar / count),
      publicTransitPct: Math.round(sumPt / count),
      freightTruckPct: Math.round(sumTruck / count),
      growthYoY: Math.round((sumGrowth / count) * 10) / 10
    });
  }

  return aggregate;
}

// Multi-region comparison trend helper
export function getComparativeMonthlyTrend(regions: string[]): { month: string; shortMonth: string; [regionKey: string]: any }[] {
  const targetRegions = WEST_JAVA_HISTORICAL_TRAFFIC.filter(r => regions.includes(r.regencyName));
  if (targetRegions.length === 0) return [];

  const sample = targetRegions[0].historicalMonthly;
  return sample.map((pt, idx) => {
    const row: any = {
      month: pt.month,
      shortMonth: pt.shortMonth,
      dateKey: pt.dateKey
    };

    targetRegions.forEach(r => {
      const monthData = r.historicalMonthly[idx];
      row[r.shortName] = Math.round(monthData.dailyAvgVolume / 1000); // in thousands of vehicles / day
      row[`${r.shortName}_speed`] = monthData.avgSpeedKmh;
      row[`${r.shortName}_dwell`] = monthData.avgDwellTimeSec;
    });

    return row;
  });
}
