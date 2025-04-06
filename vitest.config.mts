import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["html"],
      provider: "v8", // or 'v8'
    },
    environment: "node",
    include: ["**/*.{test,spec,test-d}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
  },
});
