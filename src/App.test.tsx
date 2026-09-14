import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { createWeekPlanController } from "./controller";
import type { PlanStorage } from "./storage";

function failedStorage(): PlanStorage {
  return {
    load: () => ({ kind: "empty" }),
    retryLoad: () => ({ kind: "empty" }),
    save: () => ({ kind: "failed", reason: "Storage full." }),
    retrySave: () => ({ kind: "saved" }),
    discardUnreadable: () => ({ kind: "discarded" }),
  };
}

describe("App", () => {
  it("shows inline validation and visible storage failure recovery", async () => {
    const user = userEvent.setup();
    const controller = createWeekPlanController({
      storage: failedStorage(),
      createId: () => "new-task",
    });
    render(<App controller={controller} />);

    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByText("Enter a task title.")).toBeVisible();

    await user.type(screen.getByLabelText("Task title"), "Write summary");
    await user.type(screen.getByLabelText("Effort in minutes"), "25");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByText("Write summary")).toBeVisible();
    expect(screen.getByLabelText("Storage status")).toHaveTextContent(
      "Not saved",
    );

    await user.click(screen.getByRole("button", { name: "Retry storage" }));
    expect(screen.getByLabelText("Storage status")).toHaveTextContent(
      "Saved locally",
    );
  });

  it("does not offer discard when storage is temporarily unavailable", () => {
    const storage: PlanStorage = {
      load: () => ({ kind: "unavailable", reason: "Temporarily blocked." }),
      retryLoad: () => ({ kind: "empty" }),
      save: () => ({ kind: "saved" }),
      retrySave: () => ({ kind: "saved" }),
      discardUnreadable: () => ({ kind: "discarded" }),
    };
    render(<App controller={createWeekPlanController({ storage })} />);
    expect(
      screen.queryByRole("button", { name: "Discard saved data" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry storage" })).toBeVisible();
  });

  it("resets capacity drafts when example replacement is accepted", async () => {
    const user = userEvent.setup();
    const controller = createWeekPlanController({
      storage: {
        load: () => ({ kind: "empty" }),
        retryLoad: () => ({ kind: "empty" }),
        save: () => ({ kind: "saved" }),
        retrySave: () => ({ kind: "saved" }),
        discardUnreadable: () => ({ kind: "discarded" }),
      },
      confirmReplacement: () => true,
    });
    render(<App controller={controller} />);

    const capacity = screen.getByLabelText("Monday capacity in minutes");
    await user.clear(capacity);
    await user.type(capacity, "120");
    await user.click(
      screen
        .getByRole("heading", { name: "Monday" })
        .closest("article")!
        .querySelector("button")!,
    );
    await user.click(screen.getByRole("button", { name: "Load example week" }));

    expect(screen.getByLabelText("Monday capacity in minutes")).toHaveValue(
      "360",
    );
  });
});
