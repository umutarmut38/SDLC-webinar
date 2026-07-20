export const STAGES = [
  {
    id: "plan",
    name: "Plan",
    shortLabel: "01",
    color: "#a78bfa",
    glow: "#7c3aed",
    description:
      "Frame the problem, align the team, and make the next bet explicit.",
    artifact: "A shared brief with scope, risks, and success signals.",
    prompt: "Do we know what “done” means?",
  },
  {
    id: "code",
    name: "Code",
    shortLabel: "02",
    color: "#38bdf8",
    glow: "#0284c7",
    description:
      "Turn the plan into small, reviewable changes with fast feedback.",
    artifact: "A focused implementation on a feature branch.",
    prompt: "Is the change easy to understand and undo?",
  },
  {
    id: "test",
    name: "Test",
    shortLabel: "03",
    color: "#34d399",
    glow: "#059669",
    description: "Challenge assumptions with deterministic automated checks.",
    artifact: "Evidence at the unit, component, and browser layers.",
    prompt: "What user-visible failure would escape today?",
  },
  {
    id: "ci",
    name: "CI",
    shortLabel: "04",
    color: "#fbbf24",
    glow: "#d97706",
    description:
      "Reproduce quality gates in a clean, minimal-permission environment.",
    artifact: "A locked, repeatable validation run on the exact commit.",
    prompt: "Can anyone reproduce this result?",
  },
  {
    id: "review",
    name: "Review",
    shortLabel: "05",
    color: "#fb7185",
    glow: "#e11d48",
    description:
      "Inspect the change, resolve findings, and preserve the reasoning.",
    artifact: "An auditable decision backed by green checks.",
    prompt: "Is the result safe, useful, and ready to learn from?",
  },
] as const;

export type Stage = (typeof STAGES)[number];
export type StageId = Stage["id"];
export type StagePhase = "waiting" | "active" | "passed" | "failed";

export interface WorkflowState {
  activeIndex: number;
  selectedStage: StageId;
  phases: Record<StageId, StagePhase>;
  completed: boolean;
  cycle: number;
  announcement: string;
}

export type WorkflowAction =
  | { type: "select"; stageId: StageId }
  | { type: "advance" }
  | { type: "succeed" }
  | { type: "fail" }
  | { type: "reset" };

const initialPhases = (): Record<StageId, StagePhase> => ({
  plan: "active",
  code: "waiting",
  test: "waiting",
  ci: "waiting",
  review: "waiting",
});

export function createInitialWorkflow(cycle = 1): WorkflowState {
  return {
    activeIndex: 0,
    selectedStage: "plan",
    phases: initialPhases(),
    completed: false,
    cycle,
    announcement: "Cycle 1 ready. Plan is the active stage.",
  };
}

function passCurrentStage(
  state: WorkflowState,
  actionLabel: "Advanced" | "Success simulated",
): WorkflowState {
  if (state.completed) return state;

  const current = STAGES[state.activeIndex];
  const phases = { ...state.phases, [current.id]: "passed" as const };

  if (state.activeIndex === STAGES.length - 1) {
    return {
      ...state,
      phases,
      selectedStage: current.id,
      completed: true,
      announcement: `${actionLabel}: Review passed. Cycle ${state.cycle} is complete.`,
    };
  }

  const nextIndex = state.activeIndex + 1;
  const next = STAGES[nextIndex];
  phases[next.id] = "active";

  return {
    ...state,
    activeIndex: nextIndex,
    selectedStage: next.id,
    phases,
    announcement: `${actionLabel}: ${current.name} passed. ${next.name} is now active.`,
  };
}

export function workflowReducer(
  state: WorkflowState,
  action: WorkflowAction,
): WorkflowState {
  switch (action.type) {
    case "select": {
      const stage = STAGES.find(({ id }) => id === action.stageId);
      if (!stage) return state;
      return {
        ...state,
        selectedStage: action.stageId,
        announcement: `${stage.name} selected for inspection.`,
      };
    }
    case "advance":
      return passCurrentStage(state, "Advanced");
    case "succeed":
      return passCurrentStage(state, "Success simulated");
    case "fail": {
      if (state.completed) return state;
      const current = STAGES[state.activeIndex];
      return {
        ...state,
        selectedStage: current.id,
        phases: { ...state.phases, [current.id]: "failed" },
        announcement: `Failure simulated: ${current.name} is blocked. Resolve the signal, then retry.`,
      };
    }
    case "reset": {
      const nextCycle = state.completed ? state.cycle + 1 : state.cycle;
      return {
        ...createInitialWorkflow(nextCycle),
        announcement: `Cycle ${nextCycle} reset. Plan is active again.`,
      };
    }
  }
}

export function getPassedCount(state: WorkflowState): number {
  return Object.values(state.phases).filter((phase) => phase === "passed")
    .length;
}

export function getActiveStage(state: WorkflowState): Stage {
  return STAGES[state.activeIndex];
}
