"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

const CYAN = "#00f0ff";
const MAGENTA = "#ff2d95";
const ORANGE = "#ff8a00";
const PURPLE = "#8b5cf6";
const LIME = "#a3ff12";

function CameraRig() {
  const { camera, pointer } = useThree();
  const smooth = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const scroll =
      typeof window !== "undefined"
        ? Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)))
        : 0;

    smooth.current.x += (pointer.x * 0.45 - smooth.current.x) * Math.min(1, delta * 2);
    smooth.current.y += (pointer.y * 0.25 - smooth.current.y) * Math.min(1, delta * 2);

    camera.position.x = smooth.current.x;
    camera.position.y = 0.1 + smooth.current.y;
    camera.position.z = 7.4 - scroll * 1.6;
    camera.lookAt(0, 0, 0);

    camera.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.01;
  });

  return null;
}

/**
 * A single holographic orbit. The bead rides the ring so the rotation stays
 * readable even though the torus itself is perfectly symmetric.
 */
function GyroRing({
  radius,
  color,
  tilt,
  spin,
  thickness = 0.012,
  opacity = 0.5,
  bead = 0.05,
}: {
  radius: number;
  color: string;
  tilt: [number, number, number];
  spin: number;
  thickness?: number;
  opacity?: number;
  bead?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * spin;
  });

  return (
    <group ref={ref} rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, thickness, 8, 220]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[bead, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

/** Slow wireframe shell behind the wordmark — a quiet "grid" core. */
function HoloShell() {
  const shell = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!shell.current) return;
    shell.current.rotation.y += delta * 0.07;
    shell.current.rotation.x += delta * 0.025;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.018;
    shell.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.55, 2]} />
        <meshBasicMaterial
          color={CYAN}
          wireframe
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/** A handful of tiny shards drifting on the outer orbit. */
function Shards() {
  const group = useRef<THREE.Group>(null);

  const shards = useMemo(
    () =>
      [
        { angle: 0.4, radius: 4.1, y: 0.5, color: CYAN, size: 0.09 },
        { angle: 2.1, radius: 4.4, y: -0.8, color: MAGENTA, size: 0.075 },
        { angle: 3.6, radius: 4.0, y: 0.9, color: ORANGE, size: 0.07 },
        { angle: 5.2, radius: 4.5, y: -0.4, color: LIME, size: 0.06 },
        { angle: 1.2, radius: 4.7, y: -1.1, color: PURPLE, size: 0.08 },
      ] as const,
    [],
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={group}>
      {shards.map((shard, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(shard.angle) * shard.radius,
            shard.y,
            Math.sin(shard.angle) * shard.radius,
          ]}
        >
          <octahedronGeometry args={[shard.size, 0]} />
          <meshBasicMaterial color={shard.color} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 650;
    const positionArray = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    const palette = [new THREE.Color(CYAN), new THREE.Color(MAGENTA), new THREE.Color(PURPLE), new THREE.Color(ORANGE)];

    for (let i = 0; i < count; i += 1) {
      const radius = 5 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positionArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positionArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
      positionArray[i * 3 + 2] = radius * Math.cos(phi);
      const color = palette[Math.floor(Math.random() * palette.length)];
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }
    return { positions: positionArray, colors: colorArray };
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.025;
    points.current.rotation.x += delta * 0.006;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SceneContent() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += (pointer.x * 0.12 - group.current.rotation.y) * Math.min(1, delta * 1.6);
    group.current.rotation.x += (-pointer.y * 0.08 - group.current.rotation.x) * Math.min(1, delta * 1.6);
  });

  return (
    <>
      <CameraRig />

      <group ref={group} position={[0, 0.1, 0]}>
        <HoloShell />

        <GyroRing radius={1.95} color={CYAN} tilt={[1.22, 0.18, 0]} spin={0.16} opacity={0.38} />
        <GyroRing radius={2.45} color={MAGENTA} tilt={[1.5, 0.7, 0.35]} spin={-0.11} opacity={0.3} />
        <GyroRing radius={2.95} color={PURPLE} tilt={[1.36, -0.45, 0.15]} spin={0.075} opacity={0.26} />
        <GyroRing
          radius={3.45}
          color={ORANGE}
          tilt={[1.62, 1.05, 0.5]}
          spin={-0.05}
          thickness={0.008}
          opacity={0.2}
          bead={0.04}
        />

        <Shards />
      </group>

      <ParticleField />
      <Sparkles count={55} scale={[13, 8, 7]} size={2.2} speed={0.22} opacity={0.5} color={CYAN} />
      <Sparkles count={30} scale={[11, 7, 6]} size={2.6} speed={0.16} opacity={0.35} color={MAGENTA} />
      <fog attach="fog" args={["#05010d", 9, 18]} />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.1, 7.4], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <SceneContent />
    </Canvas>
  );
}
