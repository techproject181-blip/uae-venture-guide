import { defineConfig, devices } from "@playwright/test";

// Browser tests run against the development server and its database. Every
// test signs up its own accounts (emails ending in @e2e.test), and the run
// deletes them at the end, so the demo data stays as it was.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

// This run's id goes into every test account's email, so two runs at the same
// time never delete each other's accounts (see tests/e2e/helpers.js).
process.env.E2E_RUN ??= Date.now().toString(36);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: 3,
  globalSetup: "./tests/e2e/global-setup.js",
  globalTeardown: "./tests/e2e/global-teardown.js",
  use: {
    baseURL,
    trace: "retain-on-failure",
    // Animations off: text that is still fading in, or waiting to fade in as
    // the page scrolls, would fail the contrast check for the wrong reason.
    reducedMotion: "reduce",
  },
  // Chrome, Firefox and Safari's engine (WebKit) on a laptop screen, plus a
  // phone of each kind. Chrome is the one installed on the computer; run
  // `npx playwright install firefox webkit` once for the other two.
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "safari", use: { ...devices["Desktop Safari"] } },
    { name: "phone-chrome", use: { ...devices["Pixel 7"], channel: "chrome" } },
    { name: "phone-safari", use: { ...devices["iPhone 15"] } },
  ],
  // Uses `npm run dev` if it is already running, otherwise starts it.
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
