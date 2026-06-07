import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 2000, // Cesium is huge
    rollupOptions: {
      output: {
        manualChunks: {
          cesium: ['cesium'],
          turf: ['@turf/turf']
        }
      }
    }
  }
});
