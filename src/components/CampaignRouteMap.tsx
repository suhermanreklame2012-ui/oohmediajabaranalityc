import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  useMap, 
  Polyline 
} from '@vis.gl/react-google-maps';
import { BillboardSpot, OptimizedTravelRoute } from '../types/ooh';
import { GOOGLE_MAPS_LIBRARIES } from './GoogleMapViewer';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Car, 
  RotateCcw, 
  Layers, 
  Eye, 
  EyeOff, 
  Target, 
  ShieldCheck, 
  Wrench, 
  ClipboardCheck, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_cErEKUXi76tGidnv0ke-zhMtgGYyq-A';

interface CampaignRouteMapProps {
  spots: BillboardSpot[];
  route: OptimizedTravelRoute;
  showRoutePath: boolean;
  onToggleRoutePath: () => void;
  selectedSpot: BillboardSpot | null;
  onSelectSpot: (spot: BillboardSpot) => void;
  startSpotId?: string;
  onChangeStartSpot: (spotId: string) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
  isFieldInspectionMode?: boolean;
}

// Inner Component for rendering Route Polyline and Waypoint Markers on Google Map
function GoogleRouteMapInner({
  route,
  showRoutePath,
  selectedSpot,
  onSelectSpot,
  onOpenDetailModal,
  isFieldInspectionMode = false
}: {
  route: OptimizedTravelRoute;
  showRoutePath: boolean;
  selectedSpot: BillboardSpot | null;
  onSelectSpot: (spot: BillboardSpot) => void;
  onOpenDetailModal: (spot: BillboardSpot) => void;
  isFieldInspectionMode?: boolean;
}) {
  const map = useMap();
  const [activeInfoSpot, setActiveInfoSpot] = useState<{ spot: BillboardSpot; step: number } | null>(null);

  // Auto-fit Google Map bounds to encompass all spots in the optimized route
  useEffect(() => {
    if (!map || route.orderedSpots.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    route.orderedSpots.forEach(s => {
      bounds.extend({ lat: s.coordinates.lat, lng: s.coordinates.lng });
    });

    map.fitBounds(bounds, { top: 75, right: 75, bottom: 75, left: 75 });
  }, [map, route]);

  const pathCoordinates = useMemo(() => {
    return route.orderedSpots.map(s => ({
      lat: s.coordinates.lat,
      lng: s.coordinates.lng
    }));
  }, [route.orderedSpots]);

  return (
    <>
      {/* 1. GOOGLE MAP ROUTE POLYLINE (Ambient Glow + Crisp Foreground Line) */}
      {showRoutePath && pathCoordinates.length >= 2 && (
        <>
          {/* Ambient Glow Polyline */}
          <Polyline
            path={pathCoordinates}
            strokeColor="#f59e0b"
            strokeOpacity={0.35}
            strokeWeight={11}
            zIndex={10}
          />
          {/* Sharp Navigational Polyline */}
          <Polyline
            path={pathCoordinates}
            strokeColor="#f59e0b"
            strokeOpacity={0.95}
            strokeWeight={4}
            zIndex={11}
          />
        </>
      )}

      {/* 2. GOOGLE MAP SEQUENTIAL WAYPOINT MARKERS */}
      {route.orderedSpots.map((spot, idx) => {
        const step = idx + 1;
        const isStart = idx === 0;
        const isEnd = idx === route.orderedSpots.length - 1;
        const isSelected = selectedSpot?.id === spot.id;

        const badgeBg = isStart ? '#10b981' : isEnd ? '#ef4444' : '#f59e0b';
        const badgeBorder = isStart ? '#059669' : isEnd ? '#b91c1c' : '#d97706';

        return (
          <AdvancedMarker
            key={spot.id}
            position={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
            title={`#${step} ${spot.name} (${spot.roadName})`}
            zIndex={isSelected ? 1500 : 100 + step}
            onClick={() => {
              onSelectSpot(spot);
              setActiveInfoSpot({ spot, step });
            }}
          >
            <div className="relative group cursor-pointer flex flex-col items-center">
              <div 
                className={`flex items-center justify-center font-bold text-slate-950 font-mono shadow-2xl transition-all ${
                  isSelected ? 'scale-125 ring-4 ring-white' : 'hover:scale-110'
                }`}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  backgroundColor: badgeBg,
                  border: `3px solid ${badgeBorder}`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
                }}
              >
                <span className="text-xs font-black">{step}</span>
              </div>
              <div className="absolute -bottom-5 whitespace-nowrap bg-slate-950/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono border border-slate-700 pointer-events-none shadow">
                {isStart ? 'Awal (Start)' : isEnd ? 'Akhir (End)' : `#${step}`}
              </div>
            </div>
          </AdvancedMarker>
        );
      })}

      {/* 3. INFO WINDOW UNTUK DETAIL AUDIT TITIK INSPEKSI */}
      {activeInfoSpot && (
        <InfoWindow
          position={{ 
            lat: activeInfoSpot.spot.coordinates.lat, 
            lng: activeInfoSpot.spot.coordinates.lng 
          }}
          onCloseClick={() => setActiveInfoSpot(null)}
        >
          <div className="p-1 min-w-[220px] max-w-[280px] text-slate-900 font-sans space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                {isFieldInspectionMode ? 'Inspeksi Lapangan' : 'Urutan Kunjungan'} #{activeInfoSpot.step}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                {activeInfoSpot.spot.code}
              </span>
            </div>

            <div>
              <h5 className="font-bold text-xs text-slate-950 leading-snug">
                {activeInfoSpot.spot.name}
              </h5>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {activeInfoSpot.spot.roadName}, {activeInfoSpot.spot.regency}
              </p>
            </div>

            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Tipe Media:</span>
                <strong className="text-slate-800">{activeInfoSpot.spot.type}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status Okupansi:</span>
                <strong className={activeInfoSpot.spot.occupancyStatus === 'Occupied' ? 'text-rose-600' : 'text-emerald-600'}>
                  {activeInfoSpot.spot.occupancyStatus}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimasi Waktu Audit:</span>
                <strong className="text-amber-700">
                  {activeInfoSpot.spot.type.includes('LED') || activeInfoSpot.spot.type.includes('Mega') ? '25 mnt' : '15 mnt'}
                </strong>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => onOpenDetailModal(activeInfoSpot.spot)}
                className="w-full py-1.5 text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Buka Lembar Audit Titik</span>
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function CampaignRouteMap({
  spots,
  route,
  showRoutePath,
  onToggleRoutePath,
  selectedSpot,
  onSelectSpot,
  startSpotId,
  onChangeStartSpot,
  onOpenDetailModal,
  isFieldInspectionMode = false
}: CampaignRouteMapProps) {
  // Map engine switcher: 'google' (default for requested polyline display) or 'leaflet'
  const [engine, setEngine] = useState<'google' | 'leaflet'>('google');
  
  // Leaflet map refs & states
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineGlowRef = useRef<L.Polyline | null>(null);
  const routePolylineMainRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const legDecoratorsRef = useRef<L.LayerGroup | null>(null);
  
  const [leafletStyle, setLeafletStyle] = useState<'dark' | 'street'>('dark');
  const activeTileLayerRef = useRef<L.LayerGroup | L.TileLayer | null>(null);

  // Inisialisasi Peta Leaflet (hanya saat engine === 'leaflet')
  useEffect(() => {
    if (engine !== 'leaflet') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = route.orderedSpots[0]
        ? [route.orderedSpots[0].coordinates.lat, route.orderedSpots[0].coordinates.lng]
        : [-6.9175, 107.6191];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      const markersLayer = L.layerGroup().addTo(map);
      const legDecorators = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      legDecoratorsRef.current = legDecorators;

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    if (leafletStyle === 'dark') {
      const baseLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16 }
      );
      const referenceLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16 }
      );
      const darkGroup = L.layerGroup([baseLayer, referenceLayer]).addTo(map);
      activeTileLayerRef.current = darkGroup;
    } else {
      const streetLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
      activeTileLayerRef.current = streetLayer;
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [engine, leafletStyle, route]);

  // Update Leaflet polyline & markers
  useEffect(() => {
    if (engine !== 'leaflet') return;
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !legDecoratorsRef.current) return;

    const markersLayer = markersLayerRef.current;
    const legDecorators = legDecoratorsRef.current;

    markersLayer.clearLayers();
    legDecorators.clearLayers();

    if (routePolylineGlowRef.current) {
      map.removeLayer(routePolylineGlowRef.current);
      routePolylineGlowRef.current = null;
    }
    if (routePolylineMainRef.current) {
      map.removeLayer(routePolylineMainRef.current);
      routePolylineMainRef.current = null;
    }

    if (route.orderedSpots.length === 0) return;

    if (showRoutePath && route.orderedSpots.length >= 2) {
      const latlngs: L.LatLngExpression[] = route.orderedSpots.map(s => [
        s.coordinates.lat,
        s.coordinates.lng
      ]);

      const glowPolyline = L.polyline(latlngs, {
        color: '#f59e0b',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineGlowRef.current = glowPolyline;

      const mainPolyline = L.polyline(latlngs, {
        color: '#f59e0b',
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineMainRef.current = mainPolyline;
    }

    const bounds = L.latLngBounds([]);

    route.orderedSpots.forEach((spot, idx) => {
      const latLng: [number, number] = [spot.coordinates.lat, spot.coordinates.lng];
      bounds.extend(latLng);

      const step = idx + 1;
      const isStart = idx === 0;
      const isEnd = idx === route.orderedSpots.length - 1;
      const isSelected = selectedSpot?.id === spot.id;

      const bgColor = isStart ? '#10b981' : isEnd ? '#ef4444' : '#f59e0b';
      const borderColor = isStart ? '#059669' : isEnd ? '#b91c1c' : '#d97706';

      const customIcon = L.divIcon({
        className: 'custom-route-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            background-color: ${bgColor};
            border: 3px solid ${borderColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #020617;
            font-family: ui-monospace, monospace;
            font-weight: 900;
            font-size: 13px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7);
            transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            ${step}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(markersLayer);
      marker.on('click', () => {
        onSelectSpot(spot);
      });
    });

    if (route.orderedSpots.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [engine, route, showRoutePath, selectedSpot, onSelectSpot]);

  const handleResetBounds = () => {
    if (engine === 'leaflet') {
      const map = mapInstanceRef.current;
      if (!map || route.orderedSpots.length === 0) return;
      const bounds = L.latLngBounds(route.orderedSpots.map(s => [s.coordinates.lat, s.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Card Container */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Render Engine 1: Google Maps (Default dengan Polyline Native) */}
        {engine === 'google' && (
          <APIProvider 
            apiKey={GOOGLE_MAPS_API_KEY}
            language="id" 
            region="ID"
            libraries={GOOGLE_MAPS_LIBRARIES}
          >
            <Map
              defaultCenter={{
                lat: route.orderedSpots[0]?.coordinates.lat || -6.9175,
                lng: route.orderedSpots[0]?.coordinates.lng || 107.6191
              }}
              defaultZoom={12}
              gestureHandling="greedy"
              disableDefaultUI={true}
              mapId="campaign_route_google_map"
              className="w-full h-full"
            >
              <GoogleRouteMapInner
                route={route}
                showRoutePath={showRoutePath}
                selectedSpot={selectedSpot}
                onSelectSpot={onSelectSpot}
                onOpenDetailModal={onOpenDetailModal}
                isFieldInspectionMode={isFieldInspectionMode}
              />
            </Map>
          </APIProvider>
        )}

        {/* Render Engine 2: Leaflet Fallback (Watermark-free) */}
        {engine === 'leaflet' && (
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        )}

        {/* Top Header Floating Overlay: Summary & Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pointer-events-none">
          <div className="p-3 px-4 bg-slate-950/90 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isFieldInspectionMode ? 'RUTE INSPEKSI TIM LAPANGAN' : 'RUTE EFISIEN OOH'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                  {route.totalDistanceKm} km
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {route.totalTravelMinutes} mnt berkendara
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white">{route.orderedSpots.length}</span>
                <span className="text-[10px] text-slate-400">titik reklame</span>
                {engine === 'google' && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Google Maps Polyline
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls: Engine Switcher & Polyline Toggle */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Map Engine Toggle: Google Maps vs Leaflet */}
            <div className="flex items-center p-1 bg-slate-950/90 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md">
              <button
                onClick={() => setEngine('google')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  engine === 'google'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilkan di Google Maps (Polyline Native)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </button>
              <button
                onClick={() => setEngine('leaflet')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  engine === 'leaflet'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilkan di Peta Alternatif Leaflet"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Leaflet</span>
              </button>
            </div>

            {/* ROUTE VISUALIZATION TOGGLE BUTTON */}
            <button
              onClick={onToggleRoutePath}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xl backdrop-blur-md border ${
                showRoutePath
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-slate-900/95 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {showRoutePath ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-950" />
                  <span>Polyline: Aktif</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Polyline: Nonaktif</span>
                </>
              )}
            </button>

            {/* Leaflet Theme Switcher (only shown when in Leaflet mode) */}
            {engine === 'leaflet' && (
              <button
                onClick={() => setLeafletStyle(prev => (prev === 'dark' ? 'street' : 'dark'))}
                className="p-2 bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-medium backdrop-blur-md shadow-lg"
                title="Ganti Tema Peta Leaflet"
              >
                <Layers className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Reset Bounds */}
            <button
              onClick={handleResetBounds}
              className="p-2 bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-medium backdrop-blur-md shadow-lg"
              title="Pusatkan Peta"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Bottom Floating Legend / Start Point Selector */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
          <div className="p-2.5 px-3 bg-slate-950/90 border border-slate-800 backdrop-blur-md rounded-xl shadow-2xl pointer-events-auto flex items-center gap-2.5 text-xs text-slate-300">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              Titik Mulai Inspeksi:
            </span>
            <select
              value={startSpotId || (route.orderedSpots[0]?.id || '')}
              onChange={(e) => onChangeStartSpot(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            >
              {spots.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  #{idx + 1} {s.code} - {s.roadName} ({s.regency})
                </option>
              ))}
            </select>
          </div>

          <div className="p-2 px-3 bg-slate-950/90 border border-slate-800 backdrop-blur-md rounded-xl shadow-2xl pointer-events-auto flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-300">Awal (#1 Start)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="text-slate-300">Waypoint (#2..#N-1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-300">Akhir (#N Selesai)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Travel Itinerary & Turn-by-Turn Leg Cards */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>
                {isFieldInspectionMode 
                  ? 'Urutan Inspeksi Lapangan Teroptimasi (Field Inspection Sequence)' 
                  : 'Urutan Perjalanan Rute Teroptimasi (Travel Itinerary)'}
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFieldInspectionMode
                ? 'Jalur paling efisien untuk tim teknis dan auditor lapangan mengunjungi serta memeriksa kondisi fisik reklame secara berurutan.'
                : 'Jalur menghubungkan titik-titik reklame terpilih dengan efisiensi jarak tempuh dan arah mobilitas komuter yang searah.'}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
              Total Jarak: <strong className="text-amber-400">{route.totalDistanceKm} km</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
              Waktu Tempuh: <strong className="text-cyan-400">{route.totalTravelMinutes} menit</strong>
            </span>
          </div>
        </div>

        {/* Leg by Leg List */}
        <div className="space-y-3">
          {route.legs.map((leg) => (
            <div 
              key={leg.legIndex}
              className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {leg.legIndex}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span>{leg.fromSpot.name}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="text-amber-300">{leg.toSpot.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{leg.fromSpot.roadName} ({leg.fromSpot.regency})</span>
                    <span>ke</span>
                    <span>{leg.toSpot.roadName} ({leg.toSpot.regency})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span>{leg.distanceKm} km</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>~{leg.estimatedMinutes} menit</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800">
                  Arah {leg.headingText || (leg as any).bearing?.text || 'Utara'}
                </span>
                <button
                  onClick={() => onOpenDetailModal(leg.toSpot)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Detail Spot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
