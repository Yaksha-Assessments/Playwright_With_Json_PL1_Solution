import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  retries: 1,
  timeout: 240000,
  expect: {
    timeout: 100000,
  },
  use: {
    baseURL: "https://healthapp.yaksha.com",
    trace: "on",
    headless: false,
    screenshot: "only-on-failure",
    video: "retry-with-video",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ["--disable-web-security"],
        },
      },
    },
  ],

  reporter: [
    ["list"], // Default console output
    [
      "./jest/PlaywrightCustomReporter.js", 
      { customOption: "value" } // Optional configuration for the custom reporter
    ],
  ],
});
