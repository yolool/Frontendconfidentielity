import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: 'http://localhost:4200',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'msedge' },
    },
  ],
  webServer: [
    {
      command: 'npx ng serve --no-open --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
  
      command:
        'cmd /c "set JAVA_HOME=C:\\Users\\adam\\.jdks\\openjdk-25.0.1&&cd /d confidentialite-back&&mvnw.cmd -q spring-boot:run"',
      url: 'http://localhost:8080/api/v1/Personnel/deps',
      reuseExistingServer: true,
      timeout: 240_000,
    },
  ],
});
