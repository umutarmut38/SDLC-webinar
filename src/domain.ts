export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface Task {
  id: string;
  title: string;
  effortMinutes: number;
  weekday: Weekday | null;
  completed: boolean;
}

export type CapacityRecord = Record<Weekday, number>;

export interface WeekPlan {
  tasks: Task[];
  capacities: CapacityRecord;
}

export interface DaySummary {
  scheduledMinutes: number;
  remainingMinutes: number;
  capacityMinutes: number;
  availableCapacityMinutes: number;
  overCapacityMinutes: number;
}

export interface TaskInput {
  title: string;
  effortMinutes: number;
  weekday: Weekday | null;
}

export interface ValidationResult<T> {
  value?: T;
  errors: Record<string, string>;
}

export const DEFAULT_CAPACITY_MINUTES = 360;
export const MAX_CAPACITY_MINUTES = 1440;

export function createDefaultCapacities(): CapacityRecord {
  return Object.fromEntries(
    WEEKDAYS.map((weekday) => [weekday, DEFAULT_CAPACITY_MINUTES]),
  ) as CapacityRecord;
}

export function createEmptyPlan(): WeekPlan {
  return {
    tasks: [],
    capacities: createDefaultCapacities(),
  };
}

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === "string" && WEEKDAYS.includes(value as Weekday);
}

export function validateTaskInput(input: {
  title: unknown;
  effortMinutes: unknown;
  weekday: unknown;
}): ValidationResult<TaskInput> {
  const errors: Record<string, string> = {};
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const effortMinutes =
    typeof input.effortMinutes === "number"
      ? input.effortMinutes
      : Number(input.effortMinutes);

  if (!title) {
    errors.title = "Enter a task title.";
  }
  if (!Number.isFinite(effortMinutes) || !Number.isInteger(effortMinutes)) {
    errors.effortMinutes = "Effort must be a whole number of minutes.";
  } else if (effortMinutes <= 0) {
    errors.effortMinutes = "Effort must be greater than zero.";
  }
  if (input.weekday !== null && !isWeekday(input.weekday)) {
    errors.weekday = "Choose a valid weekday or the backlog.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    value: {
      title,
      effortMinutes,
      weekday: input.weekday as Weekday | null,
    },
    errors,
  };
}

export function validateCapacity(value: unknown): ValidationResult<number> {
  const capacity = typeof value === "number" ? value : Number(value);
  const errors: Record<string, string> = {};

  if (!Number.isFinite(capacity) || !Number.isInteger(capacity)) {
    errors.capacity = "Capacity must be a whole number of minutes.";
  } else if (capacity < 0 || capacity > MAX_CAPACITY_MINUTES) {
    errors.capacity = `Capacity must be between 0 and ${MAX_CAPACITY_MINUTES} minutes.`;
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : { value: capacity, errors };
}

export function summarizeDay(plan: WeekPlan, weekday: Weekday): DaySummary {
  const tasks = plan.tasks.filter((task) => task.weekday === weekday);
  const scheduledMinutes = tasks.reduce(
    (total, task) => total + task.effortMinutes,
    0,
  );
  const remainingMinutes = tasks
    .filter((task) => !task.completed)
    .reduce((total, task) => total + task.effortMinutes, 0);
  const capacityMinutes = plan.capacities[weekday];

  return {
    scheduledMinutes,
    remainingMinutes,
    capacityMinutes,
    availableCapacityMinutes: Math.max(0, capacityMinutes - scheduledMinutes),
    overCapacityMinutes: Math.max(0, scheduledMinutes - capacityMinutes),
  };
}

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function createExamplePlan(): WeekPlan {
  return {
    capacities: createDefaultCapacities(),
    tasks: [
      {
        id: "example-team-planning",
        title: "Team planning session",
        effortMinutes: 120,
        weekday: "Wednesday",
        completed: false,
      },
      {
        id: "example-product-review",
        title: "Product review",
        effortMinutes: 180,
        weekday: "Wednesday",
        completed: false,
      },
      {
        id: "example-focus-work",
        title: "Focus work",
        effortMinutes: 180,
        weekday: "Wednesday",
        completed: false,
      },
      {
        id: "example-backlog",
        title: "Prepare project notes",
        effortMinutes: 45,
        weekday: null,
        completed: false,
      },
    ],
  };
}

export function hasUserChanges(plan: WeekPlan): boolean {
  return (
    plan.tasks.length > 0 ||
    WEEKDAYS.some(
      (weekday) => plan.capacities[weekday] !== DEFAULT_CAPACITY_MINUTES,
    )
  );
}

export type PlanAction =
  | { type: "add"; task: Task }
  | { type: "update"; id: string; input: TaskInput }
  | { type: "delete"; id: string }
  | { type: "assign"; id: string; weekday: Weekday | null }
  | { type: "toggle-completed"; id: string }
  | { type: "set-capacity"; weekday: Weekday; capacityMinutes: number }
  | { type: "replace"; plan: WeekPlan };

export function reducePlan(plan: WeekPlan, action: PlanAction): WeekPlan {
  switch (action.type) {
    case "add":
      return { ...plan, tasks: [...plan.tasks, action.task] };
    case "update":
      return {
        ...plan,
        tasks: plan.tasks.map((task) =>
          task.id === action.id ? { ...task, ...action.input } : task,
        ),
      };
    case "delete":
      return {
        ...plan,
        tasks: plan.tasks.filter((task) => task.id !== action.id),
      };
    case "assign":
      return {
        ...plan,
        tasks: plan.tasks.map((task) =>
          task.id === action.id ? { ...task, weekday: action.weekday } : task,
        ),
      };
    case "toggle-completed":
      return {
        ...plan,
        tasks: plan.tasks.map((task) =>
          task.id === action.id
            ? { ...task, completed: !task.completed }
            : task,
        ),
      };
    case "set-capacity":
      return {
        ...plan,
        capacities: {
          ...plan.capacities,
          [action.weekday]: action.capacityMinutes,
        },
      };
    case "replace":
      return action.plan;
  }
}
