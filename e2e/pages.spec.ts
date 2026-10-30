import { expect, test } from "@playwright/test";
import { answerCard, answerToTheEnd, axeViolations, pressSubmit, startTest, watchForProblems } from "./helpers";

const PAGES = [
  "/",
  "/about/",
  "/pricing/",
  "/privacy/",
  "/terms/",
  "/corrections/",
  "/practice/",
  "/practice/test/",
  "/practice/values/",
  "/practice/values/law/",
  "/practice/values/freedoms/",
  "/practice/values/equality/",
  "/practice/values/respect/",
  "/practice/values/community/",
  "/practice/values/gate/",
  "/practice/values-check/",
  "/practice/study/",
  "/practice/progress/",
  "/practice/settings/",
  "/design/",
];

test.describe("every page", () => {
  for (const path of PAGES) {
    test(`${path} loads cleanly and passes the accessibility checks`, async ({ page }) => {
      const problems = watchForProblems(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      // Production security headers are applied by the test server from public/_headers.
      expect(res?.headers()["content-security-policy"]).toContain("default-src 'self'");
      await expect(page.locator("h1").first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      expect(await axeViolations(page)).toEqual([]);
      expect(problems).toEqual([]);
    });
  }

  test("an unknown address shows the 404 page", async ({ page }) => {
    const res = await page.goto("/no-such-page/");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("accessibility during a test", () => {
  test("the test screen, the locked Submit message, the warning and the result", async ({ page }) => {
    const problems = watchForProblems(page);
    await startTest(page);
    await answerCard(page, 0).click();
    await page.getByLabel("Review later").check();
    expect(await axeViolations(page), "test screen").toEqual([]);

    await pressSubmit(page);
    await expect(page.locator("main").getByRole("alert")).toContainText("You must answer all questions.");
    expect(await axeViolations(page), "locked Submit").toEqual([]);

    await page.getByRole("button", { name: /^Next/ }).click();
    await answerToTheEnd(page, 2);
    await page.getByRole("button", { name: "Larger text" }).click();
    expect(await axeViolations(page), "larger text").toEqual([]);

    await pressSubmit(page);
    await expect(page.getByRole("dialog", { name: "Warning" })).toBeVisible();
    expect(await axeViolations(page), "warning dialog").toEqual([]);
    await page.getByRole("dialog", { name: "Warning" }).getByRole("button", { name: "Yes" }).click();

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Test result: /);
    expect(await axeViolations(page), "result").toEqual([]);
    expect(problems).toEqual([]);
  });

  test("the test screen in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await startTest(page);
    await answerCard(page, 1).click();
    await page.getByLabel("Review later").check();
    expect(await axeViolations(page)).toEqual([]);
  });
});
