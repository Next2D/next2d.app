import { defineConfig } from '@playwright/test';

const PORT = 4323;
const baseURL = process.env.PW_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL,
    viewport: { width: 1280, height: 800 }
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      stylePath: './tests/screenshot.css'
    }
  },
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: `npm run preview -- --port ${PORT}`,
        url: `http://localhost:${PORT}/ja/`,
        reuseExistingServer: true
      }
});
