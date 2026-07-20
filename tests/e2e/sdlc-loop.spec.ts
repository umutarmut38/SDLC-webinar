import { expect, test, type Page } from "@playwright/test";

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  return errors;
}

test("selects, fails, recovers, completes, and resets the lifecycle", async ({
  page,
}) => {
  const runtimeErrors = captureRuntimeErrors(page);
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Ship with signal." }),
  ).toBeVisible();
  await expect(page.locator(".scene-viewport")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Plan in focus" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "03 Test, Waiting" }).click();
  await expect(
    page.getByRole("heading", { name: "Test", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Plan in focus" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Simulate failure" }).click();
  await expect(page.getByRole("alert")).toContainText("Failure signal at Plan");

  await page.getByRole("button", { name: "Simulate success" }).click();
  await expect(
    page.getByRole("heading", { name: "Code in focus" }),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );

  await page.getByRole("button", { name: "Advance stage" }).click();
  await page.getByRole("button", { name: "Simulate success" }).click();
  await page.getByRole("button", { name: "Advance stage" }).click();
  await page.getByRole("button", { name: "Simulate success" }).click();

  await expect(
    page.getByRole("heading", { name: "Cycle complete" }),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "5",
  );
  await expect(
    page.getByRole("button", { name: "Advance stage" }),
  ).toBeDisabled();

  await page.getByRole("button", { name: "Reset loop" }).click();
  await expect(
    page.getByRole("heading", { name: "Plan in focus" }),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  expect(runtimeErrors).toEqual([]);
});

test("honors reduced motion and remains within the viewport", async ({
  page,
}) => {
  const runtimeErrors = captureRuntimeErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByText(/Reduced motion is active/)).toBeVisible();
  await expect(page.locator(".scene-viewport")).toHaveAttribute(
    "data-ready",
    "true",
  );

  await page.getByRole("link", { name: "Skip to lifecycle controls" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#controls")).toBeFocused();

  const layout = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.scrollBehavior).toBe("auto");

  await page.getByRole("button", { name: "02 Code, Waiting" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Code", exact: true }),
  ).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
