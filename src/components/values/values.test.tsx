// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SCENARIOS, SCENARIOS_BY_AREA } from "@/data/values-scenarios";
import { QUESTIONS } from "@/lib/bank";
import { GateRun } from "./gate-run";
import { ScenarioPlayer } from "./scenario-player";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }), usePathname: () => "/practice/values/" }));

const stored = () => JSON.parse(localStorage.getItem("ocb.values") ?? "{}");

/**
 * The index of the right answer for whatever the gate is showing. Several
 * scenarios share a question ("What should she do?"), so match the options too.
 */
function rightAnswerOnScreen(): number {
  const question = screen.getByRole("heading", { level: 1 }).textContent ?? "";
  const shown = screen.getAllByRole("radio").map((r) => r.closest("label")?.textContent ?? "");
  const same = (opts: string[]) => opts.every((o, i) => shown[i].includes(o));
  const s = SCENARIOS.find((x) => question.includes(x.question) && same(x.options.map((o) => o.text)));
  if (s) return s.answer;
  const q = QUESTIONS.find((x) => question.includes(x.question) && same(x.options));
  if (q) return q.answerIndex;
  throw new Error(`Unknown gate item: ${question}`);
}

describe("ScenarioPlayer", () => {
  const first = SCENARIOS_BY_AREA.law[0];
  const wrong = (first.answer + 1) % 3;

  it("asks first, then explains every option, and records only the first attempt", async () => {
    const user = userEvent.setup();
    render(<ScenarioPlayer area="law" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(first.title);
    expect(screen.queryByText("Why each answer is right or wrong")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: new RegExp(first.options[wrong].text.slice(0, 20)) }));
    expect(screen.getByText(/^Not quite\. The answer is [ABC]\.$/)).toBeInTheDocument();
    expect(screen.getByText("Why each answer is right or wrong")).toBeInTheDocument();
    for (const o of first.options) expect(screen.getByText(o.why)).toBeInTheDocument();
    expect(stored().scenarios[first.id]).toMatchObject({ first: false });

    // Coming back and getting it right later doesn't rewrite the first attempt.
    await user.click(screen.getByRole("button", { name: /Next scenario/ }));
    await user.click(screen.getByRole("button", { name: new RegExp(first.title) }));
    await user.click(screen.getAllByRole("radio")[first.answer]);
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(stored().scenarios[first.id]).toMatchObject({ first: false });
  });

  it("offers a hint before answering", async () => {
    const user = userEvent.setup();
    render(<ScenarioPlayer area="law" />);
    await user.click(screen.getByRole("button", { name: "Show a hint" }));
    expect(screen.getByText(first.meaning)).toBeInTheDocument();
  });
});

describe("GateRun", () => {
  it("ends the run on the first wrong answer", async () => {
    const user = userEvent.setup();
    render(<GateRun />);
    await user.click(screen.getByRole("button", { name: "Start the gate" }));
    const right = rightAnswerOnScreen();
    await user.click(screen.getAllByRole("radio")[right]);
    await user.click(screen.getByRole("button", { name: /Next question/ }));
    await user.click(screen.getAllByRole("radio")[(rightAnswerOnScreen() + 1) % 3]);
    await user.click(screen.getByRole("button", { name: /See how the run went/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("1 in a row. The run has ended.");
    expect(stored().gate).toMatchObject({ best: 1, runs: 1, cleared: false });
  });

  it("clears after 10 right answers in a row", { timeout: 20_000 }, async () => {
    const user = userEvent.setup();
    render(<GateRun />);
    await user.click(screen.getByRole("button", { name: "Start the gate" }));
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getAllByRole("radio")[rightAnswerOnScreen()]);
      await user.click(screen.getByRole("button", { name: i < 9 ? /Next question/ : /Finish/ }));
    }
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Values gate cleared");
    expect(stored().gate).toMatchObject({ best: 10, runs: 1, cleared: true });
  });
});
