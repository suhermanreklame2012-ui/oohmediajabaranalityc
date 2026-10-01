import { BillboardSpot } from '../types/ooh';

export interface TrafficHeatPoint {
  id: string;
  lat: number;
  lng: number;
  intensity: number; // 0.1 to 1.0
  name: string;
  roadName: string;
  regency: string;
  avgVolumePerHour: number;
  peakMorningVolume: number;
  peakEveningVolume: number;
  regularVolume: number;
  congestionLevel: 'Lancar' | 'Ramai Lancar' | 'Padat Merayap' | 'Macet Total';
  oohOpportunity: string;
  recommendedFormat: string;
}

export const WEST_JAVA_TRAFFIC_HOTSPOTS: TrafficHeatPoint[] = [
  // --- KOTA BANDUNG & BANDUNG RAYA ---
  {
    id: 'th-bdg-1',
    lat: -6.8924,
    lng: 107.5794,
    intensity: 0.98,
    name: 'Gerbang Tol Pasteur Exit Corridor',
    roadName: 'Jl. Dr. Djunjunan',
    regency: 'Kota Bandung',
    avgVolumePerHour: 14200,
    peakMorningVolume: 16500,
    peakEveningVolume: 18200,
    regularVolume: 11000,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Gerbang masuk utama wisatawan & komuter Jabodetabek ke Bandung. Kendaraan bergerak lambat (stop & go), dwell time iklan mencapai 85 detik.',
    recommendedFormat: 'LED Videotron Curved & Megatron Gantry'
  },
  {
    id: 'th-bdg-2',
    lat: -6.8996,
    lng: 107.6105,
    intensity: 0.92,
    name: 'Flyover Pasupati - Cikapayang Intersection',
    roadName: 'Jl. Prof. Mochtar Kusumaatmadja',
    regency: 'Kota Bandung',
    avgVolumePerHour: 12800,
    peakMorningVolume: 14200,
    peakEveningVolume: 15800,
    regularVolume: 9900,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Titik temu arteri timur-barat Bandung. Paparan visual tinggi dari ketinggian flyover dan persimpangan lampu merah.',
    recommendedFormat: 'Megatron Jembatan & Double-sided LED'
  },
  {
    id: 'th-bdg-3',
    lat: -6.9213,
    lng: 107.6186,
    intensity: 0.96,
    name: 'Simpang Lima Asia Afrika Historical Hub',
    roadName: 'Jl. Asia Afrika / Sunda',
    regency: 'Kota Bandung',
    avgVolumePerHour: 11500,
    peakMorningVolume: 10800,
    peakEveningVolume: 14900,
    regularVolume: 8800,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Jantung finansial dan heritage Kota Bandung. Trafik padat pejalan kaki dan kendaraan eksekutif perbankan.',
    recommendedFormat: 'LED Videotron High Refresh Rate'
  },
  {
    id: 'th-bdg-4',
    lat: -6.8863,
    lng: 107.6149,
    intensity: 0.88,
    name: 'Simpang Dago McDonald - Cikapayang',
    roadName: 'Jl. Ir. H. Juanda',
    regency: 'Kota Bandung',
    avgVolumePerHour: 9800,
    peakMorningVolume: 9200,
    peakEveningVolume: 13400,
    regularVolume: 7900,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Kawasan lifestyle mahasiswa ITB/Unpad dan wisata belanja factory outlet dengan daya beli Gen-Z & Milenial tinggi.',
    recommendedFormat: 'Neonbox Totem & LED Vertikal'
  },
  {
    id: 'th-bdg-5',
    lat: -6.9084,
    lng: 107.6138,
    intensity: 0.84,
    name: 'Simpang Riau Junction - Trunojoyo',
    roadName: 'Jl. R.E. Martadinata',
    regency: 'Kota Bandung',
    avgVolumePerHour: 8600,
    peakMorningVolume: 7900,
    peakEveningVolume: 11800,
    regularVolume: 6800,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Pusat kuliner, kafe, dan butik premium. Target segmen keluarga urban menengah ke atas.',
    recommendedFormat: 'Baliho Prisma & LED DOOH'
  },
  {
    id: 'th-bdg-6',
    lat: -6.9632,
    lng: 107.6394,
    intensity: 0.94,
    name: 'Simpang Terusan Buah Batu Exit Tol Purbaleunyi',
    roadName: 'Jl. Terusan Buah Batu',
    regency: 'Kota Bandung',
    avgVolumePerHour: 11200,
    peakMorningVolume: 13500,
    peakEveningVolume: 14200,
    regularVolume: 8500,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Koneksi vital ke kampus Telkom University dan kawasan perumahan elit Bandung Selatan.',
    recommendedFormat: 'Megatron Simpang & Static Billboard'
  },
  {
    id: 'th-bdg-7',
    lat: -6.9421,
    lng: 107.6622,
    intensity: 0.86,
    name: 'Soekarno Hatta By-Pass Metro Trade Center',
    roadName: 'Jl. Soekarno-Hatta',
    regency: 'Kota Bandung',
    avgVolumePerHour: 10400,
    peakMorningVolume: 12200,
    peakEveningVolume: 13100,
    regularVolume: 8200,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Koridor by-pass terpanjang di Bandung. Didominasi arus truk logistik, bus antar kota, dan armada komuter.',
    recommendedFormat: 'JPO Pedestrian Bridge & Horisontal Billboard'
  },
  {
    id: 'th-bdg-8',
    lat: -6.9149,
    lng: 107.5996,
    intensity: 0.89,
    name: 'Pasirkaliki 23 Paskal Corridor',
    roadName: 'Jl. Pasirkaliki',
    regency: 'Kota Bandung',
    avgVolumePerHour: 9200,
    peakMorningVolume: 8400,
    peakEveningVolume: 12900,
    regularVolume: 7500,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Akses sentra bisnis Paskal Hypersquare dan Stasiun Bandung pintu utara dengan daya tarik ritel tinggi.',
    recommendedFormat: 'LED Digital Totem'
  },
  {
    id: 'th-bdg-9',
    lat: -6.9450,
    lng: 107.5810,
    intensity: 0.91,
    name: 'Simpang Kopo Exit Tol Purbaleunyi',
    roadName: 'Jl. Kopo (Exit Tol)',
    regency: 'Kota Bandung',
    avgVolumePerHour: 11800,
    peakMorningVolume: 13900,
    peakEveningVolume: 14800,
    regularVolume: 9200,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Akses utama ke kawasan industri tekstil Soreang dan RS Immanuel dengan kepadatan harian konsisten.',
    recommendedFormat: 'Megatron Tol & Gantry'
  },
  {
    id: 'th-bdg-10',
    lat: -6.9360,
    lng: 107.7180,
    intensity: 0.87,
    name: 'Simpang Bundaran Cibiru Gateway',
    roadName: 'Jl. Raya Bandung-Garut',
    regency: 'Kota Bandung',
    avgVolumePerHour: 10600,
    peakMorningVolume: 12800,
    peakEveningVolume: 13200,
    regularVolume: 8400,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Titik pisah arus Bandung Timur menuju Sumedang, Garut, dan Tasikmalaya.',
    recommendedFormat: 'Baliho Raksasa 3-Sisi'
  },
  {
    id: 'th-cmh-1',
    lat: -6.8925,
    lng: 107.5385,
    intensity: 0.82,
    name: 'Baros Cimahi Exit Tol',
    roadName: 'Jl. Baros',
    regency: 'Kota Cimahi',
    avgVolumePerHour: 8400,
    peakMorningVolume: 9800,
    peakEveningVolume: 10400,
    regularVolume: 6500,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Jalur penghubung pusat militer dan perumahan Kota Cimahi ke Tol Padaleunyi.',
    recommendedFormat: 'LED Videotron Simpang'
  },
  {
    id: 'th-bdg-11',
    lat: -6.8640,
    lng: 107.5920,
    intensity: 0.85,
    name: 'Setiabudi Arah Lembang Wisata',
    roadName: 'Jl. Dr. Setiabudi',
    regency: 'Kota Bandung',
    avgVolumePerHour: 9100,
    peakMorningVolume: 8200,
    peakEveningVolume: 13800,
    regularVolume: 7100,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Rute utama wisata kuliner dan rekreasi dataran tinggi Lembang; lonjakan ekstrem di akhir pekan.',
    recommendedFormat: 'Static Billboard Landscape'
  },

  // --- KOTA BEKASI & KABUPATEN BEKASI ---
  {
    id: 'th-bks-1',
    lat: -6.2520,
    lng: 106.9840,
    intensity: 1.00,
    name: 'Tol Jakarta-Cikampek KM 14 Bekasi Barat',
    roadName: 'Jalan Tol Japek Elevated / Arteri',
    regency: 'Kota Bekasi',
    avgVolumePerHour: 19500,
    peakMorningVolume: 22400,
    peakEveningVolume: 24100,
    regularVolume: 15800,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Arteri nasional tersibuk di Indonesia! Volume kendaraan 24 jam nonstop; visibilitas iklan luar biasa masif.',
    recommendedFormat: 'Megatron Gantry Tol Jembatan Raksasa'
  },
  {
    id: 'th-bks-2',
    lat: -6.2610,
    lng: 107.0120,
    intensity: 0.97,
    name: 'Tol Jakarta-Cikampek KM 19 Bekasi Timur',
    roadName: 'Jalan Tol Japek',
    regency: 'Kota Bekasi',
    avgVolumePerHour: 18200,
    peakMorningVolume: 20800,
    peakEveningVolume: 21900,
    regularVolume: 14500,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Titik antrian keluar Bekasi Timur & rest area; dwell time tinggi akibat penyempitan lajur.',
    recommendedFormat: 'Megatron Rest Area & Overhead Sign'
  },
  {
    id: 'th-bks-3',
    lat: -6.2285,
    lng: 106.9992,
    intensity: 0.94,
    name: 'Flyover Summarecon Bekasi - KH Noer Ali',
    roadName: 'Jl. Jend. Ahmad Yani',
    regency: 'Kota Bekasi',
    avgVolumePerHour: 13600,
    peakMorningVolume: 15400,
    peakEveningVolume: 16800,
    regularVolume: 10800,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Landmark pusat bisnis Summarecon Bekasi, Mall & kawasan komersial berdaya beli tinggi.',
    recommendedFormat: 'LED Videotron Vertikal Modern'
  },
  {
    id: 'th-bks-4',
    lat: -6.2483,
    lng: 106.9922,
    intensity: 0.90,
    name: 'Kalimalang Simpang Metropolitan Mall',
    roadName: 'Jl. KH. Noer Ali',
    regency: 'Kota Bekasi',
    avgVolumePerHour: 11400,
    peakMorningVolume: 13200,
    peakEveningVolume: 14100,
    regularVolume: 8900,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Pusat belanja tertua dan tersibuk di Bekasi, terintegrasi akses LRT Jabodebek.',
    recommendedFormat: 'JPO Pedestrian Bridge & LED Totem'
  },
  {
    id: 'th-bks-5',
    lat: -6.1840,
    lng: 106.9772,
    intensity: 0.81,
    name: 'Boulevard Harapan Indah Medan Satria',
    roadName: 'Jl. Sultan Agung',
    regency: 'Kota Bekasi',
    avgVolumePerHour: 8700,
    peakMorningVolume: 9900,
    peakEveningVolume: 10500,
    regularVolume: 6900,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Akses masuk kawasan perumahan mandiri Kota Harapan Indah seluas 2.200 hektar.',
    recommendedFormat: 'Baliho Prisma & LED Videotron'
  },
  {
    id: 'th-ckr-1',
    lat: -6.3050,
    lng: 107.1350,
    intensity: 0.95,
    name: 'Tol Japek KM 31 Cikarang Barat - Jababeka',
    roadName: 'Kawasan Industri Jababeka / Tol Japek',
    regency: 'Kabupaten Bekasi',
    avgVolumePerHour: 16800,
    peakMorningVolume: 19500,
    peakEveningVolume: 20200,
    regularVolume: 13100,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Kawasan industri manufaktur terbesar di Asia Tenggara. Target pekerja pabrik, engineer, dan ekspatriat.',
    recommendedFormat: 'Megatron Gantry Tol & Static Unipole'
  },
  {
    id: 'th-ckr-2',
    lat: -6.3210,
    lng: 107.1680,
    intensity: 0.88,
    name: 'Simpang Lippo Cikarang Cibatu Interchange KM 34',
    roadName: 'Interchange Cibatu KM 34',
    regency: 'Kabupaten Bekasi',
    avgVolumePerHour: 10900,
    peakMorningVolume: 12500,
    peakEveningVolume: 13200,
    regularVolume: 8200,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Koneksi ke Meikarta dan perumahan ekspatriat Jepang & Korea di Cikarang.',
    recommendedFormat: 'LED Videotron Landscape'
  },

  // --- KOTA BOGOR & KABUPATEN BOGOR ---
  {
    id: 'th-bgr-1',
    lat: -6.6015,
    lng: 106.8049,
    intensity: 0.96,
    name: 'Simpang Tugu Kujang Baranangsiang',
    roadName: 'Jl. Pajajaran / Otista',
    regency: 'Kota Bogor',
    avgVolumePerHour: 13100,
    peakMorningVolume: 14800,
    peakEveningVolume: 16200,
    regularVolume: 10200,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Landmark nomor satu Kota Bogor. Pertemuan arus keluar Tol Jagorawi dengan jalur lingkar Kebun Raya.',
    recommendedFormat: 'LED Videotron Curve & Megatron'
  },
  {
    id: 'th-bgr-2',
    lat: -6.6631,
    lng: 106.8574,
    intensity: 0.99,
    name: 'Simpang Ciawi Gadog Puncak KM 45',
    roadName: 'Jl. Raya Puncak - Ciawi',
    regency: 'Kabupaten Bogor',
    avgVolumePerHour: 17200,
    peakMorningVolume: 18900,
    peakEveningVolume: 22800,
    regularVolume: 12400,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Bottleneck legendaris jalur liburan Puncak. Sistem buka-tutup (one-way) membuat kendaraan berhenti hingga 2 jam.',
    recommendedFormat: 'Megatron Raksasa & Baliho Gantry'
  },
  {
    id: 'th-bgr-3',
    lat: -6.5982,
    lng: 106.8088,
    intensity: 0.86,
    name: 'Botani Square Pajajaran Timur',
    roadName: 'Jl. Raya Pajajaran',
    regency: 'Kota Bogor',
    avgVolumePerHour: 9500,
    peakMorningVolume: 10400,
    peakEveningVolume: 12800,
    regularVolume: 7600,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Depan Mall Botani Square dan pool DAMRI Bandara Soekarno-Hatta.',
    recommendedFormat: 'JPO Pedestrian Bridge & LED'
  },
  {
    id: 'th-bgr-4',
    lat: -6.5562,
    lng: 106.7794,
    intensity: 0.88,
    name: 'Sholeh Iskandar BORR Yasmin Corridor',
    roadName: 'Jl. KH. Sholeh Iskandar',
    regency: 'Kota Bogor',
    avgVolumePerHour: 10200,
    peakMorningVolume: 11900,
    peakEveningVolume: 12600,
    regularVolume: 8100,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Arteri bisnis barat Bogor dengan jalur Tol Lingkar Luar Bogor (BORR) layang di atasnya.',
    recommendedFormat: 'Static Billboard Horisontal & LED'
  },
  {
    id: 'th-bgr-5',
    lat: -6.5290,
    lng: 106.8390,
    intensity: 0.87,
    name: 'Sentul City Bellanova Tol Jagorawi Exit',
    roadName: 'Gerbang Tol Sentul Selatan',
    regency: 'Kabupaten Bogor',
    avgVolumePerHour: 9900,
    peakMorningVolume: 11200,
    peakEveningVolume: 12400,
    regularVolume: 7800,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Akses ke Sentul International Convention Center (SICC), sirkuit, dan perumahan Sentul Highlands.',
    recommendedFormat: 'Megatron Tol Unipole'
  },
  {
    id: 'th-bgr-6',
    lat: -6.4850,
    lng: 106.8520,
    intensity: 0.85,
    name: 'Cibinong City Mall Raya Jakarta-Bogor',
    roadName: 'Jl. Raya Jakarta-Bogor',
    regency: 'Kabupaten Bogor',
    avgVolumePerHour: 9400,
    peakMorningVolume: 10800,
    peakEveningVolume: 11500,
    regularVolume: 7200,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Pusat pemerintahan Pemkab Bogor dan mall terbesar di kawasan Cibinong.',
    recommendedFormat: 'JPO Bridge & Billboard 3-Sisi'
  },

  // --- KOTA DEPOK ---
  {
    id: 'th-dpk-1',
    lat: -6.3725,
    lng: 106.8322,
    intensity: 0.98,
    name: 'Margonda Raya Margo City Corridor',
    roadName: 'Jl. Margonda Raya',
    regency: 'Kota Depok',
    avgVolumePerHour: 15400,
    peakMorningVolume: 17800,
    peakEveningVolume: 19100,
    regularVolume: 12200,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Arteri utama berdenyut menghubungkan Kampus Universitas Indonesia dengan pusat belanja & apartemen Depok.',
    recommendedFormat: 'LED Videotron Curved Facade'
  },
  {
    id: 'th-dpk-2',
    lat: -6.3842,
    lng: 106.8405,
    intensity: 0.89,
    name: 'Simpang Juanda - Tol Cijago KM 1',
    roadName: 'Jl. Ir. H. Juanda',
    regency: 'Kota Depok',
    avgVolumePerHour: 10800,
    peakMorningVolume: 12600,
    peakEveningVolume: 13400,
    regularVolume: 8400,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Pintu tol Cinere-Jagorawi (Cijago) yang membelah Depok menuju Jagorawi & Bandara Soetta.',
    recommendedFormat: 'Static Billboard Landscape'
  },
  {
    id: 'th-dpk-3',
    lat: -6.3980,
    lng: 106.8220,
    intensity: 0.88,
    name: 'Flyover Arif Rahman Hakim Depok Baru',
    roadName: 'Jl. Arif Rahman Hakim',
    regency: 'Kota Depok',
    avgVolumePerHour: 9900,
    peakMorningVolume: 11400,
    peakEveningVolume: 12100,
    regularVolume: 7900,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Akses vital di atas perlintasan rel kereta Commuter Line Stasiun Depok Baru.',
    recommendedFormat: 'JPO Pedestrian Bridge'
  },
  {
    id: 'th-dpk-4',
    lat: -6.3420,
    lng: 106.7820,
    intensity: 0.83,
    name: 'Cinere Raya Simpang Gandul',
    roadName: 'Jl. Cinere Raya',
    regency: 'Kota Depok',
    avgVolumePerHour: 8600,
    peakMorningVolume: 9700,
    peakEveningVolume: 10200,
    regularVolume: 6700,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Kawasan hunian elite perbatasan Depok dan Jakarta Selatan (Pondok Labu / TB Simatupang).',
    recommendedFormat: 'LED Videotron Totem'
  },

  // --- KARAWANG & PURWAKARTA ---
  {
    id: 'th-krw-1',
    lat: -6.3685,
    lng: 107.3512,
    intensity: 0.99,
    name: 'Tol Jakarta-Cikampek KM 54 - KM 57 Rest Area Hub',
    roadName: 'Jalan Tol Japek KM 57',
    regency: 'Kabupaten Karawang',
    avgVolumePerHour: 18400,
    peakMorningVolume: 21500,
    peakEveningVolume: 23200,
    regularVolume: 14900,
    congestionLevel: 'Macet Total',
    oohOpportunity: 'Rest Area KM 57 Tol Japek adalah rest area teramai di Indonesia! Pemberhentian wajib pemudik & logistik ke Jawa Tengah/Timur.',
    recommendedFormat: 'Megatron Rest Area 360 & Gantry Tol'
  },
  {
    id: 'th-krw-2',
    lat: -6.3328,
    lng: 107.2842,
    intensity: 0.89,
    name: 'Bundaran Badami Interchange Karawang Barat',
    roadName: 'Kawasan Industri KIIC',
    regency: 'Kabupaten Karawang',
    avgVolumePerHour: 10500,
    peakMorningVolume: 12400,
    peakEveningVolume: 13000,
    regularVolume: 8100,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Gerbang masuk kawasan industri otomotif KIIC (Toyota, Daihatsu) dan Karawang International Industrial City.',
    recommendedFormat: 'LED Videotron Simpang'
  },
  {
    id: 'th-pwk-1',
    lat: -6.6430,
    lng: 107.4110,
    intensity: 0.93,
    name: 'Tol Cipularang KM 88 Rest Area Rest & Service',
    roadName: 'Jalan Tol Cipularang',
    regency: 'Kabupaten Purwakarta',
    avgVolumePerHour: 13800,
    peakMorningVolume: 15200,
    peakEveningVolume: 17400,
    regularVolume: 10900,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Rest Area ikonik dengan Masjid Al-Safar; titik istirahat favorit rute Jakarta-Bandung.',
    recommendedFormat: 'Megatron Gantry Tol & Static Unipole'
  },
  {
    id: 'th-pwk-2',
    lat: -6.5080,
    lng: 107.4520,
    intensity: 0.86,
    name: 'Simpang Sadang Purwakarta Interchange',
    roadName: 'Jl. Raya Sadang-Subang',
    regency: 'Kabupaten Purwakarta',
    avgVolumePerHour: 9200,
    peakMorningVolume: 10300,
    peakEveningVolume: 11000,
    regularVolume: 7400,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Pertigaan vital Sadang menghubungkan Jalur Pantura, Subang, dan Tol Cipularang/Cipali.',
    recommendedFormat: 'Baliho Prisma 3-Sisi'
  },

  // --- CIREBON & PANTURA ---
  {
    id: 'th-crb-1',
    lat: -6.7214,
    lng: 108.5492,
    intensity: 0.90,
    name: 'Simpang Kartini - CSB Mall Cipto',
    roadName: 'Jl. Dr. Cipto Mangunkusumo',
    regency: 'Kota Cirebon',
    avgVolumePerHour: 10200,
    peakMorningVolume: 11100,
    peakEveningVolume: 13900,
    regularVolume: 8200,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Episentrum gaya hidup dan ritel Cirebon Raya (Cirebon Super Block).',
    recommendedFormat: 'LED Videotron Curved Facade'
  },
  {
    id: 'th-crb-2',
    lat: -6.7163,
    lng: 108.5340,
    intensity: 0.85,
    name: 'Arteri Tuparev Kuliner & Hotel',
    roadName: 'Jl. Raya Tuparev',
    regency: 'Kabupaten Cirebon',
    avgVolumePerHour: 8700,
    peakMorningVolume: 9400,
    peakEveningVolume: 11200,
    regularVolume: 7100,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Koridor perhotelan dan sentra batik Trusmi; trafik pelancong bisnis dan keluarga.',
    recommendedFormat: 'Baliho Prisma & LED'
  },
  {
    id: 'th-crb-3',
    lat: -6.7725,
    lng: 108.6180,
    intensity: 0.92,
    name: 'Tol Palimanan - Kanci KM 208 Kanci Exit',
    roadName: 'Jalan Tol Palikanci',
    regency: 'Kabupaten Cirebon',
    avgVolumePerHour: 12600,
    peakMorningVolume: 13900,
    peakEveningVolume: 15400,
    regularVolume: 9800,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Koridor Tol Trans Jawa perbatasan Jawa Barat dan Jawa Tengah (Brebes/Tegal).',
    recommendedFormat: 'Megatron Gantry Tol'
  },
  {
    id: 'th-crb-4',
    lat: -6.7020,
    lng: 108.4720,
    intensity: 0.91,
    name: 'Gerbang Tol Palimanan Utama Trans Jawa',
    roadName: 'Tol Cipali KM 188',
    regency: 'Kabupaten Cirebon',
    avgVolumePerHour: 13400,
    peakMorningVolume: 14800,
    peakEveningVolume: 16200,
    regularVolume: 10400,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Titik temu arus Tol Cipali dengan jalur arteri Pantura Cirebon-Indramayu.',
    recommendedFormat: 'Megatron Gantry Tol'
  },
  {
    id: 'th-sbg-1',
    lat: -6.4950,
    lng: 107.6740,
    intensity: 0.91,
    name: 'Tol Cipali KM 92 Subang Gateway',
    roadName: 'Jalan Tol Cipali',
    regency: 'Kabupaten Subang',
    avgVolumePerHour: 12900,
    peakMorningVolume: 14200,
    peakEveningVolume: 15500,
    regularVolume: 10100,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Akses masuk kawasan Pelabuhan Patimban dan pusat nanas madu Subang.',
    recommendedFormat: 'Static Billboard Landscape'
  },

  // --- SUMEDANG, TASIKMALAYA, SUKABUMI & GARUT ---
  {
    id: 'th-smd-1',
    lat: -6.9315,
    lng: 107.7735,
    intensity: 0.89,
    name: 'Jatinangor Koridor Kampus & Tol Cisumdawu',
    roadName: 'Jl. Raya Jatinangor (Tol Cisumdawu)',
    regency: 'Kabupaten Sumedang',
    avgVolumePerHour: 9800,
    peakMorningVolume: 11400,
    peakEveningVolume: 12800,
    regularVolume: 7900,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Pusat pendidikan tinggi (Unpad, ITB, IPDN, Ikopin) dengan lebih dari 70.000 mahasiswa aktif.',
    recommendedFormat: 'JPO Pedestrian Bridge & LED'
  },
  {
    id: 'th-tsk-1',
    lat: -7.3315,
    lng: 108.2198,
    intensity: 0.87,
    name: 'Jl. HZ Mustofa Sentra Niaga Tasikmalaya',
    roadName: 'Jl. HZ. Mustofa',
    regency: 'Kota Tasikmalaya',
    avgVolumePerHour: 8900,
    peakMorningVolume: 9600,
    peakEveningVolume: 12200,
    regularVolume: 7100,
    congestionLevel: 'Padat Merayap',
    oohOpportunity: 'Malioboro-nya Priangan Timur! Kawasan pertokoan emas, fashion, dan kuliner terpadat di Tasikmalaya.',
    recommendedFormat: 'LED Videotron Vertikal'
  },
  {
    id: 'th-tsk-2',
    lat: -7.3192,
    lng: 108.2235,
    intensity: 0.84,
    name: 'Simpang Lima Mitrabatik Tasikmalaya',
    roadName: 'Simpang Lima',
    regency: 'Kota Tasikmalaya',
    avgVolumePerHour: 8300,
    peakMorningVolume: 9100,
    peakEveningVolume: 10400,
    regularVolume: 6600,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Simpang pertemuan 5 penjuru jalan di Tasikmalaya; visibilitas ke segala sudut putaran.',
    recommendedFormat: 'Baliho Prisma 3-Sisi'
  },
  {
    id: 'th-skb-1',
    lat: -6.9248,
    lng: 106.9284,
    intensity: 0.82,
    name: 'Alun-alun Sukabumi Siliwangi',
    roadName: 'Jl. Siliwangi',
    regency: 'Kota Sukabumi',
    avgVolumePerHour: 7800,
    peakMorningVolume: 8400,
    peakEveningVolume: 10100,
    regularVolume: 6200,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Pusat kota Sukabumi depan Balaikota dan Masjid Agung; paparan pejalan kaki dan angkutan kota.',
    recommendedFormat: 'LED Videotron Landscape'
  },
  {
    id: 'th-skb-2',
    lat: -6.8290,
    lng: 106.8210,
    intensity: 0.86,
    name: 'Tol Bocimi Cicurug Parungkuda Interchange',
    roadName: 'Jalan Tol Bocimi',
    regency: 'Kabupaten Sukabumi',
    avgVolumePerHour: 9100,
    peakMorningVolume: 10200,
    peakEveningVolume: 11400,
    regularVolume: 7300,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Jalur Tol Bogor-Ciawi-Sukabumi (Bocimi) yang memangkas waktu tempuh Jakarta-Sukabumi.',
    recommendedFormat: 'Megatron Gantry Tol'
  },
  {
    id: 'th-grt-1',
    lat: -7.2185,
    lng: 107.8920,
    intensity: 0.83,
    name: 'Bundaran Tarogong Simpang Cimanuk Garut',
    roadName: 'Jl. Cimanuk',
    regency: 'Kabupaten Garut',
    avgVolumePerHour: 7900,
    peakMorningVolume: 8600,
    peakEveningVolume: 10400,
    regularVolume: 6300,
    congestionLevel: 'Ramai Lancar',
    oohOpportunity: 'Pintu gerbang masuk Garut dari arah Bandung (Nagreg); pusat oleh-oleh dodol dan kerajinan kulit.',
    recommendedFormat: 'Baliho Prisma & LED'
  }
];

// Calculate Haversine distance in kilometers
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearby billboard spots within radius km of a traffic hotspot
export function findNearbySpotsForHotspot(
  hotspot: TrafficHeatPoint,
  spots: BillboardSpot[],
  maxRadiusKm: number = 2.5
): { spot: BillboardSpot; distanceKm: number }[] {
  return spots
    .map(spot => ({
      spot,
      distanceKm: calculateHaversineKm(hotspot.lat, hotspot.lng, spot.coordinates.lat, spot.coordinates.lng)
    }))
    .filter(item => item.distanceKm <= maxRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Find nearby traffic hotspots/sensors within radius km of a billboard spot
export function findNearbyHotspotsForSpot(
  spot: BillboardSpot,
  hotspots: TrafficHeatPoint[] = WEST_JAVA_TRAFFIC_HOTSPOTS,
  maxRadiusKm: number = 6.0
): { hotspot: TrafficHeatPoint; distanceKm: number }[] {
  return hotspots
    .map(hotspot => ({
      hotspot,
      distanceKm: parseFloat(calculateHaversineKm(spot.coordinates.lat, spot.coordinates.lng, hotspot.lat, hotspot.lng).toFixed(2))
    }))
    .filter(item => item.distanceKm <= maxRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
