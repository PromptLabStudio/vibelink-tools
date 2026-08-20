import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:3111", trace: "retain-on-failure" },
  webServer: { command: "npm run start -- -p 3111", url: "http://127.0.0.1:3111", reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1100 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
