import { defineConfig, devices } from '@playwright/test'

/**
 * Post-deploy test configuration for GitHub Pages
 * Run with: npx playwright test --config=playwright.deploy.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report-deploy' }], ['list']],

  use: {
    baseURL: 'https://neonwatty.github.io/smartgif/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Longer timeouts for network latency
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No webServer - we're testing against the live deployed site
})
