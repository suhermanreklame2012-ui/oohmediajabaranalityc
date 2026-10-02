export interface NewLocationRecommendation {
  id: string;
  candidateLocationName: string;
  roadName: string;
  district?: string;
  regency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  corridorType: 'Komuter & Arteri Primer' | 'Pusat Komersial & Lifestyle' | 'Kawasan Industri & Logistik' | 'Destinasi Wisata & Leisure';
  trafficMetrics: {
    avgVolumePerHour: number;
    peakVolume: number;
    congestionLevel: 'Lancar' | 'Ramai Lancar' | 'Padat Merayap' | 'Macet Total';
    estimatedDwellTimeSec: number;
    avgSpeedKmh: number;
    trafficComposition: string; // e.g. "Mobil Pribadi 52%, Motor 40%, Angkutan 8%"
  };
  demographicProfile: {
    targetAgeGroup: string; // e.g. "21 - 42 Tahun (Milenial & Gen-Z Produktif)"
    sesTier: 'SES A & B (Menengah ke Atas)' | 'SES B & C (Menengah)' | 'SES A (Premium / Eksekutif)';
    dominantPersona: string; // e.g. "Komuter Jakarta-Bandung & Pelaku Bisnis"
    genderRatio: string; // e.g. "54% Pria / 46% Wanita"
    topSpendingInterests: string[]; // e.g. ["Otomotif & EV", "Gadget", "Kuliner Premium"]
  };
  proposedMediaFormat: {
    type: 'LED Videotron' | 'Static Billboard' | 'Megatron' | 'Baliho Prisma';
    dimensions: {
      width: number;
      height: number;
      areaM2: number;
      sides: number;
    };
    orientation: 'Front Facing (Tegak Lurus)' | 'Parallel / Side (Sejajar)' | 'Curved Corner (Sudut Simpang)' | 'Double Sided (Dua Sisi)';
    facingDirection: string;
    specialFeature: string; // e.g. "Curved Screen 3D Anamorphic", "High Nits Direct Sunlight"
  };
  projectedPerformance: {
    estimatedDailyReach: number;
    estimatedVac: number;
    projectedVisibilityScore: number;
    suggestedMonthlyRateIdr: number;
    projectedCpmIdr: number;
    roiFeasibilityScore: number; // 0 - 100
  };
  coverageGapAnalysis: string;
  strategicRationale: string;
  bestBrandIndustries: string[];
}
