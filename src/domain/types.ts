export const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const

export type Weekday = (typeof weekdays)[number]
export type Assignment = Weekday | null

export interface Task {
  id: string
  title: string
  effortMinutes: number
  weekday: Assignment
  completed: boolean
}

export type Capacities = Record<Weekday, number>

export interface Plan {
  tasks: Task[]
  capacities: Capacities
}

export interface TaskInput {
  title: string
  effortMinutes: number
  weekday: Assignment
}

export interface DaySummary {
  scheduledMinutes: number
  remainingMinutes: number
  capacityMinutes: number
  availableMinutes: number
  overCapacityMinutes: number
}

export const initialCapacities = (): Capacities =>
  Object.fromEntries(weekdays.map((day) => [day, 360])) as Capacities

export const emptyPlan = (): Plan => ({
  tasks: [],
  capacities: initialCapacities(),
})
