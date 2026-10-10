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

function Beam({
  x1,
  z1,
  x2,
  z2,
  y,
  thickness,
  height,
  map,
}: {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  y: number;
  thickness: number;
  height: number;
  map: THREE.CanvasTexture;
}) {
  const length = Math.hypot(x2 - x1, z2 - z1);
  const angle = Math.atan2(x2 - x1, z2 - z1);
  return (
    <mesh
      position={[(x1 + x2) / 2, y, (z1 + z2) / 2]}
      rotation={[0, angle, 0]}
      castShadow
      receiveShadow
      raycast={() => undefined}
    >
      <boxGeometry args={[thickness, height, Math.max(length, 0.02)]} />
      <meshPhysicalMaterial map={map} color="#ffffff" roughness={0.72} />
    </mesh>
  );
}

function Frame() {
  const pine = useMemo(() => createPineTexture(), []);
  const stain = useMemo(() => createStainTexture(), []);
  const width = spanX + 0.36;
  const railY = LAYOUT.deckY - 0.045;
  const legHeight = 0.92;
  const leftX = extents.minX - 0.1;
  const rightX = extents.maxX + 0.1;
  const frontZ = extents.maxZ + 0.07;
  const backZ = extents.minZ - 0.06;
  const stretcherY = 0.3;
  const corners = [
    [leftX, frontZ],
    [rightX, frontZ],
    [leftX, backZ],
    [rightX, backZ],
  ] as const;

  return (
    <group>
      <mesh position={[midX, railY, frontZ - 0.02]} castShadow receiveShadow raycast={() => undefined}>
        <boxGeometry args={[width, 0.06, 0.075]} />
        <meshPhysicalMaterial map={pine} color="#ffffff" roughness={0.42} clearcoat={0.22} />
      </mesh>
      <mesh position={[midX, railY - 0.01, backZ + 0.02]} castShadow raycast={() => undefined}>
        <boxGeometry args={[width, 0.05, 0.05]} />
        <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.68} />
      </mesh>
      {[leftX, rightX].map((x) => (
        <mesh key={x} position={[x, railY - 0.02, midZ]} castShadow raycast={() => undefined}>
          <boxGeometry args={[0.05, 0.16, Math.max(frontZ - backZ - 0.08, 0.2)]} />
          <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.66} />
        </mesh>
      ))}
      {corners.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, legHeight / 2, z]} castShadow raycast={() => undefined}>
          <boxGeometry args={[0.05, legHeight, 0.046]} />
          <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.74} />
        </mesh>
      ))}
      <Beam x1={leftX} z1={frontZ} x2={rightX} z2={frontZ} y={stretcherY} thickness={0.04} height={0.04} map={stain} />
      <Beam x1={leftX} z1={backZ} x2={rightX} z2={backZ} y={stretcherY} thickness={0.04} height={0.04} map={stain} />
      <Beam x1={leftX} z1={frontZ} x2={leftX} z2={backZ} y={stretcherY} thickness={0.04} height={0.04} map={stain} />
      <Beam x1={rightX} z1={frontZ} x2={rightX} z2={backZ} y={stretcherY} thickness={0.04} height={0.04} map={stain} />
      <mesh position={[rightX + 0.12, LAYOUT.deckY + 0.01, frontZ - 0.08]} castShadow raycast={() => undefined}>
        <boxGeometry args={[0.26, 0.018, 0.18]} />
        <meshPhysicalMaterial map={stain} color="#ffffff" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Suspension() {
  const rows = [
    BARS.filter((bar) => !bar.accidental),
    BARS.filter((bar) => bar.accidental),
  ];
  return (
    <group raycast={() => undefined}>
      {rows.map((row) => {
        const sorted = [...row].sort((a, b) => a.x - b.x);
        const cordY = sorted[0].y - sorted[0].height / 2 - 0.01;
        return (
          <group key={sorted[0].midi}>
            {(["frontNodeZ", "backNodeZ"] as const).map((node) =>
              sorted.slice(0, -1).map((bar, index) => {
                const next = sorted[index + 1];
                return (
                  <Cord
                    key={`${node}-${bar.midi}`}
                    ax={bar.x}
                    ay={cordY}
                    az={bar[node]}
                    bx={next.x}
                    by={cordY}
                    bz={next[node]}
                  />
                );
              }),
            )}
            {sorted.map((bar) => (
              <group key={bar.midi}>
                <mesh position={[bar.x, cordY, bar.frontNodeZ]} raycast={() => undefined}>
                  <sphereGeometry args={[0.008, 10, 10]} />
                  <meshStandardMaterial color="#1a100c" roughness={0.9} />
                </mesh>
                <mesh position={[bar.x, cordY, bar.backNodeZ]} raycast={() => undefined}>
                  <sphereGeometry args={[0.008, 10, 10]} />
                  <meshStandardMaterial color="#1a100c" roughness={0.9} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Cord({ ax, ay, az, bx, by, bz }: { ax: number; ay: number; az: number; bx: number; by: number; bz: number }) {
  const length = Math.hypot(bx - ax, by - ay, bz - az);
  const direction = new THREE.Vector3(bx - ax, by - ay, bz - az).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  return (
    <mesh position={[(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2]} quaternion={quaternion} raycast={() => undefined}>
      <cylinderGeometry args={[0.0032, 0.0032, Math.max(length, 0.01), 6]} />
      <meshStandardMaterial color="#24160f" roughness={0.88} />
    </mesh>
  );
}

const MALLET_REST = [
  {
    head: new THREE.Vector3(extents.maxX + 0.02, LAYOUT.deckY + 0.055, extents.maxZ + 0.02),
    aim: new THREE.Vector3(extents.maxX - 0.28, LAYOUT.deckY + 0.05, extents.maxZ + 0.02),
  },
  {
    head: new THREE.Vector3(extents.maxX + 0.02, LAYOUT.deckY + 0.055, extents.maxZ - 0.08),
    aim: new THREE.Vector3(extents.maxX - 0.28, LAYOUT.deckY + 0.05, extents.maxZ - 0.08),
  },
];

function Mallets() {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const seen = useRef(0);
  const cursor = useRef(0);
  const position = useRef(MALLET_REST.map((rest) => rest.head.clone()));
  const aim = useRef(MALLET_REST.map((rest) => rest.aim.clone()));
  const strikeAt = useRef([0, 0]);
  const strikePos = useRef(MALLET_REST.map((rest) => rest.head.clone()));
  const strikeAim = useRef(MALLET_REST.map((rest) => rest.aim.clone()));

  useFrame((_, delta) => {
    if (strikeLog.length > seen.current) {
      const strike = strikeLog[strikeLog.length - 1];
      const bar = BARS.find((item) => item.midi === strike.midi);
      if (bar) {
        const hand = cursor.current % 2;
        cursor.current += 1;
        strikePos.current[hand].set(bar.x, bar.y + 0.09, bar.z + 0.05);
        strikeAim.current[hand].set(bar.x, bar.y + 0.02, bar.z);
        strikeAt.current[hand] = performance.now();
      }
      seen.current = strikeLog.length;
    }
    const groups = [left.current, right.current];
    const blend = 1 - 0.0012 ** delta;
    for (let index = 0; index < 2; index += 1) {
      const age = (performance.now() - strikeAt.current[index]) / 1000;
      const home = age > 0.62;
      const targetPos = home ? MALLET_REST[index].head : strikePos.current[index];
      const targetAim = home ? MALLET_REST[index].aim : strikeAim.current[index];
      position.current[index].lerp(targetPos, blend);
      aim.current[index].lerp(targetAim, blend);
      const group = groups[index];
      if (!group) continue;
      group.position.copy(position.current[index]);
      group.lookAt(aim.current[index]);
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
      <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]} raycast={() => undefined}>
        <cylinderGeometry args={[0.01, 0.006, 0.44, 10]} />
        <meshStandardMaterial color="#b87432" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.02]} raycast={() => undefined}>
        <sphereGeometry args={[0.046, 22, 16]} />
        <meshPhysicalMaterial color="#f7f1e6" roughness={0.9} sheen={0.55} sheenColor="#fff8ee" />
      </mesh>
      <mesh position={[0, 0, 0.015]} raycast={() => undefined}>
        <torusGeometry args={[0.03, 0.008, 8, 16]} />
        <meshStandardMaterial color="#efe4d2" roughness={0.85} />
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
      <Suspension />
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
