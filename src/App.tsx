import './App.css'

const deploymentStages = ['Plan', 'Build', 'Validate', 'Deploy']

export default function App() {
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
    </main>
  )
}
