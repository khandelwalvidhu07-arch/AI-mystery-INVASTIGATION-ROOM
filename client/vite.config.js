import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Expose dev server on all network interfaces so other LAN devices can access it
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // In dev, proxy /api calls to the backend so VITE_API_URL isn't needed locally
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
