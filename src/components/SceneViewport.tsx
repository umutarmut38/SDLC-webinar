import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import type { StageId, StagePhase } from "../workflow";
import SdlcScene from "./SdlcScene";
import { SceneErrorBoundary } from "./SceneErrorBoundary";

interface SceneViewportProps {
  phases: Record<StageId, StagePhase>;
  selectedStage: StageId;
  activeIndex: number;
  completed: boolean;
  reducedMotion: boolean;
  onSelect: (stageId: StageId) => void;
}

function SceneUnavailable() {
  return (
    <div className="scene-fallback" role="status">
      <span className="scene-fallback__icon" aria-hidden="true">
        ◌
      </span>
      <h3>3D rendering unavailable</h3>
      <p>The accessible lifecycle controls remain fully functional.</p>
    </div>
  );
}

export function SceneViewport(props: SceneViewportProps) {
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);

  return (
    <div className="scene-viewport" data-ready={ready}>
      {!ready && (
        <div className="scene-loading" role="status">
          <span className="scene-loading__pulse" aria-hidden="true" />
          Preparing the 3D loop…
        </div>
      )}
      <SceneErrorBoundary
        key={attempt}
        onRetry={() => {
          setReady(false);
          setAttempt((value) => value + 1);
        }}
      >
        <div aria-hidden="true" className="scene-canvas">
          <Canvas
            dpr={[1, 1.5]}
            frameloop={props.reducedMotion ? "demand" : "always"}
            camera={{ position: [0, 3.7, 11.8], fov: 42, near: 0.1, far: 60 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            fallback={<SceneUnavailable />}
            onCreated={() => setReady(true)}
          >
            <Suspense fallback={null}>
              <SdlcScene {...props} />
            </Suspense>
          </Canvas>
        </div>
      </SceneErrorBoundary>
    </div>
  );
}
