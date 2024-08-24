import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "yvp6q8",
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
  },
});
