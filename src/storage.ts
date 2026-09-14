import {
  MAX_CAPACITY_MINUTES,
  WEEKDAYS,
  type CapacityRecord,
  type Task,
  type WeekPlan,
  isWeekday,
} from "./domain";

export const STORAGE_KEY = "weekplan.plan";

interface PersistedPlanV1 {
  version: 1;
  tasks: Task[];
  capacities: CapacityRecord;
}

export type LoadResult =
  | { kind: "empty" }
  | { kind: "loaded"; plan: WeekPlan }
  | { kind: "unreadable"; reason: string }
  | { kind: "unavailable"; reason: string };

export type SaveResult = { kind: "saved" } | { kind: "failed"; reason: string };

export type RecoveryResult =
  | { kind: "discarded" }
  | { kind: "failed"; reason: string };

export interface PlanStorage {
  load(): LoadResult;
  save(plan: WeekPlan): SaveResult;
  retryLoad(): LoadResult;
  retrySave(plan: WeekPlan): SaveResult;
  discardUnreadable(): RecoveryResult;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTask(value: unknown): value is Task {
  if (!isPlainObject(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.title === "string" &&
    value.title.trim() === value.title &&
    value.title.length > 0 &&
    typeof value.effortMinutes === "number" &&
    Number.isInteger(value.effortMinutes) &&
    value.effortMinutes > 0 &&
    (value.weekday === null || isWeekday(value.weekday)) &&
    typeof value.completed === "boolean"
  );
}

export function parsePersistedPlan(raw: string): LoadResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { kind: "unreadable", reason: "Saved plan is not valid JSON." };
  }

  if (!isPlainObject(value) || value.version !== 1) {
    return {
      kind: "unreadable",
      reason: "Saved plan uses an unsupported format.",
    };
  }
  if (!Array.isArray(value.tasks) || !value.tasks.every(isValidTask)) {
    return { kind: "unreadable", reason: "Saved tasks are invalid." };
  }
  const ids = new Set(value.tasks.map((task) => task.id));
  if (ids.size !== value.tasks.length) {
    return { kind: "unreadable", reason: "Saved task IDs are not unique." };
  }
  if (!isPlainObject(value.capacities)) {
    return { kind: "unreadable", reason: "Saved capacities are invalid." };
  }

  const capacities = {} as CapacityRecord;
  for (const weekday of WEEKDAYS) {
    const capacity = value.capacities[weekday];
    if (
      typeof capacity !== "number" ||
      !Number.isInteger(capacity) ||
      capacity < 0 ||
      capacity > MAX_CAPACITY_MINUTES
    ) {
      return { kind: "unreadable", reason: "Saved capacities are invalid." };
    }
    capacities[weekday] = capacity;
  }

  return {
    kind: "loaded",
    plan: {
      tasks: value.tasks,
      capacities,
    },
  };
}

export function serializePlan(plan: WeekPlan): string {
  const payload: PersistedPlanV1 = {
    version: 1,
    tasks: plan.tasks,
    capacities: plan.capacities,
  };
  return JSON.stringify(payload);
}

export function createBrowserPlanStorage(
  storage: Storage = window.localStorage,
): PlanStorage {
  function load(): LoadResult {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      return raw === null ? { kind: "empty" } : parsePersistedPlan(raw);
    } catch {
      return {
        kind: "unavailable",
        reason: "Browser storage is unavailable.",
      };
    }
  }

  function save(plan: WeekPlan): SaveResult {
    try {
      storage.setItem(STORAGE_KEY, serializePlan(plan));
      return { kind: "saved" };
    } catch {
      return {
        kind: "failed",
        reason: "This change is not saved because browser storage failed.",
      };
    }
  }

  return {
    load,
    save,
    retryLoad: load,
    retrySave: save,
    discardUnreadable() {
      try {
        storage.removeItem(STORAGE_KEY);
        return { kind: "discarded" };
      } catch {
        return {
          kind: "failed",
          reason: "The unreadable saved plan could not be discarded.",
        };
      }
    },
  };
}
