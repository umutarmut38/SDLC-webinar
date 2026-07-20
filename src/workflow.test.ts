import { describe, expect, it } from "vitest";
import {
  STAGES,
  createInitialWorkflow,
  getPassedCount,
  workflowReducer,
} from "./workflow";

describe("workflowReducer", () => {
  it("starts a deterministic cycle at Plan", () => {
    const state = createInitialWorkflow();

    expect(state.activeIndex).toBe(0);
    expect(state.selectedStage).toBe("plan");
    expect(state.phases).toEqual({
      plan: "active",
      code: "waiting",
      test: "waiting",
      ci: "waiting",
      review: "waiting",
    });
    expect(getPassedCount(state)).toBe(0);
  });

  it("selects a stage without changing lifecycle progress", () => {
    const initial = createInitialWorkflow();
    const selected = workflowReducer(initial, {
      type: "select",
      stageId: "test",
    });

    expect(selected.selectedStage).toBe("test");
    expect(selected.activeIndex).toBe(0);
    expect(selected.phases).toEqual(initial.phases);
  });

  it("blocks the active stage on failure and clears it on a successful retry", () => {
    const failed = workflowReducer(createInitialWorkflow(), { type: "fail" });

    expect(failed.phases.plan).toBe("failed");
    expect(failed.activeIndex).toBe(0);
    expect(failed.announcement).toContain("Plan is blocked");

    const recovered = workflowReducer(failed, { type: "succeed" });
    expect(recovered.phases.plan).toBe("passed");
    expect(recovered.phases.code).toBe("active");
    expect(recovered.activeIndex).toBe(1);
  });

  it("completes all five stages and starts a new cycle only after reset", () => {
    const completed = STAGES.reduce(
      (state) => workflowReducer(state, { type: "advance" }),
      createInitialWorkflow(),
    );

    expect(completed.completed).toBe(true);
    expect(getPassedCount(completed)).toBe(5);
    expect(completed.announcement).toContain("Cycle 1 is complete");
    expect(workflowReducer(completed, { type: "fail" })).toBe(completed);

    const reset = workflowReducer(completed, { type: "reset" });
    expect(reset.cycle).toBe(2);
    expect(reset.completed).toBe(false);
    expect(reset.phases.plan).toBe("active");
    expect(getPassedCount(reset)).toBe(0);
  });
});
