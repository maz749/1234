'use client';
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────────
   MATERIAL FACTORY
   Создаёт PBR-материал по hex цвету + типу отделки
─────────────────────────────────────────────────────────────────────────── */
function makeMaterial(color: string, finishType: string): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  const isGlossy = finishType === 'lacquer';
  const isWood   = finishType === 'wood' || finishType === 'veneer';
  return new THREE.MeshStandardMaterial({
    color: c,
    roughness:  isGlossy ? 0.05 : isWood ? 0.65 : 0.42,
    metalness:  isGlossy ? 0.02 : 0.0,
    envMapIntensity: isGlossy ? 1.4 : 0.6,
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   SHARED GEOMETRY HELPERS
─────────────────────────────────────────────────────────────────────────── */
function Box({ w, h, d, x, y, z, mat }: { w:number; h:number; d:number; x:number; y:number; z:number; mat: THREE.Material }) {
  const geo = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  return (
    <mesh geometry={geo} material={mat} position={[x, y, z]} castShadow receiveShadow />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   КУХНЯ
   Верхние шкафы + нижние шкафы + столешница + стена + пол
─────────────────────────────────────────────────────────────────────────── */
export function KitchenScene({ color, finishType }: { color: string; finishType: string }) {
  const facadeMat = useMemo(() => makeMaterial(color, finishType), [color, finishType]);
  const worktopMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ccc4b4', roughness: 0.28, metalness: 0.04 }), []);
  const wallMat    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8e2d8', roughness: 0.92 }), []);
  const floorMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8aa98', roughness: 0.72 }), []);
  const handleMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a89e90', roughness: 0.18, metalness: 0.85 }), []);
  const bodyMat    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e0dbd0', roughness: 0.72 }), []);

  const UPPER_Y = 1.6;   // центр верхних шкафов
  const LOWER_Y = 0.42;  // центр нижних шкафов
  const DEPTH_U = 0.33;  // глубина верхних
  const DEPTH_L = 0.58;  // глубина нижних
  const H_U = 0.70;      // высота верхних
  const H_L = 0.80;      // высота нижних
  const UNIT = 0.60;     // ширина одного модуля
  const TOTAL = 3.0;     // общая ширина кухни
  const N_UPPER = 5;
  const N_LOWER = 5;

  return (
    <group>
      {/* ── СТЕНА ── */}
      <Box w={TOTAL + 0.4} h={2.8} d={0.05} x={0} y={1.4} z={-DEPTH_L/2 - 0.01} mat={wallMat} />

      {/* ── ПОЛ ── */}
      <Box w={TOTAL + 1.5} h={0.04} d={2.2} x={0} y={0} z={0.5} mat={floorMat} />

      {/* ── ВЕРХНИЕ ШКАФЫ ── */}
      {Array.from({ length: N_UPPER }).map((_, i) => {
        const x = -TOTAL/2 + UNIT/2 + i * UNIT;
        return (
          <group key={`u${i}`} position={[x, UPPER_Y, -DEPTH_L/2 + DEPTH_U/2]}>
            {/* Корпус */}
            <Box w={UNIT - 0.02} h={H_U} d={DEPTH_U} x={0} y={0} z={0} mat={bodyMat} />
            {/* Фасад */}
            <Box w={UNIT - 0.04} h={H_U - 0.04} d={0.018} x={0} y={0} z={DEPTH_U/2 + 0.009} mat={facadeMat} />
            {/* Ручка */}
            <Box w={0.24} h={0.012} d={0.012} x={0} y={-(H_U/2 - 0.10)} z={DEPTH_U/2 + 0.022} mat={handleMat} />
          </group>
        );
      })}

      {/* ── НИЖНИЕ ШКАФЫ ── */}
      {Array.from({ length: N_LOWER }).map((_, i) => {
        const x = -TOTAL/2 + UNIT/2 + i * UNIT;
        return (
          <group key={`l${i}`} position={[x, LOWER_Y, 0]}>
            {/* Корпус */}
            <Box w={UNIT - 0.02} h={H_L} d={DEPTH_L} x={0} y={0} z={0} mat={bodyMat} />
            {/* Фасад */}
            <Box w={UNIT - 0.04} h={H_L - 0.04} d={0.018} x={0} y={0} z={DEPTH_L/2 + 0.009} mat={facadeMat} />
            {/* Ручка */}
            <Box w={0.24} h={0.012} d={0.012} x={0} y={H_L/2 - 0.10} z={DEPTH_L/2 + 0.022} mat={handleMat} />
            {/* Ящики (делители) */}
            <Box w={UNIT - 0.06} h={0.008} d={0.010} x={0} y={0.08} z={DEPTH_L/2 + 0.020} mat={handleMat} />
          </group>
        );
      })}

      {/* ── СТОЛЕШНИЦА ── */}
      <Box w={TOTAL + 0.04} h={0.04} d={DEPTH_L + 0.06} x={0} y={H_L + 0.02} z={0.03} mat={worktopMat} />

      {/* ── ПЛИНТУС ── */}
      <Box w={TOTAL} h={0.08} d={0.06} x={0} y={0.04} z={DEPTH_L/2 + 0.03} mat={facadeMat} />

      {/* ── РЕЙЛИНГ между верхними и нижними ── */}
      <Box w={TOTAL} h={0.012} d={0.012} x={0} y={H_L + 0.10} z={-DEPTH_L/2 + DEPTH_U + 0.04} mat={handleMat} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ШКАФ-КУПЕ
─────────────────────────────────────────────────────────────────────────── */
export function WardrobeScene({ color, finishType }: { color: string; finishType: string }) {
  const facadeMat  = useMemo(() => makeMaterial(color, finishType), [color, finishType]);
  const bodyMat    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e0dbd0', roughness: 0.7 }), []);
  const wallMat    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8e2d8', roughness: 0.9 }), []);
  const floorMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8aa98', roughness: 0.7 }), []);
  const railMat    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a89e90', roughness: 0.2, metalness: 0.9 }), []);

  const W = 2.8, H = 2.4, D = 0.65;
  const DOOR_W = W / 3;

  return (
    <group>
      <Box w={W + 0.6} h={3} d={0.05} x={0} y={1.5} z={-D/2} mat={wallMat} />
      <Box w={W + 1.5} h={0.04} d={2} x={0} y={0} z={0.5} mat={floorMat} />

      {/* Корпус */}
      <Box w={W} h={H} d={D} x={0} y={H/2} z={0} mat={bodyMat} />

      {/* 3 двери купе */}
      {[0, 1, 2].map(i => {
        const xOff = -W/2 + DOOR_W/2 + i * DOOR_W;
        const zOff = i === 1 ? D/2 + 0.02 : D/2 - 0.02; // средняя дверь чуть выдвинута
        return (
          <group key={i} position={[xOff, H/2, zOff]}>
            <Box w={DOOR_W - 0.02} h={H - 0.02} d={0.022} x={0} y={0} z={0} mat={facadeMat} />
            {/* Вертикальная ручка */}
            <Box w={0.012} h={0.38} d={0.016} x={i === 1 ? -DOOR_W/2 + 0.04 : DOOR_W/2 - 0.04} y={0} z={0.018} mat={railMat} />
          </group>
        );
      })}

      {/* Рельс сверху */}
      <Box w={W} h={0.025} d={0.05} x={0} y={H + 0.012} z={D/2} mat={railMat} />
      {/* Рельс снизу */}
      <Box w={W} h={0.015} d={0.04} x={0} y={0.008} z={D/2} mat={railMat} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   СТЕНОВЫЕ ПАНЕЛИ
─────────────────────────────────────────────────────────────────────────── */
export function PanelScene({ color, finishType }: { color: string; finishType: string }) {
  const facadeMat = useMemo(() => makeMaterial(color, finishType), [color, finishType]);
  const wallMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8e2d8', roughness: 0.9 }), []);
  const floorMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8aa98', roughness: 0.7 }), []);
  const trimMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a89e90', roughness: 0.4, metalness: 0.3 }), []);

  const PANEL_W = 0.20;
  const PANEL_H = 2.6;
  const GAP = 0.008;
  const N = 14;
  const TOTAL_W = N * (PANEL_W + GAP);

  return (
    <group>
      {/* Фоновая стена */}
      <Box w={TOTAL_W + 0.5} h={3} d={0.05} x={0} y={1.5} z={-0.05} mat={wallMat} />
      <Box w={TOTAL_W + 1.5} h={0.04} d={2} x={0} y={0} z={0.5} mat={floorMat} />

      {/* Рейки */}
      {Array.from({ length: N }).map((_, i) => {
        const x = -TOTAL_W/2 + PANEL_W/2 + i * (PANEL_W + GAP);
        return (
          <group key={i} position={[x, PANEL_H/2 + 0.1, 0]}>
            <Box w={PANEL_W} h={PANEL_H} d={0.022} x={0} y={0} z={0} mat={facadeMat} />
          </group>
        );
      })}

      {/* Верхний профиль */}
      <Box w={TOTAL_W} h={0.03} d={0.04} x={0} y={PANEL_H + 0.10 + 0.015} z={0.011} mat={trimMat} />
      {/* Нижний плинтус */}
      <Box w={TOTAL_W} h={0.09} d={0.03} x={0} y={0.045} z={0.011} mat={trimMat} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   МЕЖКОМНАТНАЯ ДВЕРЬ
─────────────────────────────────────────────────────────────────────────── */
export function DoorScene({ color, finishType }: { color: string; finishType: string }) {
  const facadeMat = useMemo(() => makeMaterial(color, finishType), [color, finishType]);
  const wallMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8e2d8', roughness: 0.9 }), []);
  const floorMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8aa98', roughness: 0.7 }), []);
  const glassMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c8dde8', roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.35 }), []);
  const handleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c0b090', roughness: 0.1, metalness: 0.9 }), []);

  const DW = 0.90, DH = 2.10, DD = 0.04;

  return (
    <group>
      <Box w={4} h={3} d={0.05} x={0} y={1.5} z={-0.3} mat={wallMat} />
      <Box w={5} h={0.04} d={2} x={0} y={0} z={0.5} mat={floorMat} />

      {/* Коробка */}
      <Box w={DW + 0.12} h={DH + 0.08} d={DD + 0.04} x={0} y={(DH+0.08)/2} z={0} mat={facadeMat} />

      {/* Полотно двери */}
      <Box w={DW} h={DH} d={DD} x={0} y={DH/2} z={0.02} mat={facadeMat} />

      {/* Стеклянная вставка */}
      <Box w={DW - 0.14} h={DH * 0.52} d={0.005} x={0} y={DH/2 + DH*0.12} z={0.026} mat={glassMat} />

      {/* Нижняя филёнка */}
      <Box w={DW - 0.14} h={DH * 0.28} d={0.008} x={0} y={DH * 0.17} z={0.026} mat={facadeMat} />

      {/* Ручка */}
      <Box w={0.012} h={0.12} d={0.012} x={DW/2 - 0.06} y={DH/2} z={DD/2 + 0.035} mat={handleMat} />
      <Box w={0.06} h={0.012} d={0.012} x={DW/2 - 0.04} y={DH/2} z={DD/2 + 0.035} mat={handleMat} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CAMERA RIG — плавный автоповорот когда не взаимодействуют
─────────────────────────────────────────────────────────────────────────── */
function AutoRotate({ active }: { active: boolean }) {
  const { camera } = useThree();
  const t = useRef(0);
  const base = useRef({ x: camera.position.x, z: camera.position.z });

  useFrame((_, delta) => {
    if (!active) return;
    t.current += delta * 0.12;
    const r = Math.sqrt(base.current.x ** 2 + base.current.z ** 2);
    camera.position.x = Math.sin(t.current) * r;
    camera.position.z = Math.cos(t.current) * r;
    camera.lookAt(0, 1.1, 0);
  });

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   CAMERA PRESETS per scene type
─────────────────────────────────────────────────────────────────────────── */
const CAM_PRESETS: Record<string, [number,number,number]> = {
  kitchen:  [2.8, 1.6, 3.2],
  wardrobe: [2.2, 1.8, 3.0],
  panels:   [0,   1.6, 3.8],
  door:     [0.6, 1.4, 2.8],
};

const TARGET_PRESETS: Record<string, [number,number,number]> = {
  kitchen:  [-0.2, 1.0, 0],
  wardrobe: [0,    1.2, 0],
  panels:   [0,    1.4, 0],
  door:     [0,    1.05, 0],
};

/* ─────────────────────────────────────────────────────────────────────────
   MAIN CANVAS EXPORT
─────────────────────────────────────────────────────────────────────────── */
export type SceneType = 'kitchen' | 'wardrobe' | 'panels' | 'door';

export default function Scene3D({
  color,
  finishType,
  sceneType,
  autoRotate,
}: {
  color: string;
  finishType: string;
  sceneType: SceneType;
  autoRotate: boolean;
}) {
  const camPos  = CAM_PRESETS[sceneType]  || CAM_PRESETS.kitchen;
  const target  = TARGET_PRESETS[sceneType] || TARGET_PRESETS.kitchen;

  const SceneComponent = {
    kitchen:  KitchenScene,
    wardrobe: WardrobeScene,
    panels:   PanelScene,
    door:     DoorScene,
  }[sceneType];

  return (
    <Canvas
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      style={{ width: '100%', height: '100%', background: '#141210' }}
    >
      <PerspectiveCamera makeDefault position={camPos} fov={42} />

      {/* Освещение */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} />
      <pointLight position={[0, 2.5, 1.5]} intensity={0.3} color="#fff8f0" />

      {/* HDR Environment для отражений */}
      <Environment preset="apartment" />

      {/* Тени под объектами */}
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
      />

      {/* Сцена */}
      <SceneComponent color={color} finishType={finishType} />

      {/* Орбитальное управление */}
      <OrbitControls
        target={target}
        enablePan={false}
        minDistance={1.5}
        maxDistance={6}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.1}
        makeDefault
      />

      <AutoRotate active={autoRotate} />
    </Canvas>
  );
}
