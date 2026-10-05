import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests sit next to the code they test (src/**/*.test.js) and need nothing
// else. Database tests (tests/integration) also need the Docker MongoDB from
// `npm run db:up`; each test file gets its own database, deleted at the end.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.js", "tests/integration/**/*.test.js"],
    env: { JWT_SECRET: "test-secret-that-is-at-least-32-characters" },
  },
});
