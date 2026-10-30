import { join } from "node:path";
import { expect, type Page } from "@playwright/test";

const AXE = join(process.cwd(), "node_modules", "axe-core", "axe.min.js");

export const PART_LABELS = [
  "Part 1 – Australia and its people",
  "Part 2 – Australia's democratic beliefs, rights and liberties",
  "Part 3 – Government and the law in Australia",
  "Part 4 – Australian values",
];

/**
 * Collects console errors, uncaught exceptions and Content-Security-Policy
 * violations. Chrome reports CSP violations as console errors, so a policy
 * that blocks a script or style shows up here.
 */
export function watchForProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  return problems;
}

/** The answer cards are labels wrapping visually hidden radio inputs. */
export function answerCard(page: Page, index: number) {
  return page.locator("label:has(input[type=radio])").nth(index);
}

export async function startTest(page: Page) {
  await page.goto("/practice/test/");
  await page.getByRole("button", { name: "Start the test" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Question 1 of 20");
}

/** Answers questions from the current one to the last, always with the first option. */
export async function answerToTheEnd(page: Page, from = 1) {
  for (let n = from; n <= 20; n++) {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(`Question ${n} of 20`);
    await answerCard(page, 0).click();
    if (n < 20) await page.getByRole("button", { name: /^Next/ }).click();
  }
}

/** Presses Submit from the keyboard: it stays focusable while locked, so this works either way. */
export async function pressSubmit(page: Page) {
  const submit = page.getByRole("button", { name: "Submit" });
  await submit.focus();
  await page.keyboard.press("Enter");
}

export async function submitTest(page: Page) {
  await pressSubmit(page);
  const dialog = page.getByRole("dialog", { name: "Warning" });
  await expect(dialog).toContainText("Are you ready to submit your test attempt?");
  await dialog.getByRole("button", { name: "Yes" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Test result: (PASS|FAIL)$/);
}

export interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  targets: string[];
}

/** Runs axe-core on the page (WCAG 2.2 A and AA plus best practices). */
export async function axeViolations(page: Page): Promise<AxeViolation[]> {
  // Let entrance animations finish: text that is still fading in fails
  // contrast. Only time-based, finite ones: scroll-driven animations never
  // finish on their own. Capped at 3 seconds either way.
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.timeline === document.timeline && a.effect?.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]),
  );
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async () => {
    // @ts-expect-error axe is added to the page above
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
    });
    return result.violations.map((v: { id: string; impact: string | null; help: string; nodes: { target: string[] }[] }) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
    }));
  });
}
