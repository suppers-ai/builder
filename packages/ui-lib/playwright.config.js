// @ts-check
import process from "node:process";
module.exports = {
  testDir: ".",
  testMatch: /.*\.playwright\.ts$/,
  testIgnore: /.*\.test\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",

  use: {
    baseURL: "http://localhost:8002", // UI lib tests run against docs package
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
};
