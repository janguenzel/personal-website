import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vitest config for the terminal portfolio.
// - `resolve.tsconfigPaths` wires up the `@/*` path alias from tsconfig.json.
// - `server-only` is a no-op in tests: several lib modules import it to fence
//   themselves to RSC, but the pure logic inside is perfectly testable here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": fileURLToPath(
        new URL("./test/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
      exclude: ["lib/**/*.d.ts", "**/*.json"],
    },
  },
});
