// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QUESTIONS, RULES } from "@/lib/bank";
import { buildPaper, seededRng } from "@/lib/exam/plan";
import { markPaper } from "@/lib/exam/score";
import { defaultSettings } from "@/lib/settings";
import type { AnswerPick } from "@/lib/types";
import { Results } from "./results";

const settings = defaultSettings([]);
const paper = buildPaper(settings, QUESTIONS, RULES, seededRng(9));

/** Right answers everywhere except the listed question numbers (1-based). */
function picksWithWrong(wrong: number[]): AnswerPick[] {
  return paper.map((q, i) => (wrong.includes(i + 1) ? (q.answerIndex + 1) % q.options.length : q.answerIndex));
}

function show(wrong: number[]) {
  const picks = picksWithWrong(wrong);
  const result = markPaper(paper, picks, settings, RULES);
  render(<Results paper={paper} picks={picks} result={result} timedOut={false} seconds={600} onAgain={() => {}} />);
}

describe("Results", () => {
  it("fails a 19/20 paper whose one mistake is a values question", () => {
    show([17]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Test result: FAIL");
    expect(screen.getByText("4/5 (80%)")).toBeInTheDocument();
    expect(screen.getByText("19/20 (95%)")).toBeInTheDocument();
    expect(screen.getByText(/at least one values question was wrong. That alone is a fail/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn the values" })).toHaveAttribute("href", expect.stringMatching(/^\/practice\/values\/?$/));
  });

  it("passes 15/20 with every values question right", () => {
    show([1, 2, 6, 11, 12]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Test result: PASS");
    expect(screen.getByText("5/5 (100%)")).toBeInTheDocument();
    expect(screen.getByText("15/20 (75%)")).toBeInTheDocument();
  });

  it("shows each part's mark out of 5, then the questions to review with the reason", () => {
    show([1, 2, 6]);
    const rows = screen.getAllByRole("listitem").filter((li) => /^Part \d – /.test(li.textContent ?? ""));
    expect(rows.map((r) => r.textContent?.match(/(\d)\/5$/)?.[1])).toEqual(["3", "4", "5", "5"]);
    expect(screen.getByRole("heading", { name: "Questions to review (3)" })).toBeInTheDocument();
    expect(screen.getAllByText("Why:")).toHaveLength(3);
  });
});
