import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the React UI.  The default settings are
// sufficient for this small SPA.  We do not proxy API requests here
// because the BFF allows cross‑origin requests.  During development
// you can run `npm run dev` from within the ui folder and the API
// requests will go directly to http://localhost:5000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    minify: false,
    sourcemap: true
  }
});