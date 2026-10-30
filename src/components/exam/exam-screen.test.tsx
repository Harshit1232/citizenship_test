// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { QUESTIONS, RULES } from "@/lib/bank";
import { buildPaper, seededRng } from "@/lib/exam/plan";
import type { RunningTest } from "@/lib/exam/session";
import { defaultSettings } from "@/lib/settings";
import { ExamScreen } from "./exam-screen";
import { formatClock } from "./exam-timer";

function makeTest(answered: number): RunningTest {
  const paper = buildPaper(defaultSettings([]), QUESTIONS, RULES, seededRng(3));
  return {
    paper,
    picks: paper.map((_, i) => (i < answered ? 0 : null)),
    flags: paper.map(() => false),
    cur: 0,
    startedAt: 0,
    deadline: 45 * 60_000,
    mode: "official",
  };
}

/** ExamScreen with the state handling ExamApp would do. */
function Harness({ start, onSubmit = () => {} }: { start: RunningTest; onSubmit?: () => void }) {
  const [t, setT] = useState(start);
  return (
    <ExamScreen
      test={t}
      now={1000}
      largeText={false}
      onLargeText={() => {}}
      onPick={(c) => setT((x) => ({ ...x, picks: x.picks.map((p, i) => (i === x.cur ? c : p)) }))}
      onMove={(to) => setT((x) => ({ ...x, cur: to }))}
      onToggleFlag={() => setT((x) => ({ ...x, flags: x.flags.map((f, i) => (i === x.cur ? !f : f)) }))}
      onSubmit={onSubmit}
      onExit={() => {}}
    />
  );
}

describe("formatClock", () => {
  it("shows hours, minutes and seconds like the official test", () => {
    expect(formatClock(2699)).toBe("00:44:59");
    expect(formatClock(3600 + 61)).toBe("01:01:01");
    expect(formatClock(-5)).toBe("00:00:00");
  });
});

describe("ExamScreen", () => {
  it("shows the part label, plain answers and the official footer", () => {
    render(<Harness start={makeTest(0)} />);
    expect(screen.getByText("Part 1 – Australia and its people")).toBeInTheDocument();
    const answers = screen.getAllByRole("radio");
    expect(answers).toHaveLength(3);
    // No A/B/C letters on the official test.
    expect(screen.queryByText(/^A\.\s/)).not.toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.tagName === "P" && el.textContent === "0 of 20 questions answered")).toBeInTheDocument();
    expect(screen.getByText("00:44:59")).toBeInTheDocument();
  });

  it("labels the last five questions as Part 4, Australian values", async () => {
    const user = userEvent.setup();
    render(<Harness start={makeTest(0)} />);
    const list = screen.getAllByRole("list", { name: "Questions" })[0];
    await user.click(within(list).getByRole("button", { name: /^Question 16,/ }));
    expect(screen.getByText("Part 4 – Australian values")).toBeInTheDocument();
    await user.click(within(list).getByRole("button", { name: /^Question 15,/ }));
    expect(screen.getByText("Part 3 – Government and the law in Australia")).toBeInTheDocument();
  });

  it("will not submit until every question has an answer", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness start={makeTest(17)} onSubmit={onSubmit} />);
    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).toHaveAttribute("aria-disabled", "true");
    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent("You must answer all questions.");
    expect(screen.getByRole("alert")).toHaveTextContent("questions 18, 19 and 20");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Go to question 18" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Question 18 of 20");
  });

  it("asks for confirmation, then submits", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness start={makeTest(20)} onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText("Review later"));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    const dialog = screen.getByRole("dialog", { name: "Warning" });
    expect(dialog).toHaveTextContent("Are you ready to submit your test attempt?");
    expect(dialog).toHaveTextContent("You marked question 1 to review later.");
    await user.click(within(dialog).getByRole("button", { name: "No" }));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(within(screen.getByRole("dialog", { name: "Warning" })).getByRole("button", { name: "Yes" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("marks questions in the list as answered or review later", async () => {
    const user = userEvent.setup();
    render(<Harness start={makeTest(0)} />);
    await user.click(screen.getAllByRole("radio")[1]);
    await user.click(screen.getByLabelText("Review later"));
    const list = screen.getAllByRole("list", { name: "Questions" })[0];
    expect(within(list).getByRole("button", { name: "Question 1, answered, marked review later" })).toBeInTheDocument();
    expect(within(list).getByRole("button", { name: "Question 2, not answered" })).toBeInTheDocument();
  });

  it("shows only Next and Submit on the first question, and Previous and Submit on the last", async () => {
    const user = userEvent.setup();
    render(<Harness start={makeTest(0)} />);
    expect(screen.queryByRole("button", { name: /Previous/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/ })).toBeInTheDocument();
    const list = screen.getAllByRole("list", { name: "Questions" })[0];
    await user.click(within(list).getByRole("button", { name: /^Question 20,/ }));
    expect(screen.getByRole("button", { name: /Previous/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next/ })).not.toBeInTheDocument();
  });
});
