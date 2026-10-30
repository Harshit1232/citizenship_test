import { expect, test } from "@playwright/test";
import { watchForProblems } from "./helpers";

/**
 * People who used the original single-file app have data in localStorage
 * under the same keys. The new site must read it without losing anything.
 */
const legacy = {
  "ocb.settings": { mode: "custom", cats: ["states-and-territories"], count: 12, timerOn: false, minutes: 30, forceValues: true, showValuesTag: true },
  "ocb.history": [
    { at: 1_700_000_000_000, mode: "official", n: 20, correct: 17, pct: 85, vTotal: 5, vCorrect: 5, valuesEnforced: true, passed: true, seconds: 1200, cats: { "states-and-territories": { n: 2, c: 2 } } },
    { at: 1_700_100_000_000, mode: "official", n: 20, correct: 19, pct: 95, vTotal: 5, vCorrect: 4, valuesEnforced: true, passed: false, seconds: 900, cats: {} },
  ],
  "ocb.qstats": { "47": { seen: 3, wrong: 2, streak: 0, lastWrongAt: 1_700_100_000_000 } },
  "ocb.active": { v: 1, at: 1, ids: [263, 1, 2], picks: [2, null, 0], flags: [false, true], cur: 1, startedAt: 10, endsAt: 0, timed: false, mode: "official", showValuesTag: false },
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((data) => {
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, JSON.stringify(v));
  }, legacy);
});

test("old test history shows on the progress page", async ({ page }) => {
  const problems = watchForProblems(page);
  await page.goto("/practice/progress/");
  await expect(page.getByRole("heading", { name: "Readiness check" })).toBeVisible();
  await expect(page.getByText(/95%/).first()).toBeVisible();
  await expect(page.getByText(/85%/).first()).toBeVisible();
  expect(problems).toEqual([]);
});

test("an old test in progress can be resumed, with its answers", async ({ page }) => {
  await page.goto("/practice/test/");
  await expect(page.getByText("You have a test in progress", { exact: true })).toBeVisible();
  await expect(page.getByText(/^2 of 3 answered\./)).toBeVisible();
  await page.getByRole("button", { name: "Resume test" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Question 2 of 3");
});

test("old custom settings are kept", async ({ page }) => {
  await page.goto("/practice/settings/");
  await expect(page.getByLabel("Number of questions")).toHaveValue("12");
  await expect(page.getByRole("radio", { name: /Custom/ })).toBeChecked();
});
