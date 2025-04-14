import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            reporter: ["html"],
            provider: "v8", // or 'v8'
            include: ["src"],
        },
        environment: "node",
        include: ["src/**/*.{test,spec,test-d}.{ts,tsx}"],
        exclude: ["node_modules", "dist", "test-setup"],
    },
});
