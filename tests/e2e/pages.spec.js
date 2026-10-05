import { expect, test } from "./fixtures.js";
import { expectAccessible } from "./helpers.js";

// Opens every page as each kind of user and checks that it loads, shows no
// JavaScript or server errors (see fixtures.js), never scrolls sideways (which
// matters most on phones), and passes the accessibility check. It signs in
// with the demo accounts from `npm run seed` and only reads, so the demo
// data stays as it was. Detail pages are reached by following the first link
// of their list, so no ids are needed.

const DEMO_PASSWORD = "Demo2026pass";

async function signInAs(page, email) {
  const response = await page.request.post("/api/auth/sign-in", { data: { email, password: DEMO_PASSWORD } });
  expect(response.ok(), `sign in as ${email} (run npm run seed first)`).toBe(true);
}

/** The address of the first link on `listPath` that starts with `prefix` and is followed by an id. */
async function firstLink(page, listPath, prefix) {
  await page.goto(listPath);
  const hrefs = await page.locator(`a[href^="${prefix}"]`).evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  const href = hrefs.find((h) => /^\/[a-z-/]+\/[0-9a-f]{24}/.test(h));
  expect(href, `a link starting with ${prefix} on ${listPath}`).toBeTruthy();
  return href.match(new RegExp(`^${prefix}[0-9a-f]{24}(/fees/[0-9a-f]{24})?`))[0];
}

/** The edit page of a fee reference, from the first source on the list that has fees. */
async function firstFeePage(page) {
  await page.goto("/admin/sources");
  const sources = await page.locator('a[href^="/admin/sources/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const source of sources.filter((href) => /^\/admin\/sources\/[0-9a-f]{24}$/.test(href))) {
    await page.goto(source);
    const fee = await page.locator(`a[href^="${source}/fees/"]`).first().getAttribute("href", { timeout: 1000 }).catch(() => null);
    if (fee) return fee;
  }
  throw new Error("No source with fee references (run npm run seed).");
}

async function checkPage(page, path) {
  await test.step(path, async () => {
    const response = await page.goto(path);
    expect(response.status(), `status of ${path}`).toBe(200);
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(sideways, `${path} scrolls sideways by ${sideways}px`).toBeLessThanOrEqual(0);
    await expectAccessible(page);
  });
}

test("every public page works for a visitor", async ({ page }) => {
  const pages = ["/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/mentors", "/posts", "/sources"];
  pages.push(await firstLink(page, "/mentors", "/mentors/"));
  pages.push(await firstLink(page, "/posts", "/posts/"));
  for (const path of pages) await checkPage(page, path);
});

test("every page works for an entrepreneur", async ({ page }) => {
  await signInAs(page, "aisha@demo.test");
  const plan = await firstLink(page, "/plans", "/plans/");
  const tabs = ["", "/tasks", "/budget", "/documents", "/risks", "/sources", "/chat", "/sharing"].map((tab) => `${plan}${tab}`);
  for (const path of ["/dashboard", "/plans", "/plans/new", "/requests", "/mentors", "/sources", ...tabs]) await checkPage(page, path);
});

test("every page works for a mentor", async ({ page }) => {
  await signInAs(page, "omar@demo.test");
  const post = await firstLink(page, "/my-posts", "/posts/");
  const edit = `${post.replace("/posts/", "/my-posts/")}/edit`;
  for (const path of ["/dashboard", "/requests", "/my-posts", "/my-posts/new", edit, "/profile"]) await checkPage(page, path);
});

test("every page works for a funder", async ({ page }) => {
  await signInAs(page, "layla@demo.test");
  for (const path of ["/dashboard", "/discover", "/interests", "/profile"]) await checkPage(page, path);
});

test("every page works for a mentor waiting for approval", async ({ page }) => {
  await signInAs(page, "rahul@demo.test");
  for (const path of ["/pending", "/profile"]) await checkPage(page, path);
});

test("every page works for the administrator", async ({ page }) => {
  await signInAs(page, "admin@demo.test");
  const user = await firstLink(page, "/admin/users?status=all", "/admin/users/");
  const source = await firstLink(page, "/admin/sources", "/admin/sources/");
  const fee = await firstFeePage(page);
  const pages = ["/dashboard", "/admin/users", "/admin/users?status=all", user, "/admin/sources", "/admin/sources/new", source, fee, "/admin/content", "/admin/usage"];
  for (const path of pages) await checkPage(page, path);
});
