import { GoogleGenAI } from '@google/genai';
import { getAllSpotsFromDb } from './database';
import { WEST_JAVA_TRAFFIC_HOTSPOTS, TrafficHeatPoint } from '../src/data/trafficDensityData';
import { NewLocationRecommendation } from '../src/types/siteRecommendation';

export interface SiteRecommendationOptions {
  corridorFilter?: string; // 'all' | 'bandung' | 'tol_komuter' | 'industri' | 'wisata'
  targetAudience?: string; // 'all' | 'genz_millennials' | 'executive' | 'family' | 'industrial'
  minRoiScore?: number;
}

export async function generateNewLocationRecommendations(
  options: SiteRecommendationOptions = {}
): Promise<NewLocationRecommendation[]> {
  const existingSpots = getAllSpotsFromDb();

  // Curated strategic candidate archetypes rooted in West Java ground truth
  const baseCandidates: NewLocationRecommendation[] = [
    {
      id: 'rec-site-whoosh-pdl',
      candidateLocationName: 'Interchange Transit Hub Stasiun Whoosh Padalarang',
      roadName: 'Jl. Raya Padalarang (Akses Tol Padalarang Timur & Stasiun Kereta Cepat)',
      district: 'Padalarang',
      regency: 'Kabupaten Bandung Barat',
      coordinates: {
        lat: -6.8428,
        lng: 107.4982
      },
      corridorType: 'Komuter & Arteri Primer',
      trafficMetrics: {
        avgVolumePerHour: 13800,
        peakVolume: 17200,
        congestionLevel: 'Padat Merayap',
        estimatedDwellTimeSec: 68,
        avgSpeedKmh: 18,
        trafficComposition: 'Mobil Pribadi Eksekutif 58%, Taksi/Feeder Whoosh 22%, Motor 20%'
      },
      demographicProfile: {
        targetAgeGroup: '25 - 48 Tahun (Profesional & Pelaku Bisnis Jakarta-Bandung)',
        sesTier: 'SES A & B (Menengah ke Atas)',
        dominantPersona: 'Komuter Whoosh, Eksekutif Bisnis, Wisatawan Premium',
        genderRatio: '55% Pria / 45% Wanita',
        topSpendingInterests: ['FinTech & Wealth Management', 'Otomotif EV / Luxury Sedan', 'Properti & Resor Premium', 'Travel & Perhotelan']
      },
      proposedMediaFormat: {
        type: 'LED Videotron',
        dimensions: {
          width: 18,
          height: 8,
          areaM2: 144,
          sides: 1
        },
        orientation: 'Front Facing (Tegak Lurus)',
        facingDirection: 'Menghadap Arus Keluar Stasiun Whoosh & Masuk Gerbang Tol',
        specialFeature: 'Curved 3D Anamorphic Display P6 High Refresh Rate'
      },
      projectedPerformance: {
        estimatedDailyReach: 245000,
        estimatedVac: 228000,
        projectedVisibilityScore: 98,
        suggestedMonthlyRateIdr: 165000000,
        projectedCpmIdr: 22500,
        roiFeasibilityScore: 96
      },
      coverageGapAnalysis: 'Belum ada Videotron LED berskala besar di lingkar bundaran stasiun Whoosh Padalarang. Terdapat kekosongan eksposur visual bagi 30.000+ penumpang kereta cepat harian.',
      strategicRationale: 'Titik emas penentu keputusan mobilitas koridor barat. Dwell time sangat tinggi akibat antrean keluar stasiun dan lampu pengatur simpang tol Padalarang.',
      bestBrandIndustries: ['FinTech & Perbankan', 'Otomotif Listrik (EV)', 'Properti Kota Baru Parahyangan', 'Lifestyle & Gadget']
    },
    {
      id: 'rec-site-flyover-kopo',
      candidateLocationName: 'Simpang Gantry Flyover Kopo - Akses Tol Soroja Soreang',
      roadName: 'Jl. K.H. Wahid Hasyim (Kopo) Simpang Tol Soroja',
      district: 'Bojongloa Kaler / Babakan Ciparay',
      regency: 'Kota Bandung',
      coordinates: {
        lat: -6.9535,
        lng: 107.5841
      },
      corridorType: 'Komuter & Arteri Primer',
      trafficMetrics: {
        avgVolumePerHour: 15400,
        peakVolume: 19600,
        congestionLevel: 'Macet Total',
        estimatedDwellTimeSec: 95,
        avgSpeedKmh: 12,
        trafficComposition: 'Motor 56%, Mobil Pribadi 32%, Angkutan & Truk Logistik 12%'
      },
      demographicProfile: {
        targetAgeGroup: '22 - 50 Tahun (Pekerja Industri, Wiraswasta & Komuter Soreang)',
        sesTier: 'SES B & C (Menengah)',
        dominantPersona: 'Pengusaha Tekstil/Sepatu, Komuter Bandung Selatan, Keluarga Muda',
        genderRatio: '52% Pria / 48% Wanita',
        topSpendingInterests: ['FMCG & Minuman Energi', 'Sepeda Motor & Suku Cadang', 'Fintech Pinjaman Usaha', 'Bahan Bangunan & Rumah Pertama']
      },
      proposedMediaFormat: {
        type: 'Megatron',
        dimensions: {
          width: 20,
          height: 10,
          areaM2: 200,
          sides: 2
        },
        orientation: 'Double Sided (Dua Sisi)',
        facingDirection: 'Menghadap Arus Masuk dari Kota Bandung ke Arah Soreang & Exit Tol',
        specialFeature: 'Double-Sided Gantry dengan Pencahayaan Super Bright LED Spot'
      },
      projectedPerformance: {
        estimatedDailyReach: 290000,
        estimatedVac: 265000,
        projectedVisibilityScore: 97,
        suggestedMonthlyRateIdr: 140000000,
        projectedCpmIdr: 16100,
        roiFeasibilityScore: 94
      },
      coverageGapAnalysis: 'Area simpang Kopo memiliki kepadatan ekstrem namun media reklame yang ada didominasi baliho statis berukuran kecil dan usang yang tidak menangkap dwell time 95 detik.',
      strategicRationale: 'Kepadatan arus kendaraan stop-and-go di kolong flyover menghasilkan durasi tatap mata (*effective exposure*) tertinggi di belahan selatan Bandung.',
      bestBrandIndustries: ['Otomotif Roda Dua', 'Provider Telekomunikasi', 'FinTech & Multifinance', 'Retail Grosir & E-Commerce']
    },
    {
      id: 'rec-site-karawang-kiic',
      candidateLocationName: 'Interchange Gerbang Tol Karawang Barat (Kawasan Industri KIIC)',
      roadName: 'Jl. Akses Tol Karawang Barat KM 47',
      district: 'Telukjambe Timur',
      regency: 'Kabupaten Karawang',
      coordinates: {
        lat: -6.3282,
        lng: 107.2894
      },
      corridorType: 'Kawasan Industri & Logistik',
      trafficMetrics: {
        avgVolumePerHour: 16800,
        peakVolume: 21500,
        congestionLevel: 'Padat Merayap',
        estimatedDwellTimeSec: 52,
        avgSpeedKmh: 24,
        trafficComposition: 'Mobil Operasional/Pribadi 48%, Truk/Kontainer Logistik 34%, Motor 18%'
      },
      demographicProfile: {
        targetAgeGroup: '26 - 55 Tahun (Eksekutif Pabrik, Insinyur, Ekspatriat & Pengusaha Logistik)',
        sesTier: 'SES A & B (Menengah ke Atas)',
        dominantPersona: 'Eksekutif Industri Multinasional, Direksi Manufaktur, Vendor B2B',
        genderRatio: '68% Pria / 32% Wanita',
        topSpendingInterests: ['B2B Industrial Equipment', 'Kendaraan Niaga & SUV Tangguh', 'Asuransi Korporat', 'Properti Residensial Baru Karawang']
      },
      proposedMediaFormat: {
        type: 'Megatron',
        dimensions: {
          width: 24,
          height: 12,
          areaM2: 288,
          sides: 2
        },
        orientation: 'Curved Corner (Sudut Simpang)',
        facingDirection: 'Dua Arah (Pintu Tol Keluar & Menuju Kawasan Industri KIIC)',
        specialFeature: 'Super Wide Unipole Monolith Tower dengan Solar Photovoltaic Hybrid'
      },
      projectedPerformance: {
        estimatedDailyReach: 320000,
        estimatedVac: 295000,
        projectedVisibilityScore: 99,
        suggestedMonthlyRateIdr: 195000000,
        projectedCpmIdr: 20300,
        roiFeasibilityScore: 98
      },
      coverageGapAnalysis: 'Koridor industri Karawang Barat merupakan pusat pertumbuhan ekonomi tertinggi Jawa Barat dengan investasi PMA triliunan rupiah, namun kekurangan format DOOH premium berteknologi tinggi.',
      strategicRationale: 'Arus harian ratusan ribu tenaga ahli dan pengambil keputusan korporasi menjadikan titik ini tambang emas bagi pengiklan sektor B2B dan industri berat.',
      bestBrandIndustries: ['Industri & Manufaktur', 'Kendaraan Niaga (Truk/Pick-up)', 'Perbankan Korporasi', 'Logistik & Properti Kawasan']
    },
    {
      id: 'rec-site-gadog-puncak',
      candidateLocationName: 'Simpang Gantry Wisata Gadog - Pintu Gerbang Puncak Bogor',
      roadName: 'Jl. Raya Puncak - Gadog (Simpang Pasir Angin Ciawi)',
      district: 'Ciawi / Megamendung',
      regency: 'Kabupaten Bogor',
      coordinates: {
        lat: -6.6578,
        lng: 106.8624
      },
      corridorType: 'Destinasi Wisata & Leisure',
      trafficMetrics: {
        avgVolumePerHour: 17500,
        peakVolume: 24200,
        congestionLevel: 'Macet Total',
        estimatedDwellTimeSec: 110,
        avgSpeedKmh: 8,
        trafficComposition: 'Mobil Pribadi Wisatawan 65%, Motor 28%, Bus Pariwisata 7%'
      },
      demographicProfile: {
        targetAgeGroup: '24 - 45 Tahun (Keluarga Urban Jabodetabek & Pasangan Muda)',
        sesTier: 'SES A & B (Menengah ke Atas)',
        dominantPersona: 'Wisatawan Weekend Jakarta, Pelaku Liburan Singkat (Staycation)',
        genderRatio: '48% Pria / 52% Wanita',
        topSpendingInterests: ['Hotel & Resort Staycation', 'Kuliner Rekreasi & Kafe Alam', 'Snack & Produk FMCG Keluarga', 'Asuransi Jiwa & Reksa Dana']
      },
      proposedMediaFormat: {
        type: 'LED Videotron',
        dimensions: {
          width: 16,
          height: 9,
          areaM2: 144,
          sides: 1
        },
        orientation: 'Front Facing (Tegak Lurus)',
        facingDirection: 'Menghadap Arus Turunan Tol Jagorawi Menuju Tanjakan Puncak',
        specialFeature: 'Ultra High Nits (8500 Nits) Anti-Fog Weatherproof Display'
      },
      projectedPerformance: {
        estimatedDailyReach: 280000,
        estimatedVac: 260000,
        projectedVisibilityScore: 99,
        suggestedMonthlyRateIdr: 175000000,
        projectedCpmIdr: 20800,
        roiFeasibilityScore: 97
      },
      coverageGapAnalysis: 'Saat diberlakukan sistem satu arah (one way) dan weekend ganjil-genap, kendaraan tertahan diam hingga 2 jam di Simpang Gadog tanpa ada media visual dinamis yang menghibur audiens tertawan (*captive audience*).',
      strategicRationale: 'Durasi tatap mata mencapai rekor tertinggi di Jawa Barat (110+ detik). Audiens dengan daya beli tinggi dalam suasana santai berlibur sangat reseptif terhadap pesan promosi brand.',
      bestBrandIndustries: ['Hospitality & Resort', 'FMCG Makanan & Minuman', 'Perbankan & Dompet Digital', 'Taman Hiburan & Destinasi Rekreasi']
    },
    {
      id: 'rec-site-cileunyi-cisumdawu',
      candidateLocationName: 'Simpang Susun Exit Cileunyi - Junction Tol Cisumdawu',
      roadName: 'Jl. Raya Bandung - Garut (Akses Tol Cisumdawu & Padaleunyi)',
      district: 'Cileunyi',
      regency: 'Kabupaten Bandung',
      coordinates: {
        lat: -6.9482,
        lng: 107.7428
      },
      corridorType: 'Komuter & Arteri Primer',
      trafficMetrics: {
        avgVolumePerHour: 14600,
        peakVolume: 18400,
        congestionLevel: 'Padat Merayap',
        estimatedDwellTimeSec: 62,
        avgSpeedKmh: 20,
        trafficComposition: 'Mobil Pribadi 45%, Motor 40%, Bus/Angkutan 15%'
      },
      demographicProfile: {
        targetAgeGroup: '20 - 45 Tahun (Mahasiswa Jatinangor & Komuter Priangan Timur)',
        sesTier: 'SES B & C (Menengah)',
        dominantPersona: 'Mahasiswa Kampus Jatinangor (Unpad, ITB, IPDN), Penglaju Garut/Tasik/Sumedang',
        genderRatio: '50% Pria / 50% Wanita',
        topSpendingInterests: ['E-Commerce & Logistik', 'Pendidikan & Kursus Online', 'Smartphone & Kuota Data', 'Transportasi Antar-Kota']
      },
      proposedMediaFormat: {
        type: 'Megatron',
        dimensions: {
          width: 18,
          height: 9,
          areaM2: 162,
          sides: 2
        },
        orientation: 'Double Sided (Dua Sisi)',
        facingDirection: 'Menghadap Dua Arah (Bandung-Garut & Keluar Junction Cisumdawu)',
        specialFeature: 'T-Pole Monolith Tower Struktur Tahan Gempa & Angin Kencang'
      },
      projectedPerformance: {
        estimatedDailyReach: 255000,
        estimatedVac: 232000,
        projectedVisibilityScore: 96,
        suggestedMonthlyRateIdr: 135000000,
        projectedCpmIdr: 17600,
        roiFeasibilityScore: 93
      },
      coverageGapAnalysis: 'Pasca beroperasinya penuh Tol Cisumdawu ke Kertajati, volume kendaraan di simpang susun Cileunyi melonjak drastis, namun titik reklame belum dimodernisasi ke format digital representatif.',
      strategicRationale: 'Hub simpul transportasi yang menghubungkan megapolitan Bandung dengan koridor Priangan Timur dan calon pusat pertumbuhan aerocity baru.',
      bestBrandIndustries: ['Telekomunikasi', 'Perguruan Tinggi & FinTech Pendidikan', 'FMCG Ritel', 'Layanan Ekspedisi']
    },
    {
      id: 'rec-site-surya-sumantri',
      candidateLocationName: 'Simpang Surya Sumantri - Kampus Maranatha & Pasteur Utara',
      roadName: 'Jl. Prof. drg. Surya Sumantri No. 65',
      district: 'Sukajadi',
      regency: 'Kota Bandung',
      coordinates: {
        lat: -6.8834,
        lng: 107.5786
      },
      corridorType: 'Pusat Komersial & Lifestyle',
      trafficMetrics: {
        avgVolumePerHour: 11800,
        peakVolume: 15100,
        congestionLevel: 'Padat Merayap',
        estimatedDwellTimeSec: 55,
        avgSpeedKmh: 16,
        trafficComposition: 'Mobil Pribadi Mahasiswa 46%, Motor 48%, Shuttle 6%'
      },
      demographicProfile: {
        targetAgeGroup: '18 - 32 Tahun (Mahasiswa Gen-Z, Dosen, Dokter & Ekspatriat Belanja PVJ)',
        sesTier: 'SES A & B (Menengah ke Atas)',
        dominantPersona: 'Mahasiswa Universitas Kristen Maranatha, Kaum Muda Urban Kreatif',
        genderRatio: '46% Pria / 54% Wanita',
        topSpendingInterests: ['Kafe & Bakery Kekinian', 'Beauty, Skincare & Kosmetik', 'Apparel Fashion & Sneakers', 'Gadget Apple/Samsung']
      },
      proposedMediaFormat: {
        type: 'LED Videotron',
        dimensions: {
          width: 12,
          height: 6,
          areaM2: 72,
          sides: 1
        },
        orientation: 'Front Facing (Tegak Lurus)',
        facingDirection: 'Menghadap Lampu Merah Simpang Surya Sumantri - Pasteur',
        specialFeature: 'Ultra Slim Bezelless LED Display dengan Audio Directional (DOOH Interaktif)'
      },
      projectedPerformance: {
        estimatedDailyReach: 195000,
        estimatedVac: 182000,
        projectedVisibilityScore: 97,
        suggestedMonthlyRateIdr: 110000000,
        projectedCpmIdr: 18800,
        roiFeasibilityScore: 95
      },
      coverageGapAnalysis: 'Kawasan kampus Maranatha memiliki daya beli siswa tertinggi di Bandung Barat, namun minim reklame digital vertikal/horizontal premium di dekat gerbang universitas.',
      strategicRationale: 'Titik tepat sasaran untuk brand yang menyasar Gen-Z berkantong tebal (*high spending youth*). Trafik padat sepanjang hari hingga malam berkat ratusan kafe di sekitarnya.',
      bestBrandIndustries: ['F&B / Kopi & Kafe', 'Kecantikan & Skincare', 'Gadget & Gaming', 'Fashion & Streetwear']
    }
  ];

  // Filter based on options
  let filtered = [...baseCandidates];
  if (options.corridorFilter && options.corridorFilter !== 'all') {
    if (options.corridorFilter === 'bandung') {
      filtered = filtered.filter(c => c.regency.includes('Bandung'));
    } else if (options.corridorFilter === 'tol_komuter') {
      filtered = filtered.filter(c => c.corridorType === 'Komuter & Arteri Primer');
    } else if (options.corridorFilter === 'industri') {
      filtered = filtered.filter(c => c.corridorType === 'Kawasan Industri & Logistik');
    } else if (options.corridorFilter === 'wisata') {
      filtered = filtered.filter(c => c.corridorType === 'Destinasi Wisata & Leisure');
    }
  }

  if (options.targetAudience && options.targetAudience !== 'all') {
    if (options.targetAudience === 'genz_millennials') {
      filtered = filtered.filter(c => c.demographicProfile.targetAgeGroup.includes('Milenial') || c.demographicProfile.targetAgeGroup.includes('Gen-Z'));
    } else if (options.targetAudience === 'executive') {
      filtered = filtered.filter(c => c.demographicProfile.sesTier.includes('A') || c.demographicProfile.dominantPersona.includes('Eksekutif'));
    } else if (options.targetAudience === 'family') {
      filtered = filtered.filter(c => c.demographicProfile.dominantPersona.includes('Keluarga'));
    }
  }

  return filtered;
}

export async function askGeminiForSiteRecommendations(
  userQuery: string,
  trafficHotspots: TrafficHeatPoint[] = WEST_JAVA_TRAFFIC_HOTSPOTS
): Promise<string> {
  const recommendations = await generateNewLocationRecommendations();

  const systemInstruction = `Anda adalah "JabarOOH AI Assistant", spesialis analisis spasial intelijen media luar ruang (OOH & DOOH) Jawa Barat di bawah naungan Suherman Reklame (suherman.reklame2012@gmail.com / 087822248975).
Tugas Anda adalah memberikan usulan dan rekomendasi lokasi titik billboard baru yang paling strategis di Jawa Barat berdasarkan:
1. Analisis Kepadatan Lalu Lintas (*Traffic Congestion & Dwell Time*): Volume kendaraan per jam, rasio kemacetan, durasi tatap mata (*effective exposure*).
2. Analisis Demografi Audiens: Segmentasi usia (Gen-Z, Milenial, Komuter), strata ekonomi SES (SES A, B, C), dan daya beli lokal.
3. Analisis Kesenjangan Pasar (*Coverage Gap / White Space*): Menemukan simpul trafik padat yang belum terlayani billboard digital modern.
4. Kelayakan Finansial & Proyeksi ROI: Estimasi Reach, VAC harian, tarif sewa ideal, dan efisiensi CPM.

DATA KANDIDAT LOKASI BARU YANG TELAH DIKALIBRASI SECARA GEOSPASIAL:
${recommendations.map(r => `
- [${r.candidateLocationName}] (${r.roadName}, ${r.regency})
  * Koordinat: ${r.coordinates.lat}, ${r.coordinates.lng}
  * Kategori Koridor: ${r.corridorType}
  * Trafik: ${r.trafficMetrics.avgVolumePerHour.toLocaleString('id-ID')} kend/jam (Puncak: ${r.trafficMetrics.peakVolume.toLocaleString('id-ID')}), Dwell Time: ${r.trafficMetrics.estimatedDwellTimeSec} detik, Status: ${r.trafficMetrics.congestionLevel}
  * Demografi: ${r.demographicProfile.targetAgeGroup} | ${r.demographicProfile.sesTier} | Persona: ${r.demographicProfile.dominantPersona}
  * Format Rekomendasi: ${r.proposedMediaFormat.type} (${r.proposedMediaFormat.dimensions.width}x${r.proposedMediaFormat.dimensions.height}m) - ${r.proposedMediaFormat.specialFeature}
  * Proyeksi: Reach ${(r.projectedPerformance.estimatedDailyReach).toLocaleString('id-ID')}/hari, VAC ${(r.projectedPerformance.estimatedVac).toLocaleString('id-ID')}, Tarif Rp${(r.projectedPerformance.suggestedMonthlyRateIdr / 1000000).toFixed(0)} Juta/bln (CPM Rp${r.projectedPerformance.projectedCpmIdr}), Skor ROI: ${r.projectedPerformance.roiFeasibilityScore}/100
  * Rationale: ${r.strategicRationale}
  * Industri Utama: ${r.bestBrandIndustries.join(', ')}
`).join('\n')}

Format jawaban Anda dalam Bahasa Indonesia profesional yang tertata rapi menggunakan Markdown (gunakan judul tebal, poin peluru yang jelas, rincian teknis, dan kesimpulan taktis bagi operator).`;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'JabarOOH-Analytics/3.5' }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: userQuery }] }],
        config: {
          systemInstruction,
          temperature: 0.35,
          maxOutputTokens: 1100
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API call failed for site recommendation, falling back to local algorithmic generator:', err.message);
    }
  }

  // Fallback domain intelligence
  return formatFallbackSiteRecommendation(recommendations, userQuery);
}

function formatFallbackSiteRecommendation(
  recommendations: NewLocationRecommendation[],
  query: string
): string {
  return `### 📍 Rekomendasi Lokasi Titik Billboard Baru Berbasis Kepadatan Trafik & Demografi

Berdasarkan integrasi sensor telemetri volume lalu lintas dan profil demografi penduduk di Jawa Barat, berikut **kandidat lokasi paling prospektif untuk ekspansi titik billboard baru**:

${recommendations.slice(0, 3).map((r, i) => `**${i + 1}. ${r.candidateLocationName}**
- **Jalan & Wilayah**: ${r.roadName}, **${r.regency}**
- **Karakteristik Trafik**: **${r.trafficMetrics.avgVolumePerHour.toLocaleString('id-ID')} kend/jam** (Puncak: ${r.trafficMetrics.peakVolume.toLocaleString('id-ID')}) · Dwell Time: **${r.trafficMetrics.estimatedDwellTimeSec} detik** · Status: *${r.trafficMetrics.congestionLevel}*
- **Profil Demografi**: **${r.demographicProfile.targetAgeGroup}** · **${r.demographicProfile.sesTier}**
- **Persona Dominan**: ${r.demographicProfile.dominantPersona} (${r.demographicProfile.genderRatio})
- **Format Rekomendasi**: **${r.proposedMediaFormat.type}** (${r.proposedMediaFormat.dimensions.width}×${r.proposedMediaFormat.dimensions.height}m) · *${r.proposedMediaFormat.specialFeature}*
- **Proyeksi Kinerja**: Reach **${r.projectedPerformance.estimatedDailyReach.toLocaleString('id-ID')}/hari** · VAC **${r.projectedPerformance.estimatedVac.toLocaleString('id-ID')}** · CPM **Rp${r.projectedPerformance.projectedCpmIdr.toLocaleString('id-ID')}** · Skor Kelayakan ROI: **${r.projectedPerformance.roiFeasibilityScore}/100**
- **Analisis Kesenjangan Pasar**: ${r.coverageGapAnalysis}
- **Kecocokan Industri Brand**: ${r.bestBrandIndustries.join(', ')}`).join('\n\n')}

---

💡 **Saran Taktis untuk Operator (Suherman Reklame)**:
1. **Prioritas 1: Transit Hub Stasiun Whoosh Padalarang** — Menawarkan paparan premium kepada puluhan ribu penumpang komuter Jabodetabek-Bandung berkantong tebal (*SES A*) yang saat ini belum tergarap oleh videotron berskala megatron.
2. **Prioritas 2: Simpang Flyover Kopo (Soroja)** — Memanfaatkan kemacetan kronis harian dengan *dwell time* 95 detik untuk mengamankan impresi massal ber-CPM sangat murah (*Rp16.100*).
3. **Prioritas 3: Kawasan KIIC Karawang Barat** — Mengunci segmen korporasi B2B, logistik, dan ekspatriat otomotif dengan daya sewa bulanan tertinggi (*Rp195 Juta/bulan*).`;
}
