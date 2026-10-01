export interface AgeBracketMetric {
  bracket: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  label: string;
  percentage: number;
  description: string;
  color: string;
}

export interface GenderDistribution {
  malePct: number;
  femalePct: number;
  dominantGender: 'Male' | 'Female' | 'Balanced';
  genderDriverRatio: string;
  rationale: string;
}

export interface AudiencePersona {
  name: string;
  segmentTitle: string;
  avatarIcon: string;
  percentageShare: number;
  ageRange: string;
  occupation: string;
  spendingHabit: string;
  topMotivation: string;
  quote: string;
}

export interface InterestAffinity {
  category: string;
  affinityIndex: number; // 0-100 index score
  ranking: number;
  relevanceExplanation: string;
}

export interface SocioEconomicTier {
  tier: 'SES A (Upper Class)' | 'SES B (Middle-Upper)' | 'SES C (Middle Class)';
  percentage: number;
  monthlyExpenditure: string;
  typicalTransport: string;
  color: string;
}

export interface DemographicAiAnalysisResult {
  spotId: string;
  spotName: string;
  analyzedAt: string;
  executionModel: string;
  confidenceScorePct: number;
  trafficSensorContext: {
    sensorName: string;
    distanceKm: number;
    congestionLevel: string;
    avgHourlyVolume: number;
    peakVolume: number;
    dwellTimeSec: number;
    speedEstimateKmh: number;
  };
  timeOfDayContext: 'weekday_commute' | 'weekend_leisure' | 'daily_aggregate';
  ageDistribution: AgeBracketMetric[];
  genderSplit: GenderDistribution;
  socioEconomicStatus: SocioEconomicTier[];
  topInterests: InterestAffinity[];
  personas: AudiencePersona[];
  strategicInsights: {
    executiveSummary: string;
    idealAdvertiserIndustries: string[];
    creativeVisualRecommendations: string[];
    optimalDaypartingWindows: string[];
    dwellTimeOpportunity: string;
  };
}

export interface DemographicAnalysisRequest {
  spotId: string;
  timeOfDayContext?: 'weekday_commute' | 'weekend_leisure' | 'daily_aggregate';
  targetBrandIndustry?: string;
}
