import { describe, expect, it } from "vitest";
import { createEmptyPlan } from "./domain";
import {
  STORAGE_KEY,
  createBrowserPlanStorage,
  parsePersistedPlan,
  serializePlan,
} from "./storage";

describe("plan storage", () => {
  it("round-trips a versioned plan", () => {
    const plan = createEmptyPlan();
    expect(parsePersistedPlan(serializePlan(plan))).toEqual({
      kind: "loaded",
      plan,
    });
  });

  it("rejects malformed, unsupported, duplicate, and invalid payloads", () => {
    expect(parsePersistedPlan("{")).toMatchObject({ kind: "unreadable" });
    expect(parsePersistedPlan('{"version":2}')).toMatchObject({
      kind: "unreadable",
    });
    const plan = createEmptyPlan();
    plan.tasks = [
      {
        id: "duplicate",
        title: "A",
        effortMinutes: 10,
        weekday: null,
        completed: false,
      },
      {
        id: "duplicate",
        title: "B",
        effortMinutes: 20,
        weekday: "Friday",
        completed: false,
      },
    ];
    expect(parsePersistedPlan(serializePlan(plan))).toMatchObject({
      kind: "unreadable",
    });
  });

  it("preserves unreadable bytes until explicit discard", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");
    const storage = createBrowserPlanStorage(window.localStorage);
    expect(storage.load()).toMatchObject({ kind: "unreadable" });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("not-json");
    expect(storage.discardUnreadable()).toEqual({ kind: "discarded" });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("reports save failures without mutating prior bytes", () => {
    const backing = new Map<string, string>([[STORAGE_KEY, "prior"]]);
    const storage = createBrowserPlanStorage({
      get length() {
        return backing.size;
      },
      clear: () => backing.clear(),
      getItem: (key) => backing.get(key) ?? null,
      key: () => null,
      removeItem: (key) => {
        backing.delete(key);
      },
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });
    expect(storage.save(createEmptyPlan())).toMatchObject({ kind: "failed" });
    expect(backing.get(STORAGE_KEY)).toBe("prior");
  });
});
