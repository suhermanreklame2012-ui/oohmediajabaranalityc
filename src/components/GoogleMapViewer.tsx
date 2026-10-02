import React, { useEffect, useRef, useState, useMemo, useCallback, Component, ErrorInfo, ReactNode } from 'react';
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
import { 
  calculateSpotKpiMetrics, 
  SpotKpiMetrics,
  calculateBillboardPerformanceDensity,
  BillboardPerformanceDensity
} from '../utils/kpiMetrics';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_cErEKUXi76tGidnv0ke-zhMtgGYyq-A';
export const GOOGLE_MAPS_LIBRARIES: ('marker' | 'places' | 'geometry')[] = ['marker', 'places', 'geometry'];

interface GoogleMapViewerProps {
  spots: BillboardSpot[];
  selectedSpot: BillboardSpot | null;
  onSelectSpot: (spot: BillboardSpot | null) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
  onSwitchToLeaflet?: () => void;
}

// Graceful Error Boundary for map overlay controllers
class MapErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Map overlay controller caught an error, handled safely:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
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
  const [showTrafficDensityHeatmap, setShowTrafficDensityHeatmap] = useState<boolean>(true);
  const [trafficHeatmapRadius, setTrafficHeatmapRadius] = useState<number>(55);
  const [trafficHeatmapOpacity, setTrafficHeatmapOpacity] = useState<number>(0.85);
  const [heatmapMetricMode, setHeatmapMetricMode] = useState<'composite' | 'traffic' | 'impressions'>('composite');
  const [heatmapThresholdFilter, setHeatmapThresholdFilter] = useState<'all' | 'top50' | 'elite'>('all');
  const [showKpiHeatmap, setShowKpiHeatmap] = useState<boolean>(false);
  const [kpiHeatmapMetric, setKpiHeatmapMetric] = useState<'composite' | 'roi' | 'conversion'>('composite');
  const [selectedCompetitorZone, setSelectedCompetitorZone] = useState<CompetitorZone | null>(null);
  const [competitorSectorFilter, setCompetitorSectorFilter] = useState<string>('all');
  const [showQuickView, setShowQuickView] = useState<boolean>(false);
  const [isQuickViewMinimized, setIsQuickViewMinimized] = useState<boolean>(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState<boolean>(false);
  const [showFilterPopover, setShowFilterPopover] = useState<boolean>(false);
  const [showLegendPopover, setShowLegendPopover] = useState<boolean>(false);
  const [currentMapBounds, setCurrentMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [showHotspotPins, setShowHotspotPins] = useState<boolean>(true);
  const [showReachCircles, setShowReachCircles] = useState<boolean>(false);
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showCorridorDrawer, setShowCorridorDrawer] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<TrafficHeatPoint | null>(null);
  const [infoWindowSpot, setInfoWindowSpot] = useState<BillboardSpot | null>(null);
  const [activeWidgetTab, setActiveWidgetTab] = useState<'spot' | 'quickview' | 'corridor'>('spot');

  // Synchronize active widget tab when a spot is clicked or selected
  useEffect(() => {
    if (selectedSpot) {
      setActiveWidgetTab('spot');
    }
  }, [selectedSpot]);

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

  const handleToggleTrafficDensityHeatmap = () => {
    setShowTrafficDensityHeatmap(prev => !prev);
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

  // Average traffic density of filtered spots based on 'traffic_density'
  const avgTrafficDensity = useMemo(() => {
    if (filteredSpots.length === 0) return 0;
    const sum = filteredSpots.reduce((acc, s) => {
      const d = s.traffic_density ?? Math.min(100, Math.max(25, Math.round(
        ((s.dailyGrossReach || 0) / 260000) * 45 + 
        ((s.avgDwellTimeSec || 30) / 60) * 35 + 
        ((50 - Math.min(50, s.avgSpeedKmh || 30)) / 50) * 20
      )));
      return acc + d;
    }, 0);
    return Math.round(sum / filteredSpots.length);
  }, [filteredSpots]);

  // Count of spots with high/extreme traffic concentration (traffic_density >= 75)
  const highTrafficSpotsCount = useMemo(() => {
    return filteredSpots.filter(s => {
      const d = s.traffic_density ?? Math.min(100, Math.max(25, Math.round(
        ((s.dailyGrossReach || 0) / 260000) * 45 + 
        ((s.avgDwellTimeSec || 30) / 60) * 35 + 
        ((50 - Math.min(50, s.avgSpeedKmh || 30)) / 50) * 20
      )));
      return d >= 75;
    }).length;
  }, [filteredSpots]);

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

  const hasActiveWidget = Boolean(selectedSpot || showCorridorDrawer || showQuickView);

  return (
    <APIProvider 
      apiKey={GOOGLE_MAPS_API_KEY} 
      language="id" 
      region="ID"
      libraries={GOOGLE_MAPS_LIBRARIES}
    >
      <div 
        className={`relative w-full ${isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-full'} grid ${hasActiveWidget ? 'lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px]' : 'grid-cols-1'} [grid-template-areas:'map-viewport'] lg:${hasActiveWidget ? "[grid-template-areas:'map-viewport_widget-panel']" : "[grid-template-areas:'map-viewport']"} overflow-hidden bg-slate-950 font-sans transition-all duration-200`}
      >
        {/* Map Viewport Grid Area */}
        <div className="[grid-area:map-viewport] relative w-full h-full overflow-hidden flex flex-col">
        
        {/* TOP FLOATING COMMAND DOCK - Clean, Modular, Single-Row */}
        <div className="absolute top-3.5 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto max-w-[calc(100vw-6rem)]">
          {/* 1. Location Search */}
          <MapLocationSearch 
            onLocationSelected={(location) => {
              setSearchedLocation(location);
              setShowSearchPinInfo(true);
            }}
          />

          {/* 2. Wilayah Selector Popover Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRegionDropdown(!showRegionDropdown);
                setShowFilterPopover(false);
                setShowLayerPanel(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md transition-all ${
                selectedRegencies.length > 0
                  ? 'bg-amber-400/15 text-amber-300 border-amber-400/50'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                {selectedRegencies.length === 0 
                  ? `Seluruh Jabar (${spots.length})` 
                  : selectedRegencies.length === 1 
                    ? selectedRegencies[0] 
                    : `${selectedRegencies.length} Kota/Kab (${filteredSpots.length})`}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Region Dropdown Card */}
            {showRegionDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in-50 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pilih Wilayah Jabar
                  </span>
                  <button
                    onClick={() => {
                      setShowAllRegionsModal(true);
                      setShowRegionDropdown(false);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Buka 27 Kota/Kab ↗
                  </button>
                </div>

                {/* Reset button */}
                <button
                  onClick={() => {
                    handleResetWestJava();
                    setShowRegionDropdown(false);
                  }}
                  className={`w-full mb-2 p-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedRegencies.length === 0 ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>Seluruh Jawa Barat</span>
                  <span className="text-[10px] font-mono opacity-80">{spots.length} Titik</span>
                </button>

                {/* Top Metropolitan Hubs */}
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase px-1 py-0.5">
                    Hub Utama
                  </div>
                  {WEST_JAVA_REGENCIES.slice(0, 10).map(reg => {
                    const count = spotCountByRegency[reg.name] || 0;
                    const isSelected = selectedRegencies.includes(reg.name);
                    return (
                      <button
                        key={reg.name}
                        onClick={() => {
                          handleSelectSingleRegency(reg.name);
                          setShowRegionDropdown(false);
                        }}
                        className={`w-full p-1.5 px-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{reg.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{count} titik</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Filter Format & Status Popover Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterPopover(!showFilterPopover);
                setShowRegionDropdown(false);
                setShowLayerPanel(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md transition-all ${
                selectedType !== 'Semua' || selectedStatus !== 'Semua'
                  ? 'text-amber-400 border-amber-400/50 bg-amber-400/10'
                  : 'text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Filter</span>
              {(selectedType !== 'Semua' || selectedStatus !== 'Semua') && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showFilterPopover ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown Card */}
            {showFilterPopover && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 z-50 backdrop-blur-xl animate-in fade-in-50 duration-150 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Filter Billboard
                  </span>
                  {(selectedType !== 'Semua' || selectedStatus !== 'Semua') && (
                    <button
                      onClick={() => {
                        setSelectedType('Semua');
                        setSelectedStatus('Semua');
                      }}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Format Reklame:
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Semua">Semua Format Reklame</option>
                    <option value="LED Videotron">LED Videotron</option>
                    <option value="Megatron">Megatron</option>
                    <option value="Static Billboard">Static Billboard</option>
                    <option value="JPO Pedestrian Bridge">JPO Bridge</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Status Okupansi:
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Occupied">Terisi (Occupied)</option>
                    <option value="Available">Tersedia (Available)</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hasil Filter:</span>
                  <span className="font-mono text-emerald-400 font-bold">{filteredSpots.length} Titik</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Lapisan Peta & Heatmap Popover Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLayerPanel(!showLayerPanel);
                setShowRegionDropdown(false);
                setShowFilterPopover(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md transition-all ${
                showLayerPanel || isSatelliteActive || isTerrainActive || showTrafficDensityHeatmap || showCompetitorLayer
                  ? 'text-amber-300 border-amber-400/50 bg-amber-400/10'
                  : 'text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Lapisan & Heatmap</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLayerPanel ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Google Maps Official Verified Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 rounded-xl shadow-xl text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Google Maps Resmi</span>
          </div>
        </div>

        {/* Active Search Result Pill Banner (if searched) */}
        {searchedLocation && (
          <div className="absolute top-16 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-blue-950/90 backdrop-blur-md border border-blue-500/50 rounded-xl shadow-xl text-xs text-blue-100 animate-in fade-in-50">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{searchedLocation.queryName}</span>
            <span className="text-[11px] text-blue-300 hidden sm:inline">({nearbySpotsForSearch.length} titik dalam 5 km)</span>
            <button
              onClick={() => setSearchedLocation(null)}
              className="ml-1 text-slate-400 hover:text-white p-0.5 rounded hover:bg-blue-900/50 text-[10px]"
            >
              ✕ Hapus
            </button>
          </div>
        )}

        {/* Floating Utility Controls on Right Side (Clean, Minimalist) */}
        <div className="absolute top-3.5 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-xl p-1 shadow-2xl">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetWestJava}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Pusatkan Peta ke Jawa Barat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSatellite}
            className={`p-2 rounded-lg transition-colors ${
              isSatelliteActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Citra Satelit Google Earth"
          >
            <Satellite className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleTraffic}
            className={`p-2 rounded-lg transition-colors ${
              showTrafficLayer ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Lalu Lintas Google Maps"
          >
            <Car className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-2 rounded-lg transition-colors ${
              showLayerPanel ? 'bg-amber-400/20 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Pengaturan Layer & Heatmap Peta"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Layer Settings Popover Card */}
        {showLayerPanel && (
          <div className="absolute top-16 right-4 z-40 w-84 sm:w-96 max-h-[85vh] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin">
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

              {/* Real-Time Traffic Density Heatmap ('traffic_density') */}
              <div 
                onClick={handleToggleTrafficDensityHeatmap}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  showTrafficDensityHeatmap
                    ? 'bg-amber-500/10 border-amber-400/50 text-white font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs">Heatmap Konsentrasi Trafik ('traffic_density')</span>
                    <span className="text-[10px] text-slate-500 font-normal">Visualisasi termal intensitas lalu lintas titik reklame</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  showTrafficDensityHeatmap ? 'bg-amber-400' : 'bg-slate-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-slate-950 transition-transform ${
                    showTrafficDensityHeatmap ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Slider for Heatmap Radius when active */}
              {showTrafficDensityHeatmap && (
                <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1.5 ml-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Radius Difusi Heatmap:</span>
                    <span className="font-mono text-amber-300 font-bold">{trafficHeatmapRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="85"
                    value={trafficHeatmapRadius}
                    onChange={(e) => setTrafficHeatmapRadius(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>25px (Fokus)</span>
                    <span>85px (Luas)</span>
                  </div>
                </div>
              )}

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

            {/* REAL-TIME TRAFFIC DENSITY HEATMAP LAYER ('traffic_density') */}
            {showTrafficDensityHeatmap && filteredSpots.map(spot => {
              const rawDensity = spot.traffic_density;
              const densityScore = (typeof rawDensity === 'number' && !isNaN(rawDensity) && rawDensity > 0)
                ? rawDensity
                : Math.min(100, Math.max(25, Math.round(
                    ((spot.dailyGrossReach || 0) / 260000) * 45 + 
                    ((spot.avgDwellTimeSec || 30) / 60) * 35 + 
                    ((50 - Math.min(50, spot.avgSpeedKmh || 30)) / 50) * 20
                  )));

              const color = densityScore >= 85 
                ? '#9333ea' // Ungu / Puncak Macet
                : densityScore >= 75
                ? '#ef4444' // Merah / Macet
                : densityScore >= 60
                ? '#f97316' // Oranye / Padat Merayap
                : densityScore >= 45
                ? '#eab308' // Kuning / Ramai Lancar
                : '#06b6d4'; // Cyan / Lancar

              // Scaled by trafficHeatmapRadius (25px - 85px) and density
              const outerRadiusMeters = (130 + (trafficHeatmapRadius * 7.5)) * (0.6 + (densityScore / 100) * 0.7);
              const midRadiusMeters = outerRadiusMeters * 0.65;
              const innerRadiusMeters = outerRadiusMeters * 0.32;

              return (
                <React.Fragment key={`traffic-heatmap-halo-${spot.id}`}>
                  {/* Outer Diffusion Wave */}
                  <Circle
                    center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
                    radius={outerRadiusMeters}
                    strokeColor={color}
                    strokeOpacity={trafficHeatmapOpacity * 0.35}
                    strokeWeight={1.2}
                    fillColor={color}
                    fillOpacity={trafficHeatmapOpacity * 0.16}
                  />
                  {/* Mid Thermal Transition */}
                  <Circle
                    center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
                    radius={midRadiusMeters}
                    strokeColor={color}
                    strokeOpacity={trafficHeatmapOpacity * 0.6}
                    strokeWeight={1.5}
                    fillColor={color}
                    fillOpacity={trafficHeatmapOpacity * 0.28}
                  />
                  {/* High Intensity Core Ring */}
                  <Circle
                    center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
                    radius={innerRadiusMeters}
                    strokeColor={color}
                    strokeOpacity={trafficHeatmapOpacity * 0.9}
                    strokeWeight={2}
                    fillColor={color}
                    fillOpacity={trafficHeatmapOpacity * 0.48}
                  />
                </React.Fragment>
              );
            })}

            {/* KPI Heatmap: Visual Intensity Halos over Billboard Markers */}
            {showKpiHeatmap && filteredSpots.map(spot => {
              const kpi = calculateSpotKpiMetrics(spot);
              const radiusMeters = 180 + (kpi.kpiIntensityScore * 4.2);
              return (
                <React.Fragment key={`kpi-halo-${spot.id}`}>
                  <Circle
                    center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
                    radius={radiusMeters}
                    strokeColor={kpi.colorHex}
                    strokeOpacity={0.8}
                    strokeWeight={1.5}
                    fillColor={kpi.colorHex}
                    fillOpacity={0.20}
                  />
                  <Circle
                    center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
                    radius={radiusMeters * 0.45}
                    strokeColor={kpi.colorHex}
                    strokeOpacity={0.95}
                    strokeWeight={2}
                    fillColor={kpi.colorHex}
                    fillOpacity={0.42}
                  />
                </React.Fragment>
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

                  {/* Traffic Density Highlight when Heatmap is Active */}
                  {showTrafficDensityHeatmap && (
                    <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg text-[10px] font-mono mb-2 space-y-1">
                      <div className="flex items-center justify-between text-amber-900 font-bold border-b border-amber-200 pb-1">
                        <span>🚦 KONSENTRASI LALU LINTAS:</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                          {infoWindowSpot.traffic_density ?? Math.min(100, Math.max(25, Math.round(((infoWindowSpot.dailyGrossReach || 0) / 260000) * 45 + ((infoWindowSpot.avgDwellTimeSec || 30) / 60) * 35 + ((50 - Math.min(50, infoWindowSpot.avgSpeedKmh || 30)) / 50) * 20)))}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-600 pt-0.5">
                        <span>DGR: {infoWindowSpot.dailyGrossReach.toLocaleString('id-ID')}</span>
                        <span className="font-semibold text-amber-800">Dwell: {infoWindowSpot.avgDwellTimeSec}s @ {infoWindowSpot.avgSpeedKmh}km/j</span>
                      </div>
                    </div>
                  )}

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

        {/* Bottom Modular Dock */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-20 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3">
          {/* Left Island: Legend & Hub Chips */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {/* Legend Popover Button */}
            <div className="relative">
              <button
                onClick={() => setShowLegendPopover(!showLegendPopover)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold shadow-2xl backdrop-blur-md transition-all"
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <span>Legenda</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLegendPopover ? 'rotate-180' : ''}`} />
              </button>

              {showLegendPopover && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 z-50 backdrop-blur-xl animate-in fade-in-50 duration-150 space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lalu Lintas Google Maps (Live)
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Lancar
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Padat
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Macet
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Format Reklame Fisik
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> LED Videotron
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Megatron
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Static Billboard
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> JPO Bridge
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Hub Filter Chips */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl text-xs shadow-2xl">
              <button
                onClick={handleResetWestJava}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedRegencies.length === 0 ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({spots.length})
              </button>
              {['Kota Bandung', 'Kota Bekasi', 'Kota Bogor', 'Kota Depok'].map(city => {
                const isSelected = selectedRegencies.length === 1 && selectedRegencies[0] === city;
                const count = spotCountByRegency[city] || 0;
                const shortName = city.replace('Kota ', '');
                return (
                  <button
                    key={city}
                    onClick={() => handleSelectSingleRegency(city)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      isSelected ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {shortName} ({count})
                  </button>
                );
              })}
            </div>

            {/* Active Count Pill */}
            <div className="hidden lg:flex items-center px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl text-xs text-slate-400 font-mono shadow-2xl">
              <span className="text-emerald-400 font-bold mr-1.5">{filteredSpots.length}</span> Titik Ditampilkan
            </div>
          </div>

          {/* Right Island: Quick View & Corridor Toggles */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Top Koridor Macet Button */}
            <button
              onClick={() => {
                if (showCorridorDrawer && activeWidgetTab === 'corridor') {
                  setShowCorridorDrawer(false);
                } else {
                  setShowCorridorDrawer(true);
                  setActiveWidgetTab('corridor');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xl border backdrop-blur-md ${
                showCorridorDrawer && activeWidgetTab === 'corridor'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-900/90 text-amber-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Koridor Macet</span>
              <span className="font-mono">({topCongestedHotspots.length})</span>
            </button>

            {/* Quick View Top 5 Impresi Button */}
            <button
              onClick={() => {
                if (showQuickView && activeWidgetTab === 'quickview') {
                  setShowQuickView(false);
                } else {
                  setShowQuickView(true);
                  setActiveWidgetTab('quickview');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xl border backdrop-blur-md ${
                showQuickView && activeWidgetTab === 'quickview'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20 ring-2 ring-amber-400/30'
                  : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${showQuickView && activeWidgetTab === 'quickview' ? 'fill-slate-950 text-slate-950' : 'text-amber-400 fill-amber-400'}`} />
              <span>Top 5 Impresi</span>
            </button>
          </div>
        </div>
        {/* End of [grid-area:map-viewport] */}
        </div>

        {/* Dedicated Modular Data Widget Sidebar (CSS Grid Area: widget-panel) */}
        {hasActiveWidget && (
          <aside className="[grid-area:widget-panel] fixed inset-x-0 bottom-0 max-h-[82vh] z-40 lg:static lg:inset-auto lg:max-h-none lg:h-full lg:w-full bg-slate-900/98 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom lg:slide-in-from-right duration-200">
            {/* Widget Tabs & Navigation Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedSpot && (
                  <button
                    onClick={() => setActiveWidgetTab('spot')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeWidgetTab === 'spot'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Detail Titik</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowQuickView(true);
                    setActiveWidgetTab('quickview');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeWidgetTab === 'quickview'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Top 5 Impresi</span>
                </button>

                <button
                  onClick={() => {
                    setShowCorridorDrawer(true);
                    setActiveWidgetTab('corridor');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeWidgetTab === 'corridor'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Koridor ({topCongestedHotspots.length})</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  onSelectSpot(null);
                  setShowQuickView(false);
                  setShowCorridorDrawer(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
                title="Tutup Panel Widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Widget Content Body */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {/* Tab 1: Selected Spot Detail View */}
              {activeWidgetTab === 'spot' && selectedSpot && (
                <div className="flex flex-col h-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {selectedSpot.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedSpot.occupancyStatus === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {selectedSpot.occupancyStatus === 'Available' ? 'Tersedia' : 'Terisi'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug">
                      {selectedSpot.name}
                    </h3>
                  </div>

                  {/* Location Info */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <span className="text-slate-400 block text-[11px]">Koridor Lokasi & Tipe Jalan</span>
                    <p className="text-slate-200 font-semibold">{selectedSpot.roadName}</p>
                    <div className="flex items-center gap-2 text-slate-400 pt-1">
                      <span className="text-amber-400 font-medium">{selectedSpot.regency}</span>
                      <span>·</span>
                      <span>Kec. {selectedSpot.district}</span>
                    </div>
                  </div>

                  {/* GPS & Direction */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Koordinat GPS WGS84:</span>
                      <span className="font-mono text-amber-400 font-semibold">
                        {selectedSpot.coordinates.lat.toFixed(4)}, {selectedSpot.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Arah Pandang:</span>
                      <span className="text-slate-200 font-medium">{selectedSpot.facingDirection}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ukuran & Format:</span>
                      <span className="text-slate-200 font-medium">
                        {selectedSpot.dimensions.width}m × {selectedSpot.dimensions.height}m · {selectedSpot.type}
                      </span>
                    </div>
                  </div>

                  {/* Metric Snapshot Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[11px] block">Gross Reach (DGR)</span>
                      <span className="text-lg font-bold font-mono text-white tabular-nums">
                        {selectedSpot.dailyGrossReach.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">kontak / hari</span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[11px] block">Visibility Adjusted (VAC)</span>
                      <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                        {selectedSpot.vacDaily.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">kontak tertarget</span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[11px] block">Rata-rata Dwell Time</span>
                      <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                        {selectedSpot.avgDwellTimeSec}s
                      </span>
                      <span className="text-[10px] text-slate-500 block">laju {selectedSpot.avgSpeedKmh} km/jam</span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 text-[11px] block">Indeks Efektivitas</span>
                      <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                        {selectedSpot.effectivenessScore} / 100
                      </span>
                      <span className="text-[10px] text-slate-500 block">skor visibilitas</span>
                    </div>
                  </div>

                  {/* Open Detail Modal CTA */}
                  <div className="pt-2 mt-auto">
                    <button
                      onClick={() => onOpenDetailModal(selectedSpot)}
                      className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Buka Analisis Lokasi Lengkap</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Top 5 Impresi Viewport View */}
              {activeWidgetTab === 'quickview' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-400 mb-0.5">
                      <Zap className="w-4 h-4 fill-amber-400" />
                      <span>Top 5 Impresi (Viewport Saat Ini)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {spotsInViewport.length} billboard terdeteksi di area koordinat layar peta
                    </p>
                  </div>

                  <div className="space-y-2">
                    {top5ViewportSpots.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                        Tidak ada titik reklame di area viewport peta saat ini. Geser atau zoom out peta untuk melihat billboard terdekat.
                      </div>
                    ) : (
                      top5ViewportSpots.map((spot, index) => {
                        const isSelected = selectedSpot?.id === spot.id;
                        const rankColors = [
                          'bg-amber-400 text-slate-950 font-black',
                          'bg-slate-300 text-slate-950 font-black',
                          'bg-amber-700 text-white font-black',
                          'bg-slate-800 text-slate-300 font-bold',
                          'bg-slate-800 text-slate-300 font-bold'
                        ];

                        return (
                          <div
                            key={spot.id}
                            onClick={() => {
                              onSelectSpot(spot);
                              setInfoWindowSpot(spot);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 min-w-0">
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
                                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
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

                            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                              <div className="flex items-center gap-1 text-slate-300">
                                <span className="text-slate-500 text-[10px]">DGR:</span>
                                <span className="font-bold text-amber-400">
                                  {spot.dailyGrossReach.toLocaleString('id-ID')}
                                </span>
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

                  {top5ViewportSpots.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Total DGR Top 5: <strong className="text-amber-400 font-mono">{top5TotalDailyImpressions.toLocaleString('id-ID')}</strong>
                      </span>
                      <button
                        onClick={() => {
                          if (top5ViewportSpots.length > 0) {
                            onSelectSpot(top5ViewportSpots[0]);
                            setInfoWindowSpot(top5ViewportSpots[0]);
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Pilih #1
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Koridor Macet View */}
              {activeWidgetTab === 'corridor' && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs">
                    <div className="flex items-center gap-2 font-bold text-red-400 mb-0.5">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span>Koridor Trafik Paling Padat</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Peringkat jalan dengan konsentrasi kepadatan lalu lintas tertinggi di Jawa Barat
                    </p>
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
                              setInfoWindowSpot(nearby[0].spot);
                            }
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-400/10 border-amber-400/50 shadow-md ring-1 ring-amber-400/30'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
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

                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                            <span className="font-mono text-amber-400 font-bold">
                              {hotspot.avgVolumePerHour.toLocaleString('id-ID')} kend/jam
                            </span>
                            <span className="text-emerald-400 font-medium">
                              {nearby.length} Billboard dalam radius 2.5km
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

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
