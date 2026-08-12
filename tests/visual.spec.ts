import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = 'docs';

function collectPaths(): string[] {
  const entries = fs.readdirSync(DOCS_DIR, { recursive: true }) as string[];
  const htmlPaths = entries
    .filter((entry) => entry.endsWith('index.html'))
    .map((entry) => {
      const normalized = entry.split(path.sep).join('/');
      const dir = normalized.slice(0, -'index.html'.length);
      return `/${dir}`;
    })
    .sort();

  return [...htmlPaths, '/404.html'];
}

function screenshotName(urlPath: string): string {
  if (urlPath === '/') {
    return 'root.png';
  }
  const trimmed = urlPath.replace(/^\/|\/$/g, '');
  return `${trimmed.replace(/[/.]/g, '-')}.png`;
}

for (const urlPath of collectPaths()) {
  test(`visual: ${urlPath}`, async ({ page }) => {
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        route.continue();
      } else {
        route.abort();
      }
    });

    await page.goto(urlPath, { waitUntil: 'networkidle' });

    await expect(page).toHaveScreenshot(screenshotName(urlPath), {
      fullPage: true,
      mask: [page.locator('canvas')]
    });
  });
}
