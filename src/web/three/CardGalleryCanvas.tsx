"use client";
/**
 * 3D holographic trading-card ring (React Three Fiber).
 * Scroll drives a camera dolly from a high wide shot down to eye level while the ring
 * makes one showcase revolution; afterwards drag to spin, tap to pull a card forward,
 * tap again to flip. Only renders while the section is on screen.
 */
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { heroes } from "@/heroes/roster";
import { color } from "@/design/tokens";
import { CARD_H, CARD_W } from "@/visual/TradingCard";
import { cardCanvas } from "./cardTextures";
import { createFloorMaterial, createHoloMaterial } from "./holoMaterial";
import { STEP, clamp01, ringRotation, smooth } from "./ring";

export type GalleryState = {
  /** 0..1 scroll choreography progress. */
  scroll: number;
  /** User drag rotation offset (radians). */
  drag: number;
  dragVel: number;
  dragging: boolean;
  selected: number | null;
  flipped: boolean;
  pointer: { x: number; y: number };
};

const CARD_WU = 1;
const CARD_HU = CARD_H / CARD_W;
const RADIUS = 2.15;

type Tex = { front: THREE.Texture; back: THREE.Texture | null; foil: THREE.Texture | null };

function toTexture(canvas: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** Yield to the browser between rasterisations so scrolling never stalls. */
const idle = () =>
  new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 250 });
    else setTimeout(resolve, 16);
  });

function useCardTextures(width: number) {
  const [tex, setTex] = useState<(Tex | null)[]>(() => heroes.map(() => null));
  useEffect(() => {
    let alive = true;
    const made: THREE.Texture[] = [];
    (async () => {
      // Fronts first (what the camera sees), then foil masks and backs.
      const fronts: THREE.Texture[] = [];
      for (const h of heroes) {
        await idle();
        if (!alive) return;
        const t = toTexture(await cardCanvas(h, "front", width));
        fronts.push(t);
        made.push(t);
        const i = fronts.length - 1;
        setTex((prev) => prev.map((p, j) => (j === i ? { front: t, foil: null, back: null } : p)));
      }
      for (let i = 0; i < heroes.length; i++) {
        await idle();
        if (!alive) return;
        const [foil, back] = await Promise.all([cardCanvas(heroes[i], "foil", Math.round(width / 2)), cardCanvas(heroes[i], "back", Math.round(width * 0.75))]);
        const t = { front: fronts[i], foil: toTexture(foil, false), back: toTexture(back) };
        made.push(t.foil, t.back);
        setTex((prev) => prev.map((p, j) => (j === i ? t : p)));
      }
    })();
    return () => {
      alive = false;
      made.forEach((t) => t.dispose());
    };
  }, [width]);
  return tex;
}

function Card({ index, tex, state }: { index: number; tex: Tex | null; state: MutableRefObject<GalleryState> }) {
  const group = useRef<THREE.Group>(null);
  const flipper = useRef<THREE.Group>(null);
  const hero = heroes[index];
  const angle = index * STEP;
  const geo = useMemo(() => new THREE.PlaneGeometry(CARD_WU, CARD_HU, 1, 1), []);
  const placeholder = useMemo(() => new THREE.MeshBasicMaterial({ color: hero.primaryColor }), [hero.primaryColor]);
  const mats = useMemo(() => {
    if (!tex) return null;
    return {
      front: createHoloMaterial(tex.front, tex.foil, [CARD_WU, CARD_HU], 0.048),
      back: tex.back ? createHoloMaterial(tex.back, null, [CARD_WU, CARD_HU], 0.048) : null,
    };
  }, [tex]);
  useEffect(
    () => () => {
      mats?.front.dispose();
      mats?.back?.dispose();
    },
    [mats],
  );

  useFrame((s, dt) => {
    const g = group.current;
    const f = flipper.current;
    if (!g || !f) return;
    const st = state.current;
    const sel = st.selected === index;
    const k = 1 - Math.pow(0.0015, dt);
    g.position.z = THREE.MathUtils.lerp(g.position.z, RADIUS + (sel ? 0.78 : 0), k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, sel ? 0.05 : 0, k);
    const targetFlip = sel && st.flipped ? Math.PI : 0;
    const tiltX = sel ? -st.pointer.y * 0.18 : 0;
    const tiltY = sel ? st.pointer.x * 0.25 : 0;
    f.rotation.y = THREE.MathUtils.lerp(f.rotation.y, targetFlip + tiltY, k);
    f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, tiltX, k);
    if (mats) {
      for (const m of mats.back ? [mats.front, mats.back] : [mats.front]) {
        m.uniforms.uTime.value = s.clock.elapsedTime;
        (m.uniforms.uPointer.value as THREE.Vector2).set(st.pointer.x, st.pointer.y);
        m.uniforms.uDim.value = THREE.MathUtils.lerp(m.uniforms.uDim.value, st.selected !== null && !sel ? 1 : 0, k);
      }
    }
  });

  return (
    <group rotation={[0, angle, 0]}>
      <group ref={group} position={[0, 0, RADIUS]}>
        <group ref={flipper} userData={{ index }}>
          <mesh geometry={geo} material={mats?.front ?? placeholder} position={[0, 0, 0.004]} />
          <mesh geometry={geo} material={mats?.back ?? placeholder} position={[0, 0, -0.004]} rotation={[0, Math.PI, 0]} />
        </group>
      </group>
    </group>
  );
}

function Rig({ state, onFront, ringRef }: { state: MutableRefObject<GalleryState>; onFront: (i: number) => void; ringRef: MutableRefObject<THREE.Group | null> }) {
  const { camera, size } = useThree();
  const last = useRef(-1);
  useFrame(() => {
    const st = state.current;
    const p = smooth(clamp01(st.scroll));
    const aspect = size.width / size.height;
    const fovR = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const fitW = (aspect < 0.75 ? 1.55 : 2.3) / (2 * Math.tan(fovR / 2) * aspect);
    const fitH = 2.7 / (2 * Math.tan(fovR / 2));
    const near = RADIUS + Math.max(fitW, fitH);
    const far = RADIUS + Math.max(fitW, fitH) * 2.1;
    const dist = THREE.MathUtils.lerp(far, near, p);
    const y = THREE.MathUtils.lerp(3.6, 0.18, p);
    const x = Math.sin(p * Math.PI) * 1.4;
    camera.position.set(x, y, dist);
    camera.lookAt(0, THREE.MathUtils.lerp(-0.6, 0, p), 0);
    camera.rotateZ(Math.sin(p * Math.PI) * 0.07);

    // Drag inertia / snapping is integrated by the section (it owns the state); we only read.
    const rot = ringRotation(st.scroll, st.drag);
    if (ringRef.current) ringRef.current.rotation.y = rot;
    const front = (((Math.round(-rot / STEP) % heroes.length) + heroes.length) % heroes.length) as number;
    if (front !== last.current) {
      last.current = front;
      onFront(front);
    }
  });
  return null;
}

function Scene({ state, onFront, onSelect, texWidth }: { state: MutableRefObject<GalleryState>; onFront: (i: number) => void; onSelect: (i: number) => void; texWidth: number }) {
  const ring = useRef<THREE.Group>(null);
  const textures = useCardTextures(texWidth);
  const floorMat = useMemo(() => createFloorMaterial(new THREE.Color(color.lilac)), []);
  const floorGeo = useMemo(() => new THREE.PlaneGeometry(9, 9), []);

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (Math.abs(state.current.dragVel) > 0.01) return;
    let o: THREE.Object3D | null = e.object;
    while (o && o.userData.index === undefined) o = o.parent;
    if (o) onSelect(o.userData.index as number);
  };

  return (
    <>
      <Rig state={state} onFront={onFront} ringRef={ring} />
      <group ref={ring} onClick={click}>
        {heroes.map((h, i) => (
          <Card key={h.id} index={i} tex={textures[i]} state={state} />
        ))}
      </group>
      <mesh geometry={floorGeo} material={floorMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -CARD_HU / 2 - 0.12, 0]} />
    </>
  );
}

export default function CardGalleryCanvas({
  state,
  active,
  onFront,
  onSelect,
  quality,
}: {
  state: MutableRefObject<GalleryState>;
  active: boolean;
  onFront: (i: number) => void;
  onSelect: (i: number) => void;
  quality: "high" | "low";
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={quality === "high" ? [1, 2] : [1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: [0, 3.6, 10], near: 0.1, far: 60 }}
      style={{ touchAction: "pan-y" }}
    >
      <Scene state={state} onFront={onFront} onSelect={onSelect} texWidth={quality === "high" ? 900 : 640} />
    </Canvas>
  );
}
