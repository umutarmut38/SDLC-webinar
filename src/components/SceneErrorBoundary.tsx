import { Component, type ErrorInfo, type ReactNode } from "react";

interface SceneErrorBoundaryProps {
  children: ReactNode;
  onRetry: () => void;
}

interface SceneErrorBoundaryState {
  failed: boolean;
}

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The 3D scene could not be rendered.", error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="scene-fallback" role="alert">
          <span className="scene-fallback__icon" aria-hidden="true">
            ◇
          </span>
          <h3>3D view paused</h3>
          <p>
            The lifecycle controls and status remain available while the visual
            renderer recovers.
          </p>
          <button
            type="button"
            className="button button--quiet"
            onClick={this.props.onRetry}
          >
            Retry 3D view
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
