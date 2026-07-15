import { useState } from 'react'
import './App.css'

const deploymentStages = ['Plan', 'Build', 'Validate', 'Deploy']

export default function App() {
  const [probePassed, setProbePassed] = useState(false)

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Codex agentic SDLC webinar</p>
        <h1 id="page-title">3D Cloud Deployment Visualizer</h1>
        <p className="intro">
          The reliable demo environment is ready. The interactive 3D experience
          will be built live on a feature branch.
        </p>
      </section>

      <section
        className="visualization-placeholder"
        data-testid="visualization-root"
        aria-label="Visualization placeholder"
      >
        <div className="placeholder-orbit" aria-hidden="true">
          <span />
        </div>
        <p>3D scene placeholder</p>
      </section>

      <section className="controls" aria-labelledby="stage-title">
        <h2 id="stage-title">Deployment stages</h2>
        <div className="stage-list" role="group" aria-label="Deployment stages">
          {deploymentStages.map((stage) => (
            <button type="button" key={stage} disabled>
              {stage}
            </button>
          ))}
        </div>
        <p className="status">
          Live feature implementation intentionally pending.
        </p>
      </section>

      <section className="integration-probe" aria-labelledby="probe-title">
        <div>
          <p className="probe-label">End-to-end rehearsal</p>
          <h2 id="probe-title">Delivery probe</h2>
          <p className="probe-copy">
            Exercise one deterministic interaction locally, in CI, and against
            the deployed demo URL.
          </p>
        </div>
        <div className="probe-action">
          <button
            type="button"
            onClick={() => setProbePassed(true)}
            disabled={probePassed}
          >
            {probePassed ? 'Probe passed' : 'Run delivery probe'}
          </button>
          <p
            className={`probe-status${probePassed ? ' is-passed' : ''}`}
            role="status"
            aria-live="polite"
            data-testid="delivery-probe-status"
          >
            {probePassed
              ? 'Delivery probe passed. This build is ready for remote verification.'
              : 'Delivery probe ready.'}
          </p>
        </div>
      </section>
    </main>
  )
}
