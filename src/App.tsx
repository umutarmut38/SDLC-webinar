import { lazy, Suspense, useReducer, type CSSProperties } from "react";
import { useReducedMotion } from "./hooks/useReducedMotion";
import {
  STAGES,
  createInitialWorkflow,
  getActiveStage,
  getPassedCount,
  workflowReducer,
  type StagePhase,
} from "./workflow";
import "./styles.css";

const SceneViewport = lazy(async () => {
  const sceneModule = await import("./components/SceneViewport");
  return { default: sceneModule.SceneViewport };
});

const phaseLabel: Record<StagePhase, string> = {
  waiting: "Waiting",
  active: "Active",
  passed: "Passed",
  failed: "Blocked",
};

export default function App() {
  const [state, dispatch] = useReducer(workflowReducer, undefined, () =>
    createInitialWorkflow(),
  );
  const reducedMotion = useReducedMotion();
  const activeStage = getActiveStage(state);
  const selectedStage =
    STAGES.find(({ id }) => id === state.selectedStage) ?? STAGES[0];
  const passedCount = getPassedCount(state);
  const currentFailed = state.phases[activeStage.id] === "failed";
  const progress = (passedCount / STAGES.length) * 100;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#controls">
        Skip to lifecycle controls
      </a>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="SDLC Loop home">
          <span className="brand__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>SDLC LOOP</span>
        </a>
        <div className="topbar__meta">
          <span className="signal-dot" aria-hidden="true" />
          Interactive system map
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero__eyebrow">
            <span>Cycle {String(state.cycle).padStart(2, "0")}</span>
            <span aria-hidden="true">/</span>
            <span>Five connected gates</span>
          </div>
          <div className="hero__title-row">
            <div>
              <h1 id="page-title">
                Ship with <em>signal.</em>
              </h1>
              <p className="hero__intro">
                Explore the software delivery loop, pressure-test each gate, and
                see how evidence moves an idea toward review.
              </p>
            </div>
            <div
              className="cycle-badge"
              aria-label={`${passedCount} of 5 stages passed`}
            >
              <span className="cycle-badge__value">{passedCount}</span>
              <span className="cycle-badge__divider" aria-hidden="true" />
              <span className="cycle-badge__total">05</span>
              <span className="cycle-badge__label">gates passed</span>
            </div>
          </div>
        </section>

        <section
          className="experience"
          aria-label="Interactive SDLC experience"
        >
          <figure className="visualizer" aria-labelledby="visualizer-caption">
            <figcaption id="visualizer-caption" className="visualizer__caption">
              <span>Live topology</span>
              <span className="visualizer__hint">
                <span aria-hidden="true">◆</span> Select a gate below or in 3D
              </span>
            </figcaption>
            <Suspense
              fallback={
                <div className="scene-viewport">
                  <div className="scene-loading" role="status">
                    <span className="scene-loading__pulse" aria-hidden="true" />
                    Loading the 3D renderer…
                  </div>
                </div>
              }
            >
              <SceneViewport
                phases={state.phases}
                selectedStage={state.selectedStage}
                activeIndex={state.activeIndex}
                completed={state.completed}
                reducedMotion={reducedMotion}
                onSelect={(stageId) => dispatch({ type: "select", stageId })}
              />
            </Suspense>
            <div className="visualizer__legend" aria-hidden="true">
              <span>
                <i className="legend-dot legend-dot--active" /> Active
              </span>
              <span>
                <i className="legend-dot legend-dot--passed" /> Passed
              </span>
              <span>
                <i className="legend-dot legend-dot--blocked" /> Blocked
              </span>
            </div>
          </figure>

          <aside
            className="control-panel"
            id="controls"
            tabIndex={-1}
            aria-labelledby="controls-title"
          >
            <div className="panel-heading">
              <span className="panel-heading__index">CTRL / 01</span>
              <h2 id="controls-title">Drive the loop</h2>
              <p>
                Move the active gate forward or inject a signal to inspect
                recovery.
              </p>
            </div>

            <section
              className={`status-card ${currentFailed ? "status-card--failed" : ""}`}
              aria-labelledby="loop-status-heading"
            >
              <div className="status-card__topline">
                <h3 id="loop-status-heading">
                  {state.completed
                    ? "Cycle complete"
                    : `${activeStage.name} in focus`}
                </h3>
                <span>{passedCount}/5</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Lifecycle progress"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={passedCount}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              <p className="status-card__message">
                {state.completed
                  ? "All five gates passed. Reset when you are ready to begin the next learning cycle."
                  : currentFailed
                    ? `${activeStage.name} is blocked. A successful retry will clear the signal and advance the loop.`
                    : `${activeStage.name} is active. Choose an outcome or advance with the current evidence.`}
              </p>
              {currentFailed && (
                <p className="failure-signal" role="alert">
                  <span aria-hidden="true">!</span> Failure signal at{" "}
                  {activeStage.name}
                </p>
              )}
            </section>

            <div className="action-grid" aria-label="Simulation actions">
              <button
                type="button"
                className="button button--primary"
                disabled={state.completed}
                onClick={() => dispatch({ type: "advance" })}
              >
                <span>Advance stage</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="button button--success"
                disabled={state.completed}
                onClick={() => dispatch({ type: "succeed" })}
              >
                <span className="button__glyph" aria-hidden="true">
                  ✓
                </span>
                Simulate success
              </button>
              <button
                type="button"
                className="button button--failure"
                disabled={state.completed}
                onClick={() => dispatch({ type: "fail" })}
              >
                <span className="button__glyph" aria-hidden="true">
                  ×
                </span>
                Simulate failure
              </button>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => dispatch({ type: "reset" })}
              >
                <span className="button__glyph" aria-hidden="true">
                  ↺
                </span>
                Reset loop
              </button>
            </div>

            <p className="motion-note">
              <span className="motion-note__icon" aria-hidden="true">
                ◎
              </span>
              {reducedMotion
                ? "Reduced motion is active — the 3D loop is held steady."
                : "Motion follows your system preference."}
            </p>
          </aside>
        </section>

        <nav className="stage-rail" aria-label="SDLC stages">
          {STAGES.map((stage) => {
            const phase = state.phases[stage.id];
            const selected = state.selectedStage === stage.id;
            return (
              <button
                type="button"
                key={stage.id}
                className={`stage-tab stage-tab--${phase}`}
                aria-label={`${stage.shortLabel} ${stage.name}, ${phaseLabel[phase]}`}
                aria-pressed={selected}
                aria-current={phase === "active" ? "step" : undefined}
                style={{ "--stage-accent": stage.color } as CSSProperties}
                onClick={() => dispatch({ type: "select", stageId: stage.id })}
              >
                <span className="stage-tab__number">{stage.shortLabel}</span>
                <span className="stage-tab__copy">
                  <strong>{stage.name}</strong>
                  <span>{phaseLabel[phase]}</span>
                </span>
                <span className="stage-tab__state" aria-hidden="true">
                  {phase === "passed" ? "✓" : phase === "failed" ? "!" : "•"}
                </span>
              </button>
            );
          })}
        </nav>

        <section
          className="stage-detail"
          aria-labelledby="stage-detail-title"
          style={{ "--stage-accent": selectedStage.color } as CSSProperties}
        >
          <div className="stage-detail__identity">
            <span className="stage-detail__number">
              {selectedStage.shortLabel}
            </span>
            <div>
              <span className="stage-detail__kicker">Selected gate</span>
              <h2 id="stage-detail-title">{selectedStage.name}</h2>
            </div>
          </div>
          <p className="stage-detail__description">
            {selectedStage.description}
          </p>
          <div className="stage-detail__meta">
            <div>
              <span>Evidence</span>
              <p>{selectedStage.artifact}</p>
            </div>
            <div>
              <span>Ask</span>
              <p>{selectedStage.prompt}</p>
            </div>
          </div>
        </section>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {state.announcement}
        </p>
      </main>

      <footer className="footer">
        <span>PLAN → CODE → TEST → CI → REVIEW → REPEAT</span>
        <span>Accessible by design · Deterministic by default</span>
      </footer>
    </div>
  );
}
