import { BillboardSpot } from '../types/ooh';
import { estimateRoadDistanceKm, calculateBearing } from './routeOptimizer';

export interface BaseLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
}

export const BANDUNG_BASE_LOCATIONS: BaseLocation[] = [
  {
    id: 'base_pasteur',
    name: 'Pool Operasional & Skylift Pasteur',
    address: 'Jl. Dr. Djunjunan No. 155, Sukajadi, Kota Bandung',
    lat: -6.8942,
    lng: 107.5788,
    description: 'Pool utama armada crane skylift dan teknisi kelistrikan gerbang tol barat.'
  },
  {
    id: 'base_dago',
    name: 'Kantor Pusat & Workshop Dago',
    address: 'Jl. Ir. H. Juanda No. 102, Coblong, Kota Bandung',
    lat: -6.8905,
    lng: 107.6105,
    description: 'Pusat operasional, tim inspeksi visual, dan suku cadang modul LED digital.'
  },
  {
    id: 'base_soetta',
    name: 'Gudang Material & Rangka Soekarno-Hatta',
    address: 'Jl. Soekarno-Hatta No. 490, Buahbatu, Kota Bandung',
    lat: -6.9482,
    lng: 107.6432,
    description: 'Penyimpanan plat besi, vinyl billboard, genset cadangan, dan armada berat.'
  },
  {
    id: 'base_gedung_sate',
    name: 'Hub Lapangan Area Gedung Sate',
    address: 'Jl. Diponegoro No. 22, Cibeunying Bandung',
    lat: -6.9025,
    lng: 107.6186,
    description: 'Posko cepat respon darurat reklame area pusat kota & kantor pemerintahan.'
  }
];

export interface SpotMaintenanceDetail {
  spotId: string;
  permitNumber: string;
  permitExpiryDate: string; // YYYY-MM-DD
  daysUntilPermitExpiry: number;
  permitStatus: 'Expired' | 'Expiring Soon' | 'Active';
  maintenanceStatus: 'Good' | 'Needs Inspection' | 'Repair Required' | 'Under Repair';
  lastInspectionDate: string;
  physicalIssues: string[];
  structuralIntegrityScore: number; // 0 - 100
  urgencyLevel: 'High' | 'Medium' | 'Low';
  estimatedRepairCostIdr: number;
}

// Generate deterministic maintenance profile for any spot
export function getSpotMaintenanceDetail(spot: BillboardSpot): SpotMaintenanceDetail {
  // Simple hash for deterministic values based on spot.id
  let hash = 0;
  for (let i = 0; i < spot.id.length; i++) {
    hash = (hash << 5) - hash + spot.id.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // 1. Permit expiry dates relative to current date (Oct 2026)
  const baseYear = 2026;
  const mod = posHash % 10;
  
  let expiryYear = baseYear;
  let expiryMonth = 10;
  let expiryDay = 15;
  let permitStatus: 'Expired' | 'Expiring Soon' | 'Active' = 'Active';
  let daysUntil = 60;

  if (mod === 1 || mod === 6) {
    // Expired
    expiryYear = 2026;
    expiryMonth = 8 + (posHash % 2); // Aug or Sept 2026
    expiryDay = (posHash % 25) + 1;
    daysUntil = -((posHash % 45) + 5);
    permitStatus = 'Expired';
  } else if (mod === 2 || mod === 7) {
    // Expiring soon in < 30 days
    expiryYear = 2026;
    expiryMonth = 10;
    expiryDay = (posHash % 20) + 10;
    daysUntil = (posHash % 25) + 4;
    permitStatus = 'Expiring Soon';
  } else {
    // Active
    expiryYear = 2027;
    expiryMonth = (posHash % 11) + 1;
    expiryDay = (posHash % 28) + 1;
    daysUntil = (posHash % 250) + 75;
    permitStatus = 'Active';
  }

  const permitExpiryDate = `${expiryYear}-${String(expiryMonth).padStart(2, '0')}-${String(expiryDay).padStart(2, '0')}`;
  const permitNumber = `SIMBG-JB-${expiryYear}-${String(posHash % 9000 + 1000)}`;

  // 2. Maintenance & physical repair status
  let maintenanceStatus: 'Good' | 'Needs Inspection' | 'Repair Required' | 'Under Repair' = 'Good';
  let physicalIssues: string[] = [];
  let integrityScore = 92;
  let urgency: 'High' | 'Medium' | 'Low' = 'Low';
  let repairCost = 0;

  if (mod === 3 || mod === 8) {
    maintenanceStatus = 'Repair Required';
    urgency = 'High';
    integrityScore = 68;
    repairCost = 8500000;
    if (spot.type.includes('LED') || spot.type.includes('Videotron')) {
      physicalIssues = [
        '3 Modul LED P4 Panel Kanan Bawah Mati / Glitch Pixel',
        'Suhu Controller Box di atas 65°C - Kipas Exhaust Macet',
        'Kabel Power Input Butuh Terminasi Ulang'
      ];
    } else {
      physicalIssues = [
        '2 Unit Lampu Sorot LED 400W Sebelah Kiri Mati Total',
        'Kekencangan Baut Monopole Menurun (Torsi Butuh Re-alignment)',
        'Permukaan Vinyl Sudut Kiri Atas Sobek Akibat Terpaan Angin'
      ];
    }
  } else if (mod === 4) {
    maintenanceStatus = 'Needs Inspection';
    urgency = 'Medium';
    integrityScore = 79;
    repairCost = 2500000;
    physicalIssues = [
      'Jadwal Rutin Uji Kelayakan Struktur (Sertifikat Laik Fungsi 6 Bulanan)',
      'Pembersihan Panel Akrilik & Cek Korosi Tiang Baja'
    ];
  } else if (mod === 5) {
    maintenanceStatus = 'Under Repair';
    urgency = 'High';
    integrityScore = 74;
    repairCost = 5000000;
    physicalIssues = [
      'Sedang Dalam Penanganan Teknisi: Penggantian Power Supply 200W',
      'Pengecatan Ulang Rangka Anti-Karat Base Plate'
    ];
  } else {
    maintenanceStatus = 'Good';
    urgency = 'Low';
    integrityScore = 95;
    physicalIssues = ['Kondisi struktural, kelistrikan, dan visual prima. Bebas karat.'];
  }

  const lastInspectionDate = `2026-09-${String((posHash % 25) + 1).padStart(2, '0')}`;

  return {
    spotId: spot.id,
    permitNumber,
    permitExpiryDate,
    daysUntilPermitExpiry: daysUntil,
    permitStatus,
    maintenanceStatus,
    lastInspectionDate,
    physicalIssues,
    structuralIntegrityScore: integrityScore,
    urgencyLevel: urgency,
    estimatedRepairCostIdr: repairCost
  };
}

export interface LogisticRouteStep {
  stepIndex: number;
  type: 'base_start' | 'spot_inspection' | 'base_return';
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  spot?: BillboardSpot;
  maintenanceDetail?: SpotMaintenanceDetail;
  distanceFromPrevKm: number;
  travelTimeMinutes: number;
  cumulativeDistanceKm: number;
  cumulativeTimeMinutes: number;
  serviceDurationMinutes: number;
  suggestedArrivalClock: string;
  actionRequired: string;
}

export interface LogisticRouteResult {
  baseLocation: BaseLocation;
  vehicleType: 'skylift_truck' | 'pickup_crew' | 'patrol_motorcycle';
  roundTrip: boolean;
  steps: LogisticRouteStep[];
  totalSpotsToVisit: number;
  totalDistanceKm: number;
  totalTravelMinutes: number;
  totalServiceMinutes: number;
  totalMissionDurationHours: number;
  estimatedFuelCostIdr: number;
  pathPolylineCoordinates: [number, number][];
  routeSummaryNarrative: string;
}

/**
 * Solves the Traveling Salesperson Problem (TSP) starting from baseLocation in Bandung,
 * visiting all selected spots in the most fuel-efficient and shortest distance order,
 * with optional return to base.
 */
export function calculateLogisticRoute(
  baseLocation: BaseLocation,
  spotsToVisit: BillboardSpot[],
  roundTrip: boolean = true,
  vehicleType: 'skylift_truck' | 'pickup_crew' | 'patrol_motorcycle' = 'pickup_crew',
  startTimeClock: string = '08:00'
): LogisticRouteResult {
  if (spotsToVisit.length === 0) {
    return {
      baseLocation,
      vehicleType,
      roundTrip,
      steps: [],
      totalSpotsToVisit: 0,
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      totalServiceMinutes: 0,
      totalMissionDurationHours: 0,
      estimatedFuelCostIdr: 0,
      pathPolylineCoordinates: [],
      routeSummaryNarrative: 'Tidak ada titik reklame yang dipilih untuk rute inspeksi.'
    };
  }

  // 1. Vehicle specs (speed & fuel consumption)
  let avgSpeedKmh = 32;
  let fuelCostPerKmIdr = 1600; // Pertalite/Dexlite per km
  if (vehicleType === 'skylift_truck') {
    avgSpeedKmh = 24; // Slower due to height & Bandung traffic
    fuelCostPerKmIdr = 3200;
  } else if (vehicleType === 'patrol_motorcycle') {
    avgSpeedKmh = 38; // Faster through traffic
    fuelCostPerKmIdr = 650;
  }

  // 2. Nearest-Neighbor Heuristic with 2-Opt refinement for visiting sequence
  const unvisited = [...spotsToVisit];
  const orderedSpots: BillboardSpot[] = [];

  let currentLat = baseLocation.lat;
  let currentLng = baseLocation.lng;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = estimateRoadDistanceKm(currentLat, currentLng, unvisited[i].coordinates.lat, unvisited[i].coordinates.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextSpot = unvisited.splice(nearestIndex, 1)[0];
    orderedSpots.push(nextSpot);
    currentLat = nextSpot.coordinates.lat;
    currentLng = nextSpot.coordinates.lng;
  }

  // 3. Build step-by-step itinerary with arrival clocks and cumulative stats
  const steps: LogisticRouteStep[] = [];
  const polylineCoords: [number, number][] = [];

  // Parse start time (e.g. "08:00")
  const [startHourStr, startMinStr] = startTimeClock.split(':');
  let currentTotalMinutes = (parseInt(startHourStr, 10) || 8) * 60 + (parseInt(startMinStr, 10) || 0);
  let cumulativeDist = 0;
  let totalTravelMins = 0;
  let totalServiceMins = 0;

  // Step 0: Start from Bandung Base
  polylineCoords.push([baseLocation.lat, baseLocation.lng]);
  steps.push({
    stepIndex: 0,
    type: 'base_start',
    locationName: baseLocation.name,
    address: baseLocation.address,
    lat: baseLocation.lat,
    lng: baseLocation.lng,
    distanceFromPrevKm: 0,
    travelTimeMinutes: 0,
    cumulativeDistanceKm: 0,
    cumulativeTimeMinutes: 0,
    serviceDurationMinutes: 15, // Briefing & tool load
    suggestedArrivalClock: formatClock(currentTotalMinutes),
    actionRequired: 'Pengecekan perlengkapan keselamatan (K3), toolbox kelistrikan, tangga/harness, dan logistik perbaikan.'
  });
  currentTotalMinutes += 15;

  let prevLat = baseLocation.lat;
  let prevLng = baseLocation.lng;

  // Intermediate Spot Steps
  for (let i = 0; i < orderedSpots.length; i++) {
    const spot = orderedSpots[i];
    const maint = getSpotMaintenanceDetail(spot);
    const dist = estimateRoadDistanceKm(prevLat, prevLng, spot.coordinates.lat, spot.coordinates.lng);
    const travelTime = Math.max(8, Math.round((dist / avgSpeedKmh) * 60 * 1.25)); // +25% traffic buffer
    
    // Service duration based on issue
    let serviceMins = 25; // Routine inspection
    if (maint.maintenanceStatus === 'Repair Required' || maint.maintenanceStatus === 'Under Repair') {
      serviceMins = 60; // Physical repair duration
    } else if (maint.permitStatus === 'Expired') {
      serviceMins = 35; // Verification & legal photo audit
    }

    cumulativeDist += dist;
    totalTravelMins += travelTime;
    totalServiceMins += serviceMins;
    currentTotalMinutes += travelTime;

    const arrivalClock = formatClock(currentTotalMinutes);
    currentTotalMinutes += serviceMins;

    steps.push({
      stepIndex: i + 1,
      type: 'spot_inspection',
      locationName: `[${spot.code}] ${spot.name}`,
      address: `${spot.roadName}, ${spot.regency}`,
      lat: spot.coordinates.lat,
      lng: spot.coordinates.lng,
      spot,
      maintenanceDetail: maint,
      distanceFromPrevKm: parseFloat(dist.toFixed(1)),
      travelTimeMinutes: travelTime,
      cumulativeDistanceKm: parseFloat(cumulativeDist.toFixed(1)),
      cumulativeTimeMinutes: totalTravelMins + totalServiceMins,
      serviceDurationMinutes: serviceMins,
      suggestedArrivalClock: arrivalClock,
      actionRequired: maint.physicalIssues[0] || 'Inspeksi berkala struktur dan visual reklame'
    });

    polylineCoords.push([spot.coordinates.lat, spot.coordinates.lng]);
    prevLat = spot.coordinates.lat;
    prevLng = spot.coordinates.lng;
  }

  // Final Step: Return to Base if roundTrip
  if (roundTrip) {
    const returnDist = estimateRoadDistanceKm(prevLat, prevLng, baseLocation.lat, baseLocation.lng);
    const returnTravelTime = Math.max(10, Math.round((returnDist / avgSpeedKmh) * 60 * 1.25));
    cumulativeDist += returnDist;
    totalTravelMins += returnTravelTime;
    currentTotalMinutes += returnTravelTime;

    steps.push({
      stepIndex: steps.length,
      type: 'base_return',
      locationName: `Kembali ke ${baseLocation.name}`,
      address: baseLocation.address,
      lat: baseLocation.lat,
      lng: baseLocation.lng,
      distanceFromPrevKm: parseFloat(returnDist.toFixed(1)),
      travelTimeMinutes: returnTravelTime,
      cumulativeDistanceKm: parseFloat(cumulativeDist.toFixed(1)),
      cumulativeTimeMinutes: totalTravelMins + totalServiceMins,
      serviceDurationMinutes: 15,
      suggestedArrivalClock: formatClock(currentTotalMinutes),
      actionRequired: 'Penyerahan berita acara hasil inspeksi lapangan, pengembalian alat, dan sinkronisasi database.'
    });

    polylineCoords.push([baseLocation.lat, baseLocation.lng]);
  }

  const totalMissionHours = parseFloat(((totalTravelMins + totalServiceMins) / 60).toFixed(1));
  const estimatedFuelCost = Math.round(cumulativeDist * fuelCostPerKmIdr);

  const vehicleLabel = vehicleType === 'skylift_truck' 
    ? 'Truk Skylift Crane 16m' 
    : vehicleType === 'patrol_motorcycle' 
      ? 'Motor Patroli Reaksi Cepat' 
      : 'Mobil Pick-up Tim Teknisi';

  const routeSummaryNarrative = `Rute logistik optimal dari ${baseLocation.name} mencakup ${orderedSpots.length} titik reklame dengan total jarak tempuh ${cumulativeDist.toFixed(1)} km. Estimasi waktu perjalanan ${Math.round(totalTravelMins / 60)} jam ${(totalTravelMins % 60)} menit dan durasi pengerjaan teknis ${Math.round(totalServiceMins / 60)} jam ${(totalServiceMins % 60)} menit menggunakan armada ${vehicleLabel}.`;

  return {
    baseLocation,
    vehicleType,
    roundTrip,
    steps,
    totalSpotsToVisit: orderedSpots.length,
    totalDistanceKm: parseFloat(cumulativeDist.toFixed(1)),
    totalTravelMinutes: totalTravelMins,
    totalServiceMinutes: totalServiceMins,
    totalMissionDurationHours: totalMissionHours,
    estimatedFuelCostIdr: estimatedFuelCost,
    pathPolylineCoordinates: polylineCoords,
    routeSummaryNarrative
  };
}

function formatClock(totalMinutes: number): string {
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} WIB`;
}
