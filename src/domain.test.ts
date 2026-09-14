import { describe, expect, it } from "vitest";
import {
  createEmptyPlan,
  createExamplePlan,
  formatMinutes,
  reducePlan,
  summarizeDay,
  validateCapacity,
  validateTaskInput,
} from "./domain";

describe("domain behavior", () => {
  it("validates and trims task input", () => {
    expect(
      validateTaskInput({
        title: "  Plan launch  ",
        effortMinutes: "45",
        weekday: "Monday",
      }).value,
    ).toEqual({
      title: "Plan launch",
      effortMinutes: 45,
      weekday: "Monday",
    });

    expect(
      validateTaskInput({
        title: " ",
        effortMinutes: "1.5",
        weekday: "Saturday",
      }).errors,
    ).toEqual({
      title: "Enter a task title.",
      effortMinutes: "Effort must be a whole number of minutes.",
      weekday: "Choose a valid weekday or the backlog.",
    });
  });

  it("enforces capacity boundaries", () => {
    expect(validateCapacity(0).value).toBe(0);
    expect(validateCapacity(1440).value).toBe(1440);
    expect(validateCapacity(-1).errors.capacity).toMatch(/between/);
    expect(validateCapacity(1441).errors.capacity).toMatch(/between/);
    expect(validateCapacity(2.5).errors.capacity).toMatch(/whole number/);
  });

  it("handles task lifecycle, reopening, and backlog moves", () => {
    const task = {
      id: "one",
      title: "Draft",
      effortMinutes: 30,
      weekday: null,
      completed: false,
    } as const;
    let plan = reducePlan(createEmptyPlan(), { type: "add", task });
    plan = reducePlan(plan, {
      type: "assign",
      id: "one",
      weekday: "Tuesday",
    });
    plan = reducePlan(plan, { type: "toggle-completed", id: "one" });
    expect(plan.tasks[0]).toMatchObject({
      weekday: "Tuesday",
      completed: true,
    });
    plan = reducePlan(plan, { type: "toggle-completed", id: "one" });
    plan = reducePlan(plan, { type: "assign", id: "one", weekday: null });
    expect(plan.tasks[0]).toMatchObject({ weekday: null, completed: false });
    expect(reducePlan(plan, { type: "delete", id: "one" }).tasks).toHaveLength(
      0,
    );
  });

  it("calculates scheduled, remaining, and overload totals", () => {
    const plan = createExamplePlan();
    plan.tasks[0].completed = true;
    const summary = summarizeDay(plan, "Wednesday");
    expect(summary).toEqual({
      scheduledMinutes: 480,
      remainingMinutes: 360,
      capacityMinutes: 360,
      availableCapacityMinutes: 0,
      overCapacityMinutes: 120,
    });
    expect(formatMinutes(480)).toBe("8h");
    expect(formatMinutes(75)).toBe("1h 15m");
  });
});
