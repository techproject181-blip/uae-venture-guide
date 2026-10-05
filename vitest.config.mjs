import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Unit tests sit next to the code they test (src/**/*.test.js) and need nothing
// else. Database tests (tests/integration) use the MongoDB in .env.local; each
// test file gets its own database, deleted at the end.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.js", "tests/integration/**/*.test.js"],
    env: { ...loadEnv("test", process.cwd(), ""), JWT_SECRET: "test-secret-that-is-at-least-32-characters" },
  },
});
