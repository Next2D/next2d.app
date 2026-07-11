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
      },
      serialize(item) {
        // ルート `/` は言語選択ページであり ja 版ではないため、
        // ja が `/` と `/ja/` の2つ付与される重複を除去し、`/` は x-default として扱う
        if (item.links?.some((link) => new URL(link.url).pathname === '/')) {
          item.links = [
            ...item.links.filter((link) => new URL(link.url).pathname !== '/'),
            { url: 'https://next2d.app/', lang: 'x-default' }
          ];
        }
        return item;
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
