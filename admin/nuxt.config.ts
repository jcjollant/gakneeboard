// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 3000
  },
  alias: {
    '@server': resolve(__dirname, '../server'),
    '@gak/shared': resolve(__dirname, '../shared/src/index.ts')
  },
  runtimeConfig: {
    public: {
      GAK_API_URL: process.env.GAK_API_URL || 'https://api.kneeboard.ga/',
      IS_TEST_DB: (process.env.POSTGRES_URL || '').includes('neondb_owner')
    }
  },
  css: [
    'primeicons/primeicons.css'
  ],
  modules: [
    '@primevue/nuxt-module'
  ],
  primevue: {
    usePrimeVue: true,
    options: {
      theme: 'none'
    }
  }
})
