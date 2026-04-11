import { defineConfig } from "cypress";
import { addMatchImageSnapshotPlugin } from '@simonsmith/cypress-image-snapshot/plugin';
import cypressSplit from 'cypress-split';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    excludeSpecPattern: 'cypress/e2e/skipped/**/*',
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on, config);
      cypressSplit(on, config);
      return config;
    },
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
