import {
  emptyPlan,
  type Assignment,
  type DaySummary,
  type Plan,
  type Task,
  type TaskInput,
  type Weekday,
  weekdays,
} from './types'

export const validateTaskInput = (input: TaskInput): string | null => {
  if (!input.title.trim()) return 'Enter a task title.'
  if (
    !Number.isFinite(input.effortMinutes) ||
    !Number.isInteger(input.effortMinutes) ||
    input.effortMinutes <= 0
  ) {
    return 'Effort must be a positive whole number of minutes.'
  }
  return null
}

export const validateCapacity = (minutes: number): string | null => {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440)
    return 'Capacity must be a whole number from 0 to 1440 minutes.'
  return null
}

export const addTask = (plan: Plan, input: TaskInput, id: string): Plan => ({
  ...plan,
  tasks: [
    ...plan.tasks,
    { ...input, title: input.title.trim(), id, completed: false },
  ],
})

export const updateTask = (
  plan: Plan,
  taskId: string,
  input: TaskInput,
): Plan => ({
  ...plan,
  tasks: plan.tasks.map((task) =>
    task.id === taskId
      ? { ...task, ...input, title: input.title.trim() }
      : task,
  ),
})

export const deleteTask = (plan: Plan, taskId: string): Plan => ({
  ...plan,
  tasks: plan.tasks.filter((task) => task.id !== taskId),
})

export const moveTask = (
  plan: Plan,
  taskId: string,
  weekday: Assignment,
): Plan => ({
  ...plan,
  tasks: plan.tasks.map((task) =>
    task.id === taskId ? { ...task, weekday } : task,
  ),
})

export const toggleTask = (plan: Plan, taskId: string): Plan => ({
  ...plan,
  tasks: plan.tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  ),
})

export const setCapacity = (
  plan: Plan,
  weekday: Weekday,
  minutes: number,
): Plan => ({
  ...plan,
  capacities: { ...plan.capacities, [weekday]: minutes },
})

export const tasksFor = (plan: Plan, weekday: Assignment): Task[] =>
  plan.tasks.filter((task) => task.weekday === weekday)

export const daySummary = (plan: Plan, weekday: Weekday): DaySummary => {
  const tasks = tasksFor(plan, weekday)
  const scheduledMinutes = tasks.reduce(
    (total, task) => total + task.effortMinutes,
    0,
  )
  const remainingMinutes = tasks
    .filter((task) => !task.completed)
    .reduce((total, task) => total + task.effortMinutes, 0)
  const capacityMinutes = plan.capacities[weekday]
  return {
    scheduledMinutes,
    remainingMinutes,
    capacityMinutes,
    availableMinutes: Math.max(0, capacityMinutes - scheduledMinutes),
    overCapacityMinutes: Math.max(0, scheduledMinutes - capacityMinutes),
  }
}

export const examplePlan = (): Plan => {
  const plan = emptyPlan()
  return {
    ...plan,
    tasks: [
      {
        id: 'example-brief',
        title: 'Prepare project brief',
        effortMinutes: 360,
        weekday: 'Wednesday',
        completed: false,
      },
      {
        id: 'example-workshop',
        title: 'Run stakeholder workshop',
        effortMinutes: 120,
        weekday: 'Wednesday',
        completed: false,
      },
      {
        id: 'example-backlog',
        title: 'Review next week',
        effortMinutes: 45,
        weekday: null,
        completed: false,
      },
    ],
  }
}

export const isPlanChanged = (plan: Plan): boolean =>
  plan.tasks.length > 0 || weekdays.some((day) => plan.capacities[day] !== 360)
