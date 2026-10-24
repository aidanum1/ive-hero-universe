"use client";
/**
 * Holographic foil card shader. Rounded-corner cutout (SDF), view-angle iridescence on
 * foil-mask areas, a moving sheen band, screen-space halftone sparkle (the "printed foil"
 * look) and a pointer-driven specular streak.
 */
import * as THREE from "three";

const vertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragment = /* glsl */ `
uniform sampler2D uMap;
uniform sampler2D uFoil;
uniform float uHasFoil;
uniform float uHolo;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uSize;
uniform float uRadius;
uniform float uDim;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
vec3 spectral(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  if (sdRoundBox(p, uSize * 0.5, uRadius) > 0.0) discard;

  vec4 base = texture2D(uMap, vUv);
  float foil = uHasFoil > 0.5 ? texture2D(uFoil, vUv).r : 0.35;
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewDir);
  float facing = dot(n, v);

  float band = vUv.x * 1.1 + vUv.y * 0.7 + facing * 1.8 + uPointer.x * 0.5 - uPointer.y * 0.3;
  vec3 holo = spectral(band);
  float sheen = pow(max(0.0, 1.0 - abs(fract(band * 0.5 + uTime * 0.02) - 0.5) * 3.2), 3.0);

  vec2 cell = fract(gl_FragCoord.xy / 5.0) - 0.5;
  float dots = 1.0 - smoothstep(0.18, 0.34, length(cell));

  vec3 col = base.rgb;
  col = mix(col, col * 0.55 + holo * 0.7, foil * uHolo * 0.5);
  col += holo * sheen * foil * 0.45 * uHolo;
  col += vec3(dots * sheen * foil * 0.35 * uHolo);

  vec3 l = normalize(vec3(uPointer.x * 1.4, uPointer.y * 1.2 + 0.4, 1.0));
  float spec = pow(max(0.0, dot(reflect(-l, n), v)), 28.0);
  col += spec * 0.45;
  col *= mix(1.0, 0.45, uDim);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export function createHoloMaterial(map: THREE.Texture, foil: THREE.Texture | null, size: [number, number], radius: number) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uMap: { value: map },
      uFoil: { value: foil ?? map },
      uHasFoil: { value: foil ? 1 : 0 },
      uHolo: { value: 1 },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uSize: { value: new THREE.Vector2(size[0], size[1]) },
      uRadius: { value: radius },
      uDim: { value: 0 },
    },
    side: THREE.FrontSide,
  });
}

/** Halftone "printed" stage floor: dot size falls off from the centre. */
export function createFloorMaterial(dot: THREE.Color) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: dot }, uSpot: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uSpot; varying vec2 vUv;
      void main(){
        vec2 c = vUv - 0.5;
        float d = length(c) * 2.0;
        vec2 g = fract(vUv * 70.0) - 0.5;
        float r = (1.0 - smoothstep(0.0, 1.0, d)) * 0.42 * uSpot;
        float a = 1.0 - smoothstep(r - 0.04, r, length(g));
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a * 0.9);
        #include <colorspace_fragment>
      }`,
  });
}
