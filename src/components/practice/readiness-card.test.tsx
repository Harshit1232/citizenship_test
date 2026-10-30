// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { HistoryEntry } from "@/lib/types";
import { ReadinessCard } from "./readiness-card";

const test = (over: Partial<HistoryEntry> = {}): HistoryEntry => ({
  at: 0, mode: "official", n: 20, correct: 18, pct: 90, vTotal: 5, vCorrect: 5,
  valuesEnforced: true, passed: true, seconds: 900, cats: {}, ...over,
});
const gate = (cleared: boolean) => ({ best: cleared ? 10 : 4, runs: 2, cleared });

describe("ReadinessCard", () => {
  it("says ready only when both parts of the rule are met", () => {
    render(<ReadinessCard history={[test(), test(), test()]} gate={gate(true)} />);
    expect(screen.getByText("Ready by our rule")).toBeInTheDocument();
  });

  it("is not ready with three good tests but the gate not cleared", () => {
    render(<ReadinessCard history={[test(), test(), test()]} gate={gate(false)} />);
    expect(screen.getByText("Not yet")).toBeInTheDocument();
  });

  it("is not ready when a recent test missed a values question", () => {
    render(<ReadinessCard history={[test(), test(), test({ vCorrect: 4, passed: false })]} gate={gate(true)} />);
    expect(screen.getByText("Not yet")).toBeInTheDocument();
  });
});
