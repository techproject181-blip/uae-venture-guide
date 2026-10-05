import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

// Every account the browser tests make ends in this domain, so they can be
// deleted afterwards without touching anyone else's data. RUN (set in
// playwright.config.mjs) is in every address too, so two runs at the same time
// never delete each other's accounts.
export const TEST_DOMAIN = "@e2e.test";
export const RUN = process.env.E2E_RUN;
export const PASSWORD = "Testpass2026";
export const ADMIN_EMAIL = `admin-${RUN}${TEST_DOMAIN}`; // made by global-setup.js

const ROLE_CARDS = {
  entrepreneur: "Plan and launch your business.",
  mentor: "Guide new founders.",
  funder: "Find ideas to support.",
};

/** A short random word, so names and titles from tests running side by side never clash. */
export function uniqueId() {
  return Math.random().toString(36).slice(2, 8);
}

/** Signs up through the sign-up form and waits for the first page. Returns { name, email }. */
export async function signUp(page, role) {
  const id = uniqueId();
  const account = { name: `Test ${role} ${id}`, email: `${role}-${id}-${RUN}${TEST_DOMAIN}` };
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill(account.name);
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByText(ROLE_CARDS[role]).click();
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(role === "entrepreneur" ? "**/dashboard" : "**/pending");
  return account;
}

/** Signs in through the sign-in form. */
export async function signIn(page, email, password = PASSWORD) {
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Fills in the new plan form and waits for the roadmap. Returns the plan's path, such as /plans/66f1…. */
export async function createPlan(page, title) {
  await page.goto("/plans/new");
  await page.getByLabel("Plan name").fill(title);
  await page.getByLabel("What is the business?").fill("A small juice bar near the beach selling fresh juices and smoothies.");
  await page.getByLabel("Who are your customers?").fill("Beach visitors and gym members");
  await page.getByLabel("Emirate", { exact: true }).selectOption("dubai");
  await page.getByLabel("Sector", { exact: true }).selectOption("food_beverage");
  await page.getByLabel("Budget for the first year (AED)").fill("150000");
  await page.getByLabel("People in the team, including you").fill("2");
  await page.getByRole("button", { name: "Build my roadmap" }).click();
  await page.waitForURL(/\/plans\/[0-9a-f]{24}$/);
  return new URL(page.url()).pathname;
}

/** Opens `path` and checks that the viewer gets "not found". */
export async function expectNotFound(page, path) {
  const response = await page.goto(path);
  expect(response.status()).toBe(404);
}

/**
 * Checks the page with axe for WCAG 2.1 level A and AA problems. It first waits
 * for entrance animations to end, because text that is still fading in would be
 * measured at part of its real contrast. Loaders that never stop are skipped.
 */
export async function expectAccessible(page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.help} (${v.nodes[0].target})`)).toEqual([]);
}
