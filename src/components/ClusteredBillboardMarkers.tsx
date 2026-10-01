import React, { useEffect, useRef, useMemo } from 'react';
import { useMap, useMapsLibrary, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MarkerClusterer, type Cluster, type ClusterStats } from '@googlemaps/markerclusterer';
import { BillboardSpot } from '../types/ooh';
import { MapPin } from 'lucide-react';
import { calculateSpotKpiMetrics } from '../utils/kpiMetrics';

interface ClusteredBillboardMarkersProps {
  spots: BillboardSpot[];
  selectedSpot: BillboardSpot | null;
  onSelectSpot: (spot: BillboardSpot) => void;
  setInfoWindowSpot: (spot: BillboardSpot | null) => void;
  showCompetitorLayer: boolean;
  showKpiHeatmap?: boolean;
  clusteringEnabled: boolean;
}

export function ClusteredBillboardMarkers({
  spots,
  selectedSpot,
  onSelectSpot,
  setInfoWindowSpot,
  showCompetitorLayer,
  showKpiHeatmap = false,
  clusteringEnabled
}: ClusteredBillboardMarkersProps) {
  const map = useMap();
  const markerLib = useMapsLibrary('marker');
  const clustererRef = useRef<MarkerClusterer | null>(null);

  // Patch AdvancedMarkerElement.prototype.addListener to prevent Google Maps deprecation warning
  useEffect(() => {
    if (!markerLib?.AdvancedMarkerElement?.prototype) return;

    const proto = markerLib.AdvancedMarkerElement.prototype as any;
    if (!proto.__patchedGmpListener) {
      proto.__patchedGmpListener = true;
      proto.addListener = function (eventName: string, handler: EventListenerOrEventListenerObject) {
        const cleanEvent = eventName.startsWith('gmp-') ? eventName : `gmp-${eventName}`;
        this.addEventListener(cleanEvent, handler);
        return {
          remove: () => {
            this.removeEventListener(cleanEvent, handler);
          }
        };
      };
    }
  }, [markerLib]);

  // Custom cluster renderer with modern badge & styling
  // Uses native addEventListener directly on the cluster marker to avoid any addListener warnings
  const customRenderer = useMemo(() => {
    if (!markerLib) return null;

    return {
      render: ({ count, position, bounds }: Cluster, _stats: ClusterStats, mapInstance: google.maps.Map) => {
        const clusterDiv = document.createElement('div');
        clusterDiv.className = 'group cursor-pointer';

        // Size scaling based on cluster count
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

        const clusterMarker = new markerLib.AdvancedMarkerElement({
          map: mapInstance,
          position,
          zIndex,
          title: `Kluster ${count} Titik Reklame (Klik untuk Memperbesar Wilayah)`,
          content: clusterDiv,
        });

        // Click handler to smoothly zoom in to the cluster bounds
        const handleClusterClick = () => {
          if (bounds) {
            mapInstance.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
          } else if (position) {
            mapInstance.panTo(position);
            mapInstance.setZoom((mapInstance.getZoom() || 12) + 2);
          }
        };

        // Attach modern DOM event listeners directly (no addListener deprecation warnings)
        clusterDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          handleClusterClick();
        });

        clusterMarker.addEventListener('gmp-click', () => {
          handleClusterClick();
        });

        return clusterMarker;
      }
    };
  }, [markerLib]);

  // Clustered mode: Manage AdvancedMarkerElement lifecycle directly inside MarkerClusterer
  // Does NOT pass onClusterClick to MarkerClusterer (which calls deprecated marker.addListener internally)
  useEffect(() => {
    if (!map || !markerLib || !customRenderer || !clusteringEnabled) {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
      return;
    }

    const clusterer = new MarkerClusterer({
      map,
      renderer: customRenderer
    });

    const createdMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    spots.forEach(spot => {
      const isSelected = selectedSpot?.id === spot.id;
      const kpi = calculateSpotKpiMetrics(spot);
      const color = 
        showKpiHeatmap ? kpi.colorHex :
        spot.type === 'LED Videotron' ? '#06b6d4' :
        spot.type === 'Megatron' ? '#a855f7' :
        spot.type === 'JPO Pedestrian Bridge' ? '#10b981' :
        '#f59e0b';
      const isOccupied = spot.occupancyStatus === 'Occupied';

      const markerContent = document.createElement('div');
      markerContent.className = 'relative group cursor-pointer flex flex-col items-center';
      
      markerContent.innerHTML = `
        ${showKpiHeatmap ? `
          <div style="margin-bottom: 4px; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 800; font-family: ui-monospace, monospace; white-space: nowrap; background: rgba(15, 23, 42, 0.95); color: ${kpi.colorHex}; border: 1.5px solid ${kpi.colorHex}; box-shadow: 0 4px 14px ${kpi.badgeGlow};">
            🔥 ${kpi.monthlyRoiMultiplier}x | ${kpi.monthlyConversionRatePct}%
          </div>
        ` : showCompetitorLayer ? `
          <div style="margin-bottom: 4px; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; white-space: nowrap; ${
            isOccupied
              ? 'background: rgba(69, 10, 10, 0.95); color: #fecaca; border: 1px solid #ef4444;'
              : 'background: rgba(6, 78, 59, 0.95); color: #a7f3d0; border: 1px solid #10b981;'
          }">
            ${isOccupied ? `⚔️ ${spot.currentBrand || 'Kompetitor'}` : '💎 Tersedia'}
          </div>
        ` : ''}
        <div style="
          width: ${showKpiHeatmap ? '32px' : '28px'};
          height: ${showKpiHeatmap ? '32px' : '28px'};
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${color};
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          ${showKpiHeatmap ? `box-shadow: 0 0 16px ${kpi.badgeGlow}; border: 2.5px solid #ffffff;` : ''}
          ${isSelected ? 'transform: scale(1.25); box-shadow: 0 0 0 4px #f59e0b;' : ''}
          ${showCompetitorLayer && !isOccupied ? 'box-shadow: 0 0 0 2px #10b981;' : ''}
        ">
          <svg style="width: 16px; height: 16px; fill: #020617;" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
        </div>
      `;

      const marker = new markerLib.AdvancedMarkerElement({
        position: { lat: spot.coordinates.lat, lng: spot.coordinates.lng },
        title: `${spot.name} - ROI: ${kpi.monthlyRoiMultiplier}x, Konversi: ${kpi.monthlyConversionRatePct}%`,
        zIndex: isSelected ? 1200 : showKpiHeatmap ? 200 + kpi.kpiIntensityScore : 100,
        content: markerContent
      });

      // Use standard gmp-click event listener to prevent deprecation warning
      marker.addEventListener('gmp-click', () => {
        onSelectSpot(spot);
        setInfoWindowSpot(spot);
      });

      createdMarkers.push(marker);
    });

    clusterer.addMarkers(createdMarkers);
    clustererRef.current = clusterer;

    return () => {
      clusterer.clearMarkers();
      clustererRef.current = null;
    };
  }, [map, markerLib, spots, clusteringEnabled, selectedSpot, showCompetitorLayer, showKpiHeatmap, customRenderer, onSelectSpot, setInfoWindowSpot]);

  // When clustering is enabled and the marker library is loaded, the clusterer renders the markers
  if (clusteringEnabled && markerLib) {
    return null;
  }

  // Fallback or when clustering is disabled: render declarative JSX AdvancedMarker
  return (
    <>
      {spots.map(spot => {
        const isSelected = selectedSpot?.id === spot.id;
        const kpi = calculateSpotKpiMetrics(spot);
        const color = 
          showKpiHeatmap ? kpi.colorHex :
          spot.type === 'LED Videotron' ? '#06b6d4' :
          spot.type === 'Megatron' ? '#a855f7' :
          spot.type === 'JPO Pedestrian Bridge' ? '#10b981' :
          '#f59e0b';
        const isOccupied = spot.occupancyStatus === 'Occupied';

        return (
          <AdvancedMarker
            key={spot.id}
            position={{ lat: spot.coordinates.lat, lng: spot.coordinates.lng }}
            title={`${spot.name} - ROI: ${kpi.monthlyRoiMultiplier}x, Konversi: ${kpi.monthlyConversionRatePct}%`}
            zIndex={isSelected ? 1200 : showKpiHeatmap ? 200 + kpi.kpiIntensityScore : 100}
            onClick={() => {
              onSelectSpot(spot);
              setInfoWindowSpot(spot);
            }}
          >
            <div className="relative group cursor-pointer transition-transform hover:scale-110 flex flex-col items-center">
              {showKpiHeatmap ? (
                <div 
                  className="mb-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold font-mono shadow-xl border backdrop-blur-md whitespace-nowrap"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: kpi.colorHex,
                    borderColor: kpi.colorHex,
                    boxShadow: `0 4px 14px ${kpi.badgeGlow}`
                  }}
                >
                  🔥 ROI {kpi.monthlyRoiMultiplier}x · {kpi.monthlyConversionRatePct}%
                </div>
              ) : showCompetitorLayer ? (
                <div className={`mb-1 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-lg border backdrop-blur-md whitespace-nowrap ${
                  isOccupied
                    ? 'bg-red-950/90 text-red-200 border-red-500/80 ring-1 ring-red-500/30'
                    : 'bg-emerald-950/90 text-emerald-200 border-emerald-400 ring-1 ring-emerald-500/50'
                }`}>
                  {isOccupied ? `⚔️ ${spot.currentBrand || 'Kompetitor'}` : '💎 Tersedia (Untapped)'}
                </div>
              ) : null}

              <div 
                className={`rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                  showKpiHeatmap ? 'w-8 h-8 border-2 border-white' : 'w-7 h-7'
                } ${
                  isSelected ? 'scale-125 ring-4 ring-amber-400' : ''
                } ${showCompetitorLayer && !isOccupied ? 'ring-2 ring-emerald-400' : ''}`}
                style={{ 
                  backgroundColor: color,
                  boxShadow: showKpiHeatmap ? `0 0 16px ${kpi.badgeGlow}` : undefined
                }}
              >
                <MapPin className="w-4 h-4 text-slate-950 fill-slate-950" />
              </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
