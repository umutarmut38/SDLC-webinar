import {
  initialCapacities,
  type Plan,
  type Task,
  type Weekday,
  weekdays,
} from './domain/types'

const storageKey = 'weekplan:v1'
const version = 1
type ReadResult = {
  plan: Plan | null
  warning: string | null
  recoveryRequired: boolean
}

const isWeekday = (value: unknown): value is Weekday =>
  typeof value === 'string' && weekdays.includes(value as Weekday)

const isTask = (value: unknown): value is Task => {
  if (!value || typeof value !== 'object') return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    Number.isInteger(task.effortMinutes) &&
    Number(task.effortMinutes) > 0 &&
    (task.weekday === null || isWeekday(task.weekday)) &&
    typeof task.completed === 'boolean'
  )
}

const isPlan = (value: unknown): value is Plan => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { tasks?: unknown; capacities?: unknown }
  if (
    !Array.isArray(candidate.tasks) ||
    !candidate.tasks.every(isTask) ||
    !candidate.capacities ||
    typeof candidate.capacities !== 'object'
  )
    return false
  const ids = candidate.tasks.map((task) => task.id)
  return (
    ids.every((id) => id.length > 0) &&
    new Set(ids).size === ids.length &&
    weekdays.every(
      (day) =>
        Number.isInteger(
          (candidate.capacities as Record<string, unknown>)[day],
        ) &&
        Number((candidate.capacities as Record<string, unknown>)[day]) >= 0 &&
        Number((candidate.capacities as Record<string, unknown>)[day]) <= 1440,
    )
  )
}

export const loadPlan = (storage?: Storage): ReadResult => {
  try {
    const saved = (storage ?? localStorage).getItem(storageKey)
    if (!saved) return { plan: null, warning: null, recoveryRequired: false }
    const payload: unknown = JSON.parse(saved)
    if (
      !payload ||
      typeof payload !== 'object' ||
      (payload as { version?: unknown }).version !== version ||
      !isPlan((payload as { plan?: unknown }).plan)
    ) {
      return {
        plan: null,
        warning:
          'Saved plan cannot be read. Your existing browser data was left unchanged.',
        recoveryRequired: true,
      }
    }
    return {
      plan: (payload as { plan: Plan }).plan,
      warning: null,
      recoveryRequired: false,
    }
  } catch {
    return {
      plan: null,
      warning:
        'Saved plan cannot be read. Your existing browser data was left unchanged.',
      recoveryRequired: true,
    }
  }
}

export const savePlan = (plan: Plan, storage?: Storage): string | null => {
  try {
    ;(storage ?? localStorage).setItem(
      storageKey,
      JSON.stringify({ version, plan }),
    )
    return null
  } catch {
    return 'Changes could not be saved in this browser. Existing saved data was left unchanged.'
  }
}

export const clearUnreadablePlan = (storage?: Storage): string | null => {
  try {
    ;(storage ?? localStorage).removeItem(storageKey)
    return null
  } catch {
    return 'The unreadable saved plan could not be cleared.'
  }
}

export const defaultPlan = (): Plan => ({
  tasks: [],
  capacities: initialCapacities(),
})
