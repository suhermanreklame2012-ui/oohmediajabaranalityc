import { BillboardSpot } from '../types/ooh';

export interface SpotKpiMetrics {
  monthlyRoiMultiplier: number;        // e.g. 3.45x
  monthlyConversionRatePct: number;    // e.g. 5.82%
  estimatedMonthlyConversions: number; // e.g. 1,420
  monthlyImpressionsVac: number;       // vacDaily * 30
  monthlyCostIdr: number;              // ratePerMonthIdr
  cpmIdr: number;                      // cpmIdr
  kpiIntensityScore: number;           // 0 - 100 composite intensity score
  intensityTier: 'Tertinggi (Tier 1)' | 'Tinggi (Tier 2)' | 'Moderat (Tier 3)' | 'Standar (Tier 4)';
  colorHex: string;
  badgeGlow: string;
  rationale: string;
}

/**
 * Calculates monthly ROI multiplier and conversion metrics for a billboard spot
 * Used by the interactive KPI Heatmap layer to overlay visual intensity.
 */
export function calculateSpotKpiMetrics(spot: BillboardSpot): SpotKpiMetrics {
  // 1. Monthly VAC Impressions & Budget
  const monthlyImpressionsVac = spot.vacDaily * 30;
  const monthlyCostIdr = spot.ratePerMonthIdr;
  
  // 2. Monthly ROI Multiplier
  // Standard market media value of 1 impression in Java Barat ~ Rp 15 - 28 (or benchmark CPM ~ Rp 22,000)
  // ROI = (Estimated media audience value delivered * effectiveness index) / Actual monthly rate
  const benchmarkAudienceValue = monthlyImpressionsVac * 0.022; // Rp 22 per VAC impression
  const effectivenessFactor = (spot.effectivenessScore / 100) * (spot.visibilityScore / 100);
  const rawRoi = (benchmarkAudienceValue * (1 + effectivenessFactor)) / Math.max(1, monthlyCostIdr);
  
  // Normalized realistic outdoor advertising ROI multiplier between 1.6x and 6.5x
  const monthlyRoiMultiplier = parseFloat(
    Math.min(6.5, Math.max(1.6, rawRoi * 2.2)).toFixed(2)
  );

  // 3. Monthly Conversion Rate (%)
  // Based on effectiveness score, dwell time multiplier at red lights/intersections, and historical performance
  const baseConversionRate = (spot.effectivenessScore / 100) * 3.8;
  const dwellMultiplier = 1 + (spot.avgDwellTimeSec / 45) * 0.45;
  const historicalRecords = spot.historicalTrend || [];
  const avgHistTraffic = historicalRecords.length > 0
    ? historicalRecords.reduce((acc, h) => acc + (h.trafficIndex || 100), 0) / historicalRecords.length
    : 100;
  const avgHistOcc = historicalRecords.length > 0
    ? historicalRecords.reduce((acc, h) => acc + (h.occupancyPercent || 85), 0) / historicalRecords.length
    : 85;
  const histFactor = (avgHistTraffic / 100) * (avgHistOcc / 100);
  const monthlyConversionRatePct = parseFloat(
    Math.min(9.2, Math.max(2.1, baseConversionRate * dwellMultiplier * histFactor)).toFixed(2)
  );

  // Estimated monthly conversion actions (direct store visits, web searches, app downloads)
  const estimatedMonthlyConversions = Math.round(monthlyImpressionsVac * (monthlyConversionRatePct / 100) * 0.04);

  // 4. Composite KPI Intensity Score (0 to 100)
  // 50% ROI Multiplier (normalized 1.6-6.5x -> 0-100) + 50% Conversion Rate (normalized 2.1-9.2% -> 0-100)
  const normRoi = Math.min(100, Math.max(0, ((monthlyRoiMultiplier - 1.6) / (6.5 - 1.6)) * 100));
  const normConv = Math.min(100, Math.max(0, ((monthlyConversionRatePct - 2.1) / (9.2 - 2.1)) * 100));
  const kpiIntensityScore = Math.round(normRoi * 0.50 + normConv * 0.50);

  // Intensity tier and visual gradient color
  let intensityTier: SpotKpiMetrics['intensityTier'] = 'Standar (Tier 4)';
  let colorHex = '#06b6d4'; // cyan
  let badgeGlow = 'rgba(6, 182, 212, 0.4)';

  if (kpiIntensityScore >= 78) {
    intensityTier = 'Tertinggi (Tier 1)';
    colorHex = '#ef4444'; // crimson red
    badgeGlow = 'rgba(239, 68, 68, 0.6)';
  } else if (kpiIntensityScore >= 58) {
    intensityTier = 'Tinggi (Tier 2)';
    colorHex = '#f59e0b'; // amber orange
    badgeGlow = 'rgba(245, 158, 11, 0.5)';
  } else if (kpiIntensityScore >= 38) {
    intensityTier = 'Moderat (Tier 3)';
    colorHex = '#10b981'; // emerald green
    badgeGlow = 'rgba(16, 185, 129, 0.45)';
  }

  const rationale = `ROI ${monthlyRoiMultiplier}x dan konversi ${monthlyConversionRatePct}% (~${estimatedMonthlyConversions.toLocaleString('id-ID')} aksi/bln) didukung VAC harian ${spot.vacDaily.toLocaleString('id-ID')}.`;

  return {
    monthlyRoiMultiplier,
    monthlyConversionRatePct,
    estimatedMonthlyConversions,
    monthlyImpressionsVac,
    monthlyCostIdr,
    cpmIdr: spot.cpmIdr,
    kpiIntensityScore,
    intensityTier,
    colorHex,
    badgeGlow,
    rationale
  };
}
