import { GoogleGenAI } from '@google/genai';
import { 
  PipelineSimulationInput, 
  AiAutomationPipelineResponse, 
  GeospatialSiteRecommendation 
} from '../src/types/aiPipeline';

export async function runOmnichannelAiPipeline(
  input: PipelineSimulationInput
): Promise<AiAutomationPipelineResponse> {
  const executionId = `PIPE-JBR-${Date.now().toString(36).toUpperCase()}`;
  const analyzedAt = new Date().toISOString();

  // 1. Pipeline Stages Definition & Metrics
  const pipelineStages = [
    {
      stageId: 'stage-1-ingest',
      stepNumber: 1,
      title: 'Multi-Source Omnichannel Ingestion',
      component: 'Kafka / Event Harvester & REST Adapters',
      status: 'completed' as const,
      latencyMs: 142,
      recordsProcessed: 284500,
      description: 'Mengekstrak log telemetri sensor loop OOH/DOOH, log aktivasi booth BTL, dan event log digital ad geotargeting.',
      dataOutputSample: `${input.atl.totalBillboards} Titik Reklame (VAC: ${input.atl.monthlyVac.toLocaleString('id-ID')}) · ${input.btl.roadshowEventsCount} Event BTL · ${(input.digital.geotargetedImpressions / 1000).toFixed(0)}k Impresi Digital`
    },
    {
      stageId: 'stage-2-spatial-etl',
      stepNumber: 2,
      title: 'Geospatial H3 Hexagonal & PostGIS Spatial Indexing',
      component: 'PostGIS / H3 Hierarchical Spatial Engine',
      status: 'completed' as const,
      latencyMs: 88,
      recordsProcessed: 19420,
      description: 'Menormalisasi koordinat GPS titik eksposur ke grid spasial H3 Resolusi 8 (~460m) dan mengagregasi densitas mobilitas.',
      dataOutputSample: 'Spatial bounding box: Jawa Barat (EPSG:4326) · Poligon H3 terindeks: 124 kluster'
    },
    {
      stageId: 'stage-3-attribution',
      stepNumber: 3,
      title: 'Omnichannel Exposure Cross-Correlation Matrix',
      component: 'Markov Attribution & Gravity Decay Model',
      status: 'completed' as const,
      latencyMs: 115,
      recordsProcessed: 124,
      description: 'Menghitung bobot sinergi antar-kanal: eksposur reklame koridor memperkuat respon iklan digital dan mendorong footfall fisik.',
      dataOutputSample: 'Sinergi Cross-Channel: +38.4% brand resonance lift saat reklame fisik bersinggungan dengan geofencing digital'
    },
    {
      stageId: 'stage-4-ai-reasoning',
      stepNumber: 4,
      title: 'AI Work Automation & Site Planning Reasoner',
      component: 'Gemini 3.8 Flash Neural Agent',
      status: 'completed' as const,
      latencyMs: 310,
      recordsProcessed: 48,
      description: 'Sintesis otomatis kluster peluang ritel, proyeksi kenaikan footfall, dan rekomendasi alokasi inventaris SKU.',
      dataOutputSample: 'Generated 4 kluster titik ritel prioritas tinggi & alokasi stok teroptimasi'
    }
  ];

  // Benchmark baseline clusters in West Java (Bandung Raya & Koridor Bisnis)
  const defaultRecommendations: GeospatialSiteRecommendation[] = [
    {
      clusterId: 'GEO-BDG-01',
      clusterName: 'Koridor Pasirkaliki - 23 Paskal Lifestyle Hub',
      regency: 'Kota Bandung',
      coordinates: { lat: -6.9149, lng: 107.5996 },
      omnichannelOpportunityScore: 96,
      atlExposureScore: 94,
      btlActivationScore: 92,
      digitalIntentScore: 98,
      retailSaturationLevel: 'Rendah (Peluang Ekspansi Emas)',
      siteCategoryAction: 'Buka Gerai Flagship / Experience Store',
      projectedMonthlyFootfall: 48500,
      projectedRevenueLiftPct: 34.5,
      recommendedInventory: [
        {
          skuCategory: 'Hero Product / Flagship Lines',
          targetStockRatioPct: 45,
          replenishmentUrgency: 'Segera (High Priority)',
          rationale: 'Tingginya paparan videotron dan pencarian lokal digital menciptakan permintaan instan produk signature.'
        },
        {
          skuCategory: 'Impulse Buy & Travel Friendly Accessories',
          targetStockRatioPct: 30,
          replenishmentUrgency: 'Reguler',
          rationale: 'Konsentrasi pengunjung mall akhir pekan dan komuter Stasiun Bandung.'
        },
        {
          skuCategory: 'Mid-Tier Value Packs',
          targetStockRatioPct: 25,
          replenishmentUrgency: 'Buffer Stock Tambahan',
          rationale: 'Menangkap segmen keluarga residensial sekitar Kebonjati dan Sukajadi.'
        }
      ],
      geospatialRationale: 'Titik temu antara eksposur LED Videotron 23 Paskal (144k VAC harian), tingginya interaksi iklan digital (CTR 3.8%), dan kedekatan simpul mobilitas stasiun kereta api. Wilayah ini memiliki surplus audiens yang terpapar kampanye namun minim titik gerai langsung merk Anda dalam radius 1.5 km.'
    },
    {
      clusterId: 'GEO-BDG-02',
      clusterName: 'Koridor Cikapayang - Dago Heritage Lifestyle',
      regency: 'Kota Bandung',
      coordinates: { lat: -6.8863, lng: 107.6149 },
      omnichannelOpportunityScore: 92,
      atlExposureScore: 91,
      btlActivationScore: 89,
      digitalIntentScore: 95,
      retailSaturationLevel: 'Sedang (Potensi Terbuka)',
      siteCategoryAction: 'Buka Titik Ritel Satelit / Express',
      projectedMonthlyFootfall: 36200,
      projectedRevenueLiftPct: 27.8,
      recommendedInventory: [
        {
          skuCategory: 'Lifestyle & Trendy SKU',
          targetStockRatioPct: 50,
          replenishmentUrgency: 'Segera (High Priority)',
          rationale: 'Didominasi mahasiswa ITB/UNPAD dan kaum profesional muda dengan siklus belanja cepat.'
        },
        {
          skuCategory: 'Grab-and-Go Convenience Items',
          targetStockRatioPct: 35,
          replenishmentUrgency: 'Reguler',
          rationale: 'Tingginya antrean kendaraan saat jam pulang kantor di Flyover Pasupati.'
        },
        {
          skuCategory: 'Seasonal Promo Bundles',
          targetStockRatioPct: 15,
          replenishmentUrgency: 'Reguler',
          rationale: 'Menangkap lonjakan akhir pekan turis Jakarta.'
        }
      ],
      geospatialRationale: 'Paparan berulang dari Dago Simpang LED dan Flyover Pasupati JPO menghasilkan Brand Recall +88%. BTL roadshow di Gasibu mengindikasikan 72% pengunjung berminat membeli langsung produk jika tersedia toko fisik di koridor Dago.'
    },
    {
      clusterId: 'GEO-BDG-03',
      clusterName: 'Koridor Simpang Buah Batu - Telkom University Hub',
      regency: 'Kabupaten Bandung',
      coordinates: { lat: -6.9632, lng: 107.6394 },
      omnichannelOpportunityScore: 88,
      atlExposureScore: 89,
      btlActivationScore: 86,
      digitalIntentScore: 90,
      retailSaturationLevel: 'Rendah (Peluang Ekspansi Emas)',
      siteCategoryAction: 'Tingkatkan Alokasi Stok Gudang Wilayah',
      projectedMonthlyFootfall: 29800,
      projectedRevenueLiftPct: 22.4,
      recommendedInventory: [
        {
          skuCategory: 'Daily Essentials & Fast-Moving SKUs',
          targetStockRatioPct: 55,
          replenishmentUrgency: 'Segera (High Priority)',
          rationale: 'Penyangga komuter komprehensif keluar tol Buah Batu dengan volume 168k VAC/hari.'
        },
        {
          skuCategory: 'Affordable Bulk Packages',
          targetStockRatioPct: 30,
          replenishmentUrgency: 'Buffer Stock Tambahan',
          rationale: '30.000+ mahasiswa Telkom University dan residensial perumahan Bandung Selatan.'
        },
        {
          skuCategory: 'Premium Reserve Line',
          targetStockRatioPct: 15,
          replenishmentUrgency: 'Reguler',
          rationale: 'Dukungan ekspansi eksekutif komuter Buah Batu Square.'
        }
      ],
      geospatialRationale: 'Gerbang utama keluar Tol Padaleunyi ke arah selatan kota. Digital geotargeting mencatat CTR pencarian tertinggi untuk kata kunci produk ritel, namun ketersediaan stok fisik di gerai penyangga saat ini sering kehabisan (stockout risk 34%).'
    },
    {
      clusterId: 'GEO-BDG-04',
      clusterName: 'Koridor Pasteur Gateway - Sukajadi Entry',
      regency: 'Kota Bandung',
      coordinates: { lat: -6.8924, lng: 107.5794 },
      omnichannelOpportunityScore: 95,
      atlExposureScore: 98,
      btlActivationScore: 84,
      digitalIntentScore: 94,
      retailSaturationLevel: 'Sedang (Potensi Terbuka)',
      siteCategoryAction: 'Aktivasi Billboard Dukungan Baru',
      projectedMonthlyFootfall: 52000,
      projectedRevenueLiftPct: 31.0,
      recommendedInventory: [
        {
          skuCategory: 'Signature Regional Edition',
          targetStockRatioPct: 40,
          replenishmentUrgency: 'Segera (High Priority)',
          rationale: 'Arus masuk mobil plat B Jakarta yang mencari produk ikonik Bandung.'
        },
        {
          skuCategory: 'Family Pack & Souvenir Bundles',
          targetStockRatioPct: 40,
          replenishmentUrgency: 'Reguler',
          rationale: 'Pariwisata akhir pekan dan perjalanan keluarga.'
        },
        {
          skuCategory: 'Standard Inventory',
          targetStockRatioPct: 20,
          replenishmentUrgency: 'Reguler',
          rationale: 'Konsumsi komuter reguler Pasteur.'
        }
      ],
      geospatialRationale: 'Pintu gerbang utama keluar tol dengan volume kontak mata tertinggi se-Jawa Barat (259.000 VAC/hari). Menjadi titik penentu arah keputusan konsumen sebelum melanjutkan perjalanan ke arah Lembang atau pusat perbelanjaan PVJ.'
    }
  ];

  // Try calling Gemini 3.8 Flash via @google/genai SDK
  let aiSummary = `Berdasarkan orkestrasi pipa data terintegrasi (ATL ${input.atl.totalBillboards} titik reklame, ${input.btl.roadshowEventsCount} aktivasi lapangan BTL, dan ${(input.digital.geotargetedImpressions / 1000).toFixed(0)}k impresi digital bergeofence), ditemukan korelasi positif kuat (+38.4%) antara titik reklame ber-dwell time tinggi dengan kenaikan minat belanja digital konsumen. Site planner disarankan memprioritaskan pembukaan gerai ritel di Koridor Pasirkaliki dan Cikapayang Dago, di mana rasio paparan terhadap keberadaan toko fisik masih memiliki peluang ekspansi tertinggi (Under-served Demand Gap).`;
  let aiDirectives = [
    'Buka gerai retail baru (Flagship) di kluster Pasirkaliki dalam radius 600m dari LED Videotron 23 Paskal untuk mengkapitalisasi 144k VAC harian.',
    'Tingkatkan alokasi persediaan inventaris (SKU Hero Product) sebesar +45% di gerai sekitar Dago sebelum aktivasi BTL akhir pekan berlangsung.',
    'Manfaatkan data titik koordinat reklame Buah Batu untuk mendirikan distribution hub/gerai express guna mereduksi stockout risk komuter Bandung Selatan.',
    'Lakukan sinkronisasi materi visual billboard Pasteur dengan push notification digital saat perangkat smartphone komuter terdeteksi melintas di exit tol.'
  ];

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `Anda adalah Direktur Intelijen Spasial & Otomasi AI Pemasaran Terintegrasi untuk CV Bandung Media Outdoor.
Analisis data kampanye terintegrasi berikut:
- Sektor Ritel: ${input.retailIndustry} (${input.brandName})
- ATL (Above The Line): ${input.atl.totalBillboards} Titik Reklame Billboard/DOOH, ${input.atl.monthlyVac.toLocaleString('id-ID')} VAC/bulan, Koridor: ${input.atl.primaryCorridors.join(', ')}
- BTL (Below The Line): ${input.btl.roadshowEventsCount} Event Roadshow Lapangan, ${input.btl.directSamplingFootfall.toLocaleString('id-ID')} orang tersampling, ${input.btl.boothConversionRatePct}% konversi booth
- Digital: ${input.digital.geotargetedImpressions.toLocaleString('id-ID')} impresi geotargeting, CTR ${input.digital.clickThroughRatePct}%, Keyword: "${input.digital.searchIntentKeyword}"

Berikan output JSON dengan skema berikut:
{
  "executiveSummary": "Analisis ringkas dan tajam 2-3 paragraf menghubungkan eksposur ATL + aktivasi BTL + pencarian digital menjadi keputusan site planner lokasi ritel dan inventaris.",
  "sitePlannerDirectives": [
    "Arahan spesifik 1 untuk site planner",
    "Arahan spesifik 2 untuk alokasi inventaris gudang/toko",
    "Arahan spesifik 3 untuk pembukaan titik ritel baru",
    "Arahan spesifik 4 untuk sinkronisasi billboard"
  ]
}
Hanya berikan JSON valid tanpa markdown formatting tambahan.`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 8000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]) as any;

      const text = response.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.executiveSummary) aiSummary = parsed.executiveSummary;
          if (Array.isArray(parsed.sitePlannerDirectives) && parsed.sitePlannerDirectives.length > 0) {
            aiDirectives = parsed.sitePlannerDirectives;
          }
        } catch (e) {
          console.warn('JSON parsing from Gemini response fallback:', e);
        }
      }
    } catch (err) {
      console.warn('Gemini 3.8 Flash execution fallback:', err);
    }
  }

  return {
    pipelineExecutionId: executionId,
    analyzedAt,
    aiEngineModel: 'Gemini 3.8 Flash (Server-Side Automated Geospatial Reasoner)',
    executiveSummary: aiSummary,
    pipelineStages,
    spatialRecommendations: defaultRecommendations,
    crossChannelAttribution: {
      atlBillboardContributionPct: 44,
      btlFieldActivationContributionPct: 28,
      digitalGeotargetedContributionPct: 28,
      crossChannelSynergyLiftPct: 38.4
    },
    sitePlannerDirectives: aiDirectives
  };
}
