import { Edges, Float, Line, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { STAGES, type StageId, type StagePhase } from "../workflow";
import { StageIcon } from "./StageIcon";

const POSITIONS: Record<StageId, [number, number, number]> = {
  plan: [-4.4, 0.12, 0],
  code: [-2.2, 0.58, 0],
  test: [0, 0.12, 0],
  ci: [2.2, 0.58, 0],
  review: [4.4, 0.12, 0],
};

const phaseColor: Record<StagePhase, string> = {
  waiting: "#334155",
  active: "#f8fafc",
  passed: "#34d399",
  failed: "#fb7185",
};

interface SdlcSceneProps {
  phases: Record<StageId, StagePhase>;
  selectedStage: StageId;
  activeIndex: number;
  completed: boolean;
  reducedMotion: boolean;
  onSelect: (stageId: StageId) => void;
}

interface StageNodeProps {
  stage: (typeof STAGES)[number];
  phase: StagePhase;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: (stageId: StageId) => void;
}

function ResponsiveCamera() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);

  useEffect(() => {
    const narrow = width < 640;
    camera.position.set(0, narrow ? 3.2 : 3.7, narrow ? 14.6 : 11.8);
    camera.updateProjectionMatrix();
  }, [camera, width]);

  return null;
}

function StageNode({
  stage,
  phase,
  selected,
  reducedMotion,
  onSelect,
}: StageNodeProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const targetScale = selected ? 1.13 : hovered ? 1.06 : 1;

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const scale = THREE.MathUtils.damp(
      group.current.scale.x,
      targetScale,
      8,
      delta,
    );
    group.current.scale.setScalar(scale);
    if (!reducedMotion && phase === "active") {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 1.25) * 0.08;
    }
  });

  const statusColor = phaseColor[phase];

  return (
    <group
      ref={group}
      position={POSITIONS[stage.id]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(stage.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <Float
        enabled={!reducedMotion}
        speed={phase === "active" ? 1.6 : 0.8}
        rotationIntensity={0.06}
        floatIntensity={phase === "active" ? 0.26 : 0.12}
      >
        <RoundedBox args={[1.48, 0.3, 1.2]} radius={0.16} smoothness={4}>
          <meshStandardMaterial
            color={selected ? stage.glow : "#111c2d"}
            emissive={stage.glow}
            emissiveIntensity={
              selected ? 0.42 : phase === "active" ? 0.22 : 0.06
            }
            metalness={0.35}
            roughness={0.34}
          />
          <Edges
            color={selected ? "#ffffff" : stage.color}
            opacity={selected ? 0.9 : 0.38}
            transparent
          />
        </RoundedBox>

        <group position={[0, 0.62, 0]} scale={0.82}>
          <StageIcon stageId={stage.id} color={stage.color} />
        </group>

        <mesh position={[0, -0.2, 0.69]}>
          <sphereGeometry args={[selected ? 0.1 : 0.075, 16, 16]} />
          <meshStandardMaterial
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={phase === "waiting" ? 0.2 : 1.2}
          />
        </mesh>
      </Float>

      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.72, 0.9, 0.12, 32]} />
        <meshStandardMaterial
          color="#07111f"
          metalness={0.5}
          roughness={0.42}
        />
      </mesh>
    </group>
  );
}

function FlowSignal({
  activeIndex,
  completed,
  reducedMotion,
}: Pick<SdlcSceneProps, "activeIndex" | "completed" | "reducedMotion">) {
  const signal = useRef<THREE.Mesh>(null);
  const current = STAGES[activeIndex];
  const next = STAGES[(activeIndex + 1) % STAGES.length];
  const start = useMemo(
    () => new THREE.Vector3(...POSITIONS[current.id]),
    [current.id],
  );
  const end = useMemo(
    () => new THREE.Vector3(...POSITIONS[next.id]),
    [next.id],
  );

  useFrame(({ clock }) => {
    if (!signal.current || completed || reducedMotion) return;
    const progress = (clock.elapsedTime * 0.34) % 1;
    signal.current.position.lerpVectors(start, end, progress);
    signal.current.position.y += 0.24;
  });

  if (completed) return null;

  const staticPosition = start.clone().lerp(end, 0.5);

  return (
    <mesh ref={signal} position={reducedMotion ? staticPosition : start}>
      <sphereGeometry args={[0.075, 16, 16]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
      <pointLight color={current.color} intensity={2.2} distance={1.8} />
    </mesh>
  );
}

export default function SdlcScene(props: SdlcSceneProps) {
  return (
    <>
      <ResponsiveCamera />
      <color attach="background" args={["#07101d"]} />
      <fog attach="fog" args={["#07101d", 9, 18]} />
      <ambientLight intensity={0.7} color="#9db7d9" />
      <directionalLight position={[2, 7, 6]} intensity={2.3} color="#e0f2fe" />
      <pointLight
        position={[-5, 2, 2]}
        intensity={13}
        distance={8}
        color="#7c3aed"
      />
      <pointLight
        position={[5, 2, 1]}
        intensity={12}
        distance={8}
        color="#e11d48"
      />

      {STAGES.slice(0, -1).map((stage, index) => {
        const next = STAGES[index + 1];
        return (
          <Line
            key={`${stage.id}-${next.id}`}
            points={[POSITIONS[stage.id], POSITIONS[next.id]]}
            color={props.phases[stage.id] === "passed" ? "#34d399" : "#334155"}
            lineWidth={2.4}
            transparent
            opacity={0.76}
          />
        );
      })}

      <Line
        points={[
          POSITIONS.review,
          [5.25, -1.18, -0.25],
          [0, -1.58, -0.45],
          [-5.25, -1.18, -0.25],
          POSITIONS.plan,
        ]}
        color={props.completed ? "#34d399" : "#243244"}
        lineWidth={2}
        transparent
        opacity={0.62}
      />

      {STAGES.map((stage) => (
        <StageNode
          key={stage.id}
          stage={stage}
          phase={props.phases[stage.id]}
          selected={props.selectedStage === stage.id}
          reducedMotion={props.reducedMotion}
          onSelect={props.onSelect}
        />
      ))}

      <FlowSignal
        activeIndex={props.activeIndex}
        completed={props.completed}
        reducedMotion={props.reducedMotion}
      />

      <mesh position={[0, -0.7, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial
          color="#07101d"
          metalness={0.18}
          roughness={0.8}
        />
      </mesh>
    </>
  );
}
