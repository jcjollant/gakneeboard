// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  alias: {
    '@server': resolve(__dirname, '../server'),
    '@gak/shared': resolve(__dirname, '../shared/src/index.ts')
  }
})
