import { expect, test } from "./fixtures.js";
import { PASSWORD, TEST_DOMAIN, createPlan, signUp, uniqueId } from "./helpers.js";

// These tests use only the keyboard, like someone who cannot use a mouse.
// Phones have no Tab key, so they skip these tests.
test.skip(({ isMobile }) => isMobile, "Phones have no Tab key.");

// Safari on a Mac moves to buttons and links with Option+Tab; plain Tab only visits text fields.
let TAB = "Tab";
test.beforeEach(({ browserName }) => {
  TAB = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
});

/** Presses Tab until `target` has focus. Fails if it takes more than `max` presses. */
async function tabTo(page, target, max = 40) {
  for (let presses = 0; presses <= max; presses++) {
    if (await target.evaluate((element) => element === document.activeElement)) return presses;
    await page.keyboard.press(TAB);
  }
  throw new Error(`Tab did not reach ${target} in ${max} presses.`);
}

test("sign-up works with the keyboard alone, in the order the fields appear", async ({ page }) => {
  await page.goto("/sign-up");
  await tabTo(page, page.getByLabel("Full name"));
  await page.keyboard.type("Test keyboard user");

  await page.keyboard.press(TAB);
  await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
  await page.keyboard.type(`keyboard-${uniqueId()}${TEST_DOMAIN}`);

  await page.keyboard.press(TAB);
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
  await page.keyboard.type(PASSWORD);

  await page.keyboard.press(TAB);
  await expect(page.getByRole("button", { name: "Show password" })).toBeFocused();

  // The role cards are one radio group: Tab enters it, the arrow keys choose.
  await page.keyboard.press(TAB);
  await expect(page.getByRole("radio", { name: /^Entrepreneur/ })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const mentor = page.getByRole("radio", { name: /^Mentor/ });
  await expect(mentor).toBeChecked();
  // The focused card shows a ring, so sighted keyboard users can see where they are.
  expect(await mentor.evaluate((radio) => getComputedStyle(radio.closest("label")).boxShadow)).not.toBe("none");

  await page.keyboard.press(TAB);
  await expect(page.getByRole("button", { name: "Create account" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/pending");
});

test("the skip link passes the menus, and the assistant answers from the keyboard", async ({ page }) => {
  await signUp(page, "entrepreneur");
  const planPath = await createPlan(page, `Test keyboard plan ${uniqueId()}`);
  await page.goto(`${planPath}/chat`);

  await page.keyboard.press(TAB);
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press(TAB);
  // The first stop after skipping is inside the page content, not the site menu.
  expect(await page.evaluate(() => Boolean(document.activeElement.closest("main")))).toBe(true);

  await tabTo(page, page.getByLabel("Your question"));
  await page.keyboard.type("Which documents do I need?");
  await page.keyboard.press("Enter");
  await expect(page.getByText("You still need these required documents:")).toBeVisible();
});
