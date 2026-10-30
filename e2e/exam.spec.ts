import { expect, test } from "@playwright/test";
import { PART_LABELS, answerCard, answerToTheEnd, pressSubmit, startTest, submitTest, watchForProblems } from "./helpers";

test.describe("practice test", () => {
  test("follows the official layout from start to result", async ({ page }) => {
    const problems = watchForProblems(page);
    await startTest(page);
    await expect(page.locator("footer")).toContainText("0 of 20");
    await expect(page.getByText("Time remaining:")).toBeVisible();
    await expect(page.getByText(/^00:4[45]:\d\d$/)).toBeVisible();

    for (let n = 1; n <= 20; n++) {
      await expect(page.getByRole("heading", { level: 1 })).toContainText(`Question ${n} of 20`);
      // Five questions from each part, in order, with the values part last.
      await expect(page.getByText(/^Part \d – /)).toHaveText(PART_LABELS[Math.floor((n - 1) / 5)]);
      await expect(page.getByRole("button", { name: /^Previous/ })).toHaveCount(n === 1 ? 0 : 1);
      await expect(page.getByRole("button", { name: /^Next/ })).toHaveCount(n === 20 ? 0 : 1);
      await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();

      if (n === 4) {
        // Submit is locked until every question has an answer.
        await pressSubmit(page);
        await expect(page.locator("main").getByRole("alert")).toContainText("You must answer all questions.");
        await expect(page.getByRole("dialog", { name: "Warning" })).toBeHidden();
      }
      await answerCard(page, 0).click();
      if (n < 20) await page.getByRole("button", { name: /^Next/ }).click();
    }
    await expect(page.locator("footer")).toContainText("20 of 20");

    await submitTest(page);
    await expect(page.getByText("Correct Australian values questions", { exact: true })).toBeVisible();
    await expect(page.getByText("Overall mark", { exact: true })).toBeVisible();
    for (const label of PART_LABELS) await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(page.getByText(/To pass the test, you must get 5\/5 \(100%\)/)).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("No in the submit warning returns to the test", async ({ page }) => {
    await startTest(page);
    await answerToTheEnd(page);
    await pressSubmit(page);
    await page.getByRole("dialog", { name: "Warning" }).getByRole("button", { name: "No" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Question 20 of 20");
  });

  test("Review later shows in the question list", async ({ page, isMobile }) => {
    await startTest(page);
    await page.getByLabel("Review later").check();
    if (isMobile) await page.getByRole("button", { name: "Questions" }).click();
    await expect(page.getByRole("button", { name: "Question 1, not answered, marked review later" }).first()).toBeVisible();
  });

  test("keeps answers through a page reload", async ({ page }) => {
    await startTest(page);
    await answerCard(page, 1).click();
    await page.getByRole("button", { name: /^Next/ }).click();
    await answerCard(page, 2).click();
    await page.reload();

    await expect(page.getByText("You have a test in progress", { exact: true })).toBeVisible();
    await expect(page.getByText(/^2 of 20 answered\./)).toBeVisible();
    await page.getByRole("button", { name: "Resume test" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Question 2 of 20");
    await expect(page.getByRole("radio").nth(2)).toBeChecked();
  });

  test("submits the paper as it stands when time runs out", async ({ page }) => {
    await page.clock.install();
    await startTest(page);
    await answerCard(page, 0).click();
    await page.clock.fastForward("45:05");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Test result: FAIL");
    await expect(page.getByText(/Time ran out/)).toBeVisible();
    await expect(page.getByText(/^\d+\/20 \(\d+%\)/)).toBeVisible();
  });

  test("answers can be chosen with the keyboard", async ({ page }) => {
    await startTest(page);
    await page.getByRole("radio").first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("radio").nth(1)).toBeChecked();
    await expect(page.locator("footer")).toContainText("1 of 20");
  });

  test("the result is saved to progress", async ({ page }) => {
    await startTest(page);
    await answerToTheEnd(page);
    await submitTest(page);
    await page.goto("/practice/progress/");
    await expect(page.getByRole("heading", { name: "Readiness check" })).toBeVisible();
    const history = await page.evaluate(() => JSON.parse(localStorage.getItem("ocb.history") ?? "[]"));
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ mode: "official", n: 20, vTotal: 5 });
  });
});
