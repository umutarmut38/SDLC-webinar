import { RoundedBox } from "@react-three/drei";

interface StageIconProps {
  stageId: "plan" | "code" | "test" | "ci" | "review";
  color: string;
}

function PlanIcon({ color }: Pick<StageIconProps, "color">) {
  return (
    <group>
      {[-0.22, 0, 0.22].map((y, index) => (
        <RoundedBox
          key={y}
          args={[0.72 - index * 0.08, 0.09, 0.5]}
          radius={0.035}
          position={[0, y, 0]}
        >
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.28}
          />
        </RoundedBox>
      ))}
      <mesh position={[0.2, 0.31, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.13, 0.45, 5]} />
        <meshStandardMaterial
          color="#f5f3ff"
          emissive={color}
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

function CodeIcon({ color }: Pick<StageIconProps, "color">) {
  return (
    <group>
      <mesh position={[-0.25, 0, 0]} rotation={[0, 0, -0.62]}>
        <boxGeometry args={[0.12, 0.66, 0.16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0.25, 0, 0]} rotation={[0, 0, 0.62]}>
        <boxGeometry args={[0.12, 0.66, 0.16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.1, 0.72, 0.12]} />
        <meshStandardMaterial color="#e0f2fe" />
      </mesh>
    </group>
  );
}

function TestIcon({ color }: Pick<StageIconProps, "color">) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.32, 0.09, 12, 36]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0.12, 0.02, -0.02]} rotation={[0, 0, -0.65]}>
        <boxGeometry args={[0.09, 0.48, 0.1]} />
        <meshStandardMaterial color="#ecfdf5" />
      </mesh>
      <mesh position={[-0.1, -0.11, -0.02]} rotation={[0, 0, 0.72]}>
        <boxGeometry args={[0.09, 0.24, 0.1]} />
        <meshStandardMaterial color="#ecfdf5" />
      </mesh>
    </group>
  );
}

function CiIcon({ color }: Pick<StageIconProps, "color">) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.27, 0.27, 0.22, 12]} />
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.24}
          emissive={color}
          emissiveIntensity={0.25}
        />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={angle}
            position={[Math.cos(angle) * 0.39, Math.sin(angle) * 0.39, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.2, 0.12, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, -0.14]}>
        <cylinderGeometry args={[0.09, 0.09, 0.26, 12]} />
        <meshStandardMaterial color="#fffbeb" />
      </mesh>
    </group>
  );
}

function ReviewIcon({ color }: Pick<StageIconProps, "color">) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.075, 12, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0.28, -0.27, 0]} rotation={[0, 0, -0.72]}>
        <cylinderGeometry args={[0.055, 0.075, 0.42, 10]} />
        <meshStandardMaterial color="#fff1f2" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.22, 0.22, 0.18]} />
        <meshStandardMaterial color="#fff1f2" metalness={0.2} />
      </mesh>
    </group>
  );
}

export function StageIcon({ stageId, color }: StageIconProps) {
  const icons = {
    plan: <PlanIcon color={color} />,
    code: <CodeIcon color={color} />,
    test: <TestIcon color={color} />,
    ci: <CiIcon color={color} />,
    review: <ReviewIcon color={color} />,
  };

  return icons[stageId];
}
