import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for React app with LAN/device testing and production-ready build
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows access from LAN devices (for Android Studio/device testing)
    port: 3000,
    // Uncomment below to allow CORS for local API testing (optional)
    // cors: true,
    // headers: {
    //   'Access-Control-Allow-Origin': '*',
    // },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
    // base: '/your-subdirectory/', // Uncomment and set if deploying to a subdirectory
  }
})