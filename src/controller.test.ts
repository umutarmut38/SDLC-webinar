import { describe, expect, it, vi } from "vitest";
import { createWeekPlanController } from "./controller";
import { createEmptyPlan, type WeekPlan } from "./domain";
import type {
  LoadResult,
  PlanStorage,
  RecoveryResult,
  SaveResult,
} from "./storage";

class FakeStorage implements PlanStorage {
  loadResult: LoadResult = { kind: "empty" };
  saveResult: SaveResult = { kind: "saved" };
  recoveryResult: RecoveryResult = { kind: "discarded" };
  savedPlans: WeekPlan[] = [];

  load() {
    return this.loadResult;
  }
  save(plan: WeekPlan) {
    this.savedPlans.push(plan);
    return this.saveResult;
  }
  retryLoad() {
    return this.loadResult;
  }
  retrySave(plan: WeekPlan) {
    this.savedPlans.push(plan);
    return this.saveResult;
  }
  discardUnreadable() {
    return this.recoveryResult;
  }
}

describe("WeekPlan controller", () => {
  it("adds, edits, completes, reopens, moves, and deletes tasks", () => {
    const controller = createWeekPlanController({
      storage: new FakeStorage(),
      createId: () => "task-1",
    });
    expect(
      controller.addTask({
        title: "Draft agenda",
        effortMinutes: "30",
        weekday: null,
      }).errors,
    ).toEqual({});
    controller.assignTask("task-1", "Monday");
    controller.updateTask("task-1", {
      title: "Final agenda",
      effortMinutes: 45,
      weekday: "Tuesday",
    });
    controller.toggleTask("task-1");
    expect(controller.getSnapshot().plan.tasks[0]).toMatchObject({
      title: "Final agenda",
      effortMinutes: 45,
      weekday: "Tuesday",
      completed: true,
    });
    controller.toggleTask("task-1");
    controller.assignTask("task-1", null);
    controller.deleteTask("task-1");
    expect(controller.getSnapshot().plan.tasks).toEqual([]);
  });

  it("requires confirmation before replacing user changes", () => {
    const confirmReplacement = vi.fn(() => false);
    const controller = createWeekPlanController({
      storage: new FakeStorage(),
      confirmReplacement,
    });
    controller.setCapacity("Monday", 0);
    expect(controller.loadExample()).toBe(false);
    expect(confirmReplacement).toHaveBeenCalledOnce();
    expect(controller.getSnapshot().plan).toEqual({
      ...createEmptyPlan(),
      capacities: { ...createEmptyPlan().capacities, Monday: 0 },
    });
  });

  it("keeps in-memory changes and exposes retry after save failure", () => {
    const storage = new FakeStorage();
    storage.saveResult = { kind: "failed", reason: "Storage full." };
    const controller = createWeekPlanController({
      storage,
      createId: () => "task-1",
    });
    controller.addTask({
      title: "Unsaved task",
      effortMinutes: 30,
      weekday: null,
    });
    expect(controller.getSnapshot()).toMatchObject({
      plan: { tasks: [{ title: "Unsaved task" }] },
      storageStatus: { kind: "not-saved", message: "Storage full." },
    });
    storage.saveResult = { kind: "saved" };
    controller.retryStorage();
    expect(controller.getSnapshot().storageStatus.kind).toBe("saved");
  });

  it("disables editing for unreadable data until recovery", () => {
    const storage = new FakeStorage();
    storage.loadResult = { kind: "unreadable", reason: "Bad saved data." };
    const controller = createWeekPlanController({ storage });
    expect(controller.getSnapshot()).toMatchObject({
      editingEnabled: false,
      storageStatus: { kind: "recovery-required", recovery: "unreadable" },
    });
    controller.addTask({
      title: "Blocked",
      effortMinutes: 30,
      weekday: null,
    });
    expect(controller.getSnapshot().plan.tasks).toHaveLength(0);
    controller.discardUnreadable();
    expect(controller.getSnapshot().editingEnabled).toBe(true);
  });

  it("does not expose destructive recovery for unavailable storage", () => {
    const storage = new FakeStorage();
    storage.loadResult = {
      kind: "unavailable",
      reason: "Temporarily blocked.",
    };
    const controller = createWeekPlanController({ storage });
    expect(controller.getSnapshot().storageStatus).toEqual({
      kind: "recovery-required",
      recovery: "unavailable",
      message: "Temporarily blocked.",
    });
  });
});
