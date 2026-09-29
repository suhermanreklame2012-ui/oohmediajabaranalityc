import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MarkerClusterer, type Marker, type Cluster, type ClusterStats } from '@googlemaps/markerclusterer';
import { BillboardSpot } from '../types/ooh';
import { MapPin } from 'lucide-react';

interface ClusteredBillboardMarkersProps {
  spots: BillboardSpot[];
  selectedSpot: BillboardSpot | null;
  onSelectSpot: (spot: BillboardSpot) => void;
  setInfoWindowSpot: (spot: BillboardSpot | null) => void;
  showCompetitorLayer: boolean;
  clusteringEnabled: boolean;
}

interface BillboardMarkerItemProps {
  spot: BillboardSpot;
  isSelected: boolean;
  onSelectSpot: (spot: BillboardSpot) => void;
  setInfoWindowSpot: (spot: BillboardSpot | null) => void;
  showCompetitorLayer: boolean;
  clusteringEnabled: boolean;
  onRegisterMarker: (marker: google.maps.marker.AdvancedMarkerElement | null, id: string) => void;
}

const BillboardMarkerItem = React.memo(function BillboardMarkerItem({
  spot,
  isSelected,
  onSelectSpot,
  setInfoWindowSpot,
  showCompetitorLayer,
  clusteringEnabled,
  onRegisterMarker
}: BillboardMarkerItemProps) {
  const handleClick = useCallback(() => {
    onSelectSpot(spot);
    setInfoWindowSpot(spot);
  }, [onSelectSpot, setInfoWindowSpot, spot]);

  const markerRefCallback = useCallback(
    (el: google.maps.marker.AdvancedMarkerElement | null) => {
      if (clusteringEnabled) {
        onRegisterMarker(el, spot.id);
      }
    },
    [clusteringEnabled, onRegisterMarker, spot.id]
  );

  const color = 
    spot.type === 'LED Videotron' ? '#06b6d4' :
    spot.type === 'Megatron' ? '#a855f7' :
    spot.type === 'JPO Pedestrian Bridge' ? '#10b981' :
    '#f59e0b';
  const isOccupied = spot.occupancyStatus === 'Occupied';

  return (
    <AdvancedMarker
      position={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
      ref={markerRefCallback}
      title={spot.name}
      zIndex={isSelected ? 1000 : 100}
      onClick={handleClick}
    >
      <div className="relative group cursor-pointer transition-transform hover:scale-110 flex flex-col items-center">
        {/* Competitor Presence Badge above billboard pin */}
        {showCompetitorLayer && (
          <div className={`mb-1 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-lg border backdrop-blur-md whitespace-nowrap animate-in fade-in duration-150 ${
            isOccupied
              ? 'bg-red-950/90 text-red-200 border-red-500/80 ring-1 ring-red-500/30'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-400 ring-1 ring-emerald-500/50'
          }`}>
            {isOccupied ? `⚔️ ${spot.currentBrand || 'Kompetitor'}` : '💎 Tersedia (Untapped)'}
          </div>
        )}

        <div 
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
            isSelected ? 'scale-125 ring-4 ring-amber-400' : ''
          } ${showCompetitorLayer && !isOccupied ? 'ring-2 ring-emerald-400' : ''}`}
          style={{ backgroundColor: color }}
        >
          <MapPin className="w-4 h-4 text-slate-950 fill-slate-950" />
        </div>
      </div>
    </AdvancedMarker>
  );
});

export function ClusteredBillboardMarkers({
  spots,
  selectedSpot,
  onSelectSpot,
  setInfoWindowSpot,
  showCompetitorLayer,
  clusteringEnabled
}: ClusteredBillboardMarkersProps) {
  const map = useMap();
  
  // Use a ref to store markers to avoid any React re-render loops
  const markersMapRef = useRef<{ [key: string]: Marker }>({});
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Custom cluster renderer with modern badge & styling
  const customRenderer = useMemo(() => {
    return {
      render: ({ count, position }: Cluster, _stats: ClusterStats, mapInstance: google.maps.Map) => {
        const clusterDiv = document.createElement('div');
        clusterDiv.className = 'group cursor-pointer';

        const sizePx = count > 10 ? 52 : count > 5 ? 46 : 40;
        const fontSize = count > 10 ? '15px' : '13px';

        clusterDiv.innerHTML = `
          <div style="
            width: ${sizePx}px; 
            height: ${sizePx}px; 
            border-radius: 9999px; 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: 3px solid #ffffff;
            box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #0f172a;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            font-weight: 800;
            line-height: 1;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            user-select: none;
          ">
            <span style="font-size: ${fontSize}; font-weight: 900; letter-spacing: -0.02em;">${count}</span>
            <span style="font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800; opacity: 0.85; margin-top: 1px;">Titik</span>
          </div>
        `;

        clusterDiv.addEventListener('mouseenter', () => {
          clusterDiv.style.transform = 'scale(1.12)';
        });
        clusterDiv.addEventListener('mouseleave', () => {
          clusterDiv.style.transform = 'scale(1)';
        });

        const zIndex = 2000 + count;

        return new google.maps.marker.AdvancedMarkerElement({
          map: mapInstance,
          position,
          zIndex,
          title: `Kluster ${count} Titik Reklame (Klik untuk Memperbesar Wilayah)`,
          content: clusterDiv,
        });
      }
    };
  }, []);

  // Initialize MarkerClusterer once map is ready
  const clusterer = useMemo(() => {
    if (!map || !clusteringEnabled) return null;

    return new MarkerClusterer({
      map,
      renderer: customRenderer,
      onClusterClick: (_event, cluster, mapInstance) => {
        if (cluster.bounds) {
          mapInstance.fitBounds(cluster.bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        } else if (cluster.position) {
          mapInstance.panTo(cluster.position);
          mapInstance.setZoom((mapInstance.getZoom() || 12) + 2);
        }
      }
    });
  }, [map, clusteringEnabled, customRenderer]);

  // Synchronize clusterer with markers safely in batch
  const syncClusterer = useCallback(() => {
    if (!clusterer) return;
    clusterer.clearMarkers(true);
    const markerList = Object.values(markersMapRef.current);
    if (markerList.length > 0) {
      clusterer.addMarkers(markerList);
    }
  }, [clusterer]);

  // Stable register callback that does NOT trigger React re-renders
  const handleRegisterMarker = useCallback((marker: google.maps.marker.AdvancedMarkerElement | null, id: string) => {
    if (marker) {
      if (markersMapRef.current[id] === (marker as unknown as Marker)) return;
      markersMapRef.current[id] = marker as unknown as Marker;
    } else {
      if (!markersMapRef.current[id]) return;
      delete markersMapRef.current[id];
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncClusterer();
    }, 20);
  }, [syncClusterer]);

  // Handle clusteringEnabled toggle or unmount
  useEffect(() => {
    if (!clusteringEnabled && clusterer) {
      clusterer.clearMarkers();
    } else if (clusteringEnabled && clusterer) {
      syncClusterer();
    }
  }, [clusteringEnabled, clusterer, syncClusterer]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (clusterer) {
        clusterer.clearMarkers();
      }
    };
  }, [clusterer]);

  return (
    <>
      {spots.map(spot => (
        <BillboardMarkerItem
          key={spot.id}
          spot={spot}
          isSelected={selectedSpot?.id === spot.id}
          onSelectSpot={onSelectSpot}
          setInfoWindowSpot={setInfoWindowSpot}
          showCompetitorLayer={showCompetitorLayer}
          clusteringEnabled={clusteringEnabled}
          onRegisterMarker={handleRegisterMarker}
        />
      ))}
    </>
  );
}
