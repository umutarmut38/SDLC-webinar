import {
  createEmptyPlan,
  createExamplePlan,
  hasUserChanges,
  reducePlan,
  validateCapacity,
  validateTaskInput,
  type PlanAction,
  type TaskInput,
  type ValidationResult,
  type Weekday,
  type WeekPlan,
} from "./domain";
import {
  createBrowserPlanStorage,
  type LoadResult,
  type PlanStorage,
} from "./storage";

export type StorageStatus =
  | { kind: "saved"; message: string }
  | { kind: "not-saved"; message: string }
  | {
      kind: "recovery-required";
      recovery: "unreadable" | "unavailable";
      message: string;
    };

export interface WeekPlanSnapshot {
  plan: WeekPlan;
  editingEnabled: boolean;
  storageStatus: StorageStatus;
}

export interface WeekPlanController {
  getSnapshot(): WeekPlanSnapshot;
  subscribe(listener: () => void): () => void;
  addTask(input: {
    title: unknown;
    effortMinutes: unknown;
    weekday: unknown;
  }): ValidationResult<TaskInput>;
  updateTask(
    id: string,
    input: { title: unknown; effortMinutes: unknown; weekday: unknown },
  ): ValidationResult<TaskInput>;
  deleteTask(id: string): void;
  assignTask(id: string, weekday: Weekday | null): void;
  toggleTask(id: string): void;
  setCapacity(weekday: Weekday, value: unknown): ValidationResult<number>;
  loadExample(): boolean;
  retryStorage(): void;
  discardUnreadable(): void;
}

export interface ControllerDependencies {
  storage?: PlanStorage;
  createId?: () => string;
  confirmReplacement?: () => boolean;
}

function initialSnapshot(result: LoadResult): WeekPlanSnapshot {
  if (result.kind === "loaded") {
    return {
      plan: result.plan,
      editingEnabled: true,
      storageStatus: { kind: "saved", message: "Saved in this browser." },
    };
  }
  if (result.kind === "empty") {
    return {
      plan: createEmptyPlan(),
      editingEnabled: true,
      storageStatus: {
        kind: "saved",
        message: "Changes are saved only in this browser.",
      },
    };
  }
  return {
    plan: createEmptyPlan(),
    editingEnabled: false,
    storageStatus: {
      kind: "recovery-required",
      recovery: result.kind,
      message: result.reason,
    },
  };
}

export function createWeekPlanController(
  dependencies: ControllerDependencies = {},
): WeekPlanController {
  const storage = dependencies.storage ?? createBrowserPlanStorage();
  const createId = dependencies.createId ?? (() => crypto.randomUUID());
  const confirmReplacement =
    dependencies.confirmReplacement ??
    (() =>
      window.confirm(
        "Replace your current tasks and capacities with the example week?",
      ));
  const listeners = new Set<() => void>();
  let snapshot = initialSnapshot(storage.load());

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  function setSnapshot(next: WeekPlanSnapshot): void {
    snapshot = next;
    emit();
  }

  function persist(plan: WeekPlan): void {
    const result = storage.save(plan);
    setSnapshot({
      plan,
      editingEnabled: true,
      storageStatus:
        result.kind === "saved"
          ? { kind: "saved", message: "Saved in this browser." }
          : { kind: "not-saved", message: result.reason },
    });
  }

  function dispatch(action: PlanAction): void {
    if (!snapshot.editingEnabled) return;
    persist(reducePlan(snapshot.plan, action));
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    addTask(input) {
      const result = validateTaskInput(input);
      if (result.value) {
        dispatch({
          type: "add",
          task: {
            id: createId(),
            ...result.value,
            completed: false,
          },
        });
      }
      return result;
    },
    updateTask(id, input) {
      const result = validateTaskInput(input);
      if (result.value) dispatch({ type: "update", id, input: result.value });
      return result;
    },
    deleteTask(id) {
      dispatch({ type: "delete", id });
    },
    assignTask(id, weekday) {
      dispatch({ type: "assign", id, weekday });
    },
    toggleTask(id) {
      dispatch({ type: "toggle-completed", id });
    },
    setCapacity(weekday, value) {
      const result = validateCapacity(value);
      if (result.value !== undefined) {
        dispatch({
          type: "set-capacity",
          weekday,
          capacityMinutes: result.value,
        });
      }
      return result;
    },
    loadExample() {
      if (hasUserChanges(snapshot.plan) && !confirmReplacement()) return false;
      dispatch({ type: "replace", plan: createExamplePlan() });
      return true;
    },
    retryStorage() {
      if (snapshot.storageStatus.kind === "not-saved") {
        const result = storage.retrySave(snapshot.plan);
        setSnapshot({
          ...snapshot,
          storageStatus:
            result.kind === "saved"
              ? { kind: "saved", message: "Saved in this browser." }
              : { kind: "not-saved", message: result.reason },
        });
        return;
      }
      const result = storage.retryLoad();
      setSnapshot(initialSnapshot(result));
    },
    discardUnreadable() {
      const result = storage.discardUnreadable();
      if (result.kind === "discarded") {
        setSnapshot(initialSnapshot({ kind: "empty" }));
      } else {
        setSnapshot({
          ...snapshot,
          storageStatus: {
            kind: "recovery-required",
            recovery: "unreadable",
            message: result.reason,
          },
        });
      }
    },
  };
}
