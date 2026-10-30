// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExamApp } from "./exam-app";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/practice/test/" }));

/** Answers the current question with its first option and moves on. */
async function answerAll(user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < 20; i++) {
    await user.click(screen.getAllByRole("radio")[0]);
    if (i < 19) await user.click(screen.getByRole("button", { name: /Next/ }));
  }
}

describe("ExamApp", () => {
  it("runs a whole test: start, answer, submit, and see the official-style result", { timeout: 20_000 }, async () => {
    const user = userEvent.setup();
    render(<ExamApp />);
    await user.click(screen.getByRole("button", { name: "Start the test" }));
    expect(screen.getByText("Part 1 – Australia and its people")).toBeInTheDocument();

    await answerAll(user);
    expect(screen.getByText("Part 4 – Australian values")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(within(screen.getByRole("dialog", { name: "Warning" })).getByRole("button", { name: "Yes" }));

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveTextContent(/^Test result: (PASS|FAIL)$/);
    expect(screen.getByText("Correct Australian values questions")).toBeInTheDocument();
    expect(screen.getByText("Overall mark")).toBeInTheDocument();
    for (const part of ["Part 1", "Part 2", "Part 3", "Part 4"]) {
      expect(screen.getByText(new RegExp(`^${part} – `))).toBeInTheDocument();
    }
    expect(
      screen.getByText(/To pass the test, you must get 5\/5 \(100%\) in the Australian values questions and at least 15\/20 \(75%\)/),
    ).toBeInTheDocument();

    // The attempt is saved to history and the in-progress copy is gone.
    const history = JSON.parse(localStorage.getItem("ocb.history") ?? "[]");
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ mode: "official", n: 20, vTotal: 5, valuesEnforced: true });
    expect(localStorage.getItem("ocb.active")).toBeNull();
  });

  it("saves as you go, so a test can be resumed after leaving", async () => {
    const user = userEvent.setup();
    const first = render(<ExamApp />);
    await user.click(screen.getByRole("button", { name: "Start the test" }));
    await user.click(screen.getAllByRole("radio")[1]);
    await user.click(screen.getByRole("button", { name: /Next/ }));
    await user.click(screen.getAllByRole("radio")[2]);
    await user.click(screen.getByRole("button", { name: "Save and exit" }));
    expect(push).toHaveBeenCalledWith("/practice/");
    first.unmount();

    render(<ExamApp />);
    expect(screen.getByText("You have a test in progress")).toBeInTheDocument();
    expect(screen.getByText(/^2 of 20 answered\./)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resume test" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Question 2 of 20");
    expect(screen.getAllByRole("radio")[2]).toBeChecked();
  });

  it("remembers the larger text choice", async () => {
    const user = userEvent.setup();
    render(<ExamApp />);
    await user.click(screen.getByRole("button", { name: "Start the test" }));
    const toggle = screen.getByRole("button", { name: "Larger text" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(localStorage.getItem("ocb.settings") ?? "{}")).toMatchObject({ largeText: true });
  });
});
