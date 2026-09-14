import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  (page as typeof page & { browserErrors?: string[] }).browserErrors =
    browserErrors;
});

test.afterEach(async ({ page }) => {
  expect(
    (page as typeof page & { browserErrors?: string[] }).browserErrors ?? [],
  ).toEqual([]);
});

test("moves overloaded work, completes it, and restores it after reload", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Load example week" }).click();
  const wednesday = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Wednesday" }),
  });
  await expect(wednesday).toContainText("Scheduled8h");
  await expect(wednesday).toContainText("Capacity6h");
  await expect(wednesday).toContainText("Over capacity2h");

  await page
    .getByLabel("Assign Team planning session")
    .selectOption("Thursday");
  await expect(wednesday).toContainText("Scheduled6h");
  const thursday = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Thursday" }),
  });
  await expect(thursday).toContainText("Scheduled2h");
  await expect(thursday).toContainText("Capacity6h");
  await expect(thursday).toContainText("Available capacity4h");
  await thursday
    .getByRole("button", { name: "Complete Team planning session" })
    .click();
  await expect(thursday).toContainText("Remaining work0m");

  await page.reload();
  await expect(page.getByLabel("Assign Team planning session")).toHaveValue(
    "Thursday",
  );
  await expect(thursday).toContainText("Remaining work0m");
});

test("adds, edits, backlogs, deletes, and changes capacity", async ({
  page,
}) => {
  await page.getByLabel("Task title").fill("Draft release notes");
  await page.getByLabel("Effort in minutes").fill("50");
  await page.getByLabel("Schedule").selectOption("Monday");
  await page.getByRole("button", { name: "Add task" }).click();

  await page.getByRole("button", { name: "Edit Draft release notes" }).click();
  await page.getByLabel("Task title").last().fill("Publish release notes");
  await page.getByLabel("Effort in minutes").last().fill("60");
  await page.getByRole("button", { name: "Save task" }).click();
  await page
    .getByLabel("Assign Publish release notes")
    .selectOption({ label: "Backlog" });
  await expect(page.getByRole("region", { name: "Backlog" })).toContainText(
    "Publish release notes",
  );

  await page.getByLabel("Tuesday capacity in minutes").fill("300");
  await page
    .getByRole("article")
    .filter({ hasText: "Tuesday" })
    .getByRole("button", { name: "Save capacity" })
    .click();
  await expect(
    page
      .getByRole("article")
      .filter({ has: page.getByRole("heading", { name: "Tuesday" }) }),
  ).toContainText("Capacity5h");

  await page.reload();
  await expect(page.getByLabel("Tuesday capacity in minutes")).toHaveValue(
    "300",
  );

  await page
    .getByRole("button", { name: "Delete Publish release notes" })
    .click();
  await expect(page.getByText("Publish release notes")).toHaveCount(0);
});

test("stacks at a narrow viewport and supports keyboard form controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Task title").focus();
  await page.keyboard.type("Keyboard task");
  await page.keyboard.press("Tab");
  await page.keyboard.type("30");
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Keyboard task" }),
  ).toBeVisible();

  const panels = page.locator(".day-panel");
  const firstBox = await panels.nth(0).boundingBox();
  const secondBox = await panels.nth(1).boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
