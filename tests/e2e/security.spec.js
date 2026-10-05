import { expect, test } from "./fixtures.js";
import { ADMIN_EMAIL, PASSWORD, TEST_DOMAIN, createPlan, signIn, signUp, uniqueId } from "./helpers.js";

test("another entrepreneur cannot open or change someone's plan", async ({ openPage }) => {
  const owner = await openPage();
  const stranger = await openPage();
  await signUp(owner, "entrepreneur");
  const planPath = await createPlan(owner, `Test private plan ${uniqueId()}`);
  await signUp(stranger, "entrepreneur");

  // 404 rather than 403, so the answer does not even confirm the plan exists.
  for (const tab of ["", "/tasks", "/budget", "/chat"]) {
    expect((await stranger.goto(`${planPath}${tab}`)).status()).toBe(404);
  }
  const api = `/api${planPath}`;
  const attempts = [
    stranger.request.get(`${api}/report`),
    stranger.request.post(`${api}/budget`, { data: { category: "other", label: "Fake cost", estimatedAed: 1, recurrence: "one_time" } }),
    stranger.request.post(`${api}/chat`, { data: { message: "What does it cost?" } }),
    stranger.request.delete(api),
  ];
  for (const response of await Promise.all(attempts)) expect(response.status()).toBe(404);
});

test("nobody can sign up as an administrator", async ({ request }) => {
  const response = await request.post("/api/auth/sign-up", {
    data: { name: "Test intruder", email: `intruder-${uniqueId()}${TEST_DOMAIN}`, password: PASSWORD, role: "admin" },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).fieldErrors).toHaveProperty("role");
});

test("a funder waiting for approval cannot use funder pages or send interest", async ({ page }) => {
  await signUp(page, "funder");
  await page.goto("/discover");
  await expect(page).toHaveURL(/\/pending$/);

  const response = await page.request.post(`/api/plans/${"0".repeat(24)}/interest`, { data: { message: "I would like to see this plan." } });
  expect(response.status()).toBe(403);
});

test("HTML in a mentor's post is shown as nothing, never run", async ({ openPage }) => {
  const admin = await openPage();
  const mentor = await openPage();
  await signIn(admin, ADMIN_EMAIL);
  await admin.waitForURL("**/dashboard");
  await signUp(mentor, "mentor");
  const { user } = await (await mentor.request.get("/api/auth/me")).json();
  expect((await admin.request.patch(`/api/admin/users/${user.id}`, { data: { status: "active" } })).ok()).toBe(true);

  const created = await mentor.request.post("/api/posts", {
    data: {
      title: "Test post with HTML in it",
      body: '<script>window.hacked = true</script><img src="x" onerror="window.hacked = true">\n\n**Start small** and keep three months of costs in reserve before you sign a lease.',
    },
  });
  expect(created.status()).toBe(201);

  await mentor.goto(`/posts/${(await created.json()).id}`);
  await expect(mentor.locator("strong", { hasText: "Start small" })).toBeVisible();
  await expect(mentor.locator('main img[src="x"]')).toHaveCount(0);
  expect(await mentor.evaluate(() => window.hacked)).toBeUndefined();
});
