/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BillboardSpot } from './types/ooh';
import { INITIAL_BILLBOARD_SPOTS } from './data/jabarData';
import { Navbar, NavTabType } from './components/Navbar';
import { GlobalPerformanceSummary } from './components/GlobalPerformanceSummary';
import { GoogleMapViewer } from './components/GoogleMapViewer';
import { MapViewer } from './components/MapViewer';
import { RealTimeStats } from './components/RealTimeStats';
import { TrafficInsights } from './components/TrafficInsights';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { EffectivenessAnalysis } from './components/EffectivenessAnalysis';
import { DemographicAnalysis } from './components/DemographicAnalysis';
import { DatabaseTable } from './components/DatabaseTable';
import { CampaignPlanner } from './components/CampaignPlanner';
import { OmnichannelMediaStrategyPlanner } from './components/OmnichannelMediaStrategyPlanner';
import { AiOmnichannelPipeline } from './components/AiOmnichannelPipeline';
import { LogisticOptimizer } from './components/LogisticOptimizer';
import { ReportGenerator } from './components/ReportGenerator';
import { SpotDetailModal } from './components/SpotDetailModal';
import { AddSpotModal } from './components/AddSpotModal';
import { ExportModal } from './components/ExportModal';
import { SecurityPortalGate } from './components/SecurityPortalGate';
import { JabarOohAiAssistant } from './components/JabarOohAiAssistant';
import { AuthSession, UserAccount } from './types/auth';
import { getActiveSession, saveActiveSession } from './utils/authService';
import { CheckCircle2, Database, Download, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('map');
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  
  // Security Authentication & Lock State
  const [session, setSession] = useState<AuthSession | null>(() => getActiveSession());
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const s = getActiveSession();
    return s ? s.isLocked : false;
  });

  // Spots state loaded from server-side SQLite (ZERO LocalStorage / ZERO IndexedDB)
  const [spots, setSpots] = useState<BillboardSpot[]>(INITIAL_BILLBOARD_SPOTS);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'fallback'>('loading');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [selectedSpot, setSelectedSpot] = useState<BillboardSpot | null>(null);
  const [detailModalSpot, setDetailModalSpot] = useState<BillboardSpot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [prefilledSpot, setPrefilledSpot] = useState<Partial<BillboardSpot> | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Polling Service: Ambil data segar dari /api/spots saat mount dan secara otomatis setiap 60 detik
  useEffect(() => {
    // Bersihkan sisa-sisa localStorage lama agar tidak terpakai lagi
    try {
      localStorage.removeItem('jabar_ooh_spots_v1');
    } catch (e) {
      // ignore
    }

    let isSubscribed = true;
    let isFetching = false;

    async function fetchSpotsFromDb(isBackgroundPolling = false) {
      if (isFetching) return;
      isFetching = true;
      if (isBackgroundPolling) {
        setIsSyncing(true);
      }

      try {
        const res = await fetch('/api/spots', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isSubscribed) {
            setSpots(json.data);
            setDbStatus('connected');
            setLastSyncTime(new Date());

            // Pastikan data spot yang sedang aktif/diinspeksi tetap tersinkronisasi
            setSelectedSpot(prevSelected => {
              if (!prevSelected) return null;
              return json.data.find((s: BillboardSpot) => s.id === prevSelected.id) || prevSelected;
            });

            setDetailModalSpot(prevModal => {
              if (!prevModal) return null;
              return json.data.find((s: BillboardSpot) => s.id === prevModal.id) || prevModal;
            });
            return;
          }
        }
        if (isSubscribed) setDbStatus(prev => (prev === 'connected' ? 'connected' : 'fallback'));
      } catch (err) {
        if (!isBackgroundPolling) {
          console.warn('Backend SQLite connection fallback:', err);
        }
        if (isSubscribed) setDbStatus(prev => (prev === 'connected' ? 'connected' : 'fallback'));
      } finally {
        isFetching = false;
        if (isSubscribed) {
          setIsSyncing(false);
        }
      }
    }

    // 1. Ambil data pertama kali saat mount
    fetchSpotsFromDb(false);

    // 2. Polling service setiap 60 detik (60.000 ms) agar sinkron dengan perubahan lapangan secara real-time
    const POLLING_INTERVAL_MS = 60000;
    const intervalId = setInterval(() => {
      fetchSpotsFromDb(true);
    }, POLLING_INTERVAL_MS);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Simpan data baru langsung ke server database SQLite
  const handleAddSpot = async (newSpot: BillboardSpot) => {
    setSpots(prev => [newSpot, ...prev]);
    setSelectedSpot(newSpot);

    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpot)
      });
      if (res.ok) {
        showToast(`Titik reklame baru "${newSpot.name}" berhasil disimpan ke server SQLite.`);
      } else {
        showToast(`Titik ditambahkan secara lokal (koneksi server: respon ${res.status}).`);
      }
    } catch (err) {
      showToast(`Titik ditambahkan ke memori aktif aplikasi.`);
    }
  };

  const handleOpenMapWithSpot = (spot: BillboardSpot) => {
    setSelectedSpot(spot);
    setActiveTab('map');
  };

  // TAMPILAN PEMBUKA DENGAN KEAMANAN SISTEM KUNCI
  if (!session || isLocked) {
    return (
      <SecurityPortalGate
        onAuthenticated={(newSession) => {
          setSession(newSession);
          setIsLocked(false);
          showToast(`Autentikasi terverifikasi. Selamat datang, ${newSession.user.fullName}!`);
        }}
        isLockScreenMode={isLocked}
        currentUser={session?.user || null}
        onCancelLockScreen={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans grid grid-rows-[auto_1fr] [grid-template-areas:'app-header''app-main'] overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-amber-400/50 text-white text-xs rounded-xl shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="[grid-area:app-header] z-40">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => {
            setPrefilledSpot(null);
            setIsAddModalOpen(true);
          }}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          totalSpotsCount={spots.length}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          currentUser={session?.user || null}
          onLockScreen={() => {
            setIsLocked(true);
            if (session) saveActiveSession({ ...session, isLocked: true });
          }}
          onLogout={() => {
            setSession(null);
            setIsLocked(false);
            saveActiveSession(null);
            showToast('Sesi operator telah diakhiri. Sistem terkunci.');
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="[grid-area:app-main] relative w-full h-full overflow-hidden flex flex-col">
        {/* Global Performance Summary Card at top of the Dashboard Main View */}
        {activeTab === 'map' && (
          <GlobalPerformanceSummary
            spots={spots}
            lastSyncTime={lastSyncTime}
            onOpenAvailableSpots={() => setActiveTab('database')}
            onNavigateToAnalytics={() => setActiveTab('realtime')}
          />
        )}

        <div className={`relative w-full flex-1 min-h-0 ${activeTab === 'map' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
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
              onNavigateToLogisticOptimizer={() => setActiveTab('logistic-optimizer')}
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

          {activeTab === 'demographic' && (
            <DemographicAnalysis
              spots={spots}
              initialSpotId={selectedSpot?.id}
              onOpenDetailModal={setDetailModalSpot}
              onNavigateToMap={handleOpenMapWithSpot}
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

          {activeTab === 'omnichannel-planner' && (
            <OmnichannelMediaStrategyPlanner
              spots={spots}
              onOpenDetailModal={setDetailModalSpot}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'ai-pipeline' && (
            <AiOmnichannelPipeline
              onOpenMapTab={(coords) => {
                const matched = spots.find(s => 
                  Math.abs(s.coordinates.lat - coords.lat) < 0.05 && 
                  Math.abs(s.coordinates.lng - coords.lng) < 0.05
                ) || spots[0];
                handleOpenMapWithSpot(matched);
              }}
            />
          )}

          {activeTab === 'logistic-optimizer' && (
            <LogisticOptimizer
              spots={spots}
              onOpenDetailModal={setDetailModalSpot}
              onNavigateToInteractiveMap={handleOpenMapWithSpot}
            />
          )}

          {activeTab === 'reports' && (
            <ReportGenerator
              spots={spots}
              onOpenDetailModal={setDetailModalSpot}
            />
          )}
        </div>
      </main>

      {/* Footer (Subtle, unobtrusive - shows server-side SQLite & MySQL status) */}
      {activeTab !== 'map' && (
        <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-xs text-slate-500 print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Database: SQLite 3 Persistent (Server-Side)
              </span>
              <span>·</span>
              <span className="text-[11px] text-slate-400">Zero LocalStorage / No IndexedDB</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <a
                href="/api/database/export/mysql"
                download="database_bandung_media_outdoor_mysql.sql"
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                title="Download MySQL Dump untuk cPanel / phpMyAdmin"
              >
                <Download className="w-3 h-3" />
                <span>Unduh MySQL Dump (.sql)</span>
              </a>
              <span>·</span>
              <a
                href="/api/database/export/sqlite"
                download="database_bandung_media_outdoor_sqlite.sql"
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                title="Download SQLite 3 Database Dump"
              >
                <Database className="w-3 h-3" />
                <span>Unduh SQLite (.sql)</span>
              </a>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <SpotDetailModal
        spot={detailModalSpot}
        onClose={() => setDetailModalSpot(null)}
        onViewOnMap={handleOpenMapWithSpot}
        onOpenDemographics={(spot) => {
          setSelectedSpot(spot);
          setActiveTab('demographic');
        }}
      />

      <AddSpotModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefilledSpot(null);
        }}
        onAddSpot={handleAddSpot}
        initialValues={prefilledSpot}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        spots={spots}
      />

      {/* JabarOOH AI Assistant - Pojok Kanan Bawah */}
      {session && !isLocked && (
        <JabarOohAiAssistant
          selectedSpot={selectedSpot}
          onSelectSpotById={(codeOrId) => {
            const found = spots.find(s => s.code === codeOrId || s.id === codeOrId);
            if (found) {
              setSelectedSpot(found);
              setDetailModalSpot(found);
            }
          }}
          onOpenAddSpotWithPrefill={(candidate) => {
            setPrefilledSpot(candidate);
            setIsAddModalOpen(true);
            setToastMessage(`Form Tambah Titik terisi otomatis berdasarkan rekomendasi AI: ${candidate.name}`);
          }}
          onViewCandidateLocationOnMap={(lat, lng, label) => {
            setActiveTab('map');
            setToastMessage(`Menyorot koordinat calon titik baru: ${label} (${lat}, ${lng})`);
          }}
        />
      )}
    </div>
  );
}
