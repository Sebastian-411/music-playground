import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { BARS, type BarSpec, marimbaExtents, noteName } from "./layout";
import { strikeLog, strikes } from "./strikes";
import { createBambooTexture, createGroundTexture, createWoodTexture, noteLabelTexture } from "./textures";

type StageProps = {
  onPlay: (midi: number) => void;
  onHover: (midi: number | null) => void;
  mappedMidis: number[];
};

const extents = marimbaExtents();
const spanX = extents.maxX - extents.minX;
const spanZ = extents.maxZ - extents.minZ;
const midX = (extents.minX + extents.maxX) / 2;
const midZ = (extents.minZ + extents.maxZ) / 2;

function Bar({
  spec,
  wood,
  bamboo,
  mapped,
  onPlay,
  onHover,
}: {
  spec: BarSpec;
  wood: THREE.CanvasTexture;
  bamboo: THREE.CanvasTexture;
  mapped: boolean;
  onPlay: (midi: number) => void;
  onHover: (midi: number | null) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const tube = useRef<THREE.Mesh>(null);
  const controls = useThree((state) => state.controls) as { enabled?: boolean } | null;
  const label = useMemo(() => noteLabelTexture(noteName(spec.midi)), [spec.midi]);
  const color = useMemo(() => {
    const lightness = spec.accidental ? 0.34 : 0.46;
    return new THREE.Color().setHSL(0.075, 0.48, lightness + (spec.midi % 5) * 0.012);
  }, [spec.accidental, spec.midi]);

  useFrame(() => {
    const struckAt = strikes.get(spec.midi);
    const age = struckAt ? (performance.now() - struckAt) / 1000 : 10;
    const hit = Math.max(0, 1 - age / 0.42);
    if (mesh.current) mesh.current.position.y = spec.y - hit * 0.014;
    if (material.current) {
      if (hit > 0.02) material.current.emissive.set("#ffb15c");
      else if (mapped) material.current.emissive.set("#6a3e1c");
      else material.current.emissive.set("#000000");
      material.current.emissiveIntensity = hit > 0.02 ? 0.25 + hit : mapped ? 0.28 : 0;
    }
    if (tube.current) {
      const pulse = 1 + hit * 0.06;
      tube.current.scale.x = pulse;
      tube.current.scale.z = pulse;
    }
  });

  const setControls = (enabled: boolean) => {
    if (controls) controls.enabled = enabled;
  };

  return (
    <group>
      <mesh
        ref={mesh}
        position={[spec.x, spec.y, spec.z]}
        castShadow
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(spec.midi);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
          setControls(true);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          setControls(false);
          onPlay(spec.midi);
        }}
        onPointerUp={() => setControls(true)}
      >
        <boxGeometry args={[spec.width, spec.height, spec.length]} />
        <meshStandardMaterial
          ref={material}
          color={color}
          map={wood}
          roughness={0.58}
          metalness={0.04}
          emissive="#000000"
        />
      </mesh>
      <mesh
        position={[spec.x, spec.y + spec.height / 2 + 0.002, spec.z + spec.length / 2 - 0.055]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => undefined}
      >
        <planeGeometry args={[spec.width * 0.92, 0.042]} />
        <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh
        ref={tube}
        position={[spec.x, spec.y - spec.height / 2 - spec.resonatorLength / 2 - 0.02, spec.z]}
        castShadow
        raycast={() => undefined}
      >
        <cylinderGeometry args={[spec.resonatorRadius, spec.resonatorRadius * 0.86, spec.resonatorLength, 18, 1, true]} />
        <meshStandardMaterial map={bamboo} roughness={0.62} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Frame() {
  const wood = useMemo(() => createWoodTexture(22), []);
  const width = spanX + 0.28;
  const depth = spanZ + 0.34;
  return (
    <group>
      <mesh position={[midX, 0.09, extents.maxZ + 0.04]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[width, 0.07, 0.055]} />
        <meshStandardMaterial color="#6b4124" map={wood} roughness={0.72} />
      </mesh>
      <mesh position={[midX, 0.08, extents.minZ - 0.05]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[width, 0.07, 0.055]} />
        <meshStandardMaterial color="#5c371f" map={wood} roughness={0.74} />
      </mesh>
      <mesh position={[extents.minX - 0.1, 0.1, midZ]} castShadow raycast={() => undefined}>
        <boxGeometry args={[0.07, 0.12, depth]} />
        <meshStandardMaterial color="#6a3f22" map={wood} roughness={0.7} />
      </mesh>
      <mesh position={[extents.maxX + 0.1, 0.1, midZ]} castShadow raycast={() => undefined}>
        <boxGeometry args={[0.07, 0.12, depth]} />
        <meshStandardMaterial color="#6a3f22" map={wood} roughness={0.7} />
      </mesh>
      {[
        [extents.minX - 0.08, extents.maxZ + 0.02],
        [extents.maxX + 0.08, extents.maxZ + 0.02],
        [extents.minX - 0.08, extents.minZ - 0.02],
        [extents.maxX + 0.08, extents.minZ - 0.02],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, -0.46, z]} castShadow raycast={() => undefined}>
          <cylinderGeometry args={[0.035, 0.045, 1.08, 10]} />
          <meshStandardMaterial color="#4e301c" map={wood} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Mallets() {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const seen = useRef(0);
  const cursor = useRef(0);
  const current = useRef([new THREE.Vector3(-0.55, 0.62, 0.85), new THREE.Vector3(0.55, 0.62, 0.85)]);
  const goal = useRef([new THREE.Vector3(-0.55, 0.62, 0.85), new THREE.Vector3(0.55, 0.62, 0.85)]);
  const liftedAt = useRef([0, 0]);

  useFrame((_, delta) => {
    if (strikeLog.length > seen.current) {
      const strike = strikeLog[strikeLog.length - 1];
      const bar = BARS.find((item) => item.midi === strike.midi);
      if (bar) {
        const hand = cursor.current % 2;
        cursor.current += 1;
        goal.current[hand].set(bar.x, bar.y + 0.05, bar.z + bar.length / 2 - 0.02);
        liftedAt.current[hand] = performance.now();
      }
      seen.current = strikeLog.length;
    }
    const groups = [left.current, right.current];
    for (let index = 0; index < 2; index += 1) {
      const age = (performance.now() - liftedAt.current[index]) / 1000;
      const lift = age < 0.12 ? 0 : Math.min(0.28, (age - 0.12) * 0.7);
      const target = goal.current[index].clone();
      target.y += lift;
      target.z += lift * 0.45;
      current.current[index].lerp(target, 1 - Math.pow(0.0015, delta));
      const group = groups[index];
      if (!group) continue;
      group.position.copy(current.current[index]);
      group.lookAt(goal.current[index].x, goal.current[index].y, goal.current[index].z);
    }
  });

  return (
    <>
      <Mallet refGroup={left} />
      <Mallet refGroup={right} />
    </>
  );
}

function Mallet({ refGroup }: { refGroup: RefObject<THREE.Group | null> }) {
  return (
    <group ref={refGroup} raycast={() => undefined}>
      <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]} raycast={() => undefined}>
        <cylinderGeometry args={[0.012, 0.008, 0.32, 8]} />
        <meshStandardMaterial color="#c9844a" roughness={0.55} />
      </mesh>
      <mesh raycast={() => undefined}>
        <sphereGeometry args={[0.034, 18, 18]} />
        <meshStandardMaterial color="#f2efe6" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Scene({ onPlay, onHover, mappedMidis }: StageProps) {
  const wood = useMemo(() => createWoodTexture(28), []);
  const bamboo = useMemo(() => createBambooTexture(), []);
  const ground = useMemo(() => createGroundTexture(), []);
  const mapped = useMemo(() => new Set(mappedMidis), [mappedMidis]);

  return (
    <>
      <color attach="background" args={["#10241c"]} />
      <fog attach="fog" args={["#10241c", 5.5, 13]} />
      <hemisphereLight args={["#d5e2c4", "#2a1a10", 0.72]} />
      <ambientLight intensity={0.18} />
      <directionalLight
        position={[2.4, 5.8, 3.2]}
        intensity={2.6}
        color="#ffe2c0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00025}
        shadow-camera-near={0.4}
        shadow-camera-far={14}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-3.5, 2.2, -2]} intensity={0.45} color="#9fbfa4" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, 0]} receiveShadow raycast={() => undefined}>
        <circleGeometry args={[9, 72]} />
        <meshStandardMaterial map={ground} roughness={1} metalness={0} />
      </mesh>
      <Frame />
      {BARS.map((spec) => (
        <Bar
          key={spec.midi}
          spec={spec}
          wood={wood}
          bamboo={bamboo}
          mapped={mapped.has(spec.midi)}
          onPlay={onPlay}
          onHover={onHover}
        />
      ))}
      <Mallets />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2.1}
        maxDistance={7}
        minPolarAngle={0.45}
        maxPolarAngle={1.35}
        target={[0, 0.05, -0.05]}
      />
    </>
  );
}

export function MarimbaStage(props: StageProps) {
  return (
    <Canvas
      className="webgl"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0.15, 1.72, 3.55], fov: 36 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
      onPointerMissed={() => {
        document.body.style.cursor = "";
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
