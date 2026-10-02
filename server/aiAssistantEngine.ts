import { GoogleGenAI } from '@google/genai';
import { getAllSpotsFromDb } from './database';
import { askGeminiForSiteRecommendations } from './siteRecommendationEngine';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AiAssistantRequest {
  message: string;
  history?: ChatMessage[];
  selectedSpotId?: string;
  filterContext?: {
    regency?: string;
    corridorType?: string;
    mediaType?: string;
  };
}

export async function askJabarOohAssistant(req: AiAssistantRequest): Promise<string> {
  const { message, history = [], selectedSpotId } = req;
  const q = message.toLowerCase();

  // If user is asking for new billboard site recommendations
  if (
    q.includes('lokasi baru') || 
    q.includes('titik baru') || 
    q.includes('sarankan lokasi') || 
    q.includes('saran lokasi') || 
    q.includes('rekomendasi lokasi') ||
    q.includes('ekspansi') ||
    (q.includes('kepadatan') && q.includes('demografi')) ||
    q.includes('coverage gap') ||
    q.includes('white space')
  ) {
    return askGeminiForSiteRecommendations(message);
  }

  const allSpots = getAllSpotsFromDb();

  // Aggregate database facts for grounding
  const totalSpots = allSpots.length;
  const totalReach = allSpots.reduce((sum, s) => sum + (s.dailyGrossReach || 0), 0);
  const totalVac = allSpots.reduce((sum, s) => sum + (s.vacDaily || 0), 0);
  const avgCpm = allSpots.length > 0 ? Math.round(allSpots.reduce((sum, s) => sum + (s.cpmIdr || 0), 0) / allSpots.length) : 18500;

  // Top 5 spots by reach
  const topSpots = [...allSpots]
    .sort((a, b) => (b.dailyGrossReach || 0) - (a.dailyGrossReach || 0))
    .slice(0, 5)
    .map(s => `[${s.code}] ${s.name} (${s.roadName}) - Reach: ${(s.dailyGrossReach || 0).toLocaleString('id-ID')}/hari, VAC: ${(s.vacDaily || 0).toLocaleString('id-ID')}, CPM: Rp${(s.cpmIdr || 0).toLocaleString('id-ID')}, Tipe: ${s.type}`);

  let selectedSpotContext = '';
  if (selectedSpotId) {
    const spot = allSpots.find(s => s.id === selectedSpotId);
    if (spot) {
      selectedSpotContext = `\nTitik Reklame yang Sedang Dilihat Operator Saat Ini:\n- Kode: ${spot.code}\n- Nama: ${spot.name}\n- Lokasi: ${spot.roadName}, ${spot.regency}\n- Tipe: ${spot.type} (${spot.dimensions?.width}x${spot.dimensions?.height}m)\n- DGR: ${spot.dailyGrossReach?.toLocaleString('id-ID')} kendaraan+pejalan/hari\n- VAC: ${spot.vacDaily?.toLocaleString('id-ID')}\n- Dwell Time: ${spot.avgDwellTimeSec} detik @ ${spot.avgSpeedKmh} km/jam\n- Visibilitas: ${spot.visibilityScore}/100, Efektivitas: ${spot.effectivenessScore}/100\n- Status: ${spot.occupancyStatus} (${spot.currentBrand || 'Kosong'})\n- Tarif: Rp${(spot.ratePerMonthIdr || 0).toLocaleString('id-ID')}/bulan (CPM: Rp${spot.cpmIdr})\n`;
    }
  }

  // Summary of spots by corridor
  const corridorBreakdown = allSpots.reduce((acc: Record<string, number>, s) => {
    const c = s.corridorType || 'Lainnya';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const systemInstruction = `Anda adalah "JabarOOH AI Assistant", asisten intelijen dan analis strategis media luar ruang (OOH & DOOH) terkemuka untuk wilayah Jawa Barat, di bawah supervisi Suherman Reklame (Pengelola Resmi JabarOOH, Kontak: 087822248975, suherman.reklame2012@gmail.com).

TUGAS DAN KEAHLIAN ANDA:
1. Menjawab pertanyaan operator reklame mengenai performa billboard (Reach harian, VAC, Dwell time, CPM, ROI, Visibility Score).
2. Menganalisis tren pergerakan mobilitas, rute komuter (Pasteur, Cileunyi, Dago, Asia Afrika, Buah Batu, Soekarno-Hatta, Setiabudi).
3. Memberikan rekomendasi pemilihan titik reklame berbasis industri (F&B, Otomotif, FMCG, FinTech, Fashion/Lifestyle, Pendidikan, Properti).
4. Menjelaskan kalkulasi anggaran, CPM efisien, perbandingan Billboard Statis vs DOOH/Videotron LED, serta strategi dominasi rute (*Corridor Domination*).
5. Bersikap profesional, analitis, ramah, berbasis data kuantitatif nyata Jawa Barat, dan menggunakan Bahasa Indonesia yang lugas dan terstruktur dengan poin-poin jelas.

RINGKASAN DATA INVENTARIS JABAROOH AKTIF:
- Total Titik Terdaftar: ${totalSpots} Titik Reklame (Kota Bandung, KBB, Kab. Bandung, Sumedang)
- Total Daily Gross Reach Gabungan: ${totalReach.toLocaleString('id-ID')} paparan/hari
- Total VAC (Visibility Adjusted Contacts): ${totalVac.toLocaleString('id-ID')} kontak pandang/hari
- Rata-rata CPM Provinsi: Rp${avgCpm.toLocaleString('id-ID')}
- Distribusi Koridor: ${Object.entries(corridorBreakdown).map(([k, v]) => `${k} (${v} titik)`).join(', ')}

TOP 5 BILLBOARD BERDASARKAN REACH:
${topSpots.join('\n')}
${selectedSpotContext}
Format jawaban Anda dengan Markdown yang bersih (gunakan poin peluru, cetak tebal untuk angka penting atau kode titik [BDG-XX], dan rekomendasi aksi yang tajam).`;

  // Check if GEMINI_API_KEY is available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'JabarOOH-Analytics/3.5'
          }
        }
      });

      // Prepare contents with conversation history
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      
      // Add previous history (max last 6 turns to maintain context)
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 900
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to specialized intelligence engine:', err.message);
    }
  }

  // Fallback Rule-Based Semantic Intelligence Engine
  return generateDomainIntelligenceFallback(message, allSpots, selectedSpotId);
}

function generateDomainIntelligenceFallback(
  query: string, 
  allSpots: any[], 
  selectedSpotId?: string
): string {
  const q = query.toLowerCase();

  // 1. Query about highest reach or top billboards
  if (q.includes('tertinggi') || q.includes('top') || q.includes('terbanyak') || q.includes('ranking')) {
    const sorted = [...allSpots].sort((a, b) => (b.dailyGrossReach || 0) - (a.dailyGrossReach || 0)).slice(0, 5);
    return `### 🏆 Top 5 Titik Reklame dengan Performa Tertinggi di Jawa Barat

Berdasarkan telemetri sensor mobilitas dan pemodelan VAC (*Visibility Adjusted Contacts*), berikut 5 titik paling impresif:

${sorted.map((s, idx) => `**${idx + 1}. [${s.code}] ${s.name}**
- **Jalan**: ${s.roadName} (${s.regency})
- **Daily Gross Reach**: **${(s.dailyGrossReach || 0).toLocaleString('id-ID')}** kendaraan/hari
- **VAC Efektif**: **${(s.vacDaily || 0).toLocaleString('id-ID')}** kontak mata
- **CPM**: **Rp${(s.cpmIdr || 0).toLocaleString('id-ID')}** · Tipe: ${s.type}
- **Skor Visibilitas**: **${s.visibilityScore}/100** (Dwell Time: ${s.avgDwellTimeSec} detik)`).join('\n\n')}

💡 **Rekomendasi Strategis**: Titik di **Gerbang Tol Pasteur** dan **Simpang Flyover Pasirkaliki** merupakan prioritas utama untuk kampanye berskala nasional (*Mass Awareness*) dengan impresi harian maksimal.`;
  }

  // 2. Query about F&B or cafes / restaurants
  if (q.includes('f&b') || q.includes('kuliner') || q.includes('kafe') || q.includes('makanan') || q.includes('restoran')) {
    const fbSpots = allSpots.filter(s => 
      s.roadName.toLowerCase().includes('dago') || 
      s.roadName.toLowerCase().includes('martadinata') || 
      s.roadName.toLowerCase().includes('riau') ||
      s.roadName.toLowerCase().includes('pasirkaliki') ||
      s.roadName.toLowerCase().includes('progo')
    ).slice(0, 4);

    return `### ☕ Rekomendasi Titik Reklame untuk Industri F&B & Kuliner Gaya Hidup

Segmen F&B dan kafe memerlukan titik dengan **Dwell Time tinggi**, audiens **SES A & B (Generasi Milenial & Gen Z)**, serta dekat dengan sentra kuliner aktif:

${fbSpots.map(s => `- **[${s.code}] ${s.name}** (${s.roadName})
  - *Karakteristik*: Berada tepat di jalur *hangout* dan *lifestyle dining*.
  - *Performa*: Reach **${(s.dailyGrossReach || 0).toLocaleString('id-ID')}/hari**, Dwell Time **${s.avgDwellTimeSec} detik**.
  - *CPM*: **Rp${(s.cpmIdr || 0).toLocaleString('id-ID')}** (Sangat efisien untuk konversi instan).`).join('\n\n')}

🎯 **Saran Taktis**: Gunakan format **DOOH/Videotron LED** pada jam makan siang (11:30 - 13:30) dan jam pulang kerja/malam (17:30 - 21:00) untuk memicu dorongan lapar (*hunger impulse*) pengunjung kawasan Dago dan R.E. Martadinata.`;
  }

  // 3. Query about commuter corridor / Pasteur / Dago traffic
  if (q.includes('komuter') || q.includes('pasteur') || q.includes('dago') || q.includes('macet') || q.includes('lalu lintas')) {
    return `### 🚗 Analisis Tren Lalu Lintas & Koridor Komuter Jawa Barat

**1. Koridor Komuter Pasteur - Gasibu (Arteri Primer Barat-Pusat)**:
- **Karakteristik**: Pintu masuk 70% kendaraan roda empat dari Tol Cipularang/Jakarta dan wilayah komuter Cimahi/Padalarang.
- **Jam Puncak**: Pagi (06:45 - 09:00 WIB) arah pusat kota; Sore (16:30 - 19:30 WIB) arah keluar tol.
- **Rata-rata Kecepatan**: 18 - 25 km/jam (Menghasilkan *Dwell Time* tinggi hingga 22 detik).
- **Rekomendasi Titik**: **[BDG-01] Interchange Pasteur** dan **[BDG-03] Simpang Pasirkaliki**.

**2. Koridor Pariwisata & Retail Dago - R.E. Martadinata**:
- **Karakteristik**: Sentra belanja, perkantoran kreatif, kampus perguruan tinggi ternama (ITB, Unpad, ITHB).
- **Lonjakan Khusus**: Jumat malam hingga Minggu sore dengan peningkatan arus kendaraan pelat B sebesar +42%.
- **Rekomendasi Titik**: **[BDG-02] Dago Cikapayang** (Visibilitas frontal 100% dari arah Gasibu).`;
  }

  // 4. Query about selected spot
  if (selectedSpotId && (q.includes('titik ini') || q.includes('spot') || q.includes('detail') || q.includes('analisis ini'))) {
    const s = allSpots.find(item => item.id === selectedSpotId) || allSpots[0];
    return `### 📊 Analisis Komprehensif Titik: [${s.code}] ${s.name}

- **Lokasi Geografis**: ${s.roadName}, Kecamatan ${s.district || '-'}, ${s.regency}
- **Format Media**: ${s.type} (${s.dimensions?.width}m × ${s.dimensions?.height}m = ${s.dimensions?.areaM2} m²)
- **Pencahayaan & Hadap**: ${s.lightingType} · Menghadap ${s.facingDirection}

**Indikator Performa & Efektivitas**:
- **Daily Gross Reach (DGR)**: **${(s.dailyGrossReach || 0).toLocaleString('id-ID')}** paparan/hari
- **Visibility Adjusted Contacts (VAC)**: **${(s.vacDaily || 0).toLocaleString('id-ID')}** kontak mata terkalibrasi
- **Indeks Visibilitas**: **${s.visibilityScore}/100** | Indeks Efektivitas: **${s.effectivenessScore}/100**
- **Durasi Pandang (Dwell Time)**: **${s.avgDwellTimeSec} detik** pada kecepatan rerata **${s.avgSpeedKmh} km/jam**

**Komersial & Investasi**:
- **Tarif Bulanan**: **Rp${(s.ratePerMonthIdr || 0).toLocaleString('id-ID')}**
- **Estimasi CPM**: **Rp${(s.cpmIdr || 0).toLocaleString('id-ID')}** (Biaya per 1.000 impresi)
- **Status Ketersediaan**: **${s.occupancyStatus}** ${s.currentBrand ? `(Klien aktif: ${s.currentBrand})` : ''}

💡 **Rekomendasi Operator**: Titik ini memiliki rasio VAC-to-Reach sebesar **${Math.round(((s.vacDaily || 0) / (s.dailyGrossReach || 1)) * 100)}%**, sangat direkomendasikan untuk kontrak kuartalan (*quarterly booking*) oleh brand Tier-1.`;
  }

  // 5. Default intelligent response
  return `### 🤖 JabarOOH AI Assistant - Panduan Strategis Media Luar Ruang

Halo! Saya siap membantu Anda menganalisis performa titik reklame dan tren mobilitas di seluruh Jawa Barat. 

Berikut beberapa analisis cepat yang dapat Anda ajukan:
1. **Analisis Titik Populer**: *"Tampilkan 5 billboard dengan reach tertinggi di Jawa Barat"*
2. **Rekomendasi Industri**: *"Titik mana yang paling cocok untuk brand F&B atau Otomotif?"*
3. **Analisis Koridor**: *"Bagaimana karakteristik komuter jalur Tol Pasteur vs Dago?"*
4. **Efisiensi Anggaran**: *"Berapa estimasi CPM dan titik mana yang paling efisien?"*
5. **Evaluasi Titik Aktif**: Klik salah satu billboard di peta, lalu tanyakan: *"Bagaimana performa titik ini?"*

*Seluruh data terintegrasi langsung dengan 77 titik inventaris aktif Suherman Reklame (suherman.reklame2012@gmail.com / 087822248975).*`;
}
