import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeRewriteLinks } from './src/plugins/rehype-rewrite-links.mjs';

export default defineConfig({
  site: 'https://next2d.app',
  base: '/',
  outDir: './docs',
  build: {
    assets: 'assets'
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja',
          en: 'en',
          cn: 'zh-CN'
        }
      }
    })
  ],
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en', 'cn'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false
    }
  },
  markdown: {
    rehypePlugins: [rehypeRewriteLinks]
  }
});
