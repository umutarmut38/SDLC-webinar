import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  WEEKDAYS,
  formatMinutes,
  summarizeDay,
  type Task,
  type Weekday,
} from "./domain";
import {
  createWeekPlanController,
  type WeekPlanController,
} from "./controller";

interface AppProps {
  controller?: WeekPlanController;
}

interface TaskFormProps {
  initialTask?: Task;
  disabled: boolean;
  onCancel?: () => void;
  onSubmit: (input: {
    title: string;
    effortMinutes: string;
    weekday: Weekday | null;
  }) => Record<string, string>;
}

function TaskForm({
  initialTask,
  disabled,
  onCancel,
  onSubmit,
}: TaskFormProps) {
  const formId = useId();
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [effortMinutes, setEffortMinutes] = useState(
    initialTask ? String(initialTask.effortMinutes) : "",
  );
  const [weekday, setWeekday] = useState<Weekday | null>(
    initialTask?.weekday ?? null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = onSubmit({ title, effortMinutes, weekday });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0 && !initialTask) {
      setTitle("");
      setEffortMinutes("");
      setWeekday(null);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={`${formId}-title`}>Task title</label>
        <input
          id={`${formId}-title`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-describedby={errors.title ? `${formId}-title-error` : undefined}
          aria-invalid={Boolean(errors.title)}
          disabled={disabled}
        />
        {errors.title && (
          <p className="field-error" id={`${formId}-title-error`}>
            {errors.title}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor={`${formId}-effort`}>Effort in minutes</label>
        <input
          id={`${formId}-effort`}
          inputMode="numeric"
          value={effortMinutes}
          onChange={(event) => setEffortMinutes(event.target.value)}
          aria-describedby={
            errors.effortMinutes ? `${formId}-effort-error` : undefined
          }
          aria-invalid={Boolean(errors.effortMinutes)}
          disabled={disabled}
        />
        {errors.effortMinutes && (
          <p className="field-error" id={`${formId}-effort-error`}>
            {errors.effortMinutes}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor={`${formId}-weekday`}>Schedule</label>
        <select
          id={`${formId}-weekday`}
          value={weekday ?? ""}
          onChange={(event) =>
            setWeekday((event.target.value || null) as Weekday | null)
          }
          disabled={disabled}
        >
          <option value="">Backlog</option>
          {WEEKDAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={disabled}>
          {initialTask ? "Save task" : "Add task"}
        </button>
        {onCancel && (
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

interface TaskCardProps {
  task: Task;
  controller: WeekPlanController;
  disabled: boolean;
  editing: boolean;
  onEdit: () => void;
  onStopEditing: () => void;
}

function TaskCard({
  task,
  controller,
  disabled,
  editing,
  onEdit,
  onStopEditing,
}: TaskCardProps) {
  if (editing) {
    return (
      <li className="task-card">
        <h4>Edit {task.title}</h4>
        <TaskForm
          initialTask={task}
          disabled={disabled}
          onCancel={onStopEditing}
          onSubmit={(input) => {
            const result = controller.updateTask(task.id, input);
            if (result.value) onStopEditing();
            return result.errors;
          }}
        />
      </li>
    );
  }

  return (
    <li className={`task-card ${task.completed ? "task-completed" : ""}`}>
      <div className="task-heading">
        <h4>{task.title}</h4>
        <span>{formatMinutes(task.effortMinutes)}</span>
      </div>
      <p className="task-state">
        {task.completed ? "Completed" : "Remaining work"}
      </p>
      <div className="field compact-field">
        <label htmlFor={`assign-${task.id}`}>Assign {task.title}</label>
        <select
          id={`assign-${task.id}`}
          value={task.weekday ?? ""}
          onChange={(event) =>
            controller.assignTask(
              task.id,
              (event.target.value || null) as Weekday | null,
            )
          }
          disabled={disabled}
        >
          <option value="">Backlog</option>
          {WEEKDAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="task-actions">
        <button
          type="button"
          className="button-secondary"
          aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
          onClick={() => controller.toggleTask(task.id)}
          disabled={disabled}
        >
          {task.completed ? "Reopen" : "Complete"}
        </button>
        <button
          type="button"
          className="button-secondary"
          aria-label={`Edit ${task.title}`}
          onClick={onEdit}
          disabled={disabled}
        >
          Edit
        </button>
        <button
          type="button"
          className="button-danger"
          aria-label={`Delete ${task.title}`}
          onClick={() => controller.deleteTask(task.id)}
          disabled={disabled}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

interface TaskListProps {
  tasks: Task[];
  emptyMessage: string;
  controller: WeekPlanController;
  disabled: boolean;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
}

function TaskList({
  tasks,
  emptyMessage,
  controller,
  disabled,
  editingTaskId,
  setEditingTaskId,
}: TaskListProps) {
  if (tasks.length === 0) return <p className="empty-state">{emptyMessage}</p>;

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          controller={controller}
          disabled={disabled}
          editing={editingTaskId === task.id}
          onEdit={() => setEditingTaskId(task.id)}
          onStopEditing={() => setEditingTaskId(null)}
        />
      ))}
    </ul>
  );
}

interface CapacityFormProps {
  weekday: Weekday;
  capacityMinutes: number;
  disabled: boolean;
  error?: string;
  onSave: (value: string) => void;
}

function CapacityForm({
  weekday,
  capacityMinutes,
  disabled,
  error,
  onSave,
}: CapacityFormProps) {
  const [draft, setDraft] = useState(String(capacityMinutes));

  useEffect(() => {
    setDraft(String(capacityMinutes));
  }, [capacityMinutes]);

  return (
    <form
      className="capacity-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
      noValidate
    >
      <div className="field compact-field">
        <label htmlFor={`capacity-${weekday}`}>
          {weekday} capacity in minutes
        </label>
        <input
          id={`capacity-${weekday}`}
          inputMode="numeric"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `capacity-${weekday}-error` : undefined}
          disabled={disabled}
        />
        {error && (
          <p className="field-error" id={`capacity-${weekday}-error`}>
            {error}
          </p>
        )}
      </div>
      <button type="submit" className="button-secondary" disabled={disabled}>
        Save capacity
      </button>
    </form>
  );
}

export function App({ controller: suppliedController }: AppProps) {
  const [controller] = useState(
    () => suppliedController ?? createWeekPlanController(),
  );
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [capacityErrors, setCapacityErrors] = useState<
    Partial<Record<Weekday, string>>
  >({});
  const disabled = !snapshot.editingEnabled;

  function saveCapacity(weekday: Weekday, value: string) {
    const result = controller.setCapacity(weekday, value);
    setCapacityErrors((current) => ({
      ...current,
      [weekday]: result.errors.capacity,
    }));
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">Browser-local weekly planner</p>
          <h1>WeekPlan</h1>
          <p className="hero-copy">
            Balance Monday through Friday without losing sight of unscheduled
            work. Your plan is saved only in this browser.
          </p>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={() => controller.loadExample()}
          disabled={disabled}
        >
          Load example week
        </button>
      </header>

      <section
        className={`storage-status storage-${snapshot.storageStatus.kind}`}
        aria-live="polite"
        aria-label="Storage status"
      >
        <strong>
          {snapshot.storageStatus.kind === "saved"
            ? "Saved locally"
            : snapshot.storageStatus.kind === "not-saved"
              ? "Not saved"
              : "Storage recovery required"}
        </strong>
        <span>{snapshot.storageStatus.message}</span>
        {snapshot.storageStatus.kind !== "saved" && (
          <button
            type="button"
            className="button-secondary"
            onClick={() => controller.retryStorage()}
          >
            Retry storage
          </button>
        )}
        {snapshot.storageStatus.kind === "recovery-required" &&
          snapshot.storageStatus.recovery === "unreadable" && (
            <button
              type="button"
              className="button-danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Discard the unreadable saved plan? This cannot be undone.",
                  )
                ) {
                  controller.discardUnreadable();
                }
              }}
            >
              Discard saved data
            </button>
          )}
      </section>

      <section className="add-panel" aria-labelledby="add-task-heading">
        <div>
          <p className="eyebrow">Capture work</p>
          <h2 id="add-task-heading">Add a task</h2>
        </div>
        <TaskForm
          disabled={disabled}
          onSubmit={(input) => controller.addTask(input).errors}
        />
      </section>

      <section className="week-section" aria-labelledby="workweek-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Monday–Friday</p>
            <h2 id="workweek-heading">Workweek</h2>
          </div>
          <p>Scheduled totals include completed tasks.</p>
        </div>
        <div className="week-grid">
          {WEEKDAYS.map((weekday) => {
            const summary = summarizeDay(snapshot.plan, weekday);
            const tasks = snapshot.plan.tasks.filter(
              (task) => task.weekday === weekday,
            );
            return (
              <article className="day-panel" key={weekday}>
                <div className="day-heading">
                  <h3>{weekday}</h3>
                  {summary.overCapacityMinutes > 0 && (
                    <span className="overload-badge">
                      Over by {formatMinutes(summary.overCapacityMinutes)}
                    </span>
                  )}
                </div>
                <dl className="summary-grid">
                  <div>
                    <dt>Scheduled</dt>
                    <dd>{formatMinutes(summary.scheduledMinutes)}</dd>
                  </div>
                  <div>
                    <dt>Remaining work</dt>
                    <dd>{formatMinutes(summary.remainingMinutes)}</dd>
                  </div>
                  <div>
                    <dt>Capacity</dt>
                    <dd>{formatMinutes(summary.capacityMinutes)}</dd>
                  </div>
                  <div>
                    <dt>Available capacity</dt>
                    <dd>{formatMinutes(summary.availableCapacityMinutes)}</dd>
                  </div>
                  <div>
                    <dt>Over capacity</dt>
                    <dd>{formatMinutes(summary.overCapacityMinutes)}</dd>
                  </div>
                </dl>
                <CapacityForm
                  weekday={weekday}
                  capacityMinutes={snapshot.plan.capacities[weekday]}
                  disabled={disabled}
                  error={capacityErrors[weekday]}
                  onSave={(value) => saveCapacity(weekday, value)}
                />
                <TaskList
                  tasks={tasks}
                  emptyMessage={`No tasks scheduled for ${weekday}.`}
                  controller={controller}
                  disabled={disabled}
                  editingTaskId={editingTaskId}
                  setEditingTaskId={setEditingTaskId}
                />
              </article>
            );
          })}
        </div>
      </section>

      <section className="backlog-panel" aria-labelledby="backlog-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Unscheduled</p>
            <h2 id="backlog-heading">Backlog</h2>
          </div>
          <p>Backlog tasks do not consume weekday capacity.</p>
        </div>
        <TaskList
          tasks={snapshot.plan.tasks.filter((task) => task.weekday === null)}
          emptyMessage="The backlog is empty."
          controller={controller}
          disabled={disabled}
          editingTaskId={editingTaskId}
          setEditingTaskId={setEditingTaskId}
        />
      </section>
    </main>
  );
}
