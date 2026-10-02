import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {patchViteClient} from './scripts/patchViteClient.ts';

patchViteClient();

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio dev environment to prevent WebSocket closed errors
      hmr: false,
      watch: null,
    },
  };
});
