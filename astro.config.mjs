import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://alexgetman.com',
  integrations: [sitemap({
    lastmod: new Date(),
    filter: (page) => ![
      '/posts/',
      '/en/posts/',
      '/ru/posts/',
    ].some((legacyPrefix) => new URL(page).pathname.startsWith(legacyPrefix)),
  })],
});
