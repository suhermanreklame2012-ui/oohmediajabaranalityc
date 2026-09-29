/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BillboardSpot } from './types/ooh';
import { INITIAL_BILLBOARD_SPOTS } from './data/jabarData';
import { Navbar, NavTabType } from './components/Navbar';
import { GoogleMapViewer } from './components/GoogleMapViewer';
import { MapViewer } from './components/MapViewer';
import { RealTimeStats } from './components/RealTimeStats';
import { TrafficInsights } from './components/TrafficInsights';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { EffectivenessAnalysis } from './components/EffectivenessAnalysis';
import { DatabaseTable } from './components/DatabaseTable';
import { CampaignPlanner } from './components/CampaignPlanner';
import { ReportGenerator } from './components/ReportGenerator';
import { SpotDetailModal } from './components/SpotDetailModal';
import { AddSpotModal } from './components/AddSpotModal';
import { ExportModal } from './components/ExportModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('map');
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  
  // Persistent spots state
  const [spots, setSpots] = useState<BillboardSpot[]>(() => {
    const saved = localStorage.getItem('jabar_ooh_spots_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BILLBOARD_SPOTS;
      }
    }
    return INITIAL_BILLBOARD_SPOTS;
  });

  const [selectedSpot, setSelectedSpot] = useState<BillboardSpot | null>(null);
  const [detailModalSpot, setDetailModalSpot] = useState<BillboardSpot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('jabar_ooh_spots_v1', JSON.stringify(spots));
  }, [spots]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSpot = (newSpot: BillboardSpot) => {
    setSpots(prev => [newSpot, ...prev]);
    setSelectedSpot(newSpot);
    showToast(`Titik reklame baru "${newSpot.name}" berhasil ditambahkan ke basis data Jawa Barat.`);
  };

  const handleOpenMapWithSpot = (spot: BillboardSpot) => {
    setSelectedSpot(spot);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-amber-400/50 text-white text-xs rounded-xl shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        totalSpotsCount={spots.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'map' && mapEngine === 'google' && (
          <GoogleMapViewer
            spots={spots}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            onOpenDetailModal={setDetailModalSpot}
            onSwitchToLeaflet={() => setMapEngine('leaflet')}
          />
        )}

        {activeTab === 'map' && mapEngine === 'leaflet' && (
          <MapViewer
            spots={spots}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            onOpenDetailModal={setDetailModalSpot}
            onSwitchToGoogle={() => setMapEngine('google')}
          />
        )}

        {activeTab === 'realtime' && (
          <RealTimeStats
            spots={spots}
            onSelectSpot={handleOpenMapWithSpot}
            onOpenDetailModal={setDetailModalSpot}
          />
        )}

        {activeTab === 'traffic-insights' && (
          <TrafficInsights
            spots={spots}
            onOpenMapTab={handleOpenMapWithSpot}
          />
        )}

        {activeTab === 'predictive' && (
          <PredictiveAnalytics
            spots={spots}
            onOpenMapTab={handleOpenMapWithSpot}
            onOpenDetailModal={setDetailModalSpot}
          />
        )}

        {activeTab === 'effectiveness' && (
          <EffectivenessAnalysis
            spots={spots}
            onSelectSpot={handleOpenMapWithSpot}
            onOpenDetailModal={setDetailModalSpot}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseTable
            spots={spots}
            onSelectSpot={setSelectedSpot}
            onOpenDetailModal={setDetailModalSpot}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenMapTab={handleOpenMapWithSpot}
          />
        )}

        {activeTab === 'planner' && (
          <CampaignPlanner
            spots={spots}
            onOpenMapTab={handleOpenMapWithSpot}
            onOpenDetailModal={setDetailModalSpot}
          />
        )}

        {activeTab === 'reports' && (
          <ReportGenerator
            spots={spots}
            onOpenDetailModal={setDetailModalSpot}
          />
        )}
      </main>

      {/* Footer (Subtle, unobtrusive - hidden in full map view) */}
      {activeTab !== 'map' && (
        <footer className="border-t border-slate-900 bg-slate-950 px-4 py-4 text-xs text-slate-500 print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span>Platform Pengukuran & Intelijen Media Iklan Luar Ruang Jawa Barat</span>
              <span className="mx-2">·</span>
              <span>Koordinat Standar WGS84 (EPSG:4326)</span>
            </div>
            <div>
              <span>Sistem Pemantauan OOH/DOOH Terintegrasi</span>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <SpotDetailModal
        spot={detailModalSpot}
        onClose={() => setDetailModalSpot(null)}
        onViewOnMap={handleOpenMapWithSpot}
      />

      <AddSpotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSpot={handleAddSpot}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        spots={spots}
      />
    </div>
  );
}
