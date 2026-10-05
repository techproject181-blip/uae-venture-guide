import { expect, test } from "./fixtures.js";
import { ADMIN_EMAIL, createPlan, expectAccessible, expectNotFound, signIn, signUp, uniqueId } from "./helpers.js";

/** The administrator approves a waiting account from the users page. */
async function approve(admin, name) {
  await admin.goto("/admin/users");
  await admin.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Approve" }).click();
  await expect(admin.getByText("Account approved.")).toBeVisible();
}

test("a mentor and a funder see a plan only after its owner says yes", async ({ openPage }) => {
  test.setTimeout(180_000);
  const [admin, owner, mentor, funder] = await Promise.all([openPage(), openPage(), openPage(), openPage()]);
  const title = `Test juice bar ${uniqueId()}`;

  await signIn(admin, ADMIN_EMAIL);
  await admin.waitForURL("**/dashboard");

  const mentorAccount = await test.step("a mentor signs up, fills in a profile and is approved", async () => {
    const account = await signUp(mentor, "mentor");
    await mentor.goto("/profile");
    await expectAccessible(mentor);
    await mentor.getByLabel("Years of experience").fill("5");
    await mentor.getByLabel("Headline").fill("Ran a juice bar in Dubai for five years");
    await mentor.getByLabel("About you").fill("I opened and ran a juice bar in Dubai Marina, and now help new food businesses start.");
    await mentor.getByRole("group", { name: "What you can help with" }).getByLabel("Business setup and licensing").check();
    await mentor.getByRole("group", { name: "Emirates you know" }).getByLabel("Dubai").check();
    await mentor.getByRole("button", { name: "Save profile" }).click();
    await expect(mentor.getByText("Profile saved.")).toBeVisible();
    await approve(admin, account.name);
    return account;
  });

  const planPath = await test.step("an entrepreneur makes a plan and asks the mentor for guidance", async () => {
    await signUp(owner, "entrepreneur");
    const path = await createPlan(owner, title);
    await owner.goto("/mentors");
    await owner.getByRole("link", { name: new RegExp(mentorAccount.name) }).click();
    await expectAccessible(owner);
    await owner.getByLabel("What do you need help with?").fill("Choosing a location");
    await owner.getByLabel("Message", { exact: true }).fill("Could you look at my roadmap and tell me what I am missing?");
    await owner.getByLabel("Attach a plan (optional)").selectOption({ label: title });
    await owner.getByRole("button", { name: "Send request" }).click();
    await owner.waitForURL("**/requests");
    return path;
  });

  await test.step("the mentor can open the plan only after accepting", async () => {
    await expectNotFound(mentor, planPath);
    await mentor.goto("/requests");
    await expectAccessible(mentor);
    await mentor.getByRole("button", { name: "Accept" }).click();
    await expect(mentor.getByRole("button", { name: "Mark as completed" })).toBeVisible();
    await mentor.goto(planPath);
    await expect(mentor.getByRole("heading", { level: 1 })).toHaveText(title);
  });

  await test.step("the owner shares the plan's pitch card with funders", async () => {
    await owner.goto(`${planPath}/sharing`);
    await owner.getByLabel("Pitch summary").fill("A fresh juice bar beside the beach, with steady daily customers from the gyms nearby.");
    await owner.getByLabel("Share this plan's pitch card with funders").check();
    await owner.getByRole("button", { name: "Save sharing settings" }).click();
    await expect(owner.getByText("Your plan is shared with funders.")).toBeVisible();
  });

  await test.step("an approved funder sends interest from the pitch card", async () => {
    const account = await signUp(funder, "funder");
    await approve(admin, account.name);
    await funder.goto("/discover");
    await expectAccessible(funder);
    const card = funder.locator("article", { hasText: title });
    await card.getByRole("button", { name: "I am interested" }).click();
    await card.getByLabel("Message to the owner").fill("I invest in food businesses and would like to see the full plan.");
    await card.getByRole("button", { name: "Send" }).click();
    await expect(funder.getByText("Interest sent. The owner will be emailed.")).toBeVisible();
    // Wait for the list to reload with the sent interest before opening another page.
    await expect(card.getByText("Your interest")).toBeVisible();
    await expectNotFound(funder, planPath);
  });

  await test.step("the funder can open the full plan once the owner accepts", async () => {
    await owner.goto("/requests");
    await expectAccessible(owner);
    owner.once("dialog", (dialog) => dialog.accept()); // "Accept? This funder can then read your full plan…"
    await owner.getByRole("button", { name: "Accept and share the plan" }).click();
    await expect(owner.getByText("Interest accepted.")).toBeVisible();
    await funder.goto(planPath);
    await expect(funder.getByRole("heading", { level: 1 })).toHaveText(title);
  });
});
