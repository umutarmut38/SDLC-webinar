import { beforeEach, describe, expect, test } from 'vitest'
import { clearUnreadablePlan, loadPlan, savePlan } from './storage'
import { addTask } from './domain/plan'
import { emptyPlan } from './domain/types'

const validPlan = addTask(
  emptyPlan(),
  { title: 'Persisted task', effortMinutes: 30, weekday: 'Monday' },
  'task-1',
)

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length(): number {
    return this.values.size
  }

  clear(): void {
    this.values.clear()
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

const storage = new MemoryStorage()

beforeEach(() => {
  storage.clear()
})

describe('versioned persistence', () => {
  test('round-trips tasks and capacities without storing derived totals', () => {
    const plan = {
      ...validPlan,
      capacities: { ...validPlan.capacities, Monday: 240 },
    }

    expect(savePlan(plan, storage)).toBeNull()
    expect(loadPlan(storage)).toEqual({
      plan,
      warning: null,
      recoveryRequired: false,
    })
    expect(JSON.parse(storage.getItem('weekplan:v1') ?? '{}')).toEqual({
      version: 1,
      plan,
    })
  })

  test('treats missing data as an ordinary empty state', () => {
    expect(loadPlan(storage)).toEqual({
      plan: null,
      warning: null,
      recoveryRequired: false,
    })
  })

  test('preserves malformed saved data and requests explicit recovery', () => {
    storage.setItem(
      'weekplan:v1',
      JSON.stringify({ version: 1, plan: { tasks: [] } }),
    )

    expect(loadPlan(storage)).toEqual({
      plan: null,
      warning:
        'Saved plan cannot be read. Your existing browser data was left unchanged.',
      recoveryRequired: true,
    })
    expect(storage.getItem('weekplan:v1')).toContain('"tasks":[]')
    expect(clearUnreadablePlan(storage)).toBeNull()
    expect(storage.getItem('weekplan:v1')).toBeNull()
  })

  test('reports malformed JSON without overwriting it', () => {
    storage.setItem('weekplan:v1', '{not-json')

    const result = loadPlan(storage)

    expect(result.recoveryRequired).toBe(true)
    expect(result.warning).toMatch(/existing browser data was left unchanged/)
    expect(storage.getItem('weekplan:v1')).toBe('{not-json')
  })
})

describe('storage failures', () => {
  test('surfaces write failures and leaves existing saved data untouched', () => {
    const storage = {
      getItem: () => JSON.stringify({ version: 1, plan: validPlan }),
      setItem: () => {
        throw new Error('quota exceeded')
      },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 1,
    } satisfies Storage

    expect(savePlan(validPlan, storage)).toBe(
      'Changes could not be saved in this browser. Existing saved data was left unchanged.',
    )
    expect(loadPlan(storage).plan).toEqual(validPlan)
  })

  test('surfaces recovery deletion failures', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {
        throw new Error('blocked')
      },
      clear: () => {},
      key: () => null,
      length: 0,
    } satisfies Storage

    expect(clearUnreadablePlan(storage)).toBe(
      'The unreadable saved plan could not be cleared.',
    )
  })
})
