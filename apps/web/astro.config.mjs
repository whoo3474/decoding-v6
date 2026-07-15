import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://decod.ing',
  output: 'static',
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !/^https:\/\/decod\.ing\/(?:ko|ja|zh-cn|es|pt-br|de|fr)(?:\/|$)/.test(page),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: { worker: { format: 'es' } },
})
