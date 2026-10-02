// Filter Node.js experimental warnings for clean server logs
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'ExperimentalWarning' && (warning.message.includes('SQLite') || warning.message.includes('sqlite'))) {
    return;
  }
  console.warn(warning);
});

import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { patchViteClient } from './scripts/patchViteClient';
import { 
  getAllSpotsFromDb, 
  insertSpotToDb, 
  updateSpotInDb, 
  deleteSpotFromDb, 
  getDatabaseStats 
} from './server/database';

dotenv.config();

async function startServer() {
  // Ensure Vite client debug noise is muted
  patchViteClient();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------------------
  // 1. REST API: TITIK REKLAME OOH (SERVER-SIDE SQLITE & MYSQL BACKED)
  // -------------------------------------------------------------------------
  app.get('/api/spots', (req, res) => {
    try {
      const spots = getAllSpotsFromDb();
      return res.json({
        success: true,
        source: 'sqlite3_server_persistent',
        count: spots.length,
        data: spots
      });
    } catch (err: any) {
      console.error('Error fetching spots from SQLite:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/spots', (req, res) => {
    try {
      const newSpot = req.body;
      if (!newSpot || !newSpot.name || !newSpot.roadName) {
        return res.status(400).json({ success: false, error: 'Nama dan Nama Jalan wajib diisi' });
      }
      const savedSpot = insertSpotToDb(newSpot);
      return res.status(201).json({ success: true, data: savedSpot });
    } catch (err: any) {
      console.error('Error creating spot in SQLite:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/spots/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const ok = updateSpotInDb(id, updates);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Titik reklame tidak ditemukan' });
      }
      return res.json({ success: true, message: 'Titik reklame berhasil diperbarui' });
    } catch (err: any) {
      console.error('Error updating spot in SQLite:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/spots/:id', (req, res) => {
    try {
      const { id } = req.params;
      const ok = deleteSpotFromDb(id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Titik reklame tidak ditemukan' });
      }
      return res.json({ success: true, message: 'Titik reklame berhasil dihapus dari SQLite' });
    } catch (err: any) {
      console.error('Error deleting spot in SQLite:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------------------
  // 2. REST API: STATISTIK & STATUS DATABASE
  // -------------------------------------------------------------------------
  app.get('/api/database/stats', (req, res) => {
    try {
      const stats = getDatabaseStats();
      return res.json({ success: true, stats });
    } catch (err: any) {
      console.error('Error getting database stats:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------------------
  // 3. REST API: DOWNLOAD SQL DUMP HOSTING (MYSQL & SQLITE)
  // -------------------------------------------------------------------------
  app.get('/api/database/export/mysql', (req, res) => {
    const filePath = path.resolve('hosting_import_mysql.sql');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File hosting_import_mysql.sql belum digenerate' });
    }
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="database_bandung_media_outdoor_mysql.sql"');
    return res.sendFile(filePath);
  });

  app.get('/api/database/export/sqlite', (req, res) => {
    const filePath = path.resolve('hosting_import_sqlite.sql');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File hosting_import_sqlite.sql belum digenerate' });
    }
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="database_bandung_media_outdoor_sqlite.sql"');
    return res.sendFile(filePath);
  });

  // -------------------------------------------------------------------------
  // 4. REST API: AI WORK AUTOMATION - OMNICHANNEL GEOSPATIAL PIPELINE
  // -------------------------------------------------------------------------
  app.post('/api/ai/omnichannel-pipeline', async (req, res) => {
    try {
      const { runOmnichannelAiPipeline } = await import('./server/aiPipelineEngine');
      const input = req.body;
      const result = await runOmnichannelAiPipeline(input);
      return res.json({ success: true, result });
    } catch (err: any) {
      console.error('Error running AI omnichannel pipeline:', err);
      return res.status(500).json({ success: false, error: err.message || 'Pipeline failed' });
    }
  });

  // -------------------------------------------------------------------------
  // 4b. REST API: GEMINI AI DEMOGRAPHIC ANALYSIS ENGINE
  // -------------------------------------------------------------------------
  app.post('/api/ai/demographic-analysis', async (req, res) => {
    try {
      const { spotId, spot: inputSpot, hotspot: inputHotspot, timeOfDay, targetBrandIndustry } = req.body;
      
      let spot = inputSpot;
      if (!spot && spotId) {
        const allSpots = getAllSpotsFromDb();
        spot = allSpots.find((s: any) => s.id === spotId);
      }

      if (!spot) {
        return res.status(400).json({ success: false, error: 'Titik reklame (spot) diperlukan untuk analisis demografi' });
      }

      const { generateDemographicAnalysis } = await import('./server/demographicEngine');
      const result = await generateDemographicAnalysis(spot, inputHotspot || null, timeOfDay || 'daily_aggregate', targetBrandIndustry);
      
      return res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('Error generating demographic analysis:', err);
      return res.status(500).json({ success: false, error: err.message || 'Analisis demografi gagal' });
    }
  });

  // -------------------------------------------------------------------------
  // 4c. REST API: JABAROOH AI ASSISTANT (CONVERSATIONAL INTELLIGENCE CHAT)
  // -------------------------------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history, selectedSpotId } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Pesan pertanyaan wajib diisi' });
      }

      const { askJabarOohAssistant } = await import('./server/aiAssistantEngine');
      const reply = await askJabarOohAssistant({
        message,
        history: history || [],
        selectedSpotId
      });

      return res.json({ success: true, reply });
    } catch (err: any) {
      console.error('Error in JabarOOH AI Assistant:', err);
      return res.status(500).json({ success: false, error: err.message || 'AI Assistant gagal memproses pertanyaan' });
    }
  });

  // -------------------------------------------------------------------------
  // 4d. REST API: JABAROOH NEW SITE RECOMMENDATIONS (TRAFFIC + DEMOGRAPHICS)
  // -------------------------------------------------------------------------
  app.get('/api/ai/site-recommendations', async (req, res) => {
    try {
      const { corridorFilter, targetAudience } = req.query;
      const { generateNewLocationRecommendations } = await import('./server/siteRecommendationEngine');
      const recommendations = await generateNewLocationRecommendations({
        corridorFilter: corridorFilter as string,
        targetAudience: targetAudience as string
      });

      return res.json({ success: true, count: recommendations.length, data: recommendations });
    } catch (err: any) {
      console.error('Error generating site recommendations:', err);
      return res.status(500).json({ success: false, error: err.message || 'Gagal menghasilkan rekomendasi titik baru' });
    }
  });

  // -------------------------------------------------------------------------
  // 5. Geocoding Proxy Route using Google Maps Geocoding API
  // -------------------------------------------------------------------------
  app.get('/api/geocode', async (req, res) => {
    try {
      const address = req.query.address as string;
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ status: 'INVALID_REQUEST', error_message: 'Address parameter is required' });
      }

      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_cErEKUXi76tGidnv0ke-zhMtgGYyq-A';
      const bounds = '-7.82,106.37|-5.91,108.84';
      const queryWithContext = (address.toLowerCase().includes('jawa barat') || address.toLowerCase().includes('jabar')) 
        ? address 
        : `${address}, Jawa Barat`;
        
      const encodedAddress = encodeURIComponent(queryWithContext);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&bounds=${bounds}&components=country:ID&region=ID&language=id&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error('Server Geocode Error:', err);
      return res.status(500).json({ status: 'INTERNAL_ERROR', error_message: err.message || 'Geocoding request failed' });
    }
  });

  // -------------------------------------------------------------------------
  // 5. Frontend Vite Middleware / Production Static
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} [SQLite & MySQL Ready - No LocalStorage]`);
  });
}

startServer();
