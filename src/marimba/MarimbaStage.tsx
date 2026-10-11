import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { BARS, LAYOUT, type BarSpec, marimbaExtents } from "./layout";
import { strikes } from "./strikes";
import { createChontaTexture, createFloorTexture, createFrameTexture, createGuaduaTexture } from "./textures";

type StageProps = {
  onPlay: (midi: number) => void;
  onHover: (midi: number | null) => void;
  mappedMidis: number[];
};

const extents = marimbaExtents();
const midX = (extents.minX + extents.maxX) / 2;
const midZ = (extents.minZ + extents.maxZ) / 2;

const wood = "#ffffff";
const cord = "#1c1612";
const rubber = "#2a241c";
const membrane = "#d9c7a6";

function Bar({
  spec,
  chonta,
  guadua,
  onPlay,
  onHover,
}: {
  spec: BarSpec;
  chonta: THREE.CanvasTexture;
  guadua: THREE.CanvasTexture;
  onPlay: (midi: number) => void;
  onHover: (midi: number | null) => void;
}) {
  const bar = useRef<THREE.Mesh>(null);
  const controls = useThree((state) => state.controls) as { enabled?: boolean } | null;
  const tint = useMemo(() => new THREE.Color().setHSL(0.07, 0.14, 0.94 + (spec.index % 4) * 0.015), [spec.index]);
  const tubeTint = useMemo(
    () => new THREE.Color().setHSL(0.08, 0.18, 0.62 + (spec.index % 5) * 0.025),
    [spec.index],
  );

  useFrame(() => {
    const mesh = bar.current;
    if (!mesh) return;
    const strike = strikes.get(spec.midi);
    const age = strike ? performance.now() - strike : 1000;
    const dip = age < 90 ? Math.sin((age / 90) * Math.PI) * 0.012 : 0;
    mesh.position.y = -dip;
  });

  const play = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onPlay(spec.midi);
  };
  const geometry = useMemo(() => barGeometry(spec.width, spec.height, spec.length), [spec.width, spec.height, spec.length]);

  const tubeTop = -spec.height / 2 - 0.012;
  const tubeCenter = tubeTop - spec.resonatorLength / 2;

  return (
    <group position={[spec.x, spec.y, spec.z]}>
      <mesh
        ref={bar}
        geometry={geometry}
        castShadow
        onPointerDown={(event) => {
          if (controls) controls.enabled = false;
          play(event);
        }}
        onPointerUp={() => {
          if (controls) controls.enabled = true;
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(spec.midi);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "grab";
        }}
      >
        <meshPhysicalMaterial map={chonta} color={tint} roughness={0.9} metalness={0} clearcoat={0} />
      </mesh>

      <CordWrap z={spec.frontNodeZ - spec.z} width={spec.width} lift={spec.height * 0.46} />
      <CordWrap z={spec.backNodeZ - spec.z} width={spec.width} lift={spec.height * 0.46} />

      <group position={[0, tubeCenter, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[spec.resonatorRadius, spec.resonatorRadius * 0.94, spec.resonatorLength, 22, 1, true]} />
          <meshPhysicalMaterial map={guadua} color={tubeTint} roughness={0.88} metalness={0} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[spec.resonatorRadius * 0.86, spec.resonatorRadius * 0.8, spec.resonatorLength * 0.98, 18, 1, true]} />
          <meshStandardMaterial color="#1a1612" roughness={1} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, -spec.resonatorLength / 2 + 0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[spec.resonatorRadius * 0.94, 22]} />
          <meshStandardMaterial color="#2a241c" roughness={0.9} />
        </mesh>
        <mesh position={[0, spec.resonatorLength / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[spec.resonatorRadius * 0.98, 0.004, 6, 22]} />
          <meshStandardMaterial color="#3a3228" roughness={0.8} />
        </mesh>
        {[0.18, 0.46, 0.74].map((t) => (
          <mesh key={t} position={[0, spec.resonatorLength * (t - 0.5), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[spec.resonatorRadius * 1.01, 0.006, 6, 18]} />
            <meshStandardMaterial color="#241c16" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, -spec.resonatorLength * 0.32, spec.resonatorRadius * 0.98]}>
          <circleGeometry args={[spec.resonatorRadius * 0.7, 20]} />
          <meshStandardMaterial color="#1a1612" roughness={1} />
        </mesh>
        <mesh position={[0, -spec.resonatorLength * 0.32, spec.resonatorRadius * 1.012]}>
          <circleGeometry args={[spec.resonatorRadius * 0.58, 20]} />
          <meshPhysicalMaterial color={membrane} roughness={0.32} metalness={0} />
        </mesh>
      </group>
    </group>
  );
}

function CordWrap({ z, width, lift }: { z: number; width: number; lift: number }) {
  return (
    <mesh position={[0, lift, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.0032, 0.0032, width + 0.012, 6]} />
      <meshStandardMaterial color={cord} roughness={0.86} />
    </mesh>
  );
}

function Cord({ node }: { node: "front" | "back" }) {
  const geometry = useMemo(() => {
    const points = BARS.map(
      (bar) => new THREE.Vector3(bar.x, bar.y + bar.height * 0.5, node === "front" ? bar.frontNodeZ : bar.backNodeZ),
    );
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 90, 0.0042, 6, false);
  }, [node]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={cord} roughness={0.84} />
    </mesh>
  );
}

function Beam({
  start,
  end,
  thickness,
  height,
  map,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness: number;
  height: number;
  map: THREE.CanvasTexture;
}) {
  const length = start.distanceTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const angle = Math.atan2(end.z - start.z, end.x - start.x);
  return (
    <mesh position={mid} rotation={[0, angle, 0]} castShadow>
      <boxGeometry args={[length, height, thickness]} />
      <meshPhysicalMaterial map={map} color={wood} roughness={0.74} metalness={0} />
    </mesh>
  );
}

function Frame({ map }: { map: THREE.CanvasTexture }) {
  const y = LAYOUT.deckY - 0.05;
  const first = BARS[0];
  const last = BARS[BARS.length - 1];
  const frontL = new THREE.Vector3(first.x - 0.12, y, first.frontNodeZ + 0.03);
  const frontR = new THREE.Vector3(last.x + 0.12, y, last.frontNodeZ + 0.03);
  const backL = new THREE.Vector3(first.x - 0.12, y, first.backNodeZ - 0.03);
  const backR = new THREE.Vector3(last.x + 0.12, y, last.backNodeZ - 0.03);
  const posts = [frontL, frontR, backL, backR];

  return (
    <group>
      <Beam start={frontL} end={frontR} thickness={0.055} height={0.06} map={map} />
      <Beam start={backL} end={backR} thickness={0.055} height={0.06} map={map} />
      <Beam start={frontL} end={backL} thickness={0.07} height={0.16} map={map} />
      <Beam start={frontR} end={backR} thickness={0.07} height={0.16} map={map} />
      <Beam start={frontL.clone().setY(0.32)} end={frontR.clone().setY(0.32)} thickness={0.04} height={0.04} map={map} />
      <Beam start={backL.clone().setY(0.32)} end={backR.clone().setY(0.32)} thickness={0.04} height={0.04} map={map} />
      {posts.map((post, index) => (
        <group key={index} position={[post.x, 0, post.z]}>
          <mesh position={[0, y / 2, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.036, y, 12]} />
            <meshPhysicalMaterial map={map} color={wood} roughness={0.76} metalness={0} />
          </mesh>
          <mesh position={[0, 0.028, 0]} receiveShadow>
            <boxGeometry args={[0.18, 0.056, 0.16]} />
            <meshPhysicalMaterial map={map} color={wood} roughness={0.78} metalness={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Mallets() {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const hands = useRef({ left: 0, right: 0, next: "right" as "left" | "right" });

  useFrame(() => {
    let newest = 0;
    for (const at of strikes.values()) newest = Math.max(newest, at);
    const age = performance.now() - newest;
    if (newest > hands.current.left && newest > hands.current.right && age < 40) {
      if (hands.current.next === "right") hands.current.right = newest;
      else hands.current.left = newest;
      hands.current.next = hands.current.next === "right" ? "left" : "right";
    }
    pose(right.current, hands.current.right, 0);
    pose(left.current, hands.current.left, 1);
  });

  return (
    <group>
      <Mallet refGroup={right} restX={0.72} />
      <Mallet refGroup={left} restX={0.5} />
    </group>
  );
}

function pose(group: THREE.Group | null, struckAt: number, slot: number) {
  if (!group) return;
  const age = performance.now() - struckAt;
  const striking = struckAt > 0 && age < 170;
  const t = striking ? Math.sin((age / 170) * Math.PI) : 0;
  group.position.set(extents.maxX + 0.04 - t * 0.9, 1.07 + t * 0.22, 0.02 + slot * 0.09);
  group.rotation.set(Math.PI / 2 - t * 1.15, 0, slot * 0.04);
}

function barGeometry(width: number, height: number, length: number) {
  const half = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-half, -height * 0.5);
  shape.lineTo(half, -height * 0.5);
  shape.lineTo(half, height * 0.12);
  shape.quadraticCurveTo(0, height * 0.5, -half, height * 0.12);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.0015,
    bevelSize: 0.0015,
    bevelSegments: 1,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -length / 2);
  geometry.computeVertexNormals();
  const uv = geometry.attributes.uv;
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    uv.setXY(i, position.getX(i) / width + 0.5, position.getZ(i) / length + 0.5);
  }
  return geometry;
}

function Mallet({ refGroup, restX }: { refGroup: RefObject<THREE.Group | null>; restX: number }) {
  return (
    <group ref={refGroup} position={[extents.maxX, 1.07, restX]}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.014, 0.34, 10]} />
        <meshPhysicalMaterial color="#8a6a48" roughness={0.62} metalness={0} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.032, 18, 16]} />
        <meshPhysicalMaterial color={rubber} roughness={0.55} metalness={0} />
      </mesh>
    </group>
  );
}

function Scene({ onPlay, onHover }: StageProps) {
  const chonta = useMemo(() => createChontaTexture(), []);
  const guadua = useMemo(() => createGuaduaTexture(), []);
  const frame = useMemo(() => createFrameTexture(), []);
  const floor = useMemo(() => createFloorTexture(), []);

  return (
    <>
      <color attach="background" args={["#1c2b22"]} />
      <fog attach="fog" args={["#1c2b22", 7, 16]} />
      <hemisphereLight args={["#d7e2d4", "#3d4a32", 0.72]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[2.4, 5.2, 3.2]} intensity={2.4} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <directionalLight position={[-3.2, 2.4, -1.6]} intensity={0.45} color="#c9d4c2" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial map={floor} color="#ffffff" roughness={1} />
      </mesh>
      <Frame map={frame} />
      <Cord node="front" />
      <Cord node="back" />
      {BARS.map((spec) => (
        <Bar key={spec.midi} spec={spec} chonta={chonta} guadua={guadua} onPlay={onPlay} onHover={onHover} />
      ))}
      <Mallets />
      <ContactShadows position={[0, 0.001, 0]} opacity={0.38} scale={12} blur={2.4} far={3} />
      <OrbitControls
        makeDefault
        target={[midX, 0.72, midZ]}
        enablePan={false}
        minDistance={1.5}
        maxDistance={6.5}
        maxPolarAngle={Math.PI / 2.02}
      />
    </>
  );
}

export function MarimbaStage(props: StageProps) {
  return (
    <Canvas
      camera={{ position: [midX + 0.2, 1.7, 2.55], fov: 33 }}
      dpr={[1, 1.75]}
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onPointerMissed={() => props.onHover(null)}
    >
      <Scene {...props} />
    </Canvas>
  );
}
