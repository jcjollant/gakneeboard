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
      '@gak/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))
    },
  },
  build: {
    chunkSizeWarningLimit: 600,


  },
})
