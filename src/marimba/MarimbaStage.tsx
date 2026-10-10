import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { BARS, LAYOUT, type BarSpec, marimbaExtents } from "./layout";
import { strikeLog, strikes } from "./strikes";
import {
  createBambooTexture,
  createBarTopTexture,
  createFloorTexture,
  createPineTexture,
  createStainTexture,
} from "./textures";

type StageProps = {
  onPlay: (midi: number) => void;
  onHover: (midi: number | null) => void;
  mappedMidis: number[];
};

const extents = marimbaExtents();
const midX = (extents.minX + extents.maxX) / 2;
const midZ = (extents.minZ + extents.maxZ) / 2;
const spanX = extents.maxX - extents.minX;

function Bar({
  spec,
  topMap,
  bamboo,
  stain,
  mapped,
  onPlay,
  onHover,
}: {
  spec: BarSpec;
  topMap: THREE.CanvasTexture;
  bamboo: THREE.CanvasTexture;
  stain: THREE.CanvasTexture;
  mapped: boolean;
  onPlay: (midi: number) => void;
  onHover: (midi: number | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const top = useRef<THREE.MeshPhysicalMaterial>(null);
  const controls = useThree((state) => state.controls) as { enabled?: boolean } | null;
  const tint = useMemo(
    () => new THREE.Color().setHSL(0.07, 0.12, spec.accidental ? 0.82 : 0.96),
    [spec.accidental],
  );
  const tubeTint = useMemo(
    () => new THREE.Color().setHSL(0.08, 0.18, 0.9 + (spec.midi % 4) * 0.02),
    [spec.midi],
  );
  const rings = spec.resonatorLength > 0.34 ? [0.22, 0.5, 0.78] : [0.3, 0.7];

  useFrame(() => {
    const struckAt = strikes.get(spec.midi);
    const age = struckAt ? (performance.now() - struckAt) / 1000 : 10;
    const hit = Math.max(0, 1 - age / 0.45);
    if (group.current) group.current.position.y = spec.y - hit * 0.007;
    if (!top.current) return;
    if (hit > 0.04) {
      top.current.emissive.set("#ffd7a8");
      top.current.emissiveIntensity = hit * 0.42;
    } else if (mapped) {
      top.current.emissive.set("#8a5a32");
      top.current.emissiveIntensity = 0.06;
    } else {
      top.current.emissive.set("#000000");
      top.current.emissiveIntensity = 0;
    }
  });

  const setControls = (enabled: boolean) => {
    if (controls) controls.enabled = enabled;
  };

  const play = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setControls(false);
    onPlay(spec.midi);
  };

  return (
    <group ref={group} position={[spec.x, spec.y, spec.z]}>
      <RoundedBox
        args={[spec.width, spec.height, spec.length]}
        radius={0.006}
        smoothness={2}
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
        onPointerDown={play}
        onPointerUp={() => setControls(true)}
      >
        <meshPhysicalMaterial color="#3b2418" roughness={0.46} clearcoat={0.12} clearcoatRoughness={0.4} />
      </RoundedBox>
      <mesh
        position={[0, spec.height / 2 + 0.0012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
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
        onPointerDown={play}
        onPointerUp={() => setControls(true)}
      >
        <planeGeometry args={[spec.width * 0.9, spec.length * 0.9]} />
        <meshPhysicalMaterial
          ref={top}
          map={topMap}
          color={tint}
          roughness={0.38}
          clearcoat={0.28}
          clearcoatRoughness={0.32}
          emissive="#000000"
        />
      </mesh>
      <mesh position={[0, -spec.height / 2 - 0.045 - spec.resonatorLength / 2, 0]} castShadow raycast={() => undefined}>
        <cylinderGeometry
          args={[spec.resonatorRadius, spec.resonatorRadius * 0.94, spec.resonatorLength, 28, 1, true]}
        />
        <meshPhysicalMaterial
          map={bamboo}
          color={tubeTint}
          roughness={0.34}
          metalness={0.02}
          clearcoat={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        position={[0, -spec.height / 2 - 0.045 - spec.resonatorLength + spec.resonatorRadius * 0.15, 0]}
        raycast={() => undefined}
        castShadow
      >
        <sphereGeometry args={[spec.resonatorRadius * 0.96, 18, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color="#c9843a" roughness={0.42} />
      </mesh>
      {rings.map((place) => (
        <mesh
          key={place}
          position={[0, -spec.height / 2 - 0.045 - spec.resonatorLength * (1 - place), 0]}
          rotation={[Math.PI / 2, 0, 0]}
          raycast={() => undefined}
        >
          <torusGeometry args={[spec.resonatorRadius * 1.01, 0.0042, 6, 20]} />
          <meshStandardMaterial color="#7a4318" roughness={0.62} />
        </mesh>
      ))}
      <mesh position={[0, -spec.height / 2 - 0.03, 0]} raycast={() => undefined} castShadow>
        <boxGeometry args={[spec.resonatorRadius * 1.3, 0.03, spec.resonatorRadius * 1.3]} />
        <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Frame() {
  const pine = useMemo(() => createPineTexture(), []);
  const stain = useMemo(() => createStainTexture(), []);
  const width = spanX + 0.34;
  const depth = extents.maxZ - extents.minZ + 0.28;
  const railY = LAYOUT.deckY - 0.04;
  const legHeight = 0.9;

  return (
    <group>
      <mesh position={[midX, railY, extents.maxZ + 0.045]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[width, 0.062, 0.078]} />
        <meshPhysicalMaterial map={pine} color="#ffffff" roughness={0.42} clearcoat={0.22} />
      </mesh>
      <mesh position={[midX, railY - 0.01, extents.minZ - 0.04]} castShadow raycast={() => undefined}>
        <boxGeometry args={[width, 0.05, 0.05]} />
        <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.68} />
      </mesh>
      <mesh position={[midX, LAYOUT.deckY - 0.014, extents.maxZ - 0.045]} raycast={() => undefined}>
        <boxGeometry args={[spanX + 0.08, 0.007, 0.008]} />
        <meshStandardMaterial color="#1c100c" roughness={0.8} />
      </mesh>
      {[extents.minX - 0.07, extents.maxX + 0.07].map((x) => (
        <mesh key={x} position={[x, railY - 0.08, midZ]} castShadow raycast={() => undefined}>
          <boxGeometry args={[0.045, 0.28, depth * 0.72]} />
          <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.66} />
        </mesh>
      ))}
      {[
        [extents.minX - 0.02, extents.maxZ + 0.02, -1, 1],
        [extents.maxX + 0.02, extents.maxZ + 0.02, 1, 1],
        [extents.minX - 0.02, extents.minZ - 0.02, -1, -1],
        [extents.maxX + 0.02, extents.minZ - 0.02, 1, -1],
      ].map(([x, z, dirX, dirZ]) => (
        <mesh
          key={`${x}-${z}`}
          position={[x + dirX * 0.05, legHeight / 2 - 0.02, z + dirZ * 0.03]}
          rotation={[dirZ * -0.08, 0, dirX * -0.1]}
          castShadow
          raycast={() => undefined}
        >
          <boxGeometry args={[0.048, legHeight, 0.04]} />
          <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.74} />
        </mesh>
      ))}
      <mesh position={[midX, 0.22, extents.maxZ + 0.08]} castShadow raycast={() => undefined}>
        <boxGeometry args={[spanX * 0.72, 0.035, 0.035]} />
        <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.76} />
      </mesh>
    </group>
  );
}

function Mallets() {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const seen = useRef(0);
  const cursor = useRef(0);
  const current = useRef([new THREE.Vector3(-1.15, 1.28, 0.85), new THREE.Vector3(1.15, 1.28, 0.85)]);
  const goal = useRef([new THREE.Vector3(-1.15, 1.05, 0.45), new THREE.Vector3(1.15, 1.05, 0.45)]);
  const liftedAt = useRef([0, 0]);

  useFrame((_, delta) => {
    if (strikeLog.length > seen.current) {
      const strike = strikeLog[strikeLog.length - 1];
      const bar = BARS.find((item) => item.midi === strike.midi);
      if (bar) {
        const hand = cursor.current % 2;
        cursor.current += 1;
        goal.current[hand].set(bar.x, bar.y + 0.03, bar.z);
        liftedAt.current[hand] = performance.now();
      }
      seen.current = strikeLog.length;
    }
    const groups = [left.current, right.current];
    for (let index = 0; index < 2; index += 1) {
      const age = (performance.now() - liftedAt.current[index]) / 1000;
      const lift = age < 0.08 ? 0 : Math.min(0.22, (age - 0.08) * 0.85);
      const target = goal.current[index].clone();
      target.y += lift;
      target.z += lift * 0.35;
      current.current[index].lerp(target, 1 - 0.0015 ** delta);
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
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]} raycast={() => undefined}>
        <cylinderGeometry args={[0.009, 0.006, 0.38, 10]} />
        <meshStandardMaterial color="#c9843c" roughness={0.48} />
      </mesh>
      <mesh raycast={() => undefined}>
        <sphereGeometry args={[0.038, 20, 16]} />
        <meshPhysicalMaterial color="#f4efe4" roughness={0.92} sheen={0.4} sheenColor="#fff6ea" />
      </mesh>
    </group>
  );
}

function KeyLight() {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useRef<THREE.Object3D>(null);
  useLayoutEffect(() => {
    if (light.current && target.current) light.current.target = target.current;
  }, []);
  return (
    <>
      <object3D ref={target} position={[0, 0.7, 0]} />
      <directionalLight
        ref={light}
        position={[2.6, 6.4, 3.1]}
        intensity={3.5}
        color="#fff6ea"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00018}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
    </>
  );
}

function Scene({ onPlay, onHover, mappedMidis }: StageProps) {
  const naturalTop = useMemo(() => createBarTopTexture(false), []);
  const accidentalTop = useMemo(() => createBarTopTexture(true), []);
  const bamboo = useMemo(() => createBambooTexture(), []);
  const stain = useMemo(() => createStainTexture(), []);
  const floor = useMemo(() => createFloorTexture(), []);
  const mapped = useMemo(() => new Set(mappedMidis), [mappedMidis]);

  return (
    <>
      <color attach="background" args={["#f3efe8"]} />
      <hemisphereLight args={["#fff8f0", "#d9cbb8", 0.9]} />
      <ambientLight intensity={0.28} />
      <KeyLight />
      <directionalLight position={[-3.2, 2.4, 1.6]} intensity={1.15} color="#f6ecdf" />
      <directionalLight position={[0.4, 2.2, -3.2]} intensity={0.55} color="#ffffff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow raycast={() => undefined}>
        <circleGeometry args={[8, 80]} />
        <meshStandardMaterial map={floor} color="#f0eadf" roughness={0.92} />
      </mesh>
      <ContactShadows position={[0, 0.001, 0.05]} opacity={0.38} scale={9} blur={2.4} far={1.8} color="#5a4636" />
      <Frame />
      {BARS.map((spec) => (
        <Bar
          key={spec.midi}
          spec={spec}
          topMap={spec.accidental ? accidentalTop : naturalTop}
          bamboo={bamboo}
          stain={stain}
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
        minDistance={1.7}
        maxDistance={8}
        minPolarAngle={0.35}
        maxPolarAngle={1.42}
        target={[0, 0.72, 0]}
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
      camera={{ position: [0.55, 1.72, 3.25], fov: 34 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
      onPointerMissed={() => {
        document.body.style.cursor = "";
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
