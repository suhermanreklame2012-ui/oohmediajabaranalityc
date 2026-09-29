import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Geocoding Proxy Route using Google Maps Geocoding API
  app.get('/api/geocode', async (req, res) => {
    try {
      const address = req.query.address as string;
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ status: 'INVALID_REQUEST', error_message: 'Address parameter is required' });
      }

      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_cErEKUXi76tGidnv0ke-zhMtgGYyq-A';

      // Geocoding API query with West Java bounds & country filter
      // West Java Bounding Box: South-West (-7.82, 106.37) to North-East (-5.91, 108.84)
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

  // Vite middleware in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
