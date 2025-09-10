import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // escucha en 0.0.0.0 (no solo localhost)
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000' // Vite → Node (dentro de la VM)
    }
  }
})
