import { expect, test } from "./fixtures.js";
import { createPlan, expectAccessible, signUp, uniqueId } from "./helpers.js";

test("an entrepreneur builds a roadmap and works through it", async ({ page }) => {
  const title = `Test juice bar ${uniqueId()}`;
  await signUp(page, "entrepreneur");
  await page.goto("/plans/new");
  await expectAccessible(page);

  const planPath = await test.step("build the roadmap", async () => {
    const path = await createPlan(page, title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText(/^0 of \d+ steps done$/)).toBeVisible();
    await expectAccessible(page);
    return path;
  });

  await test.step("mark the first step as done", async () => {
    await page.goto(`${planPath}/tasks`);
    await expectAccessible(page);
    const saved = page.waitForResponse((response) => response.url().endsWith("/status") && response.ok());
    await page.getByRole("checkbox", { name: /^Mark as done:/ }).first().check();
    await saved;
    // The header updates in place once the saved plan has reloaded.
    await expect(page.getByText(/^1 of \d+ steps done$/)).toBeVisible();
  });

  await test.step("add a cost to the budget", async () => {
    await page.goto(`${planPath}/budget`);
    await expectAccessible(page);
    await page.getByLabel("Cost", { exact: true }).fill("Juice press");
    await page.getByLabel("Category", { exact: true }).selectOption("equipment");
    await page.getByLabel("Estimate (AED)").fill("4000");
    await page.getByRole("button", { name: "Add cost" }).click();
    await expect(page.getByRole("row", { name: /Juice press/ })).toContainText("4,000");
  });

  await test.step("ask the assistant a question", async () => {
    await page.goto(`${planPath}/chat`);
    await expectAccessible(page);
    await page.getByLabel("Your question").fill("How much will everything cost?");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(/Your estimated first-year cost is AED [\d,]+/)).toBeVisible();
    await expect(page.getByText(/This is a sample answer/)).toBeVisible();
  });

  await test.step("download the PDF report", async () => {
    const report = await page.request.get(`/api${planPath}/report`);
    expect(report.headers()["content-type"]).toBe("application/pdf");
    expect((await report.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  await test.step("the other tabs pass the accessibility check", async () => {
    for (const tab of ["documents", "risks", "sources", "sharing"]) {
      await page.goto(`${planPath}/${tab}`);
      await expectAccessible(page);
    }
  });
});
