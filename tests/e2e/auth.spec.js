import { expect, test } from "./fixtures.js";
import { expectAccessible, signIn, signUp } from "./helpers.js";

test("an entrepreneur signs up, signs out and signs in again", async ({ page }) => {
  await page.goto("/sign-up");
  await expectAccessible(page);
  const { email } = await signUp(page, "entrepreneur");
  await expectAccessible(page);

  // Below 1024px, sign out sits in the side menu.
  const menu = page.getByRole("button", { name: "Open menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expectAccessible(page);
  await signIn(page, email);
  await page.waitForURL("**/dashboard");
});

test("a new mentor waits for approval before using the app", async ({ page }) => {
  await signUp(page, "mentor");
  await expectAccessible(page);

  await page.goto("/requests");
  await expect(page).toHaveURL(/\/pending$/);
});

test("signed-out visitors are sent to the sign-in page", async ({ page }) => {
  for (const path of ["/dashboard", "/plans/new", "/admin/users"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});

test("five wrong passwords lock sign-in, even with the right password", async ({ page }) => {
  const { email } = await signUp(page, "entrepreneur");
  await page.context().clearCookies();
  const formAlert = page.locator("form").getByRole("alert");

  for (let attempt = 1; attempt <= 5; attempt++) {
    await signIn(page, email, "Wrongpass2026");
    await expect(formAlert).toHaveText("Email or password is incorrect.");
  }
  await signIn(page, email);
  await expect(formAlert).toContainText("Too many failed attempts");
});
