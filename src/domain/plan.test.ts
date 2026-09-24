import { describe, expect, test } from 'vitest'
import {
  addTask,
  daySummary,
  deleteTask,
  examplePlan,
  isPlanChanged,
  moveTask,
  setCapacity,
  tasksFor,
  toggleTask,
  updateTask,
  validateCapacity,
  validateTaskInput,
} from './plan'
import { emptyPlan } from './types'

describe('task lifecycle and input validation', () => {
  test('rejects blank, non-finite, fractional, and non-positive effort', () => {
    expect(
      validateTaskInput({ title: '   ', effortMinutes: 30, weekday: null }),
    ).toBe('Enter a task title.')
    expect(
      validateTaskInput({
        title: 'Task',
        effortMinutes: Number.NaN,
        weekday: null,
      }),
    ).toBe('Effort must be a positive whole number of minutes.')
    expect(
      validateTaskInput({ title: 'Task', effortMinutes: 1.5, weekday: null }),
    ).toBe('Effort must be a positive whole number of minutes.')
    expect(
      validateTaskInput({ title: 'Task', effortMinutes: 0, weekday: null }),
    ).toBe('Effort must be a positive whole number of minutes.')
    expect(
      validateTaskInput({
        title: 'Task',
        effortMinutes: Number.MAX_SAFE_INTEGER + 1,
        weekday: null,
      }),
    ).toBe('Effort must be a positive whole number of minutes.')
  })

  test('adds, updates, completes, reopens, and deletes a task without changing other tasks', () => {
    const withTask = addTask(
      emptyPlan(),
      { title: '  Focus work  ', effortMinutes: 45, weekday: 'Monday' },
      'task-1',
    )
    expect(withTask.tasks).toEqual([
      {
        id: 'task-1',
        title: 'Focus work',
        effortMinutes: 45,
        weekday: 'Monday',
        completed: false,
      },
    ])

    const updated = updateTask(withTask, 'task-1', {
      title: ' Revised work ',
      effortMinutes: 60,
      weekday: 'Tuesday',
    })
    expect(updated.tasks[0]).toMatchObject({
      title: 'Revised work',
      effortMinutes: 60,
      weekday: 'Tuesday',
      completed: false,
    })

    const completed = toggleTask(updated, 'task-1')
    expect(completed.tasks[0].completed).toBe(true)
    expect(toggleTask(completed, 'task-1').tasks[0].completed).toBe(false)
    expect(deleteTask(completed, 'missing')).toEqual(completed)
    expect(deleteTask(completed, 'task-1').tasks).toEqual([])
  })
})

describe('scheduling, backlog, and capacity summaries', () => {
  test('moves tasks between weekdays and the backlog', () => {
    const plan = addTask(
      emptyPlan(),
      { title: 'Task', effortMinutes: 120, weekday: 'Wednesday' },
      'task-1',
    )
    expect(tasksFor(plan, 'Wednesday')).toHaveLength(1)
    expect(tasksFor(moveTask(plan, 'task-1', null), null)).toHaveLength(1)
    expect(
      tasksFor(moveTask(plan, 'task-1', 'Thursday'), 'Wednesday'),
    ).toHaveLength(0)
  })

  test('keeps completed work scheduled while excluding it from remaining work', () => {
    let plan = emptyPlan()
    plan = addTask(
      plan,
      { title: 'Done', effortMinutes: 120, weekday: 'Thursday' },
      'done',
    )
    plan = addTask(
      plan,
      { title: 'Open', effortMinutes: 60, weekday: 'Thursday' },
      'open',
    )
    plan = toggleTask(plan, 'done')

    expect(daySummary(plan, 'Thursday')).toEqual({
      scheduledMinutes: 180,
      remainingMinutes: 60,
      capacityMinutes: 360,
      availableMinutes: 180,
      overCapacityMinutes: 0,
    })
  })

  test('reports exact capacity boundaries and overload without charging backlog work', () => {
    let plan = emptyPlan()
    plan = setCapacity(plan, 'Wednesday', 0)
    plan = addTask(
      plan,
      { title: 'Scheduled', effortMinutes: 1, weekday: 'Wednesday' },
      'scheduled',
    )
    plan = addTask(
      plan,
      { title: 'Backlog', effortMinutes: 999, weekday: null },
      'backlog',
    )

    expect(daySummary(plan, 'Wednesday')).toMatchObject({
      scheduledMinutes: 1,
      remainingMinutes: 1,
      capacityMinutes: 0,
      availableMinutes: 0,
      overCapacityMinutes: 1,
    })
    expect(daySummary(plan, 'Thursday')).toMatchObject({
      scheduledMinutes: 0,
      availableMinutes: 360,
      overCapacityMinutes: 0,
    })
    expect(daySummary(plan, 'Wednesday').scheduledMinutes).not.toBe(1000)
  })

  test('accepts capacities from zero through 1440 only as whole minutes', () => {
    expect(validateCapacity(0)).toBeNull()
    expect(validateCapacity(1440)).toBeNull()
    expect(validateCapacity(-1)).toBe(
      'Capacity must be a whole number from 0 to 1440 minutes.',
    )
    expect(validateCapacity(1441)).toBe(
      'Capacity must be a whole number from 0 to 1440 minutes.',
    )
    expect(validateCapacity(30.5)).toBe(
      'Capacity must be a whole number from 0 to 1440 minutes.',
    )
  })
})

describe('example replacement state', () => {
  test('provides deterministic overloaded Wednesday data and marks an empty plan as unchanged', () => {
    const plan = examplePlan()
    expect(isPlanChanged(emptyPlan())).toBe(false)
    expect(isPlanChanged(plan)).toBe(true)
    expect(plan.tasks).toHaveLength(3)
    expect(daySummary(plan, 'Wednesday')).toMatchObject({
      scheduledMinutes: 480,
      remainingMinutes: 480,
      capacityMinutes: 360,
      overCapacityMinutes: 120,
    })
    expect(tasksFor(plan, null)).toEqual([
      {
        id: 'example-backlog',
        title: 'Review next week',
        effortMinutes: 45,
        weekday: null,
        completed: false,
      },
    ])
  })
})
