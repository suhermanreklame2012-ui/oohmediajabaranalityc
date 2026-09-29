import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { BillboardSpot } from '../types/ooh';
import { WEST_JAVA_REGENCIES, WEST_JAVA_REGIONAL_CLUSTERS, RegionalCluster } from '../data/jabarData';
import { 
  WEST_JAVA_TRAFFIC_HOTSPOTS, 
  TrafficHeatPoint, 
  findNearbySpotsForHotspot 
} from '../data/trafficDensityData';
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
  Search
} from 'lucide-react';

interface MapViewerProps {
  spots: BillboardSpot[];
  selectedSpot: BillboardSpot | null;
  onSelectSpot: (spot: BillboardSpot | null) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
  onSwitchToGoogle?: () => void;
}

export type TileServerType = 'carto_voyager' | 'carto_dark' | 'esri_street' | 'esri_satellite' | 'carto_positron' | 'osm';
export type HeatTimeMode = 'rush_morning' | 'rush_evening' | 'regular' | 'weekend_leisure';

export function MapViewer({
  spots,
  selectedSpot,
  onSelectSpot,
  onOpenDetailModal,
  onSwitchToGoogle
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);
  const coneLayerRef = useRef<L.LayerGroup | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Region & Category Filters
  const [selectedRegencies, setSelectedRegencies] = useState<string[]>([]); // Empty = 'Semua Wilayah Jawa Barat'
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [showAllRegionsModal, setShowAllRegionsModal] = useState<boolean>(false);
  const [regionModalSearch, setRegionModalSearch] = useState<string>('');
  const [regionModalCluster, setRegionModalCluster] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Display toggles & 100% Free Open Tiles (ZERO API KEY, ZERO BLOCK, ZERO WATERMARK)
  const [showReachCircles, setShowReachCircles] = useState<boolean>(false);
  const [showVisibilityCone, setShowVisibilityCone] = useState<boolean>(true);
  const [showTrafficHeatmap, setShowTrafficHeatmap] = useState<boolean>(true);
  const [showHotspotPins, setShowHotspotPins] = useState<boolean>(true);
  const [heatTimeMode, setHeatTimeMode] = useState<HeatTimeMode>('rush_evening');
  const [heatIntensityMultiplier, setHeatIntensityMultiplier] = useState<number>(1.0);
  const [tileServer, setTileServer] = useState<TileServerType>('carto_voyager');
  
  // UI Panels
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showCorridorDrawer, setShowCorridorDrawer] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<TrafficHeatPoint | null>(null);

  // Spot count by regency map
  const spotCountByRegency = useMemo(() => {
    const counts: Record<string, number> = {};
    spots.forEach(s => {
      counts[s.regency] = (counts[s.regency] || 0) + 1;
    });
    return counts;
  }, [spots]);

  // Key urban hubs highlighted for fast 1-click access (Bandung, Bekasi, Bogor, Depok, Karawang, Cirebon, dll)
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

  // Hotspots pool filtered by active regency if filtered, or all
  const filteredHotspots = useMemo(() => {
    if (selectedRegencies.length === 0 || selectedRegencies.includes('Semua')) {
      return WEST_JAVA_TRAFFIC_HOTSPOTS;
    }
    const matching = WEST_JAVA_TRAFFIC_HOTSPOTS.filter(h => selectedRegencies.includes(h.regency));
    return matching.length > 0 ? matching : WEST_JAVA_TRAFFIC_HOTSPOTS;
  }, [selectedRegencies]);

  // Top congested hotspots for quick jump
  const topCongestedHotspots = useMemo(() => {
    return [...filteredHotspots]
      .sort((a, b) => b.avgVolumePerHour - a.avgVolumePerHour)
      .slice(0, 8);
  }, [filteredHotspots]);

  // 100% Free and unblocked tile configurations (NO API KEY, NO WATERMARK, NEVER BLOCKED IN IFRAMES)
  const getTileConfig = (type: TileServerType) => {
    switch (type) {
      case 'carto_dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap (Mode Gelap Bebas API Key)',
          subdomains: 'abcd',
          maxZoom: 20
        };
      case 'carto_positron':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; CartoDB Positron &copy; OpenStreetMap (Bebas API Key)',
          subdomains: 'abcd',
          maxZoom: 20
        };
      case 'esri_street':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri World Street Map (Bebas API Key & Tanpa Blokir)',
          subdomains: 'abcd',
          maxZoom: 19
        };
      case 'esri_satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri World Imagery Citra Satelit (Bebas API Key)',
          subdomains: 'abcd',
          maxZoom: 18
        };
      case 'osm':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap Kontributor (100% Terbuka)',
          subdomains: 'abc',
          maxZoom: 19
        };
      case 'carto_voyager':
      default:
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://carto.com/">CartoDB</a> Voyager &copy; OpenStreetMap (Peta Jalan Jabar 100% Bebas API Key)',
          subdomains: 'abcd',
          maxZoom: 20
        };
    }
  };

  // Render Traffic Density Heatmap onto Canvas Overlay
  const drawHeatmap = useCallback(() => {
    const map = mapInstanceRef.current;
    const canvas = heatmapCanvasRef.current;
    if (!map || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = map.getSize();
    const dpr = window.devicePixelRatio || 1;
    
    if (canvas.width !== size.x * dpr || canvas.height !== size.y * dpr) {
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size.x, size.y);

    if (!showTrafficHeatmap) {
      ctx.restore();
      return;
    }

    ctx.globalCompositeOperation = 'lighter';

    const zoom = map.getZoom();
    // Dynamic radius based on zoom level: covers wider arterial corridor when zoomed out
    const baseRadius = Math.max(34, 52 * Math.pow(1.16, zoom - 10));

    WEST_JAVA_TRAFFIC_HOTSPOTS.forEach(p => {
      const pt = map.latLngToContainerPoint([p.lat, p.lng]);

      // Check if point is within viewport + buffer
      if (pt.x < -baseRadius * 1.5 || pt.x > size.x + baseRadius * 1.5 || 
          pt.y < -baseRadius * 1.5 || pt.y > size.y + baseRadius * 1.5) {
        return;
      }

      // Time mode adjustment factor
      let modeFactor = 1.0;
      if (heatTimeMode === 'rush_morning') {
        if (p.roadName.includes('Tol') || p.name.includes('Pasteur') || p.name.includes('Bekasi') || p.name.includes('Margonda') || p.name.includes('BORR')) {
          modeFactor = 1.30;
        } else {
          modeFactor = 0.85;
        }
      } else if (heatTimeMode === 'rush_evening') {
        if (p.name.includes('Asia Afrika') || p.name.includes('Dago') || p.name.includes('Ciawi') || p.name.includes('Buah Batu') || p.name.includes('Paskal') || p.name.includes('CSB')) {
          modeFactor = 1.35;
        } else {
          modeFactor = 1.15;
        }
      } else if (heatTimeMode === 'weekend_leisure') {
        if (p.name.includes('Puncak') || p.name.includes('Lembang') || p.name.includes('Dago') || p.name.includes('Garut') || p.name.includes('Sentul')) {
          modeFactor = 1.45;
        } else {
          modeFactor = 0.90;
        }
      } else {
        modeFactor = 0.95;
      }

      const effectiveIntensity = Math.min(1.0, p.intensity * modeFactor * heatIntensityMultiplier);
      const rad = baseRadius * (0.85 + effectiveIntensity * 0.45);

      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rad);
      grad.addColorStop(0, `rgba(239, 68, 68, ${Math.min(0.92, effectiveIntensity * 0.90)})`);    // Hot red core
      grad.addColorStop(0.25, `rgba(249, 115, 22, ${Math.min(0.80, effectiveIntensity * 0.75)})`); // Vivid fiery orange
      grad.addColorStop(0.55, `rgba(234, 179, 8, ${Math.min(0.55, effectiveIntensity * 0.50)})`);  // Amber yellow
      grad.addColorStop(0.80, `rgba(16, 185, 129, ${Math.min(0.30, effectiveIntensity * 0.25)})`); // Emerald lime edge
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');                                                 // Smooth transparent falloff

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, [showTrafficHeatmap, heatTimeMode, heatIntensityMultiplier]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on West Java (-6.9175, 107.6191) with optimal zoom
    const map = L.map(mapContainerRef.current, {
      center: [-6.9175, 107.6191],
      zoom: 10,
      minZoom: 7,
      maxZoom: 19,
      zoomControl: false
    });

    const cfg = getTileConfig(tileServer);
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abcd',
      maxZoom: cfg.maxZoom || 19
    });

    tileLayer.on('tileerror', () => {
      // Auto-fallback safely to CartoDB Voyager or Dark if current tile provider encounters any network block
      if (tileServer !== 'carto_voyager') {
        setTileServer('carto_voyager');
      }
    });

    tileLayer.addTo(map);
    activeTileLayerRef.current = tileLayer;

    // Layer groups for markers, hotspots, reach circles, and vision cones
    const circlesGroup = L.layerGroup().addTo(map);
    const coneGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const hotspotsGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    hotspotMarkersLayerRef.current = hotspotsGroup;
    circlesLayerRef.current = circlesGroup;
    coneLayerRef.current = coneGroup;
    mapInstanceRef.current = map;

    // Create and attach Traffic Density Heatmap Canvas Overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '350'; // Above tiles (200), below markers (600)
    map.getContainer().appendChild(canvas);
    heatmapCanvasRef.current = canvas;

    const handleMapMovement = () => {
      drawHeatmap();
    };

    map.on('move', handleMapMovement);
    map.on('zoom', handleMapMovement);
    map.on('resize', handleMapMovement);

    // Initial heatmap draw
    drawHeatmap();

    // Critical: Trigger invalidateSize after container has settled
    const timer1 = setTimeout(() => { 
      map.invalidateSize(); 
      drawHeatmap();
    }, 150);
    const timer2 = setTimeout(() => { 
      map.invalidateSize(); 
      drawHeatmap();
    }, 600);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      drawHeatmap();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.off('move', handleMapMovement);
      map.off('zoom', handleMapMovement);
      map.off('resize', handleMapMovement);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      heatmapCanvasRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [drawHeatmap]);

  // Redraw heatmap when toggle, mode, or intensity changes
  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap, showTrafficHeatmap, heatTimeMode, heatIntensityMultiplier]);

  // Update Tile Layer if theme/server changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const cfg = getTileConfig(tileServer);
    const newTileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abcd',
      maxZoom: cfg.maxZoom || 19
    });

    newTileLayer.addTo(map);
    newTileLayer.bringToBack();
    activeTileLayerRef.current = newTileLayer;
    map.invalidateSize();
  }, [tileServer]);

  // Render Traffic Hotspot Interactive Pins onto Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const hotspotsGroup = hotspotMarkersLayerRef.current;
    if (!map || !hotspotsGroup) return;

    hotspotsGroup.clearLayers();

    if (!showTrafficHeatmap || !showHotspotPins) return;

    filteredHotspots.forEach((hotspot) => {
      const isSelected = activeHotspot?.id === hotspot.id;
      
      const hotspotIconHtml = `
        <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${
            hotspot.congestionLevel === 'Macet Total' 
              ? 'bg-red-600 border border-red-300 traffic-pulse-hot' 
              : hotspot.congestionLevel === 'Padat Merayap'
              ? 'bg-amber-500 border border-amber-300'
              : 'bg-emerald-500 border border-emerald-300'
          } ${isSelected ? 'scale-125 ring-4 ring-white' : 'hover:scale-110'}">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          </div>
        </div>
      `;

      const hotspotIcon = L.divIcon({
        html: hotspotIconHtml,
        className: 'custom-traffic-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const currentVol = 
        heatTimeMode === 'rush_morning' ? hotspot.peakMorningVolume :
        heatTimeMode === 'rush_evening' ? hotspot.peakEveningVolume :
        heatTimeMode === 'weekend_leisure' ? Math.round(hotspot.avgVolumePerHour * 1.25) :
        hotspot.regularVolume;

      const nearbySpots = findNearbySpotsForHotspot(hotspot, spots, 2.5);

      const popupHtml = `
        <div style="min-width: 250px; font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: bold; background: ${
              hotspot.congestionLevel === 'Macet Total' ? '#ef4444' : 
              hotspot.congestionLevel === 'Padat Merayap' ? '#f59e0b' : '#10b981'
            }; color: #020617; padding: 2px 6px; border-radius: 4px;">
              ${hotspot.congestionLevel}
            </span>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">${hotspot.regency}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 2px; line-height: 1.3;">
            ${hotspot.name}
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">
            ${hotspot.roadName}
          </div>
          <div style="background: #090d16; padding: 8px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #1e293b;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Volume Lalu Lintas:</span>
              <span style="font-weight: bold; color: #f59e0b; font-family: monospace;">
                ${currentVol.toLocaleString('id-ID')} kend/jam
              </span>
            </div>
            <div style="font-size: 10px; color: #38bdf8; line-height: 1.3;">
              💡 <strong>Peluang Reklame:</strong> ${hotspot.oohOpportunity.substring(0, 110)}...
            </div>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
            Titik Reklame Berdekatan: <strong style="color: #34d399;">${nearbySpots.length} billboard</strong>
          </div>
          <button id="btn-hotspot-fly-${hotspot.id}" style="width: 100%; padding: 6px 10px; background: #ef4444; color: #ffffff; font-weight: bold; font-size: 11px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            Periksa Koridor Ini
          </button>
        </div>
      `;

      const marker = L.marker([hotspot.lat, hotspot.lng], {
        icon: hotspotIcon,
        title: `${hotspot.name} - ${hotspot.congestionLevel}`
      });

      marker.bindPopup(popupHtml, {
        offset: [0, -14],
        closeButton: true
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-hotspot-fly-${hotspot.id}`);
        if (btn) {
          btn.onclick = () => {
            setActiveHotspot(hotspot);
            setShowCorridorDrawer(true);
            if (nearbySpots.length > 0) {
              onSelectSpot(nearbySpots[0].spot);
            }
          };
        }
      });

      marker.on('click', () => {
        setActiveHotspot(hotspot);
      });

      marker.addTo(hotspotsGroup);
    });
  }, [showTrafficHeatmap, showHotspotPins, heatTimeMode, activeHotspot, spots, onSelectSpot, filteredHotspots]);

  // Render Billboard Markers and Overlays whenever filtered spots or selectedSpot changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const circlesGroup = circlesLayerRef.current;
    const coneGroup = coneLayerRef.current;

    if (!map || !markersGroup || !circlesGroup || !coneGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();
    coneGroup.clearLayers();

    filteredSpots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      
      // Determine color according to billboard type
      const color = 
        spot.type === 'LED Videotron' ? '#06b6d4' : // cyan
        spot.type === 'Megatron' ? '#a855f7' :      // violet
        spot.type === 'JPO Pedestrian Bridge' ? '#10b981' : // emerald
        '#f59e0b';                                  // amber for static

      // Reach Circle (Density indicator)
      if (showReachCircles) {
        const radius = Math.min(1200, Math.max(300, (spot.dailyGrossReach / 250)));
        const circle = L.circle([spot.coordinates.lat, spot.coordinates.lng], {
          radius: radius,
          color: color,
          weight: isSelected ? 2.5 : 1,
          opacity: isSelected ? 0.9 : 0.4,
          fillColor: color,
          fillOpacity: isSelected ? 0.22 : 0.08
        });
        circle.addTo(circlesGroup);
      }

      // Visibility Cone for selected spot
      if (showVisibilityCone && isSelected) {
        const viewingDistM = spot.viewingDistanceM || 250;
        const lat = spot.coordinates.lat;
        const lng = spot.coordinates.lng;
        const dLat = (viewingDistM / 111320);
        const dLng = (viewingDistM / (111320 * Math.cos(lat * (Math.PI / 180))));
        
        const conePolygon = L.polygon([
          [lat, lng],
          [lat + dLat * 0.9, lng - dLng * 0.5],
          [lat + dLat * 1.2, lng],
          [lat + dLat * 0.9, lng + dLng * 0.5]
        ], {
          color: '#38bdf8',
          weight: 2,
          dashArray: '4, 4',
          fillColor: '#38bdf8',
          fillOpacity: 0.22
        });
        conePolygon.addTo(coneGroup);
      }

      // Custom HTML Marker Pin for Billboard
      const iconHtml = `
        <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 shadow-xl ${
            isSelected 
              ? 'scale-125 ring-4 ring-amber-400 border-white z-50' 
              : 'hover:scale-110 border-slate-900'
          }" style="background-color: ${color};">
            <span class="text-[10px] font-black text-slate-950 font-mono tracking-tighter">
              ${spot.type === 'LED Videotron' ? 'LED' : spot.type === 'Megatron' ? 'MEGA' : spot.type === 'JPO Pedestrian Bridge' ? 'JPO' : 'OOH'}
            </span>
          </div>
          ${
            isSelected
              ? `<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r border-b border-white" style="background-color: ${color};"></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-ooh-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const popupContent = `
        <div style="min-width: 230px; font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; padding: 4px 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-family: monospace; color: #fbbf24; font-weight: bold;">${spot.code}</span>
            <span style="font-size: 10px; color: ${spot.occupancyStatus === 'Occupied' ? '#fbbf24' : '#34d399'}; font-weight: 700; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">
              ${spot.occupancyStatus === 'Occupied' ? 'Terisi (Occupied)' : 'Tersedia'}
            </span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #ffffff; line-height: 1.25; margin-bottom: 2px;">
            ${spot.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            ${spot.regency} · ${spot.roadName}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #090d16; padding: 6px; border-radius: 6px; margin-bottom: 8px; font-family: monospace; border: 1px solid #1e293b;">
            <div>
              <span style="font-size: 9px; color: #64748b; display: block;">GROSS REACH</span>
              <span style="font-size: 11px; font-weight: bold; color: #ffffff;">${spot.dailyGrossReach.toLocaleString('id-ID')}</span>
            </div>
            <div>
              <span style="font-size: 9px; color: #64748b; display: block;">VAC HARIAN</span>
              <span style="font-size: 11px; font-weight: bold; color: #34d399;">${spot.vacDaily.toLocaleString('id-ID')}</span>
            </div>
            <div>
              <span style="font-size: 9px; color: #64748b; display: block;">DWELL TIME</span>
              <span style="font-size: 11px; font-weight: bold; color: #fbbf24;">${spot.avgDwellTimeSec}s</span>
            </div>
            <div>
              <span style="font-size: 9px; color: #64748b; display: block;">EFEKTIVITAS</span>
              <span style="font-size: 11px; font-weight: bold; color: #38bdf8;">${spot.effectivenessScore}/100</span>
            </div>
          </div>
          <button id="btn-popup-${spot.id}" style="width: 100%; padding: 6px 10px; background: #fbbf24; color: #020617; font-weight: bold; font-size: 11px; border-radius: 5px; border: none; cursor: pointer; text-align: center; transition: background 0.15s;">
            Buka Analisis Lengkap
          </button>
        </div>
      `;

      const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
        icon: customIcon,
        title: spot.name,
        zIndexOffset: isSelected ? 1000 : 100
      });

      marker.bindPopup(popupContent, {
        offset: [0, -30],
        closeButton: true
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${spot.id}`);
        if (btn) {
          btn.onclick = () => {
            onOpenDetailModal(spot);
          };
        }
      });

      marker.on('click', () => {
        onSelectSpot(spot);
        map.flyTo([spot.coordinates.lat, spot.coordinates.lng], Math.max(map.getZoom(), 13), {
          duration: 0.8
        });
      });

      marker.addTo(markersGroup);
    });
  }, [filteredSpots, selectedSpot, showReachCircles, showVisibilityCone, onOpenDetailModal, onSelectSpot]);

  // Center on spot if selected from outside
  useEffect(() => {
    if (!selectedSpot || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedSpot.coordinates.lat, selectedSpot.coordinates.lng],
      14,
      { duration: 0.9 }
    );
  }, [selectedSpot]);

  // Smooth camera auto-frame to fit selected regency or regencies
  const fitMapToSelectedRegencies = useCallback((regList: string[]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (regList.length === 0 || regList.includes('Semua')) {
      map.flyTo([-6.9175, 107.6191], 9, { duration: 1 });
      return;
    }

    if (regList.length === 1) {
      const reg = WEST_JAVA_REGENCIES.find(r => r.name === regList[0]);
      if (reg) {
        map.flyTo(reg.center, reg.zoom, { duration: 1 });
        return;
      }
    }

    // Multiple regencies: calculate bounding box of their billboard spots
    const matchingSpots = spots.filter(s => regList.includes(s.regency));
    if (matchingSpots.length > 0) {
      const lats = matchingSpots.map(s => s.coordinates.lat);
      const lngs = matchingSpots.map(s => s.coordinates.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const bounds = L.latLngBounds(
        [minLat - 0.04, minLng - 0.04],
        [maxLat + 0.04, maxLng + 0.04]
      );
      map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 13, duration: 1.2 });
    } else {
      const reg = WEST_JAVA_REGENCIES.find(r => r.name === regList[0]);
      if (reg) {
        map.flyTo(reg.center, reg.zoom, { duration: 1 });
      }
    }
  }, [spots]);

  // Handlers for region selection
  const handleSelectSingleRegency = (regName: string) => {
    if (regName === 'Semua') {
      setSelectedRegencies([]);
      fitMapToSelectedRegencies([]);
    } else {
      setSelectedRegencies([regName]);
      fitMapToSelectedRegencies([regName]);
    }
  };

  const handleToggleRegency = (regName: string) => {
    if (!isMultiSelectMode) {
      // In single select mode: clicking the already active one resets to all
      if (selectedRegencies.length === 1 && selectedRegencies[0] === regName) {
        setSelectedRegencies([]);
        fitMapToSelectedRegencies([]);
      } else {
        handleSelectSingleRegency(regName);
      }
      return;
    }

    // Multi-select mode: toggle inclusion
    let next: string[];
    if (selectedRegencies.includes(regName)) {
      next = selectedRegencies.filter(r => r !== regName);
    } else {
      next = [...selectedRegencies, regName];
    }
    setSelectedRegencies(next);
    fitMapToSelectedRegencies(next);
  };

  const handleApplyCluster = (clusterRegencies: string[]) => {
    setSelectedRegencies(clusterRegencies);
    fitMapToSelectedRegencies(clusterRegencies);
  };

  const handleResetWestJava = () => {
    setSelectedRegencies([]);
    fitMapToSelectedRegencies([]);
  };

  const handleRemoveSingleRegency = (regName: string) => {
    const next = selectedRegencies.filter(r => r !== regName);
    setSelectedRegencies(next);
    fitMapToSelectedRegencies(next);
  };

  const handleFlyToHotspot = (hotspot: TrafficHeatPoint) => {
    setActiveHotspot(hotspot);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hotspot.lat, hotspot.lng], 14, { duration: 1 });
    }
    const nearby = findNearbySpotsForHotspot(hotspot, spots, 3);
    if (nearby.length > 0) {
      onSelectSpot(nearby[0].spot);
    }
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
    <div className={`relative w-full ${isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[calc(100vh-4rem)]'} flex flex-col overflow-hidden bg-slate-950`}>
      {/* Top Filter and Controls Bar */}
      <div className="absolute top-3 left-3 right-16 z-20 flex flex-col gap-2 pointer-events-auto max-w-5xl">
        
        {/* Row 1: Search & Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg shadow-2xl">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari jalan, titik, atau brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-52 pl-7 pr-2.5 py-1 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-md focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

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

          {/* Unblocked Free Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 text-emerald-400 rounded-lg shadow-xl text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Peta Bebas Blokir</span>
          </div>

          {onSwitchToGoogle && (
            <button
              onClick={onSwitchToGoogle}
              className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md flex items-center gap-1.5"
              title="Beralih ke Google Maps Resmi (Bebas Blokir)"
            >
              <span>🗺️ Buka Google Maps Resmi</span>
            </button>
          )}
        </div>

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

      {/* Floating Alert if No Spots Found */}
      {filteredSpots.length === 0 && (
        <div className="absolute top-44 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-3 bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-xl shadow-2xl text-slate-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Tidak ada titik reklame pada kriteria wilayah yang dipilih.</span>
          <button
            onClick={handleResetWestJava}
            className="px-2.5 py-1 bg-amber-400 text-slate-950 font-bold rounded-md hover:bg-amber-300 transition-colors"
          >
            Tampilkan Seluruh Jabar
          </button>
        </div>
      )}

      {/* Map Control Floating Toolbar (Right side) */}
      <div className="absolute top-3 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 rounded-lg shadow-xl transition-colors"
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Peta Tanpa Blokir)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg shadow-xl transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg shadow-xl transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetWestJava}
          className="p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 rounded-lg shadow-xl transition-colors"
          title="Reset Sudut Pandang Jawa Barat"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Heatmap Main Toggle */}
        <button
          onClick={() => setShowTrafficHeatmap(!showTrafficHeatmap)}
          className={`p-2 border rounded-lg shadow-xl transition-colors flex items-center justify-center ${
            showTrafficHeatmap 
              ? 'bg-red-500/25 border-red-500/70 text-red-400 ring-2 ring-red-500/40' 
              : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Heatmap Kepadatan Lalu Lintas Jawa Barat"
        >
          <Flame className="w-4 h-4" />
        </button>

        {/* Rush Hour & Heatmap Controller Widget */}
        {showTrafficHeatmap && (
          <div className="flex flex-col gap-1 p-2 bg-slate-900/95 border border-slate-800 rounded-lg shadow-2xl text-[10px] font-sans w-36">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Simulasi Waktu
              </span>
            </div>
            
            <button
              onClick={() => setHeatTimeMode('rush_evening')}
              className={`px-2 py-1 rounded text-left transition-colors font-medium flex items-center justify-between ${
                heatTimeMode === 'rush_evening' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🌆 Sore (17:30)</span>
              <span className="text-[9px] opacity-80">Peak</span>
            </button>

            <button
              onClick={() => setHeatTimeMode('rush_morning')}
              className={`px-2 py-1 rounded text-left transition-colors font-medium flex items-center justify-between ${
                heatTimeMode === 'rush_morning' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🌅 Pagi (07:30)</span>
              <span className="text-[9px] opacity-80">Tol</span>
            </button>

            <button
              onClick={() => setHeatTimeMode('weekend_leisure')}
              className={`px-2 py-1 rounded text-left transition-colors font-medium flex items-center justify-between ${
                heatTimeMode === 'weekend_leisure' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🚗 Wisata/Libur</span>
              <span className="text-[9px] opacity-80">Puncak</span>
            </button>

            <button
              onClick={() => setHeatTimeMode('regular')}
              className={`px-2 py-1 rounded text-left transition-colors font-medium ${
                heatTimeMode === 'regular' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>☀️ Siang Normal</span>
            </button>

            {/* Intensity slider */}
            <div className="pt-2 border-t border-slate-800 mt-1">
              <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                <span>Intensitas Heat</span>
                <span className="font-mono text-amber-400">{Math.round(heatIntensityMultiplier * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={heatIntensityMultiplier}
                onChange={(e) => setHeatIntensityMultiplier(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Toggle hotspot pins */}
            <button
              onClick={() => setShowHotspotPins(!showHotspotPins)}
              className={`mt-1.5 px-2 py-1 rounded text-[9px] font-semibold border transition-colors flex items-center justify-center gap-1 ${
                showHotspotPins 
                  ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Flame className="w-2.5 h-2.5" />
              <span>{showHotspotPins ? 'Pin Hotspot: Aktif' : 'Pin Hotspot: Nonaktif'}</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowReachCircles(!showReachCircles)}
          className={`p-2 border rounded-lg shadow-xl transition-colors ${
            showReachCircles 
              ? 'bg-amber-400/20 border-amber-400/50 text-amber-400' 
              : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Lingkaran Jangkauan Kontak (Reach Circles)"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowVisibilityCone(!showVisibilityCone)}
          className={`p-2 border rounded-lg shadow-xl transition-colors ${
            showVisibilityCone 
              ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400' 
              : 'bg-slate-900/95 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Sudut Pandang Pengemudi (Visibility Cone)"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Free Unblocked Tile Server Switcher */}
        <div className="relative group">
          <select
            value={tileServer}
            onChange={(e) => setTileServer(e.target.value as TileServerType)}
            className="w-full p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg shadow-xl transition-colors text-[10px] font-mono cursor-pointer focus:outline-none focus:border-amber-400"
            title="Pilihan Provider Peta (Semua 100% Bebas API Key & Tanpa Blokir)"
          >
            <option value="carto_voyager">🗺️ Peta Jalan Jabar (Carto Voyager)</option>
            <option value="carto_dark">🌌 Dark Modern Canvas (Carto Dark)</option>
            <option value="esri_street">🛣️ Esri Street Navigation</option>
            <option value="esri_satellite">🛰️ Citra Satelit Resolusi Tinggi</option>
            <option value="carto_positron">⚪ Light Positron Canvas</option>
            <option value="osm">🌐 OpenStreetMap Alternatif</option>
          </select>
        </div>

        <button
          onClick={() => {
            mapInstanceRef.current?.invalidateSize();
            drawHeatmap();
          }}
          className="p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg shadow-xl transition-colors"
          title="Paksa Refresh Rendering Peta"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Bottom Floating Bar: Map Legend & Corridor Drawer Button */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3">
        {/* Heatmap Intensity Legend */}
        {showTrafficHeatmap && (
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg text-xs shadow-2xl">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              Kepadatan Trafik:
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Macet Total
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Padat Merayap
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ramai Lancar
              </span>
            </div>
          </div>
        )}

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
      </div>

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
                  onClick={() => handleFlyToHotspot(hotspot)}
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

      {/* Selected Billboard Details Sidebar Drawer */}
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
            {/* Location & Road info */}
            <div>
              <span className="text-slate-400 block mb-1">Koridor Lokasi & Tipe Jalan</span>
              <p className="text-slate-200 font-semibold">{selectedSpot.roadName}</p>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <span className="text-amber-400 font-medium">{selectedSpot.regency}</span>
                <span>·</span>
                <span>Kec. {selectedSpot.district}</span>
              </div>
            </div>

            {/* GPS Coordinates & Direction */}
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
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedSpot.coordinates.lat}&mlon=${selectedSpot.coordinates.lng}#map=16/${selectedSpot.coordinates.lat}/${selectedSpot.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <Navigation className="w-3 h-3" /> Peta OpenStreetMap Bebas
                </a>
                <span className="text-slate-600">·</span>
                <a
                  href={`https://www.google.com/maps?q=${selectedSpot.coordinates.lat},${selectedSpot.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white hover:underline"
                >
                  Google Maps
                </a>
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
                <span className="text-[10px] text-slate-500 block">peringkat lokasi prima</span>
              </div>
            </div>

            {/* Specifications */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Format & Dimensi:</span>
                <span className="text-slate-200 font-mono">
                  {selectedSpot.type} · {selectedSpot.dimensions.width}m × {selectedSpot.dimensions.height}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jarak Pandang:</span>
                <span className="text-slate-200 font-mono">{selectedSpot.viewingDistanceM} meter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Keterisian:</span>
                <span className={`font-semibold ${
                  selectedSpot.occupancyStatus === 'Occupied' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedSpot.occupancyStatus === 'Occupied' ? `Terisi (${selectedSpot.currentBrand})` : 'Tersedia'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tarif Sewa:</span>
                <span className="text-white font-mono font-bold">
                  Rp {(selectedSpot.ratePerMonthIdr / 1000000).toFixed(0)} Juta / bln
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPM (Cost Per Mille):</span>
                <span className="text-slate-200 font-mono">
                  Rp {selectedSpot.cpmIdr.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Target Audience */}
            <div className="border-t border-slate-800 pt-3">
              <span className="text-slate-400 block mb-1">Profil Demografis Audiens:</span>
              <p className="text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] leading-relaxed">
                {selectedSpot.targetDemographics}
              </p>
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
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Filter Wilayah Persebaran Reklame Jawa Barat
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pilih satu atau kombinasi wilayah spesifik (seperti Bandung, Bekasi, Bogor) untuk membatasi persebaran titik reklame pada peta.
                    </p>
                  </div>
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
                      // Select only regencies that have at least 1 billboard spot
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

              {/* Cluster Filter Buttons */}
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
                          <span>·</span>
                          <span className="text-amber-400/80">+{reg.projectedAnnualGrowthPct}% thn</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {modalFilteredRegencies.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tidak ada wilayah yang cocok dengan kata kunci pencarian.
                </div>
              )}
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
                  {filteredSpots.length} Titik Reklame Ditampilkan
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
                  onClick={() => {
                    fitMapToSelectedRegencies(selectedRegencies);
                    setShowAllRegionsModal(false);
                  }}
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
  );
}
