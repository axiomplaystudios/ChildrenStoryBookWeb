import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
export default defineConfig({
  testDir: '..', testMatch: 'interactive-upgrade.spec.js', workers: 1,
  timeout: 120000,
  use: { launchOptions: { executablePath, args: ['--no-sandbox'] } },
});
