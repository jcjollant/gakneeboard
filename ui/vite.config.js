import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  envPrefix: 'GAK_',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@checklist/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('html2canvas-pro')) {
              return 'jspdf';
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdfjs';
            }
            if (id.includes('primevue') || id.includes('primeicons')) {
              return 'primevue';
            }
            if (id.includes('@fortawesome')) {
              return 'fontawesome';
            }
            return 'vendor';
          }
        }
      }
    }
  },
})
