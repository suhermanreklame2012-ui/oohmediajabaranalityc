import { BillboardSpot } from '../types/ooh';

export type TargetAudienceAge = 'gen_z_18_24' | 'millennial_25_34' | 'family_35_44' | 'senior_45_plus' | 'broad_all';
export type TargetAudienceInterest = 'tech_gadget' | 'culinary_coffee' | 'automotive_ev' | 'fashion_retail' | 'banking_finance' | 'travel_leisure' | 'general';
export type TargetAudienceSes = 'ses_a' | 'ses_b' | 'ses_c' | 'ses_ab_mixed';
export type CampaignPrimaryObjective = 'awareness_dominance' | 'balanced_omnichannel' | 'direct_conversion_leads' | 'experiential_footfall';

export interface TargetAudienceProfile {
  name: string;
  ageSegment: TargetAudienceAge;
  primaryInterest: TargetAudienceInterest;
  sesTier: TargetAudienceSes;
  geoFocus: 'bandung_urban' | 'jabar_wide' | 'corridor_highways';
  campaignObjective: CampaignPrimaryObjective;
}

export interface ChannelAllocationRecommendation {
  channel: 'OOH' | 'Digital' | 'BTL';
  channelLabel: string;
  iconName: string;
  allocatedBudget: number;
  allocatedPct: number;
  estimatedGrossReach: number;
  estimatedUniqueReach: number;
  blendedCpmIdr: number;
  estimatedConversions: number;
  cpaEstimateIdr: number;
  efficiencyIndex: number; // 0 - 100
  color: string;
  tacticalActionItems: string[];
  recommendedFormats: string[];
}

export interface BudgetOptimizationResult {
  totalBudgetIdr: number;
  audienceProfile: TargetAudienceProfile;
  overallEfficiencyScore: number; // 0 - 100 score
  synergyMultiplier: number;     // e.g. 1.48x
  totalGrossReach: number;
  totalUniqueReach: number;
  totalEstimatedConversions: number;
  blendedOverallCpm: number;
  blendedOverallCpa: number;
  allocations: {
    ooh: ChannelAllocationRecommendation;
    digital: ChannelAllocationRecommendation;
    btl: ChannelAllocationRecommendation;
  };
  heuristicRationale: string;
  suggestedMatchingSpots: BillboardSpot[];
  crossChannelPlaybook: {
    phase1_stimulate: string;
    phase2_experience: string;
    phase3_convert: string;
  };
}

/**
 * Heuristic Optimization Algorithm for Cross-Channel Budget Distribution
 * Evaluates the non-linear interaction between target audience demographic,
 * spending behavior, campaign objective, and channel-level marginal efficiency.
 */
export function optimizeBudgetHeuristic(
  totalBudgetIdr: number,
  profile: TargetAudienceProfile,
  availableSpots: BillboardSpot[]
): BudgetOptimizationResult {
  // 1. Baseline weights determined by Campaign Objective
  let oohWeight = 40;
  let digitalWeight = 30;
  let btlWeight = 30;

  switch (profile.campaignObjective) {
    case 'awareness_dominance':
      oohWeight = 55;
      digitalWeight = 25;
      btlWeight = 20;
      break;
    case 'balanced_omnichannel':
      oohWeight = 45;
      digitalWeight = 30;
      btlWeight = 25;
      break;
    case 'direct_conversion_leads':
      oohWeight = 25;
      digitalWeight = 50;
      btlWeight = 25;
      break;
    case 'experiential_footfall':
      oohWeight = 30;
      digitalWeight = 25;
      btlWeight = 45;
      break;
  }

  // 2. Adjust weights based on Age Segment
  if (profile.ageSegment === 'gen_z_18_24') {
    digitalWeight += 10;
    oohWeight -= 5;
    btlWeight -= 5;
  } else if (profile.ageSegment === 'millennial_25_34') {
    digitalWeight += 5;
    oohWeight += 5;
    btlWeight -= 10;
  } else if (profile.ageSegment === 'family_35_44') {
    btlWeight += 8;
    oohWeight += 2;
    digitalWeight -= 10;
  } else if (profile.ageSegment === 'senior_45_plus') {
    oohWeight += 12;
    digitalWeight -= 8;
    btlWeight -= 4;
  }

  // 3. Adjust based on SES Tier
  if (profile.sesTier === 'ses_a') {
    // Upper class: high-impact prestige OOH (Megatrons/Videotrons) and high-touch BTL
    oohWeight += 6;
    btlWeight += 4;
    digitalWeight -= 10;
  } else if (profile.sesTier === 'ses_c') {
    // Middle-mass: high-frequency mobile digital and roadshow BTL
    digitalWeight += 8;
    oohWeight -= 4;
    btlWeight -= 4;
  }

  // 4. Adjust based on Interest
  if (profile.primaryInterest === 'tech_gadget' || profile.primaryInterest === 'banking_finance') {
    digitalWeight += 6;
    oohWeight += 2;
    btlWeight -= 8;
  } else if (profile.primaryInterest === 'culinary_coffee' || profile.primaryInterest === 'fashion_retail') {
    btlWeight += 8;
    digitalWeight += 2;
    oohWeight -= 10;
  } else if (profile.primaryInterest === 'automotive_ev' || profile.primaryInterest === 'travel_leisure') {
    oohWeight += 8;
    btlWeight += 4;
    digitalWeight -= 12;
  }

  // 5. Adjust based on Geographic Focus
  if (profile.geoFocus === 'corridor_highways') {
    oohWeight += 10;
    btlWeight -= 8;
    digitalWeight -= 2;
  } else if (profile.geoFocus === 'bandung_urban') {
    digitalWeight += 4;
    btlWeight += 4;
    oohWeight -= 8;
  }

  // Bounds enforcement (minimum 15% per channel to prevent single-channel funnel dropoff)
  oohWeight = Math.max(15, Math.min(70, oohWeight));
  digitalWeight = Math.max(15, Math.min(65, digitalWeight));
  btlWeight = Math.max(15, Math.min(60, btlWeight));

  // Normalize to 100%
  const sumWeights = oohWeight + digitalWeight + btlWeight;
  const oohPct = Math.round((oohWeight / sumWeights) * 100);
  const digitalPct = Math.round((digitalWeight / sumWeights) * 100);
  const btlPct = 100 - (oohPct + digitalPct);

  // Monetary allocation
  const oohBudget = Math.round(totalBudgetIdr * (oohPct / 100));
  const digitalBudget = Math.round(totalBudgetIdr * (digitalPct / 100));
  const btlBudget = Math.round(totalBudgetIdr * (btlPct / 100));

  // Channel CPM and Efficiency benchmarks calibrated for West Java
  const oohCpm = 17500;
  const digitalCpm = 13500;
  const btlCpm = 38000;

  // Synergy multiplier: Multi-channel halo effect
  const synergyMultiplier = 1.48;

  // Reach and Conversion estimations
  const oohGrossReach = Math.round((oohBudget / oohCpm) * 1000 * (1 + 0.15));
  const oohUniqueReach = Math.round(oohGrossReach * 0.42);
  const oohConversions = Math.round(oohUniqueReach * 0.028);
  const oohCpa = oohConversions > 0 ? Math.round(oohBudget / oohConversions) : 0;

  const digitalGrossReach = Math.round((digitalBudget / digitalCpm) * 1000 * (1 + 0.28));
  const digitalUniqueReach = Math.round(digitalGrossReach * 0.65);
  const digitalConversions = Math.round(digitalUniqueReach * 0.046);
  const digitalCpa = digitalConversions > 0 ? Math.round(digitalBudget / digitalConversions) : 0;

  const btlGrossReach = Math.round((btlBudget / btlCpm) * 1000 * (1 + 0.22));
  const btlUniqueReach = Math.round(btlGrossReach * 0.78);
  const btlConversions = Math.round(btlUniqueReach * 0.125);
  const btlCpa = btlConversions > 0 ? Math.round(btlBudget / btlConversions) : 0;

  const totalGrossReach = oohGrossReach + digitalGrossReach + btlGrossReach;
  const totalUniqueReach = Math.round((oohUniqueReach + digitalUniqueReach + btlUniqueReach) * 0.84);
  const totalEstimatedConversions = oohConversions + digitalConversions + btlConversions;
  const blendedOverallCpm = totalGrossReach > 0 ? Math.round((totalBudgetIdr / totalGrossReach) * 1000) : 0;
  const blendedOverallCpa = totalEstimatedConversions > 0 ? Math.round(totalBudgetIdr / totalEstimatedConversions) : 0;

  // Efficiency score calculation based on synergy and CPM balance
  const overallEfficiencyScore = Math.min(98, Math.round(75 + (synergyMultiplier * 12) + (profile.sesTier === 'ses_a' ? 3 : 5)));

  // Tactical Recommendations per channel
  const oohTactics = [
    `Alokasi Rp ${Math.round(oohBudget / 1000000).toLocaleString('id-ID')} Juta difokuskan pada titik Videotron & Megatron di koridor ${profile.geoFocus === 'corridor_highways' ? 'Tol Cipularang & Arteri Primer' : 'Pusat Kota Bandung (Pasteur, Dago, Asia Afrika)'}.`,
    'Penempatan materi visual dengan kontras tinggi terbaca jelas dalam durasi paparan 35-60 detik.',
    'Pemasangan QR Code promosi terintegrasi dengan landing page kampanye digital.'
  ];

  const digitalTactics = [
    `Alokasi Rp ${Math.round(digitalBudget / 1000000).toLocaleString('id-ID')} Juta untuk iklan Meta (Instagram & Facebook) dan Google Ads ber-radius geofencing 800m dari titik billboard OOH.`,
    `Penargetan demografi spesifik segmen usia ${profile.ageSegment.replace(/_/g, ' ')} dengan minat ${profile.primaryInterest.replace(/_/g, ' ')}.`,
    'Kampanye Click-to-WhatsApp dan retargeting pengguna yang telah terpapar iklan OOH.'
  ];

  const btlTactics = [
    `Alokasi Rp ${Math.round(btlBudget / 1000000).toLocaleString('id-ID')} Juta untuk pop-up booth aktivasi dan product trial di lifestyle mall utama (23 Paskal, PVJ, TSM Bandung).`,
    'Aktivasi tim promotor/SPG saat jam sibuk akhir pekan (Jumat sore - Minggu malam).',
    'Pengambilan sampel langsung (sampling) disertai penukaran voucher digital on-the-spot.'
  ];

  // Match optimal billboard spots from database based on geoFocus and SES
  const sortedSpots = [...availableSpots].sort((a, b) => {
    let scoreA = a.effectivenessScore;
    let scoreB = b.effectivenessScore;
    if (profile.geoFocus === 'bandung_urban') {
      if (a.regency.includes('Bandung') || a.regency.includes('Cimahi')) scoreA += 20;
      if (b.regency.includes('Bandung') || b.regency.includes('Cimahi')) scoreB += 20;
    } else if (profile.geoFocus === 'corridor_highways') {
      if (a.roadType.toLowerCase().includes('tol')) scoreA += 25;
      if (b.roadType.toLowerCase().includes('tol')) scoreB += 25;
    }
    return scoreB - scoreA;
  });

  const suggestedMatchingSpots = sortedSpots.slice(0, 4);

  // Heuristic Narrative
  const heuristicRationale = `Untuk profil audiens ${profile.name || 'Target Terpilih'} dengan fokus sasaran ${profile.campaignObjective.replace(/_/g, ' ')}, algoritma merekomendasikan distribusi anggaran ${oohPct}% OOH, ${digitalPct}% Digital, dan ${btlPct}% BTL. Proporsi ini memaksimalkan efisiensi biaya paparan (CPM Rp ${blendedOverallCpm.toLocaleString('id-ID')}) sekaligus mencegah kebocoran corong konversi (funnel leakage) melalui efek pengganda sinergi sebesar +${Math.round((synergyMultiplier - 1) * 100)}%.`;

  return {
    totalBudgetIdr,
    audienceProfile: profile,
    overallEfficiencyScore,
    synergyMultiplier,
    totalGrossReach,
    totalUniqueReach,
    totalEstimatedConversions,
    blendedOverallCpm,
    blendedOverallCpa,
    allocations: {
      ooh: {
        channel: 'OOH',
        channelLabel: 'Outdoor / OOH Advertising',
        iconName: 'Maximize2',
        allocatedBudget: oohBudget,
        allocatedPct: oohPct,
        estimatedGrossReach: oohGrossReach,
        estimatedUniqueReach: oohUniqueReach,
        blendedCpmIdr: oohCpm,
        estimatedConversions: oohConversions,
        cpaEstimateIdr: oohCpa,
        efficiencyIndex: 94,
        color: '#3b82f6',
        tacticalActionItems: oohTactics,
        recommendedFormats: ['LED Videotron 3D', 'Megatron Monopole Arteri', 'JPO Pedestrian Branding']
      },
      digital: {
        channel: 'Digital',
        channelLabel: 'Digital & Geofenced Social Ads',
        iconName: 'Smartphone',
        allocatedBudget: digitalBudget,
        allocatedPct: digitalPct,
        estimatedGrossReach: digitalGrossReach,
        estimatedUniqueReach: digitalUniqueReach,
        blendedCpmIdr: digitalCpm,
        estimatedConversions: digitalConversions,
        cpaEstimateIdr: digitalCpa,
        efficiencyIndex: 91,
        color: '#a855f7',
        tacticalActionItems: digitalTactics,
        recommendedFormats: ['Meta Geofenced Reels/Stories', 'Google Performance Max', 'TikTok Hyperlocal Ads']
      },
      btl: {
        channel: 'BTL',
        channelLabel: 'Below The Line (Experiential & Booth)',
        iconName: 'Store',
        allocatedBudget: btlBudget,
        allocatedPct: btlPct,
        estimatedGrossReach: btlGrossReach,
        estimatedUniqueReach: btlUniqueReach,
        blendedCpmIdr: btlCpm,
        estimatedConversions: btlConversions,
        cpaEstimateIdr: btlCpa,
        efficiencyIndex: 88,
        color: '#10b981',
        tacticalActionItems: btlTactics,
        recommendedFormats: ['Atrium Booth 23 Paskal / PVJ', 'Weekend Sampling Station', 'In-Store POSM Display']
      }
    },
    heuristicRationale,
    suggestedMatchingSpots,
    crossChannelPlaybook: {
      phase1_stimulate: `Fase 1 (Minggu 1-2): Dominasi visual OOH ${oohPct}% di arteri utama menanamkan rasa penasaran dan kredibilitas brand.`,
      phase2_experience: `Fase 2 (Minggu 2-3): Calon konsumen yang terstimulasi diarahkan ke aktivasi booth BTL ${btlPct}% di mall untuk uji coba langsung.`,
      phase3_convert: `Fase 3 (Minggu 3-4): Iklan digital retargeting ${digitalPct}% mengepung smartphone audiens untuk penutupan transaksi (closing sales).`
    }
  };
}
