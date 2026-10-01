/**
 * Data Definisi & Benchmark Strategi Penempatan Iklan Multi-Media (ATL, BTL, DTL)
 * CV Bandung Media Outdoor - Omnichannel Strategic Media Planner
 * Cakupan: Kota Bandung, Provinsi Jawa Barat, dan Skala Nasional Indonesia
 */

export type MediaClass = 'ATL' | 'BTL' | 'DTL';
export type GeographicScope = 'bandung' | 'jabar' | 'nasional';

export interface MediaChannelDetail {
  id: string;
  name: string;
  category: MediaClass;
  iconName: string;
  description: string;
  typicalCpmIdr: number;            // Cost Per 1,000 Impressions
  avgDwellTime: string;             // Paparan durasi audiens
  engagementRatePct: number;        // Estimasi engagement (%)
  conversionRatePct: number;        // Estimasi rasio konversi aksi (%)
  minBudgetRecommendationIdr: number;
  strengths: string[];
  limitations: string[];
  recommendedFormats: {
    bandung: string[];
    jabar: string[];
    nasional: string[];
  };
  sampleVendorsOrLocations: {
    bandung: string[];
    jabar: string[];
    nasional: string[];
  };
}

export interface AreaProfileMeta {
  id: GeographicScope;
  name: string;
  titleBadge: string;
  populationLabel: string;
  populationTotal: number;
  demographicProfile: string;
  dominantConsumerHabits: string;
  topCorridorsOrNodes: string[];
  recommendedMediaMix: {
    atlPct: number;
    btlPct: number;
    dtlPct: number;
  };
  costIndexMultiplier: number; // 1.0 (Bandung baseline), 1.25 (Jabar), 2.1 (Nasional)
}

export const AREA_PROFILES: Record<GeographicScope, AreaProfileMeta> = {
  bandung: {
    id: 'bandung',
    name: 'Kota Bandung & Bandung Raya',
    titleBadge: 'Kawasan Metropolitan Urban',
    populationLabel: '± 8.8 Juta Jiwa (Bandung Raya)',
    populationTotal: 8800000,
    demographicProfile: 'Didominasi Gen-Z & Milenial produktif (56%), mahasiswa/pelajar, industri kreatif, startup tech, dan gaya hidup kafe/retail.',
    dominantConsumerHabits: 'Mobilitas tinggi komuter jalan arteri (Dago, Pasteur, Riau, Soekarno-Hatta), aktif berkunjung ke lifestyle mall di akhir pekan, serta konsumsi media digital berbasis visual (Instagram & TikTok).',
    topCorridorsOrNodes: [
      'Arteri Pasteur & Exit Tol Baros (Gerbang Utama)',
      'Flyover Pasupati & Simpang Dago (Hub Kreatif/Kampus)',
      'Jl. R.E. Martadinata / Riau & Braga (Pusat Retail & Wisata)',
      'Mall 23 Paskal, Paris Van Java & Trans Studio Mall',
      'Jl. Asia Afrika & Alun-Alun Kota Bandung'
    ],
    recommendedMediaMix: {
      atlPct: 45,
      btlPct: 25,
      dtlPct: 30
    },
    costIndexMultiplier: 1.0
  },
  jabar: {
    id: 'jabar',
    name: 'Provinsi Jawa Barat (Regional)',
    titleBadge: 'Provinsi Terbesar di Indonesia',
    populationLabel: '± 49.9 Juta Jiwa (27 Kab/Kota)',
    populationTotal: 49900000,
    demographicProfile: 'Basis populasi konsumen terbesar di Indonesia dengan kombinasi pekerja industri manufaktur (Cikarang/Karawang), komuter megacity (Bodebek), dan agraris/wisata (Priangan).',
    dominantConsumerHabits: 'Arus komuter harian lintas batas tol Jabodetabek-Cipularang-Cipali, daya beli retail stabil di perkotaan, dan penetrasi radio komunitas serta media digital daerah yang kuat.',
    topCorridorsOrNodes: [
      'Koridor Tol Trans-Jawa (Jakarta-Cikampek, Cipularang & Cipali)',
      'Agolmerasi Bodebek (Bogor, Depok, Kota & Kab. Bekasi)',
      'Kawasan Industri Terpadu Karawang, Cikarang & KIIC',
      'Jalur Wisata Puncak Bogor, Sukabumi & Lembang',
      'Pusat Niaga Priangan Timur (Tasikmalaya, Ciamis & Garut)'
    ],
    recommendedMediaMix: {
      atlPct: 50,
      btlPct: 20,
      dtlPct: 30
    },
    costIndexMultiplier: 1.25
  },
  nasional: {
    id: 'nasional',
    name: 'Nasional Indonesia (Seluruh Nusantara)',
    titleBadge: 'Skala Penetrasi Pasar Makro',
    populationLabel: '± 278.5 Juta Jiwa (38 Provinsi)',
    populationTotal: 278500000,
    demographicProfile: 'Pasar skala penuh lintas pulau; dari kota Tier-1 (Jabodetabek, Surabaya, Medan), Tier-2 (Bandung, Semarang, Makassar), hingga Tier-3 di seluruh Indonesia.',
    dominantConsumerHabits: 'Konsumsi multi-layar terfragmentasi: Televisi FTA & Bioskop untuk kesadaran merk massal, OOH strategis di bandara/arteri nasional, serta aktivasi digital programmatic e-commerce omnichannel.',
    topCorridorsOrNodes: [
      'Bandara Internasional (Soekarno-Hatta CGK, Juanda SUB, Kualanamu KNO)',
      'Segitiga Emas CBD Jakarta (Sudirman, Thamrin, Gatot Subroto)',
      'Arteri Megapolitan Surabaya (Basuki Rahmat, Ahmad Yani)',
      'Jaringan Mall Nasional (Grand Indonesia, Pakuwon, Sun Plaza Medan)',
      'Jaringan Kereta Cepat Whoosh & Kereta Api Utama Pulau Jawa'
    ],
    recommendedMediaMix: {
      atlPct: 55,
      btlPct: 20,
      dtlPct: 25
    },
    costIndexMultiplier: 2.1
  }
};

export const OMNICHANNEL_CHANNELS: MediaChannelDetail[] = [
  // 1. ATL (ABOVE THE LINE)
  {
    id: 'atl_ooh_billboard',
    name: 'OOH Billboard & Megatron LED',
    category: 'ATL',
    iconName: 'Maximize2',
    description: 'Media luar ruang skala besar (reklame monopole, videotron 3D, megatron jembatan penyeberangan orang) yang mendominasi persimpangan dan koridor arteri utama.',
    typicalCpmIdr: 16500,
    avgDwellTime: '25 - 45 detik (saat lampu merah/macet)',
    engagementRatePct: 4.8,
    conversionRatePct: 3.2,
    minBudgetRecommendationIdr: 25000000,
    strengths: [
      'Eksposur visual 24/7 tanpa bisa di-skip atau di-block audiens',
      'Membangun reputasi dan kredibilitas brand di lokasi paling prestisius',
      'Efek dominasi geografis bagi pengguna jalan komuter rutin harian'
    ],
    limitations: [
      'Tidak bisa klik langsung ke tautan web (perlu trigger QR / URL singkat)',
      'Waktu produksi dan perizinan fisik membutuhkan proses beberapa hari'
    ],
    recommendedFormats: {
      bandung: ['LED Videotron 3D Pasteur', 'Monopole 8x16m Dago Simpang', 'JPO Pedestrian Asia Afrika'],
      jabar: ['Megatron Rest Area KM 88 & KM 97 Tol Cipularang', 'Baliho Raksasa GT Cikarang Utama', 'Videotron Pusat Garut/Tasik'],
      nasional: ['Jaringan DOOH 10 Bandara PT Angkasa Pura', 'Iconic LED Bundaran HI Jakarta', 'Megatron Basuki Rahmat Surabaya']
    },
    sampleVendorsOrLocations: {
      bandung: ['CV Bandung Media Outdoor (Jaringan Utama)', 'Titik Strategis Surapati Core', 'Simpang PVJ Sukajadi'],
      jabar: ['Tol Purbaleunyi Corridor', 'Jalan Raya Pajajaran Bogor', 'Pintu Tol Bekasi Barat'],
      nasional: ['City Neon Megatrons', 'Neonlite Network', 'Airport DOOH Terminal 3 Soetta']
    }
  },
  {
    id: 'atl_broadcast_tv',
    name: 'Televisi Siaran & TV Kabel Lokal',
    category: 'ATL',
    iconName: 'Tv',
    description: 'Iklan TV spot 15-30 detik pada jam prime-time (berita, drama, olahraga) untuk memicu brand recall dan jangkauan serentak ke jutaan keluarga.',
    typicalCpmIdr: 32000,
    avgDwellTime: '15 - 30 detik per spot tayang',
    engagementRatePct: 2.1,
    conversionRatePct: 1.8,
    minBudgetRecommendationIdr: 60000000,
    strengths: [
      'Jangkauan penetrasi rumah tangga massal tertinggi dalam waktu singkat',
      'Format audio-visual dramatis yang menggugah emosi konsumen',
      'Membentuk otoritas dan kepercayaan nasional bagi produk ritel/FMCG'
    ],
    limitations: [
      'Biaya produksi materi kreatif komersial standar broadcast relatif tinggi',
      'Fenomena second-screen: penonton bermain smartphone saat jeda iklan'
    ],
    recommendedFormats: {
      bandung: ['Spot Berita TVRI Jawa Barat', 'Sponsorship Program Budaya Bandung TV', 'Ad-Insertion IndiHome Bandung Area'],
      jabar: ['Sponsor Acara Hiburan TV Regional Jabar', 'TVRI Jabar Prime Time Slot', 'Jawa Barat TV Network'],
      nasional: ['National Commercial Slot (RCTI/SCTV/Trans7/MetroTV)', 'Sponsorship Olahraga Liga 1 Nasional', 'Digital Terrestrial DVB-T2 Nationwide']
    },
    sampleVendorsOrLocations: {
      bandung: ['TVRI Stasiun Jawa Barat', 'Bandung TV', 'MQTV'],
      jabar: ['Radar TV Cirebon/Tasik', 'Jabar Digital Broadcast Platform'],
      nasional: ['Media Nusantara Citra (MNC)', 'Emtek Group', 'Trans Corp Network']
    }
  },
  {
    id: 'atl_radio_audio',
    name: 'Radio Komersial & Audio Streaming',
    category: 'ATL',
    iconName: 'Radio',
    description: 'Spot audio, ad-libs penyiar, dan time-signal saat prime-time perjalanan pagi dan sore hari menemani mobilitas pengendara mobil dan motor.',
    typicalCpmIdr: 9500,
    avgDwellTime: '30 - 60 detik (audio naratif)',
    engagementRatePct: 3.6,
    conversionRatePct: 2.4,
    minBudgetRecommendationIdr: 15000000,
    strengths: [
      'CPM sangat efisien dengan kedekatan personal penyiar idola pendengar',
      'Mendampingi pengendara di tengah kemacetan lalu lintas perkotaan',
      'Kecepatan produksi materi siar (dapat diubah dalam hitungan jam)'
    ],
    limitations: [
      'Hanya mengandalkan indera pendengaran tanpa visualisasi fisik produk',
      'Dibutuhkan frekuensi pengulangan tinggi agar pesan membekas'
    ],
    recommendedFormats: {
      bandung: ['Adlibs Penyiar Ardan 105.9 FM', 'Hard Rock FM Bandung 87.7 Drive-Time', 'Prambors Radio Bandung Slot Pagi'],
      jabar: ['Jaringan Radio Komersial Pantura & Priangan (Dahlia/Paramuda)', 'Siar Suara Pasundan Network', 'RRI Pro 2 Jabar'],
      nasional: ['MRA Broadcast Network (Jakarta-Bandung-Surabaya)', 'Mahaka Radio Network', 'Spotify Audio Ads Programmatic Indonesia']
    },
    sampleVendorsOrLocations: {
      bandung: ['Ardan Group', 'MRA Radio Bandung', 'Radio B 95.6 FM'],
      jabar: ['Jabar Radio Syndicate', 'Radio Megaswara Bogor/Sukabumi'],
      nasional: ['Masima Radio Network (Prambors/Delta)', 'Spotify for Brands Indonesia']
    }
  },

  // 2. BTL (BELOW THE LINE)
  {
    id: 'btl_mall_activation',
    name: 'Experiential Activation & Booth Mall',
    category: 'BTL',
    iconName: 'Store',
    description: 'Pemasangan booth interaktif, unit pameran produk, dan uji coba langsung (product trial) di atrium pusat perbelanjaan tier-1.',
    typicalCpmIdr: 58000,
    avgDwellTime: '3 - 8 menit per interaksi pengunjung',
    engagementRatePct: 18.2,
    conversionRatePct: 12.8,
    minBudgetRecommendationIdr: 35000000,
    strengths: [
      'Interaksi langsung panca indera (menyentuh, mencicipi, mencoba)',
      'Tingkat konversi penjualan langsung di lokasi (on-the-spot) tertinggi',
      'Target konsumen siap berbelanja dengan kantong terbuka di area mall'
    ],
    limitations: [
      'Jangkauan audiens terbatas pada pengunjung mall dalam radius tertentu',
      'Memerlukan tim SPG/promotor lapangan terlatih dan operasional booth'
    ],
    recommendedFormats: {
      bandung: ['Atrium Booth 23 Paskal Hyper Square', 'Skywalk Pop-Up Booth Paris Van Java', 'Main Atrium Trans Studio Mall Bandung'],
      jabar: ['Mall Kelapa Gading/Summarecon Bekasi', 'Cibinong City Mall Bogor', 'Living Plaza Jababeka Cikarang'],
      nasional: ['Grand Indonesia / Senayan City Jakarta', 'Pakuwon Mall Surabaya', 'Delipark Mall Medan']
    },
    sampleVendorsOrLocations: {
      bandung: ['23 Paskal Atrium Management', 'PVJ Glamour Walk', 'TSM Bandung Event Center'],
      jabar: ['Summarecon Malls Event Organizer', 'Metropolitan Mall Bekasi'],
      nasional: ['Pakuwon Group Malls', 'Lippo Malls Indonesia', 'Agung Podomoro Retail']
    }
  },
  {
    id: 'btl_roadshow_mobile',
    name: 'Roadshow Mobile LED Van & Sampling',
    category: 'BTL',
    iconName: 'Truck',
    description: 'Kendaraan truk display digital khusus yang berkeliling ke titik kumpul massa, pasar kaget, Car Free Day, dan pusat komunitas.',
    typicalCpmIdr: 28000,
    avgDwellTime: '1 - 3 menit (atraksi interaktif)',
    engagementRatePct: 12.4,
    conversionRatePct: 7.5,
    minBudgetRecommendationIdr: 28000000,
    strengths: [
      'Dapat menjemput audiens di lokasi mana pun yang tidak memiliki billboard permanen',
      'Dapat digabungkan dengan pembagian sampling gratis dan panggung musik mini',
      'Fleksibilitas rute harian yang dinamis mengikuti keramaian akhir pekan'
    ],
    limitations: [
      'Dibatasi regulasi jam masuk kendaraan besar di pusat kota tertentu',
      'Kapasitas jangkauan tergantung durasi dan kecepatan konvoi harian'
    ],
    recommendedFormats: {
      bandung: ['Aktivasi CFD Dago & Buah Batu Akhir Pekan', 'Mobile Van Kampus Dipatiukur/Jatinangor', 'Konvoi Alun-Alun & Braga'],
      jabar: ['Roadshow Sirkuit Jalur Wisata Lembang & Ciwidey', 'Konvoi Pusat Industri Cikarang & Karawang', 'Pasar Kaget Priangan Timur'],
      nasional: ['Multi-City Roadshow 10 Kota Jawa-Bali', 'Mobile Stage Truk Pantura Corridor', 'Activation Spot Konser Musik Nasional']
    },
    sampleVendorsOrLocations: {
      bandung: ['CV Bandung Media Outdoor Mobile Division', 'Bandung Event Logistics'],
      jabar: ['Jabar Roadshow Productions', 'West Java Mobile Stage'],
      nasional: ['Dyandra Promosindo', 'Multi-City Mobile Fleet Indonesia']
    }
  },
  {
    id: 'btl_posm_instore',
    name: 'POSM & In-Store Merchandising',
    category: 'BTL',
    iconName: 'ShoppingBag',
    description: 'Materi promosi tepat di titik keputusan belanja akhir (floor display, wobbler, shelf talker, neon box rak kasir) di jaringan minimarket dan supermarket.',
    typicalCpmIdr: 22000,
    avgDwellTime: '15 - 45 detik saat memilih barang',
    engagementRatePct: 9.8,
    conversionRatePct: 14.2,
    minBudgetRecommendationIdr: 20000000,
    strengths: [
      'Berada di "The Last Mile of Purchasing" saat konsumen memegang dompet',
      'Mendorong pembelian spontan (impulse buying) di depan kasir',
      'Efektif bersaing langsung dengan kompetitor yang berada di rak bersebelahan'
    ],
    limitations: [
      'Tunduk pada aturan listing fee dan kebijakan ketat retailer modern',
      'Materi rentan rusak atau tertutup barang belanjaan jika tidak dirawat'
    ],
    recommendedFormats: {
      bandung: ['End-Cap Display Borma Supermarket', 'Kasir Header Indomaret & Alfamart Bandung Raya', 'Floor Branding Yogya Grand Kepatihan'],
      jabar: ['Jaringan 3.500+ Minimarket Jawa Barat', 'Gondola Supermarket Tiara & Yogya Priangan', 'GS Supermarket Bekasi'],
      nasional: ['Jaringan Nasional Alfamidi & Indomaret Point', 'Display Modern Trade Hypermart & Lotte Mart', 'Watsons & Guardian Pharmacy Stores']
    },
    sampleVendorsOrLocations: {
      bandung: ['Yogya Group Merchandising', 'Borma Toserba Networks', 'Alfamart Branch Bandung'],
      jabar: ['Indomarco Prismatama Jabar', 'Sumber Alfaria Trijaya Regional'],
      nasional: ['Jaringan Retail Modern Trade Indonesia', 'PT Lion Super Indo']
    }
  },

  // 3. DTL (DIGITAL THROUGH THE LINE)
  {
    id: 'dtl_geofenced_meta',
    name: 'Geofenced Social Ads (Meta / IG / TikTok)',
    category: 'DTL',
    iconName: 'Smartphone',
    description: 'Iklan digital seluler hiper-lokal dengan radius geofencing presisi (500m - 2km) di sekeliling titik billboard OOH dan pusat keramaian target.',
    typicalCpmIdr: 12500,
    avgDwellTime: '10 - 25 detik (interaksi feed/reels/story)',
    engagementRatePct: 6.4,
    conversionRatePct: 4.8,
    minBudgetRecommendationIdr: 10000000,
    strengths: [
      'Menyinkronkan pesan billboard fisik langsung ke smartphone orang yang lewat',
      'Dapat diklik langsung untuk order GoFood, e-commerce, atau chat WhatsApp CS',
      'Penargetan demografis, usia, minat, dan tipe gadget yang sangat presisi'
    ],
    limitations: [
      'Tergantung algoritma dan keterbukaan aplikasi media sosial pengguna',
      'Tingkat kejenuhan iklan digital (*ad fatigue*) tinggi jika kreatif tidak diperbarui'
    ],
    recommendedFormats: {
      bandung: ['Instagram Story Radius 1 km dari Billboard Pasteur', 'TikTok Ads Geotargeted Kampus ITB & Unpad', 'Reels Feed Promo Diskon Kafe Dago'],
      jabar: ['Meta Ads Pemilik Mobil Tol Cipularang', 'TikTok Geo-Targeted Kawasan Industri Bekasi/Karawang', 'Carousel Ads Wisatawan Akhir Pekan Jabar'],
      nasional: ['Nationwide Meta Performance Ads (Lookalike Audiences)', 'TikTok TopView Brand Takeover Indonesia', 'Programmatic In-App Mobile Advertising']
    },
    sampleVendorsOrLocations: {
      bandung: ['Meta Business Partner Jabar', 'Agency Digital Bandung Media Hub'],
      jabar: ['Digital Ads Regional Network', 'TikTok Ads Specialist Indonesia'],
      nasional: ['Meta Ads Manager International', 'ByteDance Commercial Indonesia']
    }
  },
  {
    id: 'dtl_google_pmax',
    name: 'Google Search & Intent Capture (PMax)',
    category: 'DTL',
    iconName: 'Search',
    description: 'Menangkap audiens yang secara aktif mencari kata kunci produk/brand di Google setelah mereka melihat billboard luar ruang atau aktivasi mall.',
    typicalCpmIdr: 18000,
    avgDwellTime: '45 - 90 detik di landing page',
    engagementRatePct: 8.5,
    conversionRatePct: 7.2,
    minBudgetRecommendationIdr: 12000000,
    strengths: [
      'Menangkap konsumen ber-niat beli tinggi (*high purchase intent*)',
      'Mengonversi efek penasaran dari billboard OOH menjadi klik transaksi web',
      'Model penetapan harga berbasis performa (hanya bayar saat diklik/dikunjungi)'
    ],
    limitations: [
      'Hanya efektif jika calon konsumen sudah terstimulasi untuk mencari kata kunci',
      'Tingkat kompetisi lelang kata kunci populer (CPC) dapat meningkat saat peak season'
    ],
    recommendedFormats: {
      bandung: ['Google Search "hotel terdekat bandung" & "kuliner dago"', 'Google Maps Promoted Pins Outlet Bandung', 'Display Network Portal Berita Lokal'],
      jabar: ['Google Performance Max Jabar Geographic Scope', 'Search Ads Dealer Mobil & Rumah Baru Koridor Jabar', 'YouTube Pre-Roll Pemirsa Jabar'],
      nasional: ['Google PMax Nationwide Campaign', 'Brand Keyword Domination Se-Indonesia', 'YouTube Masthead Homepage Indonesia']
    },
    sampleVendorsOrLocations: {
      bandung: ['Google Premier Partner Bandung', 'Local SEO & SEM Agency'],
      jabar: ['Regional Search Performance Agency', 'Google Display Network Jabar'],
      nasional: ['Google Marketing Platform Indonesia', 'Alphabet Partner Network']
    }
  },
  {
    id: 'dtl_whatsapp_crm',
    name: 'WhatsApp Business API & Conversational CRM',
    category: 'DTL',
    iconName: 'MessageSquare',
    description: 'Pesan interaktif personal via WhatsApp resmi bercentang hijau untuk melayani penutupan transaksi (closing sales), membership, dan voucher loyalitas.',
    typicalCpmIdr: 85000,
    avgDwellTime: '1 - 3 menit (obrolan chat dua arah)',
    engagementRatePct: 24.5,
    conversionRatePct: 16.8,
    minBudgetRecommendationIdr: 8000000,
    strengths: [
      'Open rate di atas 90% (jauh melampaui email marketing konvensional)',
      'Interaksi personal ramah langsung dengan tim sales/customer care',
      'Sangat disukai konsumen Indonesia yang gemar berkonsultasi via chat'
    ],
    limitations: [
      'Memerlukan database nomor kontak yang telah memberi izin (*opt-in database*)',
      'Ada biaya per sesi percakapan sesuai tarif resmi Meta WhatsApp Business'
    ],
    recommendedFormats: {
      bandung: ['Click-to-WhatsApp dari QR Code Billboard Bandung', 'Broadcast Promo Weekend Khusus Pelanggan Bandung', 'Automated Chatbot Booking Meja/Reservasi'],
      jabar: ['Jaringan Sales Agent CRM Wilayah Jawa Barat', 'WhatsApp Katalog Produk Distribusi Toko Retail Jabar', 'Layanan Bantuan Servis Konsumen Jabar'],
      nasional: ['Official WhatsApp Green Tick Verified Account', 'Nationwide Customer Support Bot', 'Loyalty Reward Program Se-Indonesia']
    },
    sampleVendorsOrLocations: {
      bandung: ['WABA Solution Provider Bandung', 'Mekari Qontak Partner'],
      jabar: ['Kata.ai Regional Network', 'Jasnita Telekomindo Jabar'],
      nasional: ['Infobip Indonesia', 'Meta Business Solution Provider (BSP)']
    }
  }
];

export interface StrategyPlanPreset {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  atlPct: number;
  btlPct: number;
  dtlPct: number;
  synergyMultiplierScore: number; // e.g. 1.45x
  recommendedFor: string;
}

export const STRATEGY_PRESETS: StrategyPlanPreset[] = [
  {
    id: 'balanced',
    name: 'Sinergi Omnichannel Seimbang (Balanced Full-Funnel)',
    badge: 'Rekomendasi Utama Planner',
    tagline: 'Membangun Awareness Massal Sekaligus Mengonversi Penjualan Nyata',
    description: 'Strategi paling direkomendasikan yang memanfaatkan kekuatan jangkauan visual billboard OOH (ATL), kedekatan uji coba booth mall (BTL), serta retargeting digital seluler (DTL) tanpa ada celah corong penjualan yang bocor.',
    atlPct: 45,
    btlPct: 25,
    dtlPct: 30,
    synergyMultiplierScore: 1.55,
    recommendedFor: 'Peluncuran produk baru, kampanye musiman Idul Fitri/Akhir Tahun, dan ekspansi cabang ritel regional.'
  },
  {
    id: 'awareness',
    name: 'Dominasi Kesadaran Merek (Awareness & Prestige Heavy)',
    badge: 'Top-of-Mind Dominance',
    tagline: 'Kuasai Jalan Arteri Utama, Frekuensi Tayang Maksimal',
    description: 'Fokus kuat pada media luar ruang berskala besar (Videotron 3D, Megatron, TV) untuk menanamkan nama merek dalam ingatan audiens komuter harian secara masif dan berwibawa.',
    atlPct: 65,
    btlPct: 15,
    dtlPct: 20,
    synergyMultiplierScore: 1.38,
    recommendedFor: 'Perusahaan perbankan, brand gadget/elektronik, korporasi properti prestisius, dan kampanye reputasi brand.'
  },
  {
    id: 'experiential',
    name: 'Aktivasi Pengalaman & Konversi Langsung (BTL Experiential)',
    badge: 'Direct Footfall & Trial',
    tagline: 'Sentuh Langsung Konsumen dengan Uji Coba Produk di Mall & CFD',
    description: 'Mengutamakan interaksi fisik di pusat perbelanjaan, roadshow van keliling, dan penempatan display toko kasir agar calon konsumen langsung merasakan dan membeli produk di tempat.',
    atlPct: 30,
    btlPct: 45,
    dtlPct: 25,
    synergyMultiplierScore: 1.48,
    recommendedFor: 'Industri F&B kafe/kuliner, kosmetik & kecantikan, produk otomotif/test-drive, dan fashion lifestyle.'
  },
  {
    id: 'digital_first',
    name: 'Digital-Driven & Performance Capture (DTL First)',
    badge: 'Hyper-Targeted Leads',
    tagline: 'Tangkap Niat Beli Spesifik dengan Retargeting Lokasi Presisi',
    description: 'Mengombinasikan billboard sebagai jangkar kredibilitas fisik luar ruang, sementara anggaran utama diarahkan untuk mengepung layar smartphone audiens di sekitar lokasi dengan iklan Meta & Google Search.',
    atlPct: 25,
    btlPct: 15,
    dtlPct: 60,
    synergyMultiplierScore: 1.42,
    recommendedFor: 'Aplikasi digital/startup fintech, platform e-commerce, program kursus/edukasi, dan layanan pesan-antar.'
  }
];

export interface CalculatedMediaPillarResult {
  category: MediaClass;
  title: string;
  allocatedBudget: number;
  allocatedPct: number;
  channels: MediaChannelDetail[];
  estimatedGrossReach: number;
  estimatedUniqueReach: number;
  blendedCpmIdr: number;
  avgDwellTime: string;
  avgEngagementRatePct: number;
  estimatedConversions: number;
  blendedCpaIdr: number; // Cost Per Acquisition
  haloSynergyLiftPct: number; // % lift from cross-media interaction
}

export interface CalculatedPlanComparison {
  scope: GeographicScope;
  scopeMeta: AreaProfileMeta;
  totalBudgetIdr: number;
  durationMonths: number;
  presetId: string;
  isCustom: boolean;
  pillars: {
    atl: CalculatedMediaPillarResult;
    btl: CalculatedMediaPillarResult;
    dtl: CalculatedMediaPillarResult;
  };
  totalGrossReach: number;
  totalUniqueReach: number;
  totalConversions: number;
  blendedOverallCpm: number;
  overallCpaIdr: number;
  overallSynergyMultiplier: number;
  synergyNarrative: string;
}

/**
 * Calculates complete media plan simulation comparing ATL, BTL, and DTL
 * based on geographic scope, total budget, duration, and percentage allocation.
 */
export function calculateOmnichannelPlanComparison(
  scope: GeographicScope,
  totalBudgetIdr: number,
  durationMonths: number,
  atlPct: number,
  btlPct: number,
  dtlPct: number,
  presetId: string = 'balanced'
): CalculatedPlanComparison {
  const scopeMeta = AREA_PROFILES[scope];
  const costMultiplier = scopeMeta.costIndexMultiplier;

  // Filter channels by class
  const atlChannels = OMNICHANNEL_CHANNELS.filter(c => c.category === 'ATL');
  const btlChannels = OMNICHANNEL_CHANNELS.filter(c => c.category === 'BTL');
  const dtlChannels = OMNICHANNEL_CHANNELS.filter(c => c.category === 'DTL');

  // Helper calculation for a pillar
  const calculatePillar = (
    category: MediaClass,
    title: string,
    pct: number,
    channels: MediaChannelDetail[],
    haloLift: number
  ): CalculatedMediaPillarResult => {
    const allocatedBudget = Math.round(totalBudgetIdr * (pct / 100));
    
    // Average metrics across channels in pillar
    const baseCpm = (channels.reduce((acc, c) => acc + c.typicalCpmIdr, 0) / channels.length) * costMultiplier;
    const avgEngage = channels.reduce((acc, c) => acc + c.engagementRatePct, 0) / channels.length;
    const avgConv = channels.reduce((acc, c) => acc + c.conversionRatePct, 0) / channels.length;

    // Monthly reach scaled by duration
    const monthlyImpressions = allocatedBudget > 0 ? (allocatedBudget / baseCpm) * 1000 : 0;
    const estimatedGrossReach = Math.round(monthlyImpressions * durationMonths * (1 + haloLift));

    // Deduplication factor depending on media class
    const dedupFactor = category === 'ATL' ? 0.38 : category === 'BTL' ? 0.85 : 0.62;
    const estimatedUniqueReach = Math.min(scopeMeta.populationTotal, Math.round(estimatedGrossReach * dedupFactor));

    // Conversions calculated with synergistic halo lift
    const conversionRateEffective = (avgConv / 100) * (1 + haloLift * 0.5);
    const estimatedConversions = Math.round(estimatedUniqueReach * conversionRateEffective);
    const blendedCpaIdr = estimatedConversions > 0 ? Math.round(allocatedBudget / estimatedConversions) : 0;

    let avgDwell = '30 detik';
    if (category === 'ATL') avgDwell = '25 - 45 detik (OOH & TV)';
    else if (category === 'BTL') avgDwell = '2 - 6 menit (Interaksi Fisik Booth)';
    else avgDwell = '35 - 90 detik (Layar Mobile)';

    return {
      category,
      title,
      allocatedBudget,
      allocatedPct: pct,
      channels,
      estimatedGrossReach,
      estimatedUniqueReach,
      blendedCpmIdr: Math.round(baseCpm),
      avgDwellTime: avgDwell,
      avgEngagementRatePct: parseFloat(avgEngage.toFixed(1)),
      estimatedConversions,
      blendedCpaIdr,
      haloSynergyLiftPct: Math.round(haloLift * 100)
    };
  };

  // Cross-media Halo Effect multipliers:
  // Having all 3 pillars active creates cross-reinforcement
  const hasAtl = atlPct >= 15;
  const hasBtl = btlPct >= 10;
  const hasDtl = dtlPct >= 15;

  let atlHalo = 0.08;
  let btlHalo = 0.12;
  let dtlHalo = 0.15;

  if (hasAtl && hasDtl) {
    dtlHalo += 0.22; // OOH + Mobile geofencing boosts CTR by +22%
    atlHalo += 0.10;
  }
  if (hasAtl && hasBtl) {
    btlHalo += 0.25; // OOH Awareness drives footfall to Mall Activation by +25%
  }
  if (hasBtl && hasDtl) {
    dtlHalo += 0.18; // Mall sampling to WhatsApp CRM increases closing by +18%
  }

  const atlResult = calculatePillar('ATL', 'Above The Line (Massa & Reputasi)', atlPct, atlChannels, atlHalo);
  const btlResult = calculatePillar('BTL', 'Below The Line (Aktivasi & Uji Coba)', btlPct, btlChannels, btlHalo);
  const dtlResult = calculatePillar('DTL', 'Digital & Direct (Retargeting & CRM)', dtlPct, dtlChannels, dtlHalo);

  const totalGrossReach = atlResult.estimatedGrossReach + btlResult.estimatedGrossReach + dtlResult.estimatedGrossReach;
  const rawUnique = atlResult.estimatedUniqueReach + btlResult.estimatedUniqueReach + dtlResult.estimatedUniqueReach;
  const totalUniqueReach = Math.min(scopeMeta.populationTotal, Math.round(rawUnique * 0.82));
  const totalConversions = atlResult.estimatedConversions + btlResult.estimatedConversions + dtlResult.estimatedConversions;
  
  const blendedOverallCpm = totalGrossReach > 0 ? Math.round((totalBudgetIdr / totalGrossReach) * 1000) : 0;
  const overallCpaIdr = totalConversions > 0 ? Math.round(totalBudgetIdr / totalConversions) : 0;

  // Synergy multiplier: compared to running separate isolated single-channel campaigns
  const activePillarsCount = (atlPct > 0 ? 1 : 0) + (btlPct > 0 ? 1 : 0) + (dtlPct > 0 ? 1 : 0);
  const overallSynergyMultiplier = parseFloat((1.15 + (activePillarsCount === 3 ? 0.40 : activePillarsCount === 2 ? 0.20 : 0)).toFixed(2));

  let narrative = '';
  if (activePillarsCount === 3) {
    narrative = `Alokasi 3 pilar terpadu di ${scopeMeta.name} mengaktifkan "Halo Effect" sebesar +${Math.round((overallSynergyMultiplier - 1) * 100)}%: Billboard OOH menstimulasi pencarian dan kunjungan booth mall, sementara retargeting seluler mengonversi audiens yang penasaran menjadi pelanggan tetap.`;
  } else {
    narrative = `Strategi terfokus pada ${activePillarsCount} media di ${scopeMeta.name}. Rekomendasikan menambahkan pilar komplementer untuk mencegah kebocoran corong penjualan (funnel leakage).`;
  }

  return {
    scope,
    scopeMeta,
    totalBudgetIdr,
    durationMonths,
    presetId,
    isCustom: presetId === 'custom',
    pillars: {
      atl: atlResult,
      btl: btlResult,
      dtl: dtlResult
    },
    totalGrossReach,
    totalUniqueReach,
    totalConversions,
    blendedOverallCpm,
    overallCpaIdr,
    overallSynergyMultiplier,
    synergyNarrative: narrative
  };
}
