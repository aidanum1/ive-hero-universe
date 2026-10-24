/** Path generators for hero masks, emblems and ornaments. All output plain SVG path data. */

const f = (n: number) => Math.round(n * 100) / 100;

export const poly = (pts: [number, number][]) => `M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ")} Z`;

export function star(cx: number, cy: number, outer: number, inner: number, points = 5, rotDeg = -90) {
  const pts: [number, number][] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((rotDeg + (i * 180) / points) * Math.PI) / 180;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poly(pts);
}

export function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return `M ${f(cx - rx)} ${f(cy)} A ${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)} A ${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)} Z`;
}

export const circle = (cx: number, cy: number, r: number) => ellipse(cx, cy, r, r);

/** Mirror a list of points across a vertical axis. */
export const mirrorX = (pts: [number, number][], axis: number): [number, number][] =>
  pts.map(([x, y]) => [axis * 2 - x, y]);

/** Band with sine-wave edges (Liz's mask). */
export function waveBand(x0: number, x1: number, top: number, bottom: number, amp: number, waves: number) {
  const steps = 48;
  const topPts: [number, number][] = [];
  const botPts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const taper = Math.sin(Math.PI * t) ** 0.35;
    const mid = (top + bottom) / 2;
    topPts.push([x, mid - (mid - top) * taper + Math.sin(t * Math.PI * 2 * waves) * amp]);
    botPts.push([x, mid + (bottom - mid) * taper + Math.sin(t * Math.PI * 2 * waves + Math.PI) * amp]);
  }
  return poly([...topPts, ...botPts.reverse()]);
}

/** Jagged comic burst (impact balloon). `seedJitter` returns 0..1 for each spike. */
export function burst(cx: number, cy: number, outer: number, inner: number, spikes: number, seedJitter?: (i: number) => number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const j = seedJitter ? seedJitter(i) : 0.5;
    const r = i % 2 === 0 ? outer * (0.82 + j * 0.36) : inner * (0.9 + j * 0.2);
    const a = (i / (spikes * 2)) * Math.PI * 2 + (j - 0.5) * 0.12;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poly(pts);
}

/** Arc stroke path (for sound waves). */
export function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const a0 = (fromDeg * Math.PI) / 180;
  const a1 = (toDeg * Math.PI) / 180;
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${f(cx + Math.cos(a0) * r)} ${f(cy + Math.sin(a0) * r)} A ${f(r)} ${f(r)} 0 ${large} 1 ${f(cx + Math.cos(a1) * r)} ${f(cy + Math.sin(a1) * r)}`;
}
