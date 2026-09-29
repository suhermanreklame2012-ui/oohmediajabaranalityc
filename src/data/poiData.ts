import { BillboardSpot } from '../types/ooh';

export type PoiCategory = 
  | 'Mall & Shopping' 
  | 'CBD & Office' 
  | 'Campus & School' 
  | 'Transit Hub & Toll' 
  | 'Hospital & Health' 
  | 'Industrial Estate' 
  | 'Residential & Elite Housing' 
  | 'Tourism & Leisure';

export interface SpotPoiDetail {
  id: string;
  name: string;
  category: PoiCategory;
  distanceMeters: number;
  highlightText: string;
}

export interface BrandIndustryProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  idealPoiCategories: PoiCategory[];
  preferredRoadTypes: string[];
  primarySes: ('SES A+' | 'SES A' | 'SES B' | 'SES C')[];
  recommendedBillboardTypes: string[];
  keyPerformanceDriver: string;
}

// Preset Daftar Industri Merk
export const BRAND_INDUSTRY_PROFILES: BrandIndustryProfile[] = [
  {
    id: 'banking_fintech',
    name: 'Perbankan, Fintech & Investasi',
    icon: '🏦',
    description: 'Bank BUMN/Swasta, dompet digital, sekuritas, paylater & asuransi',
    idealPoiCategories: ['CBD & Office', 'Mall & Shopping', 'Transit Hub & Toll'],
    preferredRoadTypes: ['Arteri Primer', 'Kawasan Komersial & Pusat Bisnis'],
    primarySes: ['SES A+', 'SES A', 'SES B'],
    recommendedBillboardTypes: ['LED Videotron', 'Megatron'],
    keyPerformanceDriver: 'Tingkat kepercayaan publik tinggi di simpul finansial & dwell time lampu merah'
  },
  {
    id: 'fmcg_food',
    name: 'FMCG, Makanan & Minuman (F&B)',
    icon: '🛒',
    description: 'Makanan cepat saji, kopi kekinian, bumbu dapur, minuman kemasan, dairy',
    idealPoiCategories: ['Mall & Shopping', 'Residential & Elite Housing', 'Campus & School'],
    preferredRoadTypes: ['Arteri Primer', 'Arteri Sekunder', 'Kolektor Perkotaan'],
    primarySes: ['SES A', 'SES B', 'SES C'],
    recommendedBillboardTypes: ['LED Videotron', 'Static Billboard', 'JPO Pedestrian Bridge'],
    keyPerformanceDriver: 'Frekuensi paparan berulang & kedekatan dengan titik penjualan ritel'
  },
  {
    id: 'automotive_ev',
    name: 'Otomotif (Mobil, EV & Motor)',
    icon: '🚗',
    description: 'Kendaraan listrik (EV), SUV, sepeda motor matic, ban & oli pelumas',
    idealPoiCategories: ['Transit Hub & Toll', 'Industrial Estate', 'CBD & Office'],
    preferredRoadTypes: ['Jalan Tol Bebas Hambatan', 'Arteri Primer'],
    primarySes: ['SES A+', 'SES A', 'SES B'],
    recommendedBillboardTypes: ['Megatron', 'Static Billboard', 'LED Videotron'],
    keyPerformanceDriver: 'Jarak pandang jauh di jalan tol & paparan langsung ke pengendara mobil'
  },
  {
    id: 'gadget_tech',
    name: 'Gadget, Smartphone & Elektronik',
    icon: '📱',
    description: 'Smartphone flagship, laptop, operator seluler, smart TV & wearables',
    idealPoiCategories: ['Mall & Shopping', 'Campus & School', 'CBD & Office'],
    preferredRoadTypes: ['Kawasan Komersial & Pusat Bisnis', 'Arteri Primer'],
    primarySes: ['SES A+', 'SES A', 'SES B'],
    recommendedBillboardTypes: ['LED Videotron', 'Megatron'],
    keyPerformanceDriver: 'Visual resolusi tinggi LED di sentra teknologi & pusat perkuliahan'
  },
  {
    id: 'fashion_beauty',
    name: 'Fashion, Kosmetik & Skincare',
    icon: '🛍️',
    description: 'Pakaian ritel, skincare lokal & global, parfum, kacamata & aksesori',
    idealPoiCategories: ['Mall & Shopping', 'Campus & School', 'Tourism & Leisure'],
    preferredRoadTypes: ['Kawasan Komersial & Pusat Bisnis', 'Arteri Sekunder'],
    primarySes: ['SES A', 'SES B'],
    recommendedBillboardTypes: ['LED Videotron', 'JPO Pedestrian Bridge'],
    keyPerformanceDriver: 'Pencahayaan warna akurat & kedekatan dengan lifestyle mall'
  },
  {
    id: 'property_living',
    name: 'Properti, Residensial & Perumahan',
    icon: '🏢',
    description: 'Perumahan baru, apartemen komuter, kota mandiri, ruko komersial',
    idealPoiCategories: ['Transit Hub & Toll', 'Residential & Elite Housing', 'CBD & Office'],
    preferredRoadTypes: ['Jalan Tol Bebas Hambatan', 'Arteri Primer'],
    primarySes: ['SES A+', 'SES A'],
    recommendedBillboardTypes: ['Megatron', 'Static Billboard'],
    keyPerformanceDriver: 'Ukuran raksasa di koridor tol kepulangan komuter menuju perumahan'
  },
  {
    id: 'education_university',
    name: 'Pendidikan & Kampus',
    icon: '🎓',
    description: 'Penerimaan mahasiswa baru perguruan tinggi, kursus bahasa & edtech',
    idealPoiCategories: ['Campus & School', 'Transit Hub & Toll', 'Residential & Elite Housing'],
    preferredRoadTypes: ['Arteri Sekunder', 'Kawasan Komersial & Pusat Bisnis'],
    primarySes: ['SES A', 'SES B', 'SES C'],
    recommendedBillboardTypes: ['Static Billboard', 'LED Videotron', 'JPO Pedestrian Bridge'],
    keyPerformanceDriver: 'Konsentrasi tinggi populasi usia sekolah & koridor antar-kota'
  },
  {
    id: 'healthcare_pharma',
    name: 'Kesehatan, Rumah Sakit & Farmasi',
    icon: '🏥',
    description: 'Rumah sakit spesialis, vitamin suplemen, klinik kecantikan & asuransi jiwa',
    idealPoiCategories: ['Hospital & Health', 'Residential & Elite Housing', 'CBD & Office'],
    preferredRoadTypes: ['Arteri Primer', 'Arteri Sekunder'],
    primarySes: ['SES A+', 'SES A', 'SES B'],
    recommendedBillboardTypes: ['LED Videotron', 'Static Billboard'],
    keyPerformanceDriver: 'Pesan informatif dengan dwell time tinggi di kawasan padat hunian'
  }
];

// Database Pemetaan Point of Interest (POI) per Titik Reklame di Jawa Barat
export const SPOT_POI_MAP: Record<string, SpotPoiDetail[]> = {
  'spot-01': [ // Simpang Lima Asia Afrika Bandung
    { id: 'poi-bdg-1', name: 'Alun-Alun & Masjid Raya Bandung', category: 'Tourism & Leisure', distanceMeters: 450, highlightText: 'Pusat wisata sejarah & pejalan kaki' },
    { id: 'poi-bdg-2', name: 'Kantor Pusat Bank BJB & Koridor Finansial', category: 'CBD & Office', distanceMeters: 200, highlightText: 'Pusat kantor perbankan & korporasi' },
    { id: 'poi-bdg-3', name: 'The Trans Luxury Hotel & Trans Studio Mall', category: 'Mall & Shopping', distanceMeters: 1400, highlightText: 'Mall keluarga & hotel bintang lima' },
    { id: 'poi-bdg-4', name: 'Stasiun Kereta Api Bandung (KAI)', category: 'Transit Hub & Toll', distanceMeters: 1800, highlightText: 'Pintu gerbang kereta antar-kota' }
  ],
  'spot-02': [ // Tol Pasteur Exit Bandung
    { id: 'poi-bdg-5', name: 'Gerbang Tol Pasteur (Tol Cipularang / Padaleunyi)', category: 'Transit Hub & Toll', distanceMeters: 150, highlightText: 'Pintu masuk-keluar utama Jakarta-Bandung' },
    { id: 'poi-bdg-6', name: 'Paris Van Java Resort Lifestyle Mall', category: 'Mall & Shopping', distanceMeters: 1600, highlightText: 'Tujuan belanja & kuliner utama turis' },
    { id: 'poi-bdg-7', name: 'Universitas Kristen Maranatha', category: 'Campus & School', distanceMeters: 850, highlightText: 'Kampus swasta ternama Bandung Barat' },
    { id: 'poi-bdg-8', name: 'BTC Fashion Mall & Hotel Pasteur Corridor', category: 'Mall & Shopping', distanceMeters: 400, highlightText: 'Pusat belanja busana & hotel transit' }
  ],
  'spot-03': [ // Dago Simpang McDonald Bandung
    { id: 'poi-bdg-9', name: 'Institut Teknologi Bandung (ITB Ganesha)', category: 'Campus & School', distanceMeters: 650, highlightText: 'Pusat universitas teknik nomor satu' },
    { id: 'poi-bdg-10', name: 'Kawasan Factory Outlet & Cafe Dago', category: 'Mall & Shopping', distanceMeters: 250, highlightText: 'Hangout Gen-Z & wisata belanja' },
    { id: 'poi-bdg-11', name: 'Rumah Sakit Borromeus Dago', category: 'Hospital & Health', distanceMeters: 550, highlightText: 'Rumah sakit swasta rujukan' },
    { id: 'poi-bdg-12', name: 'Universitas Padjadjaran (Kampus Dipatiukur)', category: 'Campus & School', distanceMeters: 900, highlightText: 'Pusat ribuan mahasiswa pascasarjana' }
  ],
  'spot-04': [ // Riau Junction Bandung
    { id: 'poi-bdg-13', name: 'Riau Junction Supermarket & Mall', category: 'Mall & Shopping', distanceMeters: 80, highlightText: 'Pusat belanja groceries premium keluarga' },
    { id: 'poi-bdg-14', name: 'Heritage Factory Outlet & Distro Hub', category: 'Mall & Shopping', distanceMeters: 200, highlightText: 'Sentra fashion muda & turis akhir pekan' },
    { id: 'poi-bdg-15', name: 'Gedung Sate & Kantor Gubernur Jabar', category: 'CBD & Office', distanceMeters: 950, highlightText: 'Pusat administrasi pemerintahan provinsi' },
    { id: 'poi-bdg-16', name: 'Banda Gourmet Dining Street', category: 'Tourism & Leisure', distanceMeters: 350, highlightText: 'Kawasan restoran keluarga & eksekutif' }
  ],
  'spot-05': [ // Supratman Gasibu Bandung
    { id: 'poi-bdg-17', name: 'Lapangan Gasibu & Monumen Perjuangan', category: 'Tourism & Leisure', distanceMeters: 300, highlightText: 'Pusat olahraga & event massal publik' },
    { id: 'poi-bdg-18', name: 'Pusat Perkantoran Telkom Landmark Tower Jabar', category: 'CBD & Office', distanceMeters: 450, highlightText: 'Pusat industri digital & telekomunikasi' },
    { id: 'poi-bdg-19', name: 'Universitas Widyatama & Itenas', category: 'Campus & School', distanceMeters: 1200, highlightText: 'Koridor kampus mahasiswa Cikutra' }
  ],
  'spot-06': [ // Soekarno Hatta Buah Batu Bandung
    { id: 'poi-bdg-20', name: 'Gerbang Tol Buah Batu (Tol Padaleunyi)', category: 'Transit Hub & Toll', distanceMeters: 750, highlightText: 'Akses komuter Bandung Selatan & timur' },
    { id: 'poi-bdg-21', name: 'Telkom University Smart Campus (Dayeuhkolot)', category: 'Campus & School', distanceMeters: 1800, highlightText: 'Kampus teknologi dengan 30.000+ mahasiswa' },
    { id: 'poi-bdg-22', name: 'Metro Trade Center & Sentra Otomotif ByPass', category: 'Mall & Shopping', distanceMeters: 600, highlightText: 'Dealer mobil & pusat suku cadang' }
  ],
  'spot-07': [ // Ahmad Yani Summarecon Bekasi
    { id: 'poi-bks-1', name: 'Summarecon Mall Bekasi (SMB)', category: 'Mall & Shopping', distanceMeters: 350, highlightText: 'Mall gaya hidup terpadu & pusat kuliner' },
    { id: 'poi-bks-2', name: 'Kompleks Pemkot Bekasi & Stadion Patriot', category: 'CBD & Office', distanceMeters: 550, highlightText: 'Pusat pemerintahan kota & olahraga' },
    { id: 'poi-bks-3', name: 'Gerbang Tol Bekasi Barat 1 & 2', category: 'Transit Hub & Toll', distanceMeters: 650, highlightText: 'Akses utama komuter Jakarta-Cikampek' },
    { id: 'poi-bks-4', name: 'Stasiun LRT Jabodebek Bekasi Barat', category: 'Transit Hub & Toll', distanceMeters: 700, highlightText: 'Transit kereta layang harian ke Kuningan/Dukuh Atas' }
  ],
  'spot-08': [ // Tol Jakarta-Cikampek KM 14 Bekasi
    { id: 'poi-bks-5', name: 'Ruas Jalan Tol Jakarta - Cikampek Layang MBZ', category: 'Transit Hub & Toll', distanceMeters: 0, highlightText: 'Jalur komuter logistik & antar-kota terpadat di Asia' },
    { id: 'poi-bks-6', name: 'Metropolitan Mall Bekasi & Grand Metropolitan', category: 'Mall & Shopping', distanceMeters: 900, highlightText: 'Pusat belanja modern tertua & teramai' },
    { id: 'poi-bks-7', name: 'Sentra Otomotif & Logistik Kalimalang', category: 'Industrial Estate', distanceMeters: 1100, highlightText: 'Gudang distribusi & dealer komersial' }
  ],
  'spot-09': [ // Tol Cibubur Plaza Kranggan Bekasi
    { id: 'poi-bks-8', name: 'Plaza Cibubur & Cibubur Junction', category: 'Mall & Shopping', distanceMeters: 600, highlightText: 'Mall persimpangan Bekasi-Bogor-Depok' },
    { id: 'poi-bks-9', name: 'Kawasan Residensial Elit CitraGran & Kota Wisata', category: 'Residential & Elite Housing', distanceMeters: 400, highlightText: 'Hunian SES A/B dengan daya beli sangat tinggi' },
    { id: 'poi-bks-10', name: 'Gerbang Tol Cibubur (Tol Jagorawi)', category: 'Transit Hub & Toll', distanceMeters: 850, highlightText: 'Arus masuk ribuan mobil eksekutif tiap pagi' }
  ],
  'spot-10': [ // Margonda Raya Margo City Depok
    { id: 'poi-dpk-1', name: 'Margo City Mall & Depok Town Square (Detos)', category: 'Mall & Shopping', distanceMeters: 150, highlightText: 'Pusat gaya hidup & retail no. 1 di Kota Depok' },
    { id: 'poi-dpk-2', name: 'Universitas Indonesia (UI) Kampus Depok', category: 'Campus & School', distanceMeters: 450, highlightText: 'Kampus terbesar Indonesia dengan 45.000+ civitas' },
    { id: 'poi-dpk-3', name: 'Stasiun KRL Pondok Cina & UI', category: 'Transit Hub & Toll', distanceMeters: 300, highlightText: 'Stasiun komuter commuterline Jakarta-Bogor' },
    { id: 'poi-dpk-4', name: 'Universitas Gunadarma Margonda', category: 'Campus & School', distanceMeters: 400, highlightText: 'Kampus teknik komputer & ekonomi' }
  ],
  'spot-11': [ // Juanda Simpang Margonda Depok
    { id: 'poi-dpk-5', name: 'Gerbang Tol Margonda (Tol Cijago / Cengkareng-Kunciran)', category: 'Transit Hub & Toll', distanceMeters: 500, highlightText: 'Akses lingkar luar menuju Bandara Soetta & Cibubur' },
    { id: 'poi-dpk-6', name: 'Pusat Kuliner & Restoran Keluarga Margonda', category: 'Tourism & Leisure', distanceMeters: 200, highlightText: 'Ratusan gerai F&B nasional & internasional' },
    { id: 'poi-dpk-7', name: 'Pesona Square Mall Depok', category: 'Mall & Shopping', distanceMeters: 800, highlightText: 'Mall modern keluarga & bioskop' }
  ],
  'spot-12': [ // Pajajaran Tugu Kujang Bogor
    { id: 'poi-bgr-1', name: 'Tugu Kujang & Monumen Landmark Kota Bogor', category: 'Tourism & Leisure', distanceMeters: 50, highlightText: 'Titik nol kilometer & ikon kebanggaan Bogor' },
    { id: 'poi-bgr-2', name: 'Botani Square Mall & IPB Convention Center', category: 'Mall & Shopping', distanceMeters: 200, highlightText: 'Pusat perbelanjaan paling prestisius di Bogor' },
    { id: 'poi-bgr-3', name: 'Institut Pertanian Bogor (IPB Baranangsiang)', category: 'Campus & School', distanceMeters: 250, highlightText: 'Kampus pascasarjana & riset agribisnis' },
    { id: 'poi-bgr-4', name: 'Terminal Baranangsiang & Exit Tol Jagorawi', category: 'Transit Hub & Toll', distanceMeters: 350, highlightText: 'Pintu gerbang utama keluar tol Jagorawi' }
  ],
  'spot-13': [ // Simpang Gadog Puncak Bogor
    { id: 'poi-bgr-5', name: 'Pintu Tol Ciawi / Gadog (Tol Jagorawi KM 44)', category: 'Transit Hub & Toll', distanceMeters: 200, highlightText: 'Titik awal jalur liburan wisata Puncak' },
    { id: 'poi-bgr-6', name: 'Kawasan Wisata Puncak & Villa Resort', category: 'Tourism & Leisure', distanceMeters: 500, highlightText: 'Destinasi liburan keluarga Jakarta & domestik' },
    { id: 'poi-bgr-7', name: 'Sentra Kuliner Oleh-oleh & Restoran Sunda Gadog', category: 'Tourism & Leisure', distanceMeters: 150, highlightText: 'Tempat singgah puluhan ribu kendaraan per hari' }
  ],
  'spot-14': [ // KIIC Interchange Tol Karawang Barat
    { id: 'poi-krw-1', name: 'Kawasan Industri Karawang International Industrial City (KIIC)', category: 'Industrial Estate', distanceMeters: 300, highlightText: 'Pabrik manufaktur Toyota, Daihatsu, Yamaha, Sharp' },
    { id: 'poi-krw-2', name: 'Gerbang Tol Karawang Barat (Tol Jakarta-Cikampek)', category: 'Transit Hub & Toll', distanceMeters: 450, highlightText: 'Gerbang ribuan kendaraan logistik & mobil pimpinan' },
    { id: 'poi-krw-3', name: 'Resinda Park Mall Karawang', category: 'Mall & Shopping', distanceMeters: 1800, highlightText: 'Mall terbesar & hotel bintang empat Karawang' },
    { id: 'poi-krw-4', name: 'Stasiun Kereta Cepat Whoosh Karawang', category: 'Transit Hub & Toll', distanceMeters: 3500, highlightText: 'Stasiun kereta cepat Jakarta-Bandung' }
  ],
  'spot-15': [ // Cipto Mangunkusumo CSB Mall Cirebon
    { id: 'poi-crb-1', name: 'Cirebon Super Block Mall (CSB Mall)', category: 'Mall & Shopping', distanceMeters: 100, highlightText: 'Mall no. 1 di Wilayah III Cirebon & Pantura' },
    { id: 'poi-crb-2', name: 'Kawasan Bisnis & Perbankan Jl. Cipto', category: 'CBD & Office', distanceMeters: 200, highlightText: 'Jantung ekonomi & pertokoan modern kota Cirebon' },
    { id: 'poi-crb-3', name: 'Stasiun Kereta Api Cirebon Kejaksan', category: 'Transit Hub & Toll', distanceMeters: 1500, highlightText: 'Stasiun persimpangan jalur lintas utara & selatan Jawa' },
    { id: 'poi-crb-4', name: 'Sentra Wisata Kuliner Empal Gentong & Batik Trusmi', category: 'Tourism & Leisure', distanceMeters: 1200, highlightText: 'Daya tarik turis domestik lintas Jawa' }
  ]
};

// Fallback generator POI cerdas untuk spot yang belum terdaftar secara manual
export function getSpotPois(spot: BillboardSpot): SpotPoiDetail[] {
  if (SPOT_POI_MAP[spot.id]) {
    return SPOT_POI_MAP[spot.id];
  }

  // Generate POI berbasis regency & tipe jalan
  const defaultPois: SpotPoiDetail[] = [];
  
  if (spot.roadType === 'Jalan Tol Bebas Hambatan') {
    defaultPois.push({
      id: `${spot.id}-poi-1`,
      name: `Gerbang Tol & Rest Area Koridor ${spot.regency}`,
      category: 'Transit Hub & Toll',
      distanceMeters: 400,
      highlightText: 'Arus kendaraan antar-kota & komuter cepat'
    });
    defaultPois.push({
      id: `${spot.id}-poi-2`,
      name: `Kawasan Logistik & Pergudangan ${spot.regency}`,
      category: 'Industrial Estate',
      distanceMeters: 1200,
      highlightText: 'Akses armada distribusi & komersial'
    });
  } else if (spot.roadType === 'Kawasan Komersial & Pusat Bisnis') {
    defaultPois.push({
      id: `${spot.id}-poi-1`,
      name: `Pusat Perbelanjaan & Lifestyle Hub ${spot.district}`,
      category: 'Mall & Shopping',
      distanceMeters: 250,
      highlightText: 'Pusat belanja harian & hangout'
    });
    defaultPois.push({
      id: `${spot.id}-poi-2`,
      name: `Kompleks Ruko Bisnis & Perbankan ${spot.regency}`,
      category: 'CBD & Office',
      distanceMeters: 300,
      highlightText: 'Sentra transaksi finansial & jasa'
    });
  } else {
    defaultPois.push({
      id: `${spot.id}-poi-1`,
      name: `Pusat Keramaian & Simpang Arteri ${spot.roadName}`,
      category: 'Transit Hub & Toll',
      distanceMeters: 200,
      highlightText: 'Simpul kepadatan lalu lintas harian'
    });
    defaultPois.push({
      id: `${spot.id}-poi-2`,
      name: `Kawasan Hunian & Perumahan ${spot.district}`,
      category: 'Residential & Elite Housing',
      distanceMeters: 600,
      highlightText: 'Basis populasi komuter harian keluarga'
    });
  }

  return defaultPois;
}

// Algoritma Evaluasi & Skor Kecocokan Penempatan Merk (Brand-Placement Matching Engine)
export interface BrandPlacementEvaluation {
  spot: BillboardSpot;
  pois: SpotPoiDetail[];
  overallMatchScore: number;       // 0 - 100%
  poiMatchScore: number;           // 0 - 100%
  demographicFitScore: number;     // 0 - 100%
  exposureQualityScore: number;    // 0 - 100%
  costEfficiencyScore: number;     // 0 - 100%
  matchingPois: SpotPoiDetail[];
  strategicRationale: string;
  recommendedTag: 'Pilihan Utama (Top Pick)' | 'Sangat Direkomendasikan' | 'Alternatif Strategis';
  monthlyGrossReach: number;
  monthlyVac: number;
  monthlyGrossImpressions: number; // monthlyVac * estimated loop frequency
  estimatedUniqueReach: number;
  estimatedFrequency: number;
  costEstimateIdr: number;
  effectiveCpmIdr: number;
}

export function evaluateSpotForBrand(
  spot: BillboardSpot,
  industryId: string,
  targetSes: string[],
  campaignGoal: 'awareness' | 'conversion' | 'dwell' | 'cpm',
  durationMonths: number,
  discountFactor: number = 1.0
): BrandPlacementEvaluation {
  const profile = BRAND_INDUSTRY_PROFILES.find(p => p.id === industryId) || BRAND_INDUSTRY_PROFILES[0];
  const pois = getSpotPois(spot);

  // 1. POI Matching Score (Seberapa banyak POI relevan di sekitar titik)
  const matchingPois = pois.filter(poi => profile.idealPoiCategories.includes(poi.category));
  let poiScore = 50; // baseline
  if (matchingPois.length > 0) {
    // Closer distance yields higher score
    const avgDistance = matchingPois.reduce((acc, p) => acc + p.distanceMeters, 0) / matchingPois.length;
    const distanceBonus = Math.max(0, 30 - (avgDistance / 50));
    poiScore = Math.min(100, 65 + (matchingPois.length * 10) + distanceBonus);
  }

  // 2. Demographic & Road Type Fit Score
  let demoScore = 70;
  if (profile.preferredRoadTypes.includes(spot.roadType)) {
    demoScore += 18;
  }
  if (profile.recommendedBillboardTypes.includes(spot.type)) {
    demoScore += 12;
  }
  demoScore = Math.min(100, demoScore);

  // 3. Exposure Quality Score (VAC / Dwell / Visibility)
  const dwellWeight = Math.min(100, (spot.avgDwellTimeSec / 60) * 100);
  const exposureScore = Math.round((spot.visibilityScore * 0.4) + (dwellWeight * 0.3) + (spot.effectivenessScore * 0.3));

  // 4. Cost Efficiency Score
  const costScore = Math.min(100, Math.max(40, 100 - (spot.cpmIdr / 350)));

  // Combine by Campaign Goal
  let overallScore = 0;
  if (campaignGoal === 'awareness') {
    overallScore = (poiScore * 0.30) + (exposureScore * 0.35) + (demoScore * 0.20) + (costScore * 0.15);
  } else if (campaignGoal === 'conversion') {
    overallScore = (poiScore * 0.45) + (demoScore * 0.25) + (exposureScore * 0.20) + (costScore * 0.10);
  } else if (campaignGoal === 'dwell') {
    overallScore = (dwellWeight * 0.40) + (poiScore * 0.25) + (exposureScore * 0.20) + (demoScore * 0.15);
  } else { // cpm
    overallScore = (costScore * 0.45) + (poiScore * 0.25) + (exposureScore * 0.15) + (demoScore * 0.15);
  }

  overallScore = Math.min(99, Math.max(55, Math.round(overallScore)));

  // Tag determination
  const recommendedTag: 'Pilihan Utama (Top Pick)' | 'Sangat Direkomendasikan' | 'Alternatif Strategis' = 
    overallScore >= 90 ? 'Pilihan Utama (Top Pick)' :
    overallScore >= 80 ? 'Sangat Direkomendasikan' : 'Alternatif Strategis';

  // Strategic Rationale Generator
  const topPoi = matchingPois[0] || pois[0];
  let rationale = '';
  if (matchingPois.length > 0) {
    rationale = `Sangat selaras dengan kategori ${profile.name} karena berjarak ${topPoi.distanceMeters}m dari ${topPoi.name} (${topPoi.category}), menjamin paparan tepat sasaran bagi ${spot.targetDemographics}.`;
  } else {
    rationale = `Koridor ${spot.roadName} memiliki kepadatan lalu lintas ${spot.dailyGrossReach.toLocaleString('id-ID')} kontak/hari dengan visibilitas tinggi (${spot.visibilityScore}/100) dan dwell time ${spot.avgDwellTimeSec} detik.`;
  }

  // Monthly Calculations
  const monthlyGrossReach = spot.dailyGrossReach * 30;
  const monthlyVac = spot.vacDaily * 30;
  const monthlyGrossImpressions = Math.round(monthlyVac * (spot.type === 'LED Videotron' ? 1.6 : 1.2));
  
  // Estimated Unique Reach (Deduplicated based on frequency curve)
  const estimatedFrequency = spot.avgFrequency || (spot.roadType === 'Jalan Tol Bebas Hambatan' ? 2.8 : 4.4);
  const estimatedUniqueReach = Math.round(monthlyGrossReach / estimatedFrequency);

  // Discounted Rate
  const costEstimateIdr = Math.round(spot.ratePerMonthIdr * durationMonths * discountFactor);
  const effectiveCpmIdr = monthlyVac > 0 ? Math.round((costEstimateIdr / (monthlyVac * durationMonths)) * 1000) : spot.cpmIdr;

  return {
    spot,
    pois,
    overallMatchScore: overallScore,
    poiMatchScore: Math.round(poiScore),
    demographicFitScore: demoScore,
    exposureQualityScore: exposureScore,
    costEfficiencyScore: Math.round(costScore),
    matchingPois,
    strategicRationale: rationale,
    recommendedTag,
    monthlyGrossReach,
    monthlyVac,
    monthlyGrossImpressions,
    estimatedUniqueReach,
    estimatedFrequency,
    costEstimateIdr,
    effectiveCpmIdr
  };
}
