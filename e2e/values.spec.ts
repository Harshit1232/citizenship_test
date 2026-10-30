import { expect, test } from "@playwright/test";
import { SCENARIOS_BY_AREA } from "../src/data/values-scenarios";
import { answerCard, watchForProblems } from "./helpers";

const law = SCENARIOS_BY_AREA.law;

test.describe("values mastery", () => {
  test("a scenario asks first, then explains every answer, and remembers progress", async ({ page }) => {
    const problems = watchForProblems(page);
    await page.goto("/practice/values/law/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(law[0].title);
    await expect(page.getByText("Why each answer is right or wrong")).toHaveCount(0);

    await answerCard(page, law[0].answer).click();
    await expect(page.getByText("Right", { exact: true })).toBeVisible();
    await expect(page.getByText("Why each answer is right or wrong")).toBeVisible();
    for (const o of law[0].options) await expect(page.getByText(o.why)).toBeVisible();

    await page.getByRole("button", { name: /Next scenario/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(law[1].title);
    await expect(page).toHaveURL(new RegExp(`#${law[1].id}$`));

    // Progress survives a reload, and the next unseen scenario opens.
    await page.goto("/practice/values/law/");
    await expect(page.getByRole("img", { name: `1 of ${law.length} scenarios done` })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(law[1].title);
    expect(problems).toEqual([]);
  });

  test("a link to a scenario opens that scenario", async ({ page }) => {
    await page.goto(`/practice/values/law/#${law[2].id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(law[2].title);
  });

  test("the values gate explains its rule before starting", async ({ page }) => {
    await page.goto("/practice/values/gate/");
    await page.getByRole("button", { name: "Start the gate" }).click();
    await expect(page.getByRole("radio")).toHaveCount(3);
  });
});
