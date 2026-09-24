import { useMemo, useState } from 'react'
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
} from './domain/plan'
import {
  emptyPlan,
  weekdays,
  type Assignment,
  type Plan,
  type Task,
  type TaskInput,
  type Weekday,
} from './domain/types'
import { clearUnreadablePlan, loadPlan, savePlan } from './storage'

type TaskDraft = {
  title: string
  effortMinutes: string
  weekday: Assignment
}

type Notice = {
  kind: 'success' | 'warning' | 'error'
  message: string
}

const blankTaskDraft = (): TaskDraft => ({
  title: '',
  effortMinutes: '',
  weekday: null,
})

const formatHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes}m`
  if (!remainingMinutes) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

const taskInputFromDraft = (draft: TaskDraft): TaskInput => ({
  title: draft.title,
  effortMinutes: Number(draft.effortMinutes),
  weekday: draft.weekday,
})

const draftFromTask = (task: Task): TaskDraft => ({
  title: task.title,
  effortMinutes: String(task.effortMinutes),
  weekday: task.weekday,
})

const taskId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    return crypto.randomUUID()
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function App() {
  const initialRead = useMemo(() => loadPlan(), [])
  const [plan, setPlan] = useState<Plan>(initialRead.plan ?? emptyPlan())
  const [notice, setNotice] = useState<Notice | null>(
    initialRead.warning
      ? { kind: 'warning', message: initialRead.warning }
      : null,
  )
  const [recoveryRequired, setRecoveryRequired] = useState(
    initialRead.recoveryRequired,
  )
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(blankTaskDraft)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingDraft, setEditingDraft] = useState<TaskDraft>(blankTaskDraft)
  const [editingError, setEditingError] = useState<string | null>(null)
  const [capacityDrafts, setCapacityDrafts] = useState<Record<Weekday, string>>(
    () =>
      Object.fromEntries(
        weekdays.map((day) => [
          day,
          String((initialRead.plan ?? emptyPlan()).capacities[day]),
        ]),
      ) as Record<Weekday, string>,
  )
  const [capacityErrors, setCapacityErrors] = useState<
    Partial<Record<Weekday, string>>
  >({})

  const persist = (
    nextPlan: Plan,
    successMessage = 'Saved in this browser.',
  ) => {
    if (recoveryRequired) {
      setNotice({
        kind: 'warning',
        message:
          'Clear unreadable saved data before making changes. Your existing browser data was left unchanged.',
      })
      return
    }
    setPlan(nextPlan)
    setCapacityDrafts(
      Object.fromEntries(
        weekdays.map((day) => [day, String(nextPlan.capacities[day])]),
      ) as Record<Weekday, string>,
    )
    const error = savePlan(nextPlan)
    if (error) {
      setNotice({ kind: 'error', message: error })
      return
    }
    setNotice({ kind: 'success', message: successMessage })
  }

  const handleAddTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = taskInputFromDraft(taskDraft)
    const error = validateTaskInput(input)
    if (error) {
      setTaskError(error)
      return
    }
    persist(
      addTask(plan, input, taskId()),
      'Task added and saved in this browser.',
    )
    setTaskDraft(blankTaskDraft())
    setTaskError(null)
  }

  const beginEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingDraft(draftFromTask(task))
    setEditingError(null)
  }

  const handleEditTask = (
    event: React.FormEvent<HTMLFormElement>,
    taskIdToUpdate: string,
  ) => {
    event.preventDefault()
    const input = taskInputFromDraft(editingDraft)
    const error = validateTaskInput(input)
    if (error) {
      setEditingError(error)
      return
    }
    persist(
      updateTask(plan, taskIdToUpdate, input),
      'Task updated and saved in this browser.',
    )
    setEditingTaskId(null)
    setEditingError(null)
  }

  const handleCapacityChange = (day: Weekday, value: string) => {
    setCapacityDrafts((current) => ({ ...current, [day]: value }))
    if (value === '') {
      setCapacityErrors((current) => ({
        ...current,
        [day]: 'Enter a capacity from 0 to 1440 minutes.',
      }))
      return
    }
    const minutes = Number(value)
    const error = validateCapacity(minutes)
    if (error) {
      setCapacityErrors((current) => ({ ...current, [day]: error }))
      return
    }
    setCapacityErrors((current) => ({ ...current, [day]: undefined }))
    persist(
      setCapacity(plan, day, minutes),
      `${day} capacity saved in this browser.`,
    )
  }

  const handleLoadExample = () => {
    if (
      isPlanChanged(plan) &&
      !window.confirm('Replace your current plan with the example week?')
    )
      return
    persist(examplePlan(), 'Example week loaded and saved in this browser.')
  }

  const handleRecover = () => {
    const error = clearUnreadablePlan()
    if (error) {
      setNotice({ kind: 'error', message: error })
      return
    }
    setRecoveryRequired(false)
    setNotice({
      kind: 'success',
      message:
        'Unreadable saved data cleared. Your new plan can be saved safely.',
    })
  }

  const handleMoveTask = (task: Task, weekday: Assignment) => {
    persist(
      moveTask(plan, task.id, weekday),
      `${task.title} moved and saved in this browser.`,
    )
  }

  const handleDeleteTask = (task: Task) => {
    persist(
      deleteTask(plan, task.id),
      `${task.title} deleted and saved in this browser.`,
    )
  }

  const scheduledMinutes = plan.tasks.reduce(
    (total, task) => total + (task.weekday ? task.effortMinutes : 0),
    0,
  )
  const remainingMinutes = plan.tasks.reduce(
    (total, task) =>
      total + (task.weekday && !task.completed ? task.effortMinutes : 0),
    0,
  )

  return (
    <main className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">WeekPlan</p>
          <h1>Make the week fit.</h1>
          <p className="lede">
            A calm, practical place to balance your workweek. Your plan is saved
            only in this browser.
          </p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={handleLoadExample}
        >
          Load example week
        </button>
      </header>

      {notice && (
        <div
          className={`notice notice-${notice.kind}`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          <strong>
            {notice.kind === 'success'
              ? 'Saved'
              : notice.kind === 'warning'
                ? 'Needs attention'
                : 'Could not save'}
          </strong>
          <span>{notice.message}</span>
          {recoveryRequired && (
            <button
              type="button"
              className="text-button"
              onClick={handleRecover}
            >
              Clear unreadable saved data
            </button>
          )}
        </div>
      )}

      <section className="overview" aria-labelledby="overview-title">
        <div>
          <p className="section-kicker">This week</p>
          <h2 id="overview-title">A clear view of your workload</h2>
        </div>
        <dl className="overview-stats">
          <div>
            <dt>Scheduled</dt>
            <dd>{formatHours(scheduledMinutes)}</dd>
          </div>
          <div>
            <dt>Remaining work</dt>
            <dd>{formatHours(remainingMinutes)}</dd>
          </div>
          <div>
            <dt>Total tasks</dt>
            <dd>{plan.tasks.length}</dd>
          </div>
        </dl>
      </section>

      <section className="add-card" aria-labelledby="add-task-title">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Capture the work</p>
            <h2 id="add-task-title">Add a task</h2>
          </div>
          <span className="required-note">
            All fields marked * are required
          </span>
        </div>
        <form className="task-form" onSubmit={handleAddTask} noValidate>
          <label>
            <span>
              Task title <span aria-hidden="true">*</span>
            </span>
            <input
              type="text"
              value={taskDraft.title}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              aria-invalid={Boolean(taskError && !taskDraft.title.trim())}
              placeholder="e.g. Draft project brief"
            />
          </label>
          <label>
            <span>
              Effort (minutes) <span aria-hidden="true">*</span>
            </span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={taskDraft.effortMinutes}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  effortMinutes: event.target.value,
                }))
              }
              aria-invalid={Boolean(taskError)}
              placeholder="60"
            />
          </label>
          <label>
            <span>Schedule</span>
            <DaySelect
              value={taskDraft.weekday}
              onChange={(weekday) =>
                setTaskDraft((current) => ({ ...current, weekday }))
              }
            />
          </label>
          <button className="primary-button" type="submit">
            Add task
          </button>
        </form>
        {taskError && (
          <p className="inline-error" role="alert">
            {taskError}
          </p>
        )}
      </section>

      <section className="week-section" aria-labelledby="week-title">
        <div className="section-title-row">
          <div>
            <p className="section-kicker">Plan by day</p>
            <h2 id="week-title">Your workweek</h2>
          </div>
          <p className="muted-copy">
            Scheduled effort includes completed tasks.
          </p>
        </div>
        <div className="week-grid">
          {weekdays.map((day) => (
            <DayPanel
              key={day}
              day={day}
              plan={plan}
              capacity={capacityDrafts[day]}
              capacityError={capacityErrors[day]}
              onCapacityChange={handleCapacityChange}
              onMove={handleMoveTask}
              onToggle={(task) =>
                persist(
                  toggleTask(plan, task.id),
                  `${task.title} status saved in this browser.`,
                )
              }
              onEdit={beginEdit}
              onDelete={handleDeleteTask}
              editingTaskId={editingTaskId}
              editingDraft={editingDraft}
              editingError={editingError}
              onEditingDraftChange={setEditingDraft}
              onEditSubmit={handleEditTask}
              onCancelEdit={() => setEditingTaskId(null)}
            />
          ))}
        </div>
      </section>

      <Backlog
        plan={plan}
        onMove={handleMoveTask}
        onToggle={(task) =>
          persist(
            toggleTask(plan, task.id),
            `${task.title} status saved in this browser.`,
          )
        }
        onEdit={beginEdit}
        onDelete={handleDeleteTask}
        editingTaskId={editingTaskId}
        editingDraft={editingDraft}
        editingError={editingError}
        onEditingDraftChange={setEditingDraft}
        onEditSubmit={handleEditTask}
        onCancelEdit={() => setEditingTaskId(null)}
      />
    </main>
  )
}

type DayPanelProps = {
  day: Weekday
  plan: Plan
  capacity: string
  capacityError?: string
  onCapacityChange: (day: Weekday, value: string) => void
  onMove: (task: Task, weekday: Assignment) => void
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  editingTaskId: string | null
  editingDraft: TaskDraft
  editingError: string | null
  onEditingDraftChange: (draft: TaskDraft) => void
  onEditSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    taskId: string,
  ) => void
  onCancelEdit: () => void
}

function DayPanel(props: DayPanelProps) {
  const summary = daySummary(props.plan, props.day)
  const tasks = tasksFor(props.plan, props.day)
  return (
    <article
      className={`day-panel ${summary.overCapacityMinutes ? 'is-overloaded' : ''}`}
    >
      <div className="day-heading">
        <div>
          <h3>{props.day}</h3>
          <p>
            {tasks.length
              ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`
              : 'Open day'}
          </p>
        </div>
        <label className="capacity-field">
          <span>{props.day} capacity</span>
          <span className="capacity-input">
            <input
              type="number"
              min="0"
              max="1440"
              step="1"
              inputMode="numeric"
              value={props.capacity}
              onChange={(event) =>
                props.onCapacityChange(props.day, event.target.value)
              }
              aria-describedby={`${props.day}-capacity-help`}
              aria-invalid={Boolean(props.capacityError)}
            />
            <span>min</span>
          </span>
        </label>
      </div>
      <p id={`${props.day}-capacity-help`} className="field-help">
        0–1440 whole minutes
      </p>
      {props.capacityError && (
        <p className="inline-error" role="alert">
          {props.capacityError}
        </p>
      )}
      <Summary summary={summary} />
      {summary.overCapacityMinutes > 0 && (
        <p className="overload-message" role="status">
          Over capacity by {formatHours(summary.overCapacityMinutes)}. Move or
          shorten a task.
        </p>
      )}
      <div className="task-list">
        {tasks.length ? (
          tasks.map((task) => <TaskItem key={task.id} task={task} {...props} />)
        ) : (
          <EmptyState text="No tasks scheduled here yet." />
        )}
      </div>
    </article>
  )
}

function Backlog({
  plan,
  ...props
}: Omit<
  DayPanelProps,
  'day' | 'plan' | 'capacity' | 'capacityError' | 'onCapacityChange'
> & { plan: Plan }) {
  const tasks = tasksFor(plan, null)
  return (
    <section className="backlog-section" aria-labelledby="backlog-title">
      <div className="section-title-row">
        <div>
          <p className="section-kicker">Not scheduled yet</p>
          <h2 id="backlog-title">Backlog</h2>
        </div>
        <p className="muted-copy">Backlog effort does not use day capacity.</p>
      </div>
      <div className="backlog-card">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} plan={plan} {...props} />
          ))
        ) : (
          <EmptyState text="Your backlog is clear." />
        )}
      </div>
    </section>
  )
}

type TaskItemProps = {
  task: Task
  plan: Plan
  onMove: (task: Task, weekday: Assignment) => void
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  editingTaskId: string | null
  editingDraft: TaskDraft
  editingError: string | null
  onEditingDraftChange: (draft: TaskDraft) => void
  onEditSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    taskId: string,
  ) => void
  onCancelEdit: () => void
}

function TaskItem({
  task,
  onMove,
  onToggle,
  onEdit,
  onDelete,
  editingTaskId,
  editingDraft,
  editingError,
  onEditingDraftChange,
  onEditSubmit,
  onCancelEdit,
}: TaskItemProps) {
  if (editingTaskId === task.id) {
    return (
      <form
        className="edit-task-form"
        onSubmit={(event) => onEditSubmit(event, task.id)}
        noValidate
      >
        <label>
          <span>Task title</span>
          <input
            type="text"
            value={editingDraft.title}
            onChange={(event) =>
              onEditingDraftChange({
                ...editingDraft,
                title: event.target.value,
              })
            }
          />
        </label>
        <label>
          <span>Effort (minutes)</span>
          <input
            type="number"
            min="1"
            step="1"
            value={editingDraft.effortMinutes}
            onChange={(event) =>
              onEditingDraftChange({
                ...editingDraft,
                effortMinutes: event.target.value,
              })
            }
          />
        </label>
        <label>
          <span>Schedule</span>
          <DaySelect
            value={editingDraft.weekday}
            onChange={(weekday) =>
              onEditingDraftChange({ ...editingDraft, weekday })
            }
          />
        </label>
        {editingError && (
          <p className="inline-error" role="alert">
            {editingError}
          </p>
        )}
        <div className="button-row">
          <button className="primary-button small-button" type="submit">
            Save changes
          </button>
          <button className="quiet-button" type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className={`task-item ${task.completed ? 'is-complete' : ''}`}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
        />
        <span className="checkmark" aria-hidden="true" />
        <span className="task-title">{task.title}</span>
      </label>
      <span className="task-effort">{formatHours(task.effortMinutes)}</span>
      <div className="task-actions">
        <label className="visually-compact">
          <span>Move {task.title}</span>
          <DaySelect
            value={task.weekday}
            onChange={(weekday) => onMove(task, weekday)}
          />
        </label>
        <button
          className="quiet-button"
          type="button"
          onClick={() => onEdit(task)}
        >
          Edit {task.title}
        </button>
        <button
          className="quiet-button danger-button"
          type="button"
          onClick={() => onDelete(task)}
        >
          Delete {task.title}
        </button>
      </div>
    </div>
  )
}

function DaySelect({
  value,
  onChange,
}: {
  value: Assignment
  onChange: (value: Assignment) => void
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(event) => onChange((event.target.value || null) as Assignment)}
    >
      <option value="">Backlog</option>
      {weekdays.map((day) => (
        <option key={day} value={day}>
          {day}
        </option>
      ))}
    </select>
  )
}

function Summary({ summary }: { summary: ReturnType<typeof daySummary> }) {
  return (
    <dl className="day-summary">
      <div>
        <dt>Scheduled</dt>
        <dd>{formatHours(summary.scheduledMinutes)}</dd>
      </div>
      <div>
        <dt>Remaining</dt>
        <dd>{formatHours(summary.remainingMinutes)}</dd>
      </div>
      <div>
        <dt>Available</dt>
        <dd>{formatHours(summary.availableMinutes)}</dd>
      </div>
    </dl>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="empty-state">{text}</p>
}

export default App
