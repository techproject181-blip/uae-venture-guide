import { test as base, expect } from "@playwright/test";

// Every browser test imports `test` from here instead of @playwright/test.
// It watches each page for JavaScript errors and for server errors (500 and
// up), and fails the test when any happen, even if every other check passed.

/** Starts watching `page`; anything that goes wrong is added to `problems`. */
export function watchForErrors(page, problems) {
  page.on("pageerror", (error) => problems.push(`JavaScript error on ${page.url()}: ${error.message}`));
  page.on("console", (message) => {
    // Failed requests also log "Failed to load resource"; the tests check
    // their status codes on purpose (401, 404, 429), so only other errors count.
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
      problems.push(`Console error on ${page.url()}: ${message.text()}`);
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 500) problems.push(`Server error ${response.status()} for ${response.request().method()} ${response.url()}`);
  });
}

// Each fixture hands its value to the test with provide(value) (Playwright calls
// this argument "use"; the name is changed so ESLint does not take it for a React hook).
export const test = base.extend({
  // Collects problems from every page the test opens, then checks the list at the end.
  problems: [
    async ({}, provide) => {
      const problems = [];
      await provide(problems);
      expect(problems, "JavaScript or server errors during the test").toEqual([]);
    },
    { auto: true },
  ],
  page: async ({ page, problems }, provide) => {
    watchForErrors(page, problems);
    await provide(page);
  },
  // For tests with several people at once: openPage() gives each one their own
  // browser session (their own cookies), watched like the main page. New
  // contexts get the project's settings (address, screen size) automatically.
  openPage: async ({ browser, problems }, provide) => {
    await provide(async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      watchForErrors(page, problems);
      return page;
    });
  },
});

export { expect };
