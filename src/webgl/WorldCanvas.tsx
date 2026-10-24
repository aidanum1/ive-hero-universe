"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  TextureLoader,
  ShaderMaterial,
  type Texture,
} from "three";
import type { MotionRuntime } from "@/controllers/runtime";
import { assetUrl } from "@/utils/assets";
import { cameraRigs, mix } from "@/motion/config";
import { vertexShader, fragmentShader } from "@/shaders/halftone";

function ComicWorld({
  runtime,
  onReady,
}: {
  runtime: MotionRuntime;
  onReady: () => void;
}) {
  const { invalidate, camera, size, gl } = useThree();
  const group = useRef<Group>(null),
    paper = useRef<Mesh>(null),
    character = useRef<Mesh>(null),
    foreground = useRef<Mesh>(null);
  const [textures, setTextures] = useState<Texture[] | null>(null);
  const shader = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uOpacity: { value: 0.5 } }), []);
  useEffect(() => {
    let disposed = false;
    const owned: Texture[] = [];
    const loader = new TextureLoader();
    Promise.all(
      [
        "assets/comic-page.svg",
        "heroes/captain-purple.webp",
        "assets/page-frame.svg",
      ].map((path) =>
        loader.loadAsync(assetUrl(path)).then((texture) => {
          texture.colorSpace = SRGBColorSpace;
          if (disposed) texture.dispose();
          else owned.push(texture);
          return texture;
        }),
      ),
    )
      .then((loaded) => {
        if (!disposed) {
          setTextures(loaded);
          onReady();
          invalidate();
        }
      })
      .catch(() => {
        /* DOM artwork remains available. */
      });
    return () => {
      disposed = true;
      owned.forEach((texture) => texture.dispose());
    };
  }, [invalidate, onReady]);
  useEffect(() => runtime.subscribe(() => invalidate()), [runtime, invalidate]);
  useEffect(() => {
    // Small read-only diagnostics used during visual verification.
    const element = gl.domElement;
    const report = () => {
      element.dataset.calls = String(gl.info.render.calls);
      element.dataset.textures = String(gl.info.memory.textures);
      element.dataset.geometries = String(gl.info.memory.geometries);
    };
    const unsub = runtime.subscribe(() => requestAnimationFrame(report));
    return unsub;
  }, [gl, runtime]);
  useFrame(() => {
    gl.domElement.setAttribute(
      "data-frames",
      String(Number(gl.domElement.getAttribute("data-frames") ?? 0) + 1),
    );
    const f = runtime.frame;
    const mobile = size.width < 700;
    const rig = mobile ? cameraRigs.mobile : cameraRigs.desktop;
    camera.position.set(
      mix(rig.x[0], rig.x[1], f.pageTravel),
      rig.y,
      mix(rig.z[0], rig.z[1], f.pageTravel),
    );
    camera.lookAt(mix(rig.targetX[0], rig.targetX[1], f.pageTravel), 0, 0);
    if (group.current) {
      group.current.position.set(
        mix(rig.groupX[0], rig.groupX[1], f.pageTravel),
        mix(rig.groupY[0], rig.groupY[1], f.pageTravel),
        0,
      );
      group.current.rotation.set(
        cameraRigs.rotation[0],
        cameraRigs.rotation[1] * (1 - f.pageTravel),
        cameraRigs.rotation[2] * (1 - f.pageTravel),
      );
    }
    if (paper.current)
      paper.current.position.z = f.pageSplit * cameraRigs.depth.paper;
    if (character.current) {
      character.current.position.z =
        cameraRigs.depth.heroBase + f.pageSplit * cameraRigs.depth.hero;
      character.current.rotation.z = f.pageSplit * cameraRigs.depth.heroTwist;
    }
    if (foreground.current) {
      foreground.current.position.z =
        cameraRigs.depth.foregroundBase +
        f.pageSplit * cameraRigs.depth.foreground;
      foreground.current.rotation.z =
        f.pageSplit * cameraRigs.depth.foregroundTwist;
    }
    [paper, character, foreground].forEach((ref) => {
      if (ref.current) {
        const material = ref.current.material as MeshBasicMaterial;
        material.opacity = f.pageOpacity;
      }
    });
    if (shader.current) shader.current.uniforms.uOpacity.value = f.pageOpacity;
  });
  if (!textures) return null;
  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.4]}>
        <planeGeometry args={[7.5, 9.5]} />
        <shaderMaterial
          ref={shader}
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
      <mesh ref={paper}>
        <planeGeometry args={[4.4, 5.775]} />
        <meshBasicMaterial map={textures[0]} transparent toneMapped={false} />
      </mesh>
      <mesh ref={character} position={[0, -0.1, 0.06]}>
        <planeGeometry args={[3.6, 5.4]} />
        <meshBasicMaterial
          map={textures[1]}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={foreground} position={[0, 0, 0.13]}>
        <planeGeometry args={[4.4, 5.775]} />
        <meshBasicMaterial
          map={textures[2]}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ContextEvents({
  runtime,
  onReady,
  onLost,
}: {
  runtime: MotionRuntime;
  onReady: () => void;
  onLost: () => void;
}) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const element = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    const restored = () => {
      runtime.update();
      invalidate();
      onReady();
    };
    element.addEventListener("webglcontextlost", lost);
    element.addEventListener("webglcontextrestored", restored);
    return () => {
      element.removeEventListener("webglcontextlost", lost);
      element.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl, invalidate, onLost, onReady, runtime]);
  return null;
}

export default function WorldCanvas({
  runtime,
  onReady,
  onLost,
}: {
  runtime: MotionRuntime;
  onReady: () => void;
  onLost: () => void;
}) {
  return (
    <div className="worldCanvas" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[
          1,
          typeof window !== "undefined" && window.innerWidth < 700
            ? 1.25
            : 1.75,
        ]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        fallback={null}
      >
        <ContextEvents runtime={runtime} onLost={onLost} onReady={onReady} />
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={37} />
        <ComicWorld runtime={runtime} onReady={onReady} />
      </Canvas>
    </div>
  );
}
