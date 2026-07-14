import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://decod.ing',
  output: 'static',
  integrations: [preact(), sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: { worker: { format: 'es' } },
})
