import { BillboardSpot } from '../types/ooh';

export type SaturationLevel = 
  | 'high_saturation'      // Red Ocean: >75% Clutter, Heavy Competitor Dominance
  | 'moderate_presence'    // Yellow/Orange: 45-75% Competitor Clutter
  | 'untapped_opportunity'; // Blue Ocean: <45% Clutter, High Traffic, Prime Uncaptured Space

export interface CompetitorZone {
  id: string;
  name: string;
  regency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  saturationLevel: SaturationLevel;
  clutterScore: number; // 0 - 100
  occupancyRatePct: number; // %
  dominantCompetitorSectors: string[];
  activeCompetitorBrands: string[];
  vacDailyTotal: number;
  untappedMarketRationale: string;
  opportunityRecommendation: 'Pasar Jenuh (Red Ocean)' | 'Persaingan Moderat' | 'Peluang Terbuka (Untapped Blue Ocean)';
  recommendedStrategy: string;
}

// Preset Zona Konsentrasi Iklan Kompetitor & Ruang Pasar Terbuka di Jawa Barat
export const WEST_JAVA_COMPETITOR_ZONES: CompetitorZone[] = [
  {
    id: 'zone-bdg-asia-afrika',
    name: 'Koridor Finansial & Heritage Asia Afrika Bandung',
    regency: 'Kota Bandung',
    coordinates: { lat: -6.9215, lng: 107.6145 },
    radiusMeters: 1400,
    saturationLevel: 'high_saturation',
    clutterScore: 92,
    occupancyRatePct: 95,
    dominantCompetitorSectors: ['Perbankan & Fintech', 'BUMN & Korporasi', 'Pariwisata'],
    activeCompetitorBrands: ['Bank BJB', 'Bank BCA', 'Bank Mandiri', 'Telkom Indonesia'],
    vacDailyTotal: 345000,
    untappedMarketRationale: 'Sangat jenuh dengan iklan perbankan & jasa finansial. Share of voice sangat terpecah.',
    opportunityRecommendation: 'Pasar Jenuh (Red Ocean)',
    recommendedStrategy: 'Pilih LED Videotron lengkung resolusi tinggi jika ingin head-to-head, atau alihkan ke koridor alternatif yang belum dikuasai perbankan.'
  },
  {
    id: 'zone-bdg-pasteur',
    name: 'Pintu Gerbang Tol Pasteur & Pasupati',
    regency: 'Kota Bandung',
    coordinates: { lat: -6.8942, lng: 107.5855 },
    radiusMeters: 1800,
    saturationLevel: 'high_saturation',
    clutterScore: 89,
    occupancyRatePct: 90,
    dominantCompetitorSectors: ['Telekomunikasi & Provider', 'Otomotif & Oli', 'E-Commerce'],
    activeCompetitorBrands: ['Telkomsel 5G', 'Indosat Ooredoo', 'Toyota Astra', 'Shopee'],
    vacDailyTotal: 410000,
    untappedMarketRationale: 'Titik pertarungan utama brand nasional. Tarif premium dengan tingkat persaingan visual ekstrem.',
    opportunityRecommendation: 'Pasar Jenuh (Red Ocean)',
    recommendedStrategy: 'Gunakan Megatron raksasa atau JPO berukuran besar untuk mendominasi ketinggian pandang komuter tol.'
  },
  {
    id: 'zone-bdg-dago',
    name: 'Sentra Kampus & Gaya Hidup Dago Cikapayang',
    regency: 'Kota Bandung',
    coordinates: { lat: -6.8885, lng: 107.6138 },
    radiusMeters: 1300,
    saturationLevel: 'moderate_presence',
    clutterScore: 68,
    occupancyRatePct: 75,
    dominantCompetitorSectors: ['Fashion & Lifestyle', 'F&B & Kafe', 'Aplikasi Digital & Edukasi'],
    activeCompetitorBrands: ['Shopee', 'Erigo', 'McDonalds', 'By.U Telkomsel'],
    vacDailyTotal: 260000,
    untappedMarketRationale: 'Kawasan favorit Gen-Z & mahasiswa ITB/Unpad. Brand teknologi gadget & skincare masih minim dominasi.',
    opportunityRecommendation: 'Persaingan Moderat',
    recommendedStrategy: 'Peluang strategis bagi brand Gadget, Smartphone, dan Beauty D2C untuk merebut top-of-mind generasi muda.'
  },
  {
    id: 'zone-bdg-buah-batu',
    name: 'Koridor ByPass Soekarno Hatta - Buah Batu (Akses Selatan)',
    regency: 'Kota Bandung',
    coordinates: { lat: -6.9452, lng: 107.6325 },
    radiusMeters: 1600,
    saturationLevel: 'untapped_opportunity',
    clutterScore: 38,
    occupancyRatePct: 40,
    dominantCompetitorSectors: ['Dealer Otomotif Lokal', 'Semen & Material', 'Properti'],
    activeCompetitorBrands: ['Daihatsu Bandung', 'Semen Tiga Roda'],
    vacDailyTotal: 295000,
    untappedMarketRationale: 'Volume sirkulasi 220.000+ kendaraan/hari dengan kehadiran kompetitor brand nasional yang sangat minim.',
    opportunityRecommendation: 'Peluang Terbuka (Untapped Blue Ocean)',
    recommendedStrategy: 'Titik emas terbuka (Untapped Space)! Pasang iklan brand perbankan ritel, FMCG, atau EV untuk dominasi 100% tanpa gangguan kompetitor.'
  },
  {
    id: 'zone-dpk-margonda',
    name: 'Sentra Koridor Margonda Raya (UI - Margo City)',
    regency: 'Kota Depok',
    coordinates: { lat: -6.3725, lng: 106.8328 },
    radiusMeters: 1500,
    saturationLevel: 'high_saturation',
    clutterScore: 88,
    occupancyRatePct: 88,
    dominantCompetitorSectors: ['E-Commerce & Dompet Digital', 'Properti & Apartemen Komuter', 'FMCG'],
    activeCompetitorBrands: ['Gojek', 'Tokopedia', 'Podomoro Golf View', 'Kopi Kenangan'],
    vacDailyTotal: 380000,
    untappedMarketRationale: 'Jalur komuter padat 24 jam dengan kepadatan media luar ruang tinggi. Waktu tempuh lambat memberi impresi maksimal.',
    opportunityRecommendation: 'Pasar Jenuh (Red Ocean)',
    recommendedStrategy: 'Prioritaskan titik dekat jembatan penyeberangan (JPO) atau LED videotron tepat di depan mall Margo City.'
  },
  {
    id: 'zone-dpk-juanda-tol',
    name: 'Simpang Tol Cijago - Juanda Depok Timur',
    regency: 'Kota Depok',
    coordinates: { lat: -6.3812, lng: 106.8485 },
    radiusMeters: 1400,
    saturationLevel: 'untapped_opportunity',
    clutterScore: 32,
    occupancyRatePct: 35,
    dominantCompetitorSectors: ['Retail Lokal', 'Kuliner Daerah'],
    activeCompetitorBrands: ['Mie Gacoan', 'Perumahan Pesona'],
    vacDailyTotal: 240000,
    untappedMarketRationale: 'Akses baru lingkar tol Cijago dengan pertumbuhan arus komuter bandara yang melonjak, namun belum banyak dilirik brand korporat.',
    opportunityRecommendation: 'Peluang Terbuka (Untapped Blue Ocean)',
    recommendedStrategy: 'Sangat cocok untuk brand perbankan, asuransi, dan otomotif keluarga yang ingin menjangkau komuter elit Depok-Cibubur.'
  },
  {
    id: 'zone-bks-ahmad-yani',
    name: 'Koridor CBD Ahmad Yani - Summarecon Bekasi Barat',
    regency: 'Kota Bekasi',
    coordinates: { lat: -6.2345, lng: 106.9982 },
    radiusMeters: 1700,
    saturationLevel: 'high_saturation',
    clutterScore: 94,
    occupancyRatePct: 92,
    dominantCompetitorSectors: ['Properti Kota Mandiri', 'Finansial & Bank BUMN', 'Otomotif'],
    activeCompetitorBrands: ['Summarecon Bekasi', 'Bank Mandiri', 'Wuling Motors', 'BCA Prioritas'],
    vacDailyTotal: 460000,
    untappedMarketRationale: 'Jantung ekonomi Kota Bekasi dengan persaingan ketat antar pengembang properti & lembaga perbankan.',
    opportunityRecommendation: 'Pasar Jenuh (Red Ocean)',
    recommendedStrategy: 'Gunakan visual dinamis pada LED videotron vertikal untuk mencuri perhatian dari baliho properti statis sekitar.'
  },
  {
    id: 'zone-bks-cibubur',
    name: 'Kawasan Segitiga Emas Transyogi Cibubur - Kranggan',
    regency: 'Kota Bekasi',
    coordinates: { lat: -6.3762, lng: 106.9185 },
    radiusMeters: 1500,
    saturationLevel: 'moderate_presence',
    clutterScore: 65,
    occupancyRatePct: 70,
    dominantCompetitorSectors: ['Perumahan Mewah', 'Sekolah Internasional & RS', 'Otomotif SUV'],
    activeCompetitorBrands: ['CitraGran', 'Kota Wisata Sinarmas', 'RS Meilia'],
    vacDailyTotal: 310000,
    untappedMarketRationale: 'Kantong hunian SES A/B paling makmur di perbatasan Bekasi-Bogor-Depok. Iklan brand perbankan kekayaan & EV masih terbuka lebar.',
    opportunityRecommendation: 'Persaingan Moderat',
    recommendedStrategy: 'Fokuskan pada pesan eksklusif kekayaan (Wealth Management / EV) saat komuter pulang kerja dari Jakarta.'
  },
  {
    id: 'zone-bgr-pajajaran',
    name: 'Pusat Kota Pajajaran - Tugu Kujang & Botani Square',
    regency: 'Kota Bogor',
    coordinates: { lat: -6.6012, lng: 106.8062 },
    radiusMeters: 1300,
    saturationLevel: 'high_saturation',
    clutterScore: 86,
    occupancyRatePct: 88,
    dominantCompetitorSectors: ['FMCG Makanan', 'Pariwisata & Hotel', 'Perbankan'],
    activeCompetitorBrands: ['Indofood', 'The 1O1 Hotel', 'Bank BJB', 'Grab'],
    vacDailyTotal: 320000,
    untappedMarketRationale: 'Titik nol kilometer Kota Bogor dengan sirkulasi wisatawan Jakarta yang padat di akhir pekan.',
    opportunityRecommendation: 'Pasar Jenuh (Red Ocean)',
    recommendedStrategy: 'Pilih titik berhadapan langsung dengan arus keluar tol Jagorawi Baranangsiang.'
  },
  {
    id: 'zone-krw-kiic',
    name: 'Kawasan Industri Internasional KIIC - Gerbang Tol Karawang Barat',
    regency: 'Kabupaten Karawang',
    coordinates: { lat: -6.3312, lng: 107.2885 },
    radiusMeters: 2000,
    saturationLevel: 'untapped_opportunity',
    clutterScore: 42,
    occupancyRatePct: 45,
    dominantCompetitorSectors: ['Alat Berat & Ban', 'Logistik & Truk', 'Pabrik Jepang'],
    activeCompetitorBrands: ['Bridgestone', 'Toyota Logistics'],
    vacDailyTotal: 360000,
    untappedMarketRationale: 'Pusat manufaktur terbesar se-Asia Tenggara dengan puluhan ribu ekspatriat dan pimpinan pabrik, namun reklame modern sangat minim!',
    opportunityRecommendation: 'Peluang Terbuka (Untapped Blue Ocean)',
    recommendedStrategy: 'Peluang emas bagi brand Business-to-Business (B2B), Perbankan Korporasi, Maskapai Penerbangan, dan Otomotif Premium.'
  },
  {
    id: 'zone-crb-cipto',
    name: 'Kawasan Pusat Bisnis & CSB Mall Jl. Cipto Cirebon',
    regency: 'Kota Cirebon',
    coordinates: { lat: -6.7215, lng: 108.5525 },
    radiusMeters: 1400,
    saturationLevel: 'moderate_presence',
    clutterScore: 62,
    occupancyRatePct: 65,
    dominantCompetitorSectors: ['Pusat Gadget & HP', 'Kuliner & Wisata Pantura', 'Finansial'],
    activeCompetitorBrands: ['OPPO Mobile', 'Vivo', 'BCA Cirebon'],
    vacDailyTotal: 210000,
    untappedMarketRationale: 'Kawasan paling prestisius di Wilayah III Cirebon. Brand fashion global & produk keluarga masih belum mendominasi.',
    opportunityRecommendation: 'Persaingan Moderat',
    recommendedStrategy: 'Tempatkan materi visual pada LED videotron depan CSB Mall untuk menguasai pusat perbelanjaan satu-satunya di Cirebon.'
  }
];

// Helper to determine competitor footprint on an individual spot
export interface SpotCompetitorEvaluation {
  spot: BillboardSpot;
  hasCompetitorOccupancy: boolean;
  occupyingBrand?: string;
  clutterLevel: 'Rendah (Unobstructed)' | 'Sedang (Normal)' | 'Tinggi (Kompetitif)';
  isUntappedSpace: boolean; // Spot is Available or has Low Clutter
  opportunityType: 'Untapped Goldmine' | 'High Competition Zone' | 'Balanced Growth';
  opportunityBadgeColor: string;
  surroundingZone?: CompetitorZone;
}

export function evaluateSpotCompetitorPresence(spot: BillboardSpot): SpotCompetitorEvaluation {
  const isOccupied = spot.occupancyStatus === 'Occupied';
  const hasCompetitor = isOccupied && !!spot.currentBrand;

  // Find nearest competitor zone within radius
  const surroundingZone = WEST_JAVA_COMPETITOR_ZONES.find(zone => {
    const dLat = (spot.coordinates.lat - zone.coordinates.lat) * 111;
    const dLng = (spot.coordinates.lng - zone.coordinates.lng) * 111 * Math.cos(zone.coordinates.lat * (Math.PI / 180));
    const distM = Math.sqrt(dLat * dLat + dLng * dLng) * 1000;
    return distM <= zone.radiusMeters;
  });

  const isUntappedSpace = !isOccupied || spot.clutterLevel === 'Rendah (Unobstructed)' || (surroundingZone?.saturationLevel === 'untapped_opportunity');

  let opportunityType: 'Untapped Goldmine' | 'High Competition Zone' | 'Balanced Growth' = 'Balanced Growth';
  let opportunityBadgeColor = '#f59e0b'; // Amber

  if (isUntappedSpace && spot.vacDaily > 120000) {
    opportunityType = 'Untapped Goldmine';
    opportunityBadgeColor = '#10b981'; // Emerald
  } else if (hasCompetitor || spot.clutterLevel === 'Tinggi (Kompetitif)' || surroundingZone?.saturationLevel === 'high_saturation') {
    opportunityType = 'High Competition Zone';
    opportunityBadgeColor = '#ef4444'; // Red
  }

  return {
    spot,
    hasCompetitorOccupancy: hasCompetitor,
    occupyingBrand: spot.currentBrand,
    clutterLevel: spot.clutterLevel,
    isUntappedSpace,
    opportunityType,
    opportunityBadgeColor,
    surroundingZone
  };
}
