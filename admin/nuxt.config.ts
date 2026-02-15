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
      IS_PROD_DB: (process.env.POSTGRES_URL || '').includes('ep-shrill-silence-a6ypne6y-pooler'),
      IS_TEST_DB: (process.env.POSTGRES_URL || '').includes('ep-proud-field-a6tfe60l-pooler'),
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
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
