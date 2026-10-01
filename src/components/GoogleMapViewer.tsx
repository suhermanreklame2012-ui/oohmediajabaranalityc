import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  useMap, 
  useMapsLibrary,
  Circle 
} from '@vis.gl/react-google-maps';
import { BillboardSpot } from '../types/ooh';
import { WEST_JAVA_REGENCIES, WEST_JAVA_REGIONAL_CLUSTERS } from '../data/jabarData';
import { 
  WEST_JAVA_TRAFFIC_HOTSPOTS, 
  TrafficHeatPoint, 
  findNearbySpotsForHotspot 
} from '../data/trafficDensityData';
import { MapLocationSearch, GeocodedLocation } from './MapLocationSearch';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Eye, 
  Sparkles, 
  Navigation, 
  ShieldCheck, 
  RefreshCw, 
  Flame, 
  AlertTriangle,
  Maximize2,
  Minimize2,
  ChevronRight,
  TrendingUp,
  Clock,
  Car,
  Activity,
  MapPin,
  Sliders,
  Filter,
  Check,
  X,
  ChevronDown,
  Building2,
  RotateCcw,
  CheckSquare,
  Square,
  Search,
  Satellite,
  Mountain,
  Swords,
  ShieldAlert,
  Target,
  Boxes,
  Zap,
  ChevronUp
} from 'lucide-react';
import { WEST_JAVA_COMPETITOR_ZONES, CompetitorZone } from '../data/competitorData';
import { ClusteredBillboardMarkers } from './ClusteredBillboardMarkers';
import { calculateSpotKpiMetrics, SpotKpiMetrics } from '../utils/kpiMetrics';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_cErEKUXi76tGidnv0ke-zhMtgGYyq-A';

interface GoogleMapViewerProps {
  spots: BillboardSpot[];
  selectedSpot: BillboardSpot | null;
  onSelectSpot: (spot: BillboardSpot | null) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
  onSwitchToLeaflet?: () => void;
}

// Inner helper component to handle live Google Maps Visualization HeatmapLayer for KPI Intensity (Monthly ROI & Conversion)
function GoogleKpiHeatmapController({
  spots,
  showHeatmap,
  metric = 'composite'
}: {
  spots: BillboardSpot[];
  showHeatmap: boolean;
  metric?: 'composite' | 'roi' | 'conversion';
}) {
  const map = useMap();
  const visualizationLib = useMapsLibrary('visualization') as any;
  const heatmapLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !visualizationLib) return;

    if (!showHeatmap || spots.length === 0) {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
        heatmapLayerRef.current = null;
      }
      return;
    }

    const data = spots.map(spot => {
      const kpi = calculateSpotKpiMetrics(spot);
      let weight = kpi.kpiIntensityScore;
      if (metric === 'roi') {
        weight = Math.min(100, Math.max(10, (kpi.monthlyRoiMultiplier / 6.0) * 100));
      } else if (metric === 'conversion') {
        weight = Math.min(100, Math.max(10, (kpi.monthlyConversionRatePct / 8.5) * 100));
      }

      return {
        location: new google.maps.LatLng(spot.coordinates.lat, spot.coordinates.lng),
        weight: weight
      };
    });

    if (!heatmapLayerRef.current) {
      heatmapLayerRef.current = new (visualizationLib.HeatmapLayer as any)({
        data,
        map,
        radius: 48,
        opacity: 0.85,
        gradient: [
          'rgba(6, 182, 212, 0)',    // Transparent cyan
          'rgba(6, 182, 212, 0.45)', // Cyan
          'rgba(16, 185, 129, 0.75)',// Emerald Green
          'rgba(245, 158, 11, 0.85)',// Amber Gold
          'rgba(249, 115, 22, 0.92)',// Orange
          'rgba(239, 68, 68, 0.98)', // Crimson Red
          'rgba(225, 29, 72, 1)'     // Rose peak
        ]
      });
    } else {
      heatmapLayerRef.current.setData(data);
      heatmapLayerRef.current.setMap(map);
    }

    return () => {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
        heatmapLayerRef.current = null;
      }
    };
  }, [map, visualizationLib, showHeatmap, spots, metric]);

  return null;
}

// Inner helper component to handle live Google TrafficLayer
function GoogleTrafficController({ showTraffic }: { showTraffic: boolean }) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const layerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    if (!layerRef.current) {
      layerRef.current = new google.maps.TrafficLayer();
    }

    if (showTraffic) {
      layerRef.current.setMap(map);
    } else {
      layerRef.current.setMap(null);
    }

    return () => {
      if (layerRef.current) {
        layerRef.current.setMap(null);
      }
    };
  }, [map, mapsLib, showTraffic]);

  return null;
}

// Inner helper component to manage map type (roadmap, hybrid/satellite, terrain)
function GoogleMapTypeController({ mapTypeId }: { mapTypeId: string }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(mapTypeId);
  }, [map, mapTypeId]);
  return null;
}

// Inner helper component to manage camera movement & bounds fitting
function GoogleMapCameraController({ 
  selectedRegencies, 
  spots,
  selectedSpot,
  searchedLocation
}: { 
  selectedRegencies: string[]; 
  spots: BillboardSpot[];
  selectedSpot: BillboardSpot | null;
  searchedLocation: GeocodedLocation | null;
}) {
  const map = useMap();

  // Smoothly pan and zoom to geocoded searched location
  useEffect(() => {
    if (!map || !searchedLocation) return;
    map.panTo({ lat: searchedLocation.lat, lng: searchedLocation.lng });
    map.setZoom(16);
  }, [map, searchedLocation]);

  // Fit bounds when selected regencies change
  useEffect(() => {
    if (!map) return;
    if (searchedLocation) return; // Do not override if user just searched a location

    if (selectedRegencies.length === 0 || selectedRegencies.includes('Semua')) {
      map.panTo({ lat: -6.9175, lng: 107.6191 });
      map.setZoom(9);
      return;
    }

    if (selectedRegencies.length === 1) {
      const reg = WEST_JAVA_REGENCIES.find(r => r.name === selectedRegencies[0]);
      if (reg) {
        map.panTo({ lat: reg.center[0], lng: reg.center[1] });
        map.setZoom(reg.zoom);
        return;
      }
    }

    // Multiple regencies: fit bounds
    const matchingSpots = spots.filter(s => selectedRegencies.includes(s.regency));
    if (matchingSpots.length > 0 && window.google?.maps?.LatLngBounds) {
      const bounds = new window.google.maps.LatLngBounds();
      matchingSpots.forEach(s => {
        bounds.extend({ lat: s.coordinates.lat, lng: s.coordinates.lng });
      });
      map.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 });
    }
  }, [map, selectedRegencies, spots, searchedLocation]);

  // Center on spot when selected externally
  useEffect(() => {
    if (!map || !selectedSpot) return;
    map.panTo({ lat: selectedSpot.coordinates.lat, lng: selectedSpot.coordinates.lng });
    map.setZoom(15);
  }, [map, selectedSpot]);

  return null;
}

// Inner helper component to track active viewport bounds on pan/zoom
function ViewportBoundsTracker({ 
  onBoundsChange 
}: { 
  onBoundsChange: (bounds: google.maps.LatLngBounds | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const handleIdle = () => {
      const bounds = map.getBounds();
      onBoundsChange(bounds || null);
    };

    const listener = map.addListener('idle', handleIdle);
    // Initial update
    handleIdle();

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onBoundsChange]);

  return null;
}

export function GoogleMapViewer({
  spots,
  selectedSpot,
  onSelectSpot,
  onOpenDetailModal,
  onSwitchToLeaflet
}: GoogleMapViewerProps) {
  // Region & Category Filters
  const [selectedRegencies, setSelectedRegencies] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [showAllRegionsModal, setShowAllRegionsModal] = useState<boolean>(false);
  const [regionModalSearch, setRegionModalSearch] = useState<string>('');
  const [regionModalCluster, setRegionModalCluster] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map Controls & Layer Overlays
  const [isSatelliteActive, setIsSatelliteActive] = useState<boolean>(false);
  const [isTerrainActive, setIsTerrainActive] = useState<boolean>(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [isClusteringActive, setIsClusteringActive] = useState<boolean>(true);
  const [showCompetitorLayer, setShowCompetitorLayer] = useState<boolean>(false);
  const [showKpiHeatmap, setShowKpiHeatmap] = useState<boolean>(false);
  const [kpiHeatmapMetric, setKpiHeatmapMetric] = useState<'composite' | 'roi' | 'conversion'>('composite');
  const [selectedCompetitorZone, setSelectedCompetitorZone] = useState<CompetitorZone | null>(null);
  const [competitorSectorFilter, setCompetitorSectorFilter] = useState<string>('all');
  const [showQuickView, setShowQuickView] = useState<boolean>(true);
  const [isQuickViewMinimized, setIsQuickViewMinimized] = useState<boolean>(false);
  const [currentMapBounds, setCurrentMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [showHotspotPins, setShowHotspotPins] = useState<boolean>(true);
  const [showReachCircles, setShowReachCircles] = useState<boolean>(false);
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showCorridorDrawer, setShowCorridorDrawer] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<TrafficHeatPoint | null>(null);
  const [infoWindowSpot, setInfoWindowSpot] = useState<BillboardSpot | null>(null);

  // Toggle handler for Marker Clustering
  const handleToggleClustering = () => {
    setIsClusteringActive(prev => !prev);
  };

  // Toggle handler for Competitor Presence Layer
  const handleToggleCompetitorLayer = () => {
    setShowCompetitorLayer(prev => !prev);
  };

  // Toggle handler for Quick View Mode
  const handleToggleQuickView = () => {
    setShowQuickView(prev => !prev);
    if (!showQuickView) {
      setIsQuickViewMinimized(false);
    }
  };

  // Geocoded Location Search State
  const [searchedLocation, setSearchedLocation] = useState<GeocodedLocation | null>(null);
  const [showSearchPinInfo, setShowSearchPinInfo] = useState<boolean>(true);

  // Nearby billboard spots for the searched location
  const nearbySpotsForSearch = useMemo(() => {
    if (!searchedLocation) return [];

    const R = 6371; // Earth's radius in km
    return spots.map(spot => {
      const dLat = (spot.coordinates.lat - searchedLocation.lat) * (Math.PI / 180);
      const dLng = (spot.coordinates.lng - searchedLocation.lng) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(searchedLocation.lat * (Math.PI / 180)) * Math.cos(spot.coordinates.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = R * c;
      return { spot, distKm: Math.round(distKm * 10) / 10 };
    })
    .filter(item => item.distKm <= 5.0) // within 5 km
    .sort((a, b) => a.distKm - b.distKm);
  }, [searchedLocation, spots]);

  // Computed active Google MapType (hybrid for satellite with road labels, terrain for topographical relief)
  const mapTypeId = useMemo(() => {
    if (isSatelliteActive) return 'hybrid';
    if (isTerrainActive) return 'terrain';
    return 'roadmap';
  }, [isSatelliteActive, isTerrainActive]);

  // Separate toggle handlers for Satelit, Terrain, and Traffic Layer
  const handleToggleSatellite = () => {
    if (isSatelliteActive) {
      setIsSatelliteActive(false);
    } else {
      setIsSatelliteActive(true);
      setIsTerrainActive(false);
    }
  };

  const handleToggleTerrain = () => {
    if (isTerrainActive) {
      setIsTerrainActive(false);
    } else {
      setIsTerrainActive(true);
      setIsSatelliteActive(false);
    }
  };

  const handleToggleTraffic = () => {
    setShowTrafficLayer(prev => !prev);
  };

  const handleToggleKpiHeatmap = () => {
    setShowKpiHeatmap(prev => !prev);
  };

  // Spot count by regency map
  const spotCountByRegency = useMemo(() => {
    const counts: Record<string, number> = {};
    spots.forEach(s => {
      counts[s.regency] = (counts[s.regency] || 0) + 1;
    });
    return counts;
  }, [spots]);

  // Key urban hubs highlighted for fast 1-click access
  const topHubCities = useMemo(() => {
    return [
      { name: 'Kota Bandung', shortName: 'Bandung', count: spotCountByRegency['Kota Bandung'] || 0 },
      { name: 'Kota Bekasi', shortName: 'Bekasi', count: spotCountByRegency['Kota Bekasi'] || 0 },
      { name: 'Kota Bogor', shortName: 'Bogor', count: spotCountByRegency['Kota Bogor'] || 0 },
      { name: 'Kota Depok', shortName: 'Depok', count: spotCountByRegency['Kota Depok'] || 0 },
      { name: 'Kabupaten Karawang', shortName: 'Karawang', count: spotCountByRegency['Kabupaten Karawang'] || 0 },
      { name: 'Kota Cirebon', shortName: 'Cirebon', count: spotCountByRegency['Kota Cirebon'] || 0 },
      { name: 'Kabupaten Bogor', shortName: 'Kab. Bogor', count: spotCountByRegency['Kabupaten Bogor'] || 0 },
      { name: 'Kota Cimahi', shortName: 'Cimahi', count: spotCountByRegency['Kota Cimahi'] || 0 },
      { name: 'Kabupaten Bandung', shortName: 'Kab. Bandung', count: spotCountByRegency['Kabupaten Bandung'] || 0 },
      { name: 'Kota Tasikmalaya', shortName: 'Tasikmalaya', count: spotCountByRegency['Kota Tasikmalaya'] || 0 }
    ];
  }, [spotCountByRegency]);

  // Filtered spots based on selected regency/regencies and attributes
  const filteredSpots = useMemo(() => {
    return spots.filter(spot => {
      if (selectedRegencies.length > 0 && !selectedRegencies.includes('Semua')) {
        if (!selectedRegencies.includes(spot.regency)) return false;
      }
      if (selectedType !== 'Semua' && spot.type !== selectedType) return false;
      if (selectedStatus !== 'Semua' && spot.occupancyStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(q);
        const matchRoad = spot.roadName.toLowerCase().includes(q);
        const matchCode = spot.code.toLowerCase().includes(q);
        const matchBrand = (spot.currentBrand || '').toLowerCase().includes(q);
        const matchReg = spot.regency.toLowerCase().includes(q);
        if (!matchName && !matchRoad && !matchCode && !matchBrand && !matchReg) return false;
      }
      return true;
    });
  }, [spots, selectedRegencies, selectedType, selectedStatus, searchQuery]);

  // Billboards currently visible inside active map viewport
  const spotsInViewport = useMemo(() => {
    if (!currentMapBounds) return filteredSpots;
    return filteredSpots.filter(spot => {
      return currentMapBounds.contains({ lat: spot.coordinates.lat, lng: spot.coordinates.lng });
    });
  }, [filteredSpots, currentMapBounds]);

  // Top 5 highest-impression billboards in the current viewport
  const top5ViewportSpots = useMemo(() => {
    return [...spotsInViewport]
      .sort((a, b) => b.dailyGrossReach - a.dailyGrossReach)
      .slice(0, 5);
  }, [spotsInViewport]);

  // Aggregate total daily reach of the top 5 spots
  const top5TotalDailyImpressions = useMemo(() => {
    return top5ViewportSpots.reduce((acc, s) => acc + s.dailyGrossReach, 0);
  }, [top5ViewportSpots]);

  // Hotspots pool filtered by active regency if filtered, or all
  const filteredHotspots = useMemo(() => {
    if (selectedRegencies.length === 0 || selectedRegencies.includes('Semua')) {
      return WEST_JAVA_TRAFFIC_HOTSPOTS;
    }
    const matching = WEST_JAVA_TRAFFIC_HOTSPOTS.filter(h => selectedRegencies.includes(h.regency));
    return matching.length > 0 ? matching : WEST_JAVA_TRAFFIC_HOTSPOTS;
  }, [selectedRegencies]);

  const topCongestedHotspots = useMemo(() => {
    return [...filteredHotspots]
      .sort((a, b) => b.avgVolumePerHour - a.avgVolumePerHour)
      .slice(0, 8);
  }, [filteredHotspots]);

  // Filtered Competitor Presence Zones based on selected regency and sector filter
  const filteredCompetitorZones = useMemo(() => {
    return WEST_JAVA_COMPETITOR_ZONES.filter(zone => {
      if (selectedRegencies.length > 0 && !selectedRegencies.includes('Semua')) {
        if (!selectedRegencies.includes(zone.regency)) return false;
      }
      if (competitorSectorFilter !== 'all') {
        const matches = zone.dominantCompetitorSectors.some(s => s.toLowerCase().includes(competitorSectorFilter.toLowerCase()));
        if (!matches) return false;
      }
      return true;
    });
  }, [selectedRegencies, competitorSectorFilter]);

  // Competitor Layer summary stats
  const competitorLayerStats = useMemo(() => {
    const redOceanCount = filteredCompetitorZones.filter(z => z.saturationLevel === 'high_saturation').length;
    const moderateCount = filteredCompetitorZones.filter(z => z.saturationLevel === 'moderate_presence').length;
    const untappedCount = filteredCompetitorZones.filter(z => z.saturationLevel === 'untapped_opportunity').length;
    return { redOceanCount, moderateCount, untappedCount };
  }, [filteredCompetitorZones]);

  // Handlers for region selection
  const handleSelectSingleRegency = (regName: string) => {
    if (regName === 'Semua') {
      setSelectedRegencies([]);
    } else {
      setSelectedRegencies([regName]);
    }
  };

  const handleToggleRegency = (regName: string) => {
    if (!isMultiSelectMode) {
      if (selectedRegencies.length === 1 && selectedRegencies[0] === regName) {
        setSelectedRegencies([]);
      } else {
        handleSelectSingleRegency(regName);
      }
      return;
    }

    if (selectedRegencies.includes(regName)) {
      setSelectedRegencies(selectedRegencies.filter(r => r !== regName));
    } else {
      setSelectedRegencies([...selectedRegencies, regName]);
    }
  };

  const handleApplyCluster = (clusterRegencies: string[]) => {
    setSelectedRegencies(clusterRegencies);
  };

  const handleResetWestJava = () => {
    setSelectedRegencies([]);
  };

  const handleRemoveSingleRegency = (regName: string) => {
    setSelectedRegencies(selectedRegencies.filter(r => r !== regName));
  };

  // Filtered regencies for modal search & cluster tabs
  const modalFilteredRegencies = useMemo(() => {
    return WEST_JAVA_REGENCIES.filter(r => {
      if (regionModalSearch.trim()) {
        const q = regionModalSearch.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchEco = (r.dominantEconomy || '').toLowerCase().includes(q);
        if (!matchName && !matchEco) return false;
      }
      if (regionModalCluster !== 'all') {
        const cluster = WEST_JAVA_REGIONAL_CLUSTERS.find(c => c.id === regionModalCluster);
        if (cluster && !cluster.regencies.includes(r.name)) return false;
      }
      return true;
    });
  }, [regionModalSearch, regionModalCluster]);

  const isClusterActive = (clusterRegencies: string[]) => {
    if (selectedRegencies.length !== clusterRegencies.length) return false;
    return clusterRegencies.every(r => selectedRegencies.includes(r));
  };

  return (
    <APIProvider 
      apiKey={GOOGLE_MAPS_API_KEY} 
      language="id" 
      region="ID"
      libraries={['marker', 'visualization', 'places', 'geometry']}
    >
      <div className={`relative w-full ${isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[calc(100vh-4rem)]'} flex flex-col overflow-hidden bg-slate-950 font-sans`}>
        
        {/* Top Filter and Controls Bar */}
        <div className="absolute top-3 left-3 right-16 z-20 flex flex-col gap-2 pointer-events-auto max-w-5xl">
          
          {/* Row 1: Search, Filter Selects, Provider Badge */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Google Maps Geocoding API Location Search Bar */}
            <MapLocationSearch 
              onLocationSelected={(location) => {
                setSearchedLocation(location);
                setShowSearchPinInfo(true);
              }}
            />

            <div className="flex items-center gap-2 p-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg shadow-2xl">
              {/* Quick dropdown for all 27 regencies */}
              <select
                value={selectedRegencies.length === 1 ? selectedRegencies[0] : (selectedRegencies.length === 0 ? 'Semua' : 'custom_multi')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Semua') {
                    handleResetWestJava();
                  } else if (val === 'custom_multi') {
                    setShowAllRegionsModal(true);
                  } else {
                    handleSelectSingleRegency(val);
                  }
                }}
                className="px-2 py-1 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-md focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
              >
                <option value="Semua">Semua Wilayah Jabar (27 Kota/Kab · {spots.length} Titik)</option>
                {selectedRegencies.length > 1 && (
                  <option value="custom_multi">
                    ✓ {selectedRegencies.length} Wilayah Terpilih ({filteredSpots.length} Titik)
                  </option>
                )}
                {WEST_JAVA_REGENCIES.map(r => {
                  const count = spotCountByRegency[r.name] || 0;
                  return (
                    <option key={r.name} value={r.name}>
                      {r.name} ({count} titik reklame)
                    </option>
                  );
                })}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="hidden sm:block px-2 py-1 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-md focus:outline-none focus:border-amber-400"
              >
                <option value="Semua">Semua Format Reklame</option>
                <option value="LED Videotron">LED Videotron</option>
                <option value="Megatron">Megatron</option>
                <option value="Static Billboard">Static Billboard</option>
                <option value="JPO Pedestrian Bridge">JPO Bridge</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="hidden md:block px-2 py-1 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-md focus:outline-none focus:border-amber-400"
              >
                <option value="Semua">Semua Status</option>
                <option value="Occupied">Terisi (Occupied)</option>
                <option value="Available">Tersedia (Available)</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>

            {/* Google Maps Official Verified Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 text-emerald-400 rounded-lg shadow-xl text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Google Maps Resmi</span>
            </div>

            {/* Quick Layer Toggles for Satellite, Terrain, and Traffic */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl text-xs">
              {/* Satellite Toggle */}
              <button
                onClick={handleToggleSatellite}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 border ${
                  isSatelliteActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                }`}
                title="Aktifkan / Nonaktifkan Tampilan Citra Satelit Google Earth"
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>Satelit</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isSatelliteActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isSatelliteActive ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Terrain Toggle */}
              <button
                onClick={handleToggleTerrain}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 border ${
                  isTerrainActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                }`}
                title="Aktifkan / Nonaktifkan Tampilan Medan & Kontur Topografi"
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Terrain</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isTerrainActive ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isTerrainActive ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Traffic Layer Toggle */}
              <button
                onClick={handleToggleTraffic}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 border ${
                  showTrafficLayer
                    ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-sm shadow-red-500/20'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                }`}
                title="Aktifkan / Nonaktifkan Lapisan Lalu Lintas Real-Time Google Maps"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Lalu Lintas</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  showTrafficLayer ? 'bg-red-500/30 text-red-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {showTrafficLayer ? 'LIVE' : 'OFF'}
                </span>
              </button>

              {/* Competitor Presence Toggle */}
              <button
                onClick={handleToggleCompetitorLayer}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 border ${
                  showCompetitorLayer
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-500/20 ring-1 ring-rose-500/40'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                }`}
                title="Aktifkan / Nonaktifkan Layer Kehadiran Kompetitor & Ruang Pasar Terbuka (Untapped Spaces)"
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>Kompetitor</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  showCompetitorLayer ? 'bg-rose-500/30 text-rose-200 font-bold' : 'bg-slate-800 text-slate-500'
                }`}>
                  {showCompetitorLayer ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Marker Clustering Toggle */}
              <button
                onClick={handleToggleClustering}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 border ${
                  isClusteringActive
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/40'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                }`}
                title="Aktifkan / Nonaktifkan Pengelompokan Kluster Titik Reklame (Marker Clustering)"
              >
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Kluster</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isClusteringActive ? 'bg-amber-400/30 text-amber-200 font-bold' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isClusteringActive ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Quick View Mode Toggle */}
              <button
                onClick={handleToggleQuickView}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 border ${
                  showQuickView
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400/80 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                }`}
                title="Tampilkan 5 Billboard Impresi Tertinggi di Layar Peta (Viewport)"
              >
                <Zap className={`w-3.5 h-3.5 ${showQuickView ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                <span>Quick View</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  showQuickView ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                }`}>
                  {showQuickView ? `${top5ViewportSpots.length}` : 'OFF'}
                </span>
              </button>

              {/* KPI Heatmap Toggle */}
              <button
                onClick={handleToggleKpiHeatmap}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 border ${
                  showKpiHeatmap
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-lg shadow-amber-400/20 ring-2 ring-amber-400/40'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                }`}
                title="Aktifkan / Nonaktifkan Peta Intensitas KPI (Monthly ROI & Conversion Metrics)"
              >
                <Flame className={`w-3.5 h-3.5 ${showKpiHeatmap ? 'text-slate-950 fill-slate-950 animate-pulse' : 'text-amber-400'}`} />
                <span>KPI Heatmap</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  showKpiHeatmap ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-500'
                }`}>
                  {showKpiHeatmap ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Layer Panel Popover Trigger */}
              <button
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                className={`p-1 rounded-md transition-all ${
                  showLayerPanel ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Buka Pengaturan Layer Lengkap"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            {onSwitchToLeaflet && (
              <button
                onClick={onSwitchToLeaflet}
                className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs font-medium transition-colors"
                title="Beralih ke Open CDN Tile Map"
              >
                Mode Open Tiles
              </button>
            )}
          </div>

          {/* Active Competitor Presence Insight Ribbon */}
          {showCompetitorLayer && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/95 backdrop-blur-md border border-rose-500/50 rounded-xl shadow-2xl text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 font-bold text-rose-400 shrink-0">
                  <Swords className="w-4 h-4 text-rose-400" />
                  Kehadiran Kompetitor & Untapped Spaces:
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Red Ocean ({competitorLayerStats.redOceanCount} Zona Jenuh)
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Moderat ({competitorLayerStats.moderateCount})
                </span>

                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 font-bold shadow-sm shadow-emerald-500/20 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  💎 Peluang Terbuka ({competitorLayerStats.untappedCount} Untapped Blue Ocean)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">Sektor:</span>
                <select
                  value={competitorSectorFilter}
                  onChange={(e) => setCompetitorSectorFilter(e.target.value)}
                  className="px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-700 text-slate-200 rounded-md focus:outline-none focus:border-rose-400 font-medium cursor-pointer"
                >
                  <option value="all">Semua Sektor Industri</option>
                  <option value="Perbankan">Perbankan & Fintech</option>
                  <option value="Telekomunikasi">Telekomunikasi & Provider</option>
                  <option value="Otomotif">Otomotif & EV</option>
                  <option value="E-Commerce">E-Commerce & Digital</option>
                  <option value="Properti">Properti & Real Estate</option>
                  <option value="FMCG">FMCG & F&B</option>
                </select>

                <button
                  onClick={() => setShowCompetitorLayer(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                  title="Sembunyikan Layer Kompetitor"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Active KPI Heatmap Insight Ribbon */}
          {showKpiHeatmap && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/95 backdrop-blur-md border border-amber-500/50 rounded-xl shadow-2xl text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 font-bold text-amber-400 shrink-0">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Peta Intensitas KPI Reklame (Monthly ROI & Konversi):
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Tier 1: ROI &gt; 4.5x &amp; Konversi &gt; 6%
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Tier 2: Tinggi
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Tier 3: Moderat
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Tier 4: Standar
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">Metrik Intensitas:</span>
                <select
                  value={kpiHeatmapMetric}
                  onChange={(e) => setKpiHeatmapMetric(e.target.value as any)}
                  className="px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-700 text-amber-300 rounded-md focus:outline-none focus:border-amber-400 font-semibold cursor-pointer"
                >
                  <option value="composite">Komposit (50% ROI + 50% Konversi)</option>
                  <option value="roi">Hanya Monthly ROI Multiplier</option>
                  <option value="conversion">Hanya Tingkat Konversi (%)</option>
                </select>

                <button
                  onClick={() => setShowKpiHeatmap(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                  title="Sembunyikan KPI Heatmap"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Active Geocoded Location Banner */}
          {searchedLocation && (
            <div className="flex items-center justify-between gap-2 p-2 bg-blue-950/90 backdrop-blur-md border border-blue-500/50 rounded-xl shadow-xl text-xs text-blue-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-md bg-blue-500/20 text-blue-400 shrink-0">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white mr-1.5">{searchedLocation.queryName}</span>
                  <span className="text-blue-300 text-[11px] truncate hidden sm:inline">({searchedLocation.formattedAddress})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/40 text-blue-200 text-[11px] font-mono rounded-md font-bold">
                  {nearbySpotsForSearch.length} Billboard dalam 5 km
                </span>
                <button
                  onClick={() => setSearchedLocation(null)}
                  className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md text-[11px] transition-colors"
                >
                  ✕ Hapus Pin
                </button>
              </div>
            </div>
          )}

          {/* Row 2: Interactive Region Filter Bar (Bar Filter Wilayah Jawa Barat) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider px-2 py-0.5 shrink-0 border-r border-slate-800 pr-2.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Wilayah:</span>
            </div>

            {/* Button: Semua Wilayah Jawa Barat */}
            <button
              onClick={handleResetWestJava}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5 ${
                selectedRegencies.length === 0
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>Seluruh Jabar</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedRegencies.length === 0 ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {spots.length}
              </span>
            </button>

            {/* Primary Quick Hub Chips (Bandung, Bekasi, Bogor, Depok, Karawang, Cirebon, dll) */}
            {topHubCities.map(city => {
              const isSelected = selectedRegencies.includes(city.name);
              return (
                <button
                  key={city.name}
                  onClick={() => handleToggleRegency(city.name)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-400/20'
                      : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                  }`}
                  title={`Filter titik reklame di ${city.name} (${city.count} titik)`}
                >
                  <span>{city.shortName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400/90'
                  }`}>
                    {city.count}
                  </span>
                </button>
              );
            })}

            <div className="h-4 w-px bg-slate-800 shrink-0 mx-0.5" />

            {/* Cluster Presets (Bodebek, Bandung Raya, Pantura Industri) */}
            {WEST_JAVA_REGIONAL_CLUSTERS.slice(0, 3).map(cluster => {
              const active = isClusterActive(cluster.regencies);
              return (
                <button
                  key={cluster.id}
                  onClick={() => handleApplyCluster(cluster.regencies)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-all flex items-center gap-1 border ${
                    active
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border-slate-800'
                  }`}
                  title={`${cluster.name}: ${cluster.description}`}
                >
                  <span>{cluster.name.split(' ')[0]}</span>
                </button>
              );
            })}

            {/* Open Full 27 Regencies Selector Modal */}
            <button
              onClick={() => setShowAllRegionsModal(true)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-400/30 hover:border-amber-400"
            >
              <span>+ 27 Kab/Kota</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Toggle Multi-Select Mode */}
            <button
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1 border ${
                isMultiSelectMode
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-slate-950 text-slate-500 hover:text-slate-300 border-slate-800'
              }`}
              title={isMultiSelectMode ? 'Mode Multi-Pilih Aktif: Klik kota untuk menambah/mengurangi pilihan' : 'Mode Tunggal: Klik kota untuk langsung fokus ke kota tersebut'}
            >
              {isMultiSelectMode ? <CheckSquare className="w-3 h-3 text-emerald-400" /> : <Square className="w-3 h-3" />}
              <span>Multi-Pilih</span>
            </button>

            {/* Clear / Reset Filter Button */}
            {selectedRegencies.length > 0 && (
              <button
                onClick={handleResetWestJava}
                className="px-2 py-1 text-[11px] font-bold rounded-lg shrink-0 transition-all flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
                title="Reset filter wilayah dan tampilkan seluruh Jawa Barat"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Row 3: Active Filter Status Strip (Visible when filtered) */}
          {selectedRegencies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/90 backdrop-blur-md border border-amber-400/30 rounded-xl shadow-xl text-xs">
              <span className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
                <MapPin className="w-3.5 h-3.5" />
                Membatasi Wilayah:
              </span>

              <div className="flex flex-wrap items-center gap-1">
                {selectedRegencies.map(regName => {
                  const count = spotCountByRegency[regName] || 0;
                  return (
                    <span
                      key={regName}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-md font-medium text-[11px]"
                    >
                      <span>{regName}</span>
                      <span className="text-[10px] text-amber-400/80 font-mono">({count})</span>
                      <button
                        onClick={() => handleRemoveSingleRegency(regName)}
                        className="text-amber-400 hover:text-white ml-0.5 rounded-full hover:bg-amber-400/20 p-0.5"
                        title={`Hapus filter ${regName}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="font-semibold text-emerald-400 font-mono">
                  {filteredSpots.length} Titik Ditampilkan
                </span>
                <button
                  onClick={handleResetWestJava}
                  className="text-slate-400 hover:text-white underline hover:no-underline text-[11px]"
                >
                  Hapus Filter Wilayah
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Floating Toolbar on Right Side */}
        <div className="absolute top-3 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 rounded-lg shadow-xl transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Google Live Traffic Toggle */}
          <button
            onClick={handleToggleTraffic}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              showTrafficLayer 
                ? 'bg-red-500/25 border-red-500/70 text-red-400 ring-2 ring-red-500/40' 
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={`Lapisan Lalu Lintas Real-Time: ${showTrafficLayer ? 'Aktif' : 'Nonaktif'}`}
          >
            <Car className="w-4 h-4" />
          </button>

          {/* Competitor Presence Toggle */}
          <button
            onClick={handleToggleCompetitorLayer}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              showCompetitorLayer 
                ? 'bg-rose-500/25 border-rose-500/80 text-rose-300 ring-2 ring-rose-500/40' 
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={`Toggle Layer Kehadiran Kompetitor & Untapped Spaces: ${showCompetitorLayer ? 'Aktif' : 'Nonaktif'}`}
          >
            <Swords className="w-4 h-4" />
          </button>

          {/* Marker Clustering Toggle */}
          <button
            onClick={handleToggleClustering}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              isClusteringActive 
                ? 'bg-amber-400/25 border-amber-400/80 text-amber-300 ring-2 ring-amber-400/40' 
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={`Toggle Kluster Titik Reklame (Clustering): ${isClusteringActive ? 'Aktif' : 'Nonaktif'}`}
          >
            <Boxes className="w-4 h-4" />
          </button>

          {/* Quick View Toggle */}
          <button
            onClick={handleToggleQuickView}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              showQuickView 
                ? 'bg-amber-400/25 border-amber-400/80 text-amber-300 ring-2 ring-amber-400/40' 
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={`Quick View (Top 5 Impresi di Viewport): ${showQuickView ? 'Aktif' : 'Nonaktif'}`}
          >
            <Zap className={`w-4 h-4 ${showQuickView ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* KPI Heatmap Toggle */}
          <button
            onClick={handleToggleKpiHeatmap}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              showKpiHeatmap 
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold ring-2 ring-amber-400/40 shadow-lg shadow-amber-400/20' 
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={`KPI Heatmap (Monthly ROI & Conversion Intensity): ${showKpiHeatmap ? 'Aktif' : 'Nonaktif'}`}
          >
            <Flame className={`w-4 h-4 ${showKpiHeatmap ? 'fill-slate-950 text-slate-950 animate-pulse' : 'text-amber-400'}`} />
          </button>

          {/* Satellite View Toggle */}
          <button
            onClick={handleToggleSatellite}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              isSatelliteActive
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/40'
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={`View Satelit (Google Earth): ${isSatelliteActive ? 'Aktif' : 'Nonaktif'}`}
          >
            <Satellite className="w-4 h-4" />
          </button>

          {/* Terrain View Toggle */}
          <button
            onClick={handleToggleTerrain}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              isTerrainActive
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={`View Medan & Topografi: ${isTerrainActive ? 'Aktif' : 'Nonaktif'}`}
          >
            <Mountain className="w-4 h-4" />
          </button>

          {/* Hotspots Toggle */}
          <button
            onClick={() => setShowHotspotPins(!showHotspotPins)}
            className={`p-2 border rounded-lg shadow-xl transition-colors flex items-center justify-center ${
              showHotspotPins 
                ? 'bg-amber-400/25 border-amber-400/70 text-amber-400' 
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Pin Hotspot Kemacetan Jawa Barat"
          >
            <Flame className="w-4 h-4" />
          </button>

          {/* Reach Circles Toggle */}
          <button
            onClick={() => setShowReachCircles(!showReachCircles)}
            className={`p-2 border rounded-lg shadow-xl transition-colors ${
              showReachCircles 
                ? 'bg-cyan-400/25 border-cyan-400/60 text-cyan-400' 
                : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Lingkaran Jangkauan Kontak (Reach Circles)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Layer Panel Popover Trigger */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-2 border rounded-lg shadow-xl transition-all flex items-center justify-center ${
              showLayerPanel
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-900/95 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Buka Pengaturan Layer Peta Google"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Layer Settings Popover Card */}
        {showLayerPanel && (
          <div className="absolute top-3 right-16 z-30 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pengaturan Layer Google Maps
                </h4>
              </div>
              <button
                onClick={() => setShowLayerPanel(false)}
                className="text-slate-400 hover:text-white p-1 rounded text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Section 1: Tampilan Peta Dasar */}
            <div className="space-y-3 text-xs mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tampilan Peta Dasar:
              </span>

              {/* Standard Road Map */}
              <div 
                onClick={() => {
                  setIsSatelliteActive(false);
                  setIsTerrainActive(false);
                }}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  !isSatelliteActive && !isTerrainActive
                    ? 'bg-amber-400/10 border-amber-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs">Jalan Standar (Roadmap)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Peta vektor jalan jelas & bersih</span>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  !isSatelliteActive && !isTerrainActive ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                }`}>
                  {!isSatelliteActive && !isTerrainActive && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
              </div>

              {/* Satellite View */}
              <div 
                onClick={handleToggleSatellite}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSatelliteActive
                    ? 'bg-cyan-500/10 border-cyan-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="block text-xs">View Satelit (Satellite / Hybrid)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Foto udara satelit resolusi tinggi</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  isSatelliteActive ? 'bg-cyan-500' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    isSatelliteActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Terrain View */}
              <div 
                onClick={handleToggleTerrain}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isTerrainActive
                    ? 'bg-amber-500/10 border-amber-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs">View Terrain (Topografi & Kontur)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Kontur elevasi, bukit & pegunungan</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  isTerrainActive ? 'bg-amber-500' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    isTerrainActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>

            {/* Section 2: Lapisan Data Dinamis */}
            <div className="space-y-3 text-xs pt-3 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lapisan Data Dinamis (Overlays):
              </span>

              {/* Live Traffic Layer */}
              <div 
                onClick={handleToggleTraffic}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  showTrafficLayer
                    ? 'bg-red-500/10 border-red-500/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="block text-xs">Layer Lalu Lintas (Traffic Layer)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Aliran macet live di jalan tol & arteri</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  showTrafficLayer ? 'bg-red-500' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    showTrafficLayer ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Marker Clustering Layer */}
              <div 
                onClick={handleToggleClustering}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isClusteringActive
                    ? 'bg-amber-500/10 border-amber-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs">Kluster Titik Reklame (Clustering)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Gabungkan titik berdekatan saat zoom out di Bandung & Jabar</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  isClusteringActive ? 'bg-amber-400' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-slate-950 transition-transform ${
                    isClusteringActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Quick View Mode Layer */}
              <div 
                onClick={handleToggleQuickView}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  showQuickView
                    ? 'bg-amber-500/10 border-amber-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div>
                    <span className="block text-xs">Quick View (Top 5 Impresi Viewport)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Overlay melayang 5 billboard impresi terbesar di layar</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  showQuickView ? 'bg-amber-400' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-slate-950 transition-transform ${
                    showQuickView ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Competitor Presence Layer */}
              <div 
                onClick={handleToggleCompetitorLayer}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  showCompetitorLayer
                    ? 'bg-rose-500/10 border-rose-500/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="block text-xs">Kehadiran Kompetitor & Untapped Spaces</span>
                    <span className="text-[10px] text-slate-500 font-normal">Peta jenuh iklan vs peluang pasar terbuka</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  showCompetitorLayer ? 'bg-rose-500' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    showCompetitorLayer ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* KPI Heatmap Layer Switch in Popover */}
              <div 
                onClick={handleToggleKpiHeatmap}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  showKpiHeatmap
                    ? 'bg-amber-500/15 border-amber-400/60 text-white font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div>
                    <span className="block text-xs">KPI Heatmap (Monthly ROI & Konversi)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Peta intensitas visual performa ROI & rasio konversi</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  showKpiHeatmap ? 'bg-amber-400' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-slate-950 transition-transform ${
                    showKpiHeatmap ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Hotspots Pin */}
              <div 
                onClick={() => setShowHotspotPins(!showHotspotPins)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  showHotspotPins
                    ? 'bg-amber-500/10 border-amber-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs">Pin Hotspot Kemacetan</span>
                    <span className="text-[10px] text-slate-500 font-normal">Titik simpul macet Jawa Barat</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  showHotspotPins ? 'bg-amber-400' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    showHotspotPins ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Reach Circles */}
              <div 
                onClick={() => setShowReachCircles(!showReachCircles)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  showReachCircles
                    ? 'bg-cyan-500/10 border-cyan-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="block text-xs">Lingkaran Jangkauan Billboard</span>
                    <span className="text-[10px] text-slate-500 font-normal">Radius estimasi jarak kontak</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  showReachCircles ? 'bg-cyan-400' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    showReachCircles ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>

            {/* Reset All Layers */}
            <div className="pt-3 mt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setIsSatelliteActive(false);
                  setIsTerrainActive(false);
                  setShowTrafficLayer(true);
                  setShowHotspotPins(true);
                  setShowReachCircles(false);
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ke Tampilan Standar</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Google Maps Canvas Component */}
        <div className="w-full h-full z-10">
          <Map
            defaultCenter={{ lat: -6.9175, lng: 107.6191 }}
            defaultZoom={9}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapTypeId}
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            disableDefaultUI={false}
            gestureHandling="greedy"
            className="w-full h-full"
          >
            {/* Live Traffic Controller */}
            <GoogleTrafficController showTraffic={showTrafficLayer} />

            {/* Map Type Controller */}
            <GoogleMapTypeController mapTypeId={mapTypeId} />

            {/* Camera and bounds controller */}
            <GoogleMapCameraController 
              selectedRegencies={selectedRegencies} 
              spots={spots} 
              selectedSpot={selectedSpot} 
              searchedLocation={searchedLocation}
            />

            {/* Viewport Bounds Tracker for Quick View Mode */}
            <ViewportBoundsTracker onBoundsChange={setCurrentMapBounds} />

            {/* Geocoded Location Search Pin & Pulse Ring */}
            {searchedLocation && (
              <>
                <Circle
                  center={{ lat: searchedLocation.lat, lng: searchedLocation.lng }}
                  radius={1800} // 1.8km radius circle around searched location
                  strokeColor="#3b82f6"
                  strokeOpacity={0.8}
                  strokeWeight={2}
                  fillColor="#3b82f6"
                  fillOpacity={0.12}
                />
                <AdvancedMarker
                  position={{ lat: searchedLocation.lat, lng: searchedLocation.lng }}
                  title={`Lokasi Hasil Pencarian: ${searchedLocation.queryName}`}
                  zIndex={1500}
                  onClick={() => setShowSearchPinInfo(true)}
                >
                  <div className="relative group cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-2xl ring-4 ring-blue-500/50 animate-bounce">
                      <Navigation className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </AdvancedMarker>
              </>
            )}

            {/* Reach Circles */}
            {showReachCircles && filteredSpots.map(spot => (
              <Circle
                key={`circle-${spot.id}`}
                center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
                radius={Math.min(1200, Math.max(300, (spot.dailyGrossReach / 250)))}
                strokeColor="#fbbf24"
                strokeOpacity={0.6}
                strokeWeight={1.5}
                fillColor="#fbbf24"
                fillOpacity={0.12}
              />
            ))}

            {/* Competitor Presence Concentration Circles */}
            {showCompetitorLayer && filteredCompetitorZones.map(zone => {
              const isHigh = zone.saturationLevel === 'high_saturation';
              const isUntapped = zone.saturationLevel === 'untapped_opportunity';
              const stroke = isHigh ? '#ef4444' : isUntapped ? '#10b981' : '#f59e0b';

              return (
                <Circle
                  key={`comp-circle-${zone.id}`}
                  center={{ lat: zone.coordinates.lat, lng: zone.coordinates.lng }}
                  radius={zone.radiusMeters}
                  strokeColor={stroke}
                  strokeOpacity={0.85}
                  strokeWeight={isUntapped ? 2.5 : 2}
                  fillColor={stroke}
                  fillOpacity={isUntapped ? 0.22 : 0.13}
                />
              );
            })}

            {/* Competitor Presence Zone Center Marker Badges */}
            {showCompetitorLayer && filteredCompetitorZones.map(zone => {
              const isHigh = zone.saturationLevel === 'high_saturation';
              const isUntapped = zone.saturationLevel === 'untapped_opportunity';

              return (
                <AdvancedMarker
                  key={`comp-marker-${zone.id}`}
                  position={{ lat: zone.coordinates.lat, lng: zone.coordinates.lng }}
                  title={`Zona Kompetitor: ${zone.name}`}
                  zIndex={850}
                  onClick={() => setSelectedCompetitorZone(zone)}
                >
                  <div className="relative group cursor-pointer transition-transform hover:scale-110">
                    <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xl flex items-center gap-1.5 border backdrop-blur-md ${
                      isHigh
                        ? 'bg-red-950/90 text-red-200 border-red-500/80 ring-2 ring-red-500/40'
                        : isUntapped
                        ? 'bg-emerald-950/90 text-emerald-200 border-emerald-400 ring-2 ring-emerald-500/50 animate-pulse'
                        : 'bg-amber-950/90 text-amber-200 border-amber-500/70 ring-2 ring-amber-500/40'
                    }`}>
                      {isHigh ? (
                        <Swords className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : isUntapped ? (
                        <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="whitespace-nowrap font-sans">{zone.name.split(' ')[0]}</span>
                      <span className="font-mono text-[10px] opacity-80">
                        {isUntapped ? '💎 Untapped' : `${zone.clutterScore}%`}
                      </span>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* KPI Heatmap: Google Maps Visualization HeatmapLayer (Smooth Gaussian Thermal Intensity) */}
            <GoogleKpiHeatmapController
              spots={filteredSpots}
              showHeatmap={showKpiHeatmap}
              metric={kpiHeatmapMetric}
            />

            {/* KPI Heatmap: Visual Intensity Halos over Billboard Markers */}
            {showKpiHeatmap && filteredSpots.map(spot => {
              const kpi = calculateSpotKpiMetrics(spot);
              const radiusMeters = 180 + (kpi.kpiIntensityScore * 4.2);
              return (
                <Circle
                  key={`kpi-halo-${spot.id}`}
                  center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
                  radius={radiusMeters}
                  strokeColor={kpi.colorHex}
                  strokeOpacity={0.8}
                  strokeWeight={2}
                  fillColor={kpi.colorHex}
                  fillOpacity={0.22}
                />
              );
            })}

            {/* Clustered or Direct Billboard Advanced Markers */}
            <ClusteredBillboardMarkers
              spots={filteredSpots}
              selectedSpot={selectedSpot}
              onSelectSpot={(spot) => {
                onSelectSpot(spot);
                setInfoWindowSpot(spot);
              }}
              setInfoWindowSpot={setInfoWindowSpot}
              showCompetitorLayer={showCompetitorLayer}
              showKpiHeatmap={showKpiHeatmap}
              clusteringEnabled={isClusteringActive}
            />

            {/* Traffic Hotspot Pins */}
            {showHotspotPins && filteredHotspots.map(hotspot => {
              const isSelected = activeHotspot?.id === hotspot.id;
              const badgeColor = 
                hotspot.congestionLevel === 'Macet Total' ? '#ef4444' :
                hotspot.congestionLevel === 'Padat Merayap' ? '#f59e0b' : '#10b981';

              return (
                <AdvancedMarker
                  key={hotspot.id}
                  position={{ lat: hotspot.lat, lng: hotspot.lng }}
                  title={`${hotspot.name} - ${hotspot.congestionLevel}`}
                  zIndex={isSelected ? 900 : 80}
                  onClick={() => {
                    setActiveHotspot(hotspot);
                    setShowCorridorDrawer(true);
                  }}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer ${
                    hotspot.congestionLevel === 'Macet Total' ? 'traffic-pulse-hot' : ''
                  }`} style={{ backgroundColor: badgeColor }}>
                    <Flame className="w-3 h-3 text-white fill-white" />
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow for Clicked Billboard */}
            {infoWindowSpot && (
              <InfoWindow
                position={{ lat: infoWindowSpot.coordinates.lat, lng: infoWindowSpot.coordinates.lng }}
                onCloseClick={() => setInfoWindowSpot(null)}
              >
                <div className="p-1 min-w-[220px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="font-bold text-amber-600">{infoWindowSpot.code}</span>
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                      {infoWindowSpot.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1">
                    {infoWindowSpot.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-2">
                    {infoWindowSpot.regency} · {infoWindowSpot.roadName}
                  </p>
                  <div className="bg-slate-100 p-1.5 rounded text-[10px] font-mono grid grid-cols-2 gap-1 mb-2">
                    <div>
                      <span className="text-slate-500 block">DWELL TIME:</span>
                      <span className="font-bold text-amber-600">{infoWindowSpot.avgDwellTimeSec}s</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">VAC HARIAN:</span>
                      <span className="font-bold text-emerald-600">{infoWindowSpot.vacDaily.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* KPI Heatmap Metrics Highlight */}
                  {showKpiHeatmap && (
                    <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg text-[10px] font-mono mb-2 space-y-1">
                      <div className="flex items-center justify-between text-amber-900 font-bold border-b border-amber-200 pb-1">
                        <span>🔥 METRIK KPI BULANAN:</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                          {calculateSpotKpiMetrics(infoWindowSpot).intensityTier}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-0.5">
                        <div>
                          <span className="text-amber-800 block text-[9px]">MONTHLY ROI:</span>
                          <strong className="text-amber-950 text-xs font-black">
                            {calculateSpotKpiMetrics(infoWindowSpot).monthlyRoiMultiplier}x
                          </strong>
                        </div>
                        <div>
                          <span className="text-amber-800 block text-[9px]">KONVERSI:</span>
                          <strong className="text-emerald-700 text-xs font-black">
                            {calculateSpotKpiMetrics(infoWindowSpot).monthlyConversionRatePct}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onOpenDetailModal(infoWindowSpot)}
                    className="w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded transition-colors text-center"
                  >
                    Buka Analisis Lengkap
                  </button>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Competitor Presence Zone */}
            {selectedCompetitorZone && (
              <InfoWindow
                position={{ lat: selectedCompetitorZone.coordinates.lat, lng: selectedCompetitorZone.coordinates.lng }}
                onCloseClick={() => setSelectedCompetitorZone(null)}
              >
                <div className="p-1 min-w-[260px] max-w-[320px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                      selectedCompetitorZone.saturationLevel === 'high_saturation'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : selectedCompetitorZone.saturationLevel === 'untapped_opportunity'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {selectedCompetitorZone.opportunityRecommendation}
                    </span>
                    <span className="text-slate-500 font-semibold">{selectedCompetitorZone.regency}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-950 leading-tight mb-1.5">
                    {selectedCompetitorZone.name}
                  </h4>

                  <div className="bg-slate-100 p-2 rounded-lg text-[10px] font-mono grid grid-cols-3 gap-1 mb-2 text-center">
                    <div>
                      <span className="text-slate-500 block">CLUTTER</span>
                      <span className="font-bold text-red-600">{selectedCompetitorZone.clutterScore}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">OKUPANSI</span>
                      <span className="font-bold text-slate-800">{selectedCompetitorZone.occupancyRatePct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">VAC HARIAN</span>
                      <span className="font-bold text-emerald-600">{(selectedCompetitorZone.vacDailyTotal / 1000).toFixed(0)}k</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] mb-2">
                    <div>
                      <span className="text-slate-500 font-semibold text-[10px] block">Sektor Kompetitor Dominan:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {selectedCompetitorZone.dominantCompetitorSectors.map((sec, i) => (
                          <span key={i} className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-medium">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold text-[10px] block">Brand Terpantau di Koridor:</span>
                      <span className="text-slate-800 font-semibold text-[11px] block">
                        {selectedCompetitorZone.activeCompetitorBrands.join(', ')}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="text-amber-800 font-bold block text-[10px] uppercase">Peluang Ruang Pasar:</span>
                      <p className="text-slate-700 leading-snug text-[10px]">
                        {selectedCompetitorZone.untappedMarketRationale}
                      </p>
                    </div>

                    <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-900 leading-snug">
                      <strong>Strategi Penempatan:</strong> {selectedCompetitorZone.recommendedStrategy}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCompetitorZone(null)}
                    className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-white text-[11px] rounded font-medium transition-colors"
                  >
                    Tutup Info
                  </button>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Searched Geocoded Location */}
            {searchedLocation && showSearchPinInfo && (
              <InfoWindow
                position={{ lat: searchedLocation.lat, lng: searchedLocation.lng }}
                onCloseClick={() => setShowSearchPinInfo(false)}
              >
                <div className="p-1 min-w-[240px] max-w-[290px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] font-mono text-blue-700 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-blue-600" /> HASIL GEOCODING GOOGLE
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-semibold text-[9px]">
                      Jawa Barat
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-950 leading-tight mb-1">
                    {searchedLocation.queryName}
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                    {searchedLocation.formattedAddress}
                  </p>

                  <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-[10px] text-blue-900 mb-2 font-mono flex items-center justify-between">
                    <span>SEKITAR LOKASI:</span>
                    <span className="font-bold text-blue-700">
                      {nearbySpotsForSearch.length} Titik Reklame (≤5 km)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {nearbySpotsForSearch.length > 0 && (
                      <button
                        onClick={() => {
                          onSelectSpot(nearbySpotsForSearch[0].spot);
                        }}
                        className="flex-1 py-1 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded transition-colors text-center"
                      >
                        Lihat Billboard ({nearbySpotsForSearch[0].distKm} km)
                      </button>
                    )}
                    <button
                      onClick={() => setSearchedLocation(null)}
                      className="py-1 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] rounded transition-colors font-medium"
                    >
                      Tutup Pin
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>

        {/* Bottom Floating Bar */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3">
          {/* Traffic Legend */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg text-xs shadow-2xl">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Car className="w-3.5 h-3.5 text-emerald-400" />
              Lalu Lintas Google Maps:
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-emerald-400 font-bold">Lancar</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold">Padat</span>
              <span className="text-slate-600">·</span>
              <span className="text-red-500 font-bold">Macet Total</span>
            </div>
          </div>

          {/* Billboard Types Legend */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg text-xs shadow-2xl">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300">LED Videotron</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="text-slate-300">Megatron</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-slate-300">Static Billboard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">JPO Bridge</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px] border-l border-slate-800 pl-2">
              {filteredSpots.length} Titik Ditampilkan
            </div>
          </div>

          {/* Toggle Corridor Drawer Button */}
          <button
            onClick={() => setShowCorridorDrawer(!showCorridorDrawer)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-2xl border ${
              showCorridorDrawer
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-900/90 text-amber-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top Koridor Macet Jabar ({topCongestedHotspots.length})</span>
          </button>

          {/* Toggle Quick View Button */}
          <button
            onClick={() => {
              setShowQuickView(!showQuickView);
              if (!showQuickView) setIsQuickViewMinimized(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-2xl border ${
              showQuickView
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
            title="Tampilkan Quick View: 5 Billboard Impresi Tertinggi di Viewport"
          >
            <Zap className={`w-3.5 h-3.5 ${showQuickView ? 'text-slate-950 fill-slate-950' : 'text-amber-400'}`} />
            <span>Quick View Top 5 ({top5ViewportSpots.length})</span>
          </button>
        </div>

        {/* Quick View Floating Overlay: Top 5 Highest-Impression Billboards in Current Viewport */}
        {showQuickView && (
          isQuickViewMinimized ? (
            <div 
              onClick={() => setIsQuickViewMinimized(false)}
              className="absolute bottom-16 right-4 sm:right-6 z-30 flex items-center gap-2 px-3 py-2 bg-slate-950/95 backdrop-blur-md border border-amber-500/60 rounded-xl shadow-2xl cursor-pointer hover:border-amber-400 transition-all text-xs font-semibold text-white group"
            >
              <div className="p-1 rounded-md bg-amber-400/20 text-amber-400 group-hover:scale-110 transition-transform">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span>Quick View: Top 5 Impresi</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-400 text-slate-950 font-bold">
                {spotsInViewport.length} di Layar
              </span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </div>
          ) : (
            <div className="absolute bottom-16 right-4 sm:right-6 z-30 w-80 sm:w-96 max-h-[75vh] flex flex-col bg-slate-950/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 shrink-0">
                    <Zap className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Quick View: Top 5 Impresi
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Live Viewport
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {spotsInViewport.length} titik reklame terlihat di area peta saat ini
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setIsQuickViewMinimized(true)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Minimalkan Quick View"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowQuickView(false)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Tutup Quick View"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spot List */}
              <div className="p-2.5 overflow-y-auto space-y-2 max-h-[50vh] scrollbar-thin">
                {top5ViewportSpots.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Tidak ada titik reklame yang berada di dalam area tampilan peta saat ini. Geser atau zoom out peta untuk melihat billboard terdekat.
                  </div>
                ) : (
                  top5ViewportSpots.map((spot, index) => {
                    const isSelected = selectedSpot?.id === spot.id;
                    const rankColors = [
                      'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md', // #1
                      'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-black shadow-md', // #2
                      'bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black shadow-md',       // #3
                      'bg-slate-800 text-slate-300 font-bold',                                             // #4
                      'bg-slate-800 text-slate-300 font-bold'                                              // #5
                    ];

                    return (
                      <div
                        key={spot.id}
                        onClick={() => {
                          onSelectSpot(spot);
                          setInfoWindowSpot(spot);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                            : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${rankColors[index]}`}>
                              {index === 0 ? '👑' : index + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-xs truncate group-hover:text-amber-300 transition-colors">
                                  {spot.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {spot.code}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {spot.regency} · {spot.roadName}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetailModal(spot);
                            }}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white rounded text-[10px] font-semibold transition-colors shrink-0"
                          >
                            Detail
                          </button>
                        </div>

                        {/* Impressions & Metrics Row */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center gap-1 text-slate-300">
                            <span className="text-slate-500 text-[10px]">DGR:</span>
                            <span className="font-bold text-amber-400">
                              {spot.dailyGrossReach.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[9px] text-slate-500">/hari</span>
                          </div>

                          <div className="flex items-center gap-1 text-slate-300">
                            <span className="text-slate-500 text-[10px]">VAC:</span>
                            <span className="font-bold text-emerald-400">
                              {spot.vacDaily.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-sans font-bold ${
                            spot.occupancyStatus === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {spot.occupancyStatus === 'Available' ? 'Tersedia' : 'Terisi'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {top5ViewportSpots.length > 0 && (
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    Total Top 5: <strong className="text-amber-400 font-mono">{top5TotalDailyImpressions.toLocaleString('id-ID')}</strong> DGR/hari
                  </div>
                  <button
                    onClick={() => {
                      if (top5ViewportSpots.length > 0) {
                        onSelectSpot(top5ViewportSpots[0]);
                        setInfoWindowSpot(top5ViewportSpots[0]);
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[10px] transition-colors shadow-md"
                  >
                    Lihat #1 Teratas
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* Top Congested Corridors Drawer (Collapsible) */}
        {showCorridorDrawer && (
          <div className="absolute bottom-16 left-4 z-30 w-80 sm:w-96 max-h-96 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Koridor Trafik Paling Padat</h4>
              </div>
              <button
                onClick={() => setShowCorridorDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {topCongestedHotspots.map((hotspot, idx) => {
                const isSelected = activeHotspot?.id === hotspot.id;
                const nearby = findNearbySpotsForHotspot(hotspot, spots, 2.5);

                return (
                  <div
                    key={hotspot.id}
                    onClick={() => {
                      setActiveHotspot(hotspot);
                      if (nearby.length > 0) {
                        onSelectSpot(nearby[0].spot);
                      }
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-100">{hotspot.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{hotspot.regency} · {hotspot.roadName}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded shrink-0 ${
                        hotspot.congestionLevel === 'Macet Total'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {hotspot.congestionLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                      <span className="font-mono text-amber-400 font-bold">
                        {hotspot.avgVolumePerHour.toLocaleString('id-ID')} kend/jam
                      </span>
                      <span className="text-emerald-400 font-medium">
                        {nearby.length} Billboard dalam radius
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Spot Details Sidebar Drawer */}
        {selectedSpot ? (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 z-30 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">{selectedSpot.code}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedSpot.name}</h3>
              </div>
              <button
                onClick={() => onSelectSpot(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-semibold rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Koridor Lokasi & Tipe Jalan</span>
                <p className="text-slate-200 font-semibold">{selectedSpot.roadName}</p>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <span className="text-amber-400 font-medium">{selectedSpot.regency}</span>
                  <span>·</span>
                  <span>Kec. {selectedSpot.district}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Koordinat GPS WGS84:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {selectedSpot.coordinates.lat.toFixed(4)}, {selectedSpot.coordinates.lng.toFixed(4)}
                  </span>
                </div>
                <div className="text-slate-400 mt-1">
                  Arah Pandang: <span className="text-slate-200 font-medium">{selectedSpot.facingDirection}</span>
                </div>
              </div>

              {/* Metric Snapshot */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Gross Reach (DGR)</span>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {selectedSpot.dailyGrossReach.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">kontak / hari</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Visibility Adjusted (VAC)</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                    {selectedSpot.vacDaily.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">kontak tertarget</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Rata-rata Dwell Time</span>
                  <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                    {selectedSpot.avgDwellTimeSec} detik
                  </span>
                  <span className="text-[10px] text-slate-500 block">kecepatan {selectedSpot.avgSpeedKmh} km/jam</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Indeks Efektivitas</span>
                  <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                    {selectedSpot.effectivenessScore} / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-slate-800">
              <button
                onClick={() => onOpenDetailModal(selectedSpot)}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Buka Analisis Lokasi Lengkap</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Full 27 West Java Regencies Filter Modal */}
        {showAllRegionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Filter Wilayah Persebaran Reklame Jawa Barat (Google Maps)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pilih satu atau kombinasi wilayah spesifik (seperti Bandung, Bekasi, Bogor) untuk membatasi persebaran titik reklame pada peta.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllRegionsModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search & Cluster Tabs */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/30 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari nama kota, kabupaten, atau sektor ekonomi..."
                      value={regionModalSearch}
                      onChange={(e) => setRegionModalSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                    />
                    {regionModalSearch && (
                      <button
                        onClick={() => setRegionModalSearch('')}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => {
                        const allNames = WEST_JAVA_REGENCIES.map(r => r.name);
                        setSelectedRegencies(allNames);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Pilih Semua (27)
                    </button>
                    <button
                      onClick={() => {
                        const withSpots = WEST_JAVA_REGENCIES.filter(r => (spotCountByRegency[r.name] || 0) > 0).map(r => r.name);
                        setSelectedRegencies(withSpots);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors"
                    >
                      Hanya Wilayah Beriklan (15)
                    </button>
                    <button
                      onClick={() => setSelectedRegencies([])}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider mr-1">
                    Aglomerasi:
                  </span>
                  <button
                    onClick={() => setRegionModalCluster('all')}
                    className={`px-2.5 py-1 text-xs rounded-lg shrink-0 transition-colors font-medium ${
                      regionModalCluster === 'all'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Semua Wilayah ({WEST_JAVA_REGENCIES.length})
                  </button>
                  {WEST_JAVA_REGIONAL_CLUSTERS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setRegionModalCluster(c.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg shrink-0 transition-colors font-medium border ${
                        regionModalCluster === c.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="ml-1 text-[10px] opacity-75">({c.regencies.length})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Body: Cards Grid */}
              <div className="p-4 sm:p-5 overflow-y-auto max-h-[52vh] flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {modalFilteredRegencies.map(reg => {
                    const count = spotCountByRegency[reg.name] || 0;
                    const isChecked = selectedRegencies.includes(reg.name);

                    return (
                      <div
                        key={reg.name}
                        onClick={() => {
                          let next: string[];
                          if (isChecked) {
                            next = selectedRegencies.filter(r => r !== reg.name);
                          } else {
                            next = [...selectedRegencies, reg.name];
                          }
                          setSelectedRegencies(next);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-amber-400/10 border-amber-400/60 shadow-lg shadow-amber-400/5 ring-1 ring-amber-400/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                          isChecked ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className="text-xs font-bold text-white truncate">
                              {reg.name}
                            </h4>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded shrink-0 font-mono ${
                              count > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {count} Reklame
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 line-clamp-1 mb-1">
                            {reg.dominantEconomy}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>{reg.type}</span>
                            <span>·</span>
                            <span>{(reg.totalPopulation / 1000000).toFixed(2)}M jiwa</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Status Pilihan:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {selectedRegencies.length === 0 ? 'Seluruh Jawa Barat (Semua 27 Kab/Kota)' : `${selectedRegencies.length} Wilayah Dipilih`}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    {filteredSpots.length} Titik Ditampilkan
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleResetWestJava();
                      setShowAllRegionsModal(false);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                  >
                    Tampilkan Seluruh Jabar
                  </button>
                  <button
                    onClick={() => setShowAllRegionsModal(false)}
                    className="px-4 py-1.5 text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors shadow-lg shadow-amber-400/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Terapkan Filter Wilayah</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </APIProvider>
  );
}
