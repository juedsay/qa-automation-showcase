import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Records the demo video used for the README GIF (docs/assets/demo.gif).
 * Same suite and settings, plus video recording and a little slow motion so the flow is
 * readable. Not used in CI.
 *
 *   pnpm exec playwright test tests/checkout --config playwright.demo.config.ts
 */
export default defineConfig({
  ...base,
  workers: 1,
  retries: 0,
  reporter: 'list',
  outputDir: 'demo-results',
  // Set per project: project-level `use` takes precedence over the top-level one.
  projects: (base.projects ?? []).map((project) => ({
    ...project,
    use: {
      ...project.use,
      video: { mode: 'on', size: { width: 1280, height: 720 } },
      launchOptions: { slowMo: 350 },
    },
  })),
});
