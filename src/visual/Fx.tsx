/**
 * Comic / print FX primitives. Deterministic (seeded) and frame-safe.
 * All render as SVG groups or standalone SVGs with inline styles only.
 */
import { memo, useMemo, type CSSProperties, type ReactNode } from "react";
import { color, fx } from "@/design/tokens";
import { family } from "@/design/typography";
import { burst } from "@/heroes/shapes";
import { rng } from "@/lib/random";
import { useSvgId } from "./useSvgId";

const r1 = (n: number) => Math.round(n * 10) / 10;

// ───────────────────────────── Speed lines ─────────────────────────────

type RadialLinesProps = {
  width: number;
  height: number;
  cx?: number;
  cy?: number;
  /** Clear ellipse around the focus, as a fraction of min(width,height). */
  inner?: number;
  count?: number;
  color?: string;
  seed?: string | number;
  /** 0..1 — how far lines reach inward (animate for a burst). */
  reach?: number;
  /** Max wedge half-width in degrees. */
  thickness?: number;
};

/** Radial focus lines (manga 集中線). Use inside an <svg>. */
export const RadialSpeedLines = memo(function RadialSpeedLines({
  width,
  height,
  cx = width / 2,
  cy = height / 2,
  inner = 0.28,
  count = fx.speedLineCount,
  color: fill = color.ink,
  seed = "radial",
  reach = 1,
  thickness = 1.1,
}: RadialLinesProps) {
  const d = useMemo(() => {
    const rand = rng(seed);
    const outer = Math.hypot(width, height);
    const base = Math.min(width, height) * inner;
    let path = "";
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (rand() - 0.5) * ((Math.PI * 2) / count);
      const half = ((0.25 + rand() * thickness) * Math.PI) / 180;
      const tip = base * (1 + rand() * 0.9);
      const tipR = outer - (outer - tip) * Math.max(0, Math.min(1, reach));
      const x0 = cx + Math.cos(a - half) * outer;
      const y0 = cy + Math.sin(a - half) * outer;
      const x1 = cx + Math.cos(a + half) * outer;
      const y1 = cy + Math.sin(a + half) * outer;
      const xt = cx + Math.cos(a) * tipR;
      const yt = cy + Math.sin(a) * tipR;
      path += `M${r1(x0)} ${r1(y0)}L${r1(xt)} ${r1(yt)}L${r1(x1)} ${r1(y1)}Z`;
    }
    return path;
  }, [width, height, cx, cy, inner, count, seed, reach, thickness]);
  return <path d={d} fill={fill} />;
});

type LinearLinesProps = {
  width: number;
  height: number;
  /** Degrees; 0 = horizontal travel to the right. */
  angle?: number;
  count?: number;
  color?: string;
  seed?: string | number;
  /** 0..1 draw-on progress (lines grow from their tail). */
  progress?: number;
  minLen?: number;
  maxLen?: number;
  maxThickness?: number;
};

/** Directional streaks — tapered at both ends. Use inside an <svg>. */
export const LinearSpeedLines = memo(function LinearSpeedLines({
  width,
  height,
  angle = 0,
  count = fx.speedLineCount,
  color: fill = color.ink,
  seed = "linear",
  progress = 1,
  minLen = 0.15,
  maxLen = 0.6,
  maxThickness = 6,
}: LinearLinesProps) {
  const d = useMemo(() => {
    const rand = rng(seed);
    const span = Math.hypot(width, height);
    let path = "";
    for (let i = 0; i < count; i++) {
      const y = (rand() - 0.5) * span;
      const len = span * (minLen + rand() * (maxLen - minLen)) * Math.max(0, Math.min(1, progress));
      const start = (rand() - 0.5) * span - len / 2;
      const t = 0.6 + rand() * maxThickness;
      if (len < 1) continue;
      const x0 = start;
      const x1 = start + len;
      const xm = start + len * 0.72;
      path += `M${r1(x0)} ${r1(y)}L${r1(xm)} ${r1(y - t / 2)}L${r1(x1)} ${r1(y)}L${r1(xm)} ${r1(y + t / 2)}Z`;
    }
    return path;
  }, [width, height, count, seed, progress, minLen, maxLen, maxThickness]);
  return <path d={d} fill={fill} transform={`translate(${width / 2} ${height / 2}) rotate(${angle})`} />;
});

// ───────────────────────────── Bursts & lettering ─────────────────────────────

export function burstPath(cx: number, cy: number, outer: number, inner: number, spikes: number, seed: string | number) {
  const rand = rng(seed);
  const jit = Array.from({ length: spikes * 2 }, () => rand());
  return burst(cx, cy, outer, inner, spikes, (i) => jit[i]);
}

/** Jagged comic impact balloon. Use inside an <svg>. */
export function ImpactBurst({
  cx,
  cy,
  r,
  spikes = 14,
  fill = color.plateYellow,
  stroke = color.ink,
  strokeWidth = 6,
  inner = 0.62,
  seed = "burst",
  rotate = 0,
}: {
  cx: number;
  cy: number;
  r: number;
  spikes?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  inner?: number;
  seed?: string | number;
  rotate?: number;
}) {
  const d = useMemo(() => burstPath(0, 0, r, r * inner, spikes, seed), [r, inner, spikes, seed]);
  return <path d={d} transform={`translate(${cx} ${cy}) rotate(${rotate})`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="miter" />;
}

/**
 * Heavy slanted comic lettering with ink outline + offset shadow ("DRAW!", "BANG!").
 * Use inside an <svg>. `width` forces the word to an exact length.
 */
export function SfxText({
  x,
  y,
  children,
  size = 120,
  width,
  fill = color.plateYellow,
  stroke = color.ink,
  strokeWidth,
  shadow = color.plateMagenta,
  shadowOffset,
  skew = -12,
  rotate = 0,
  anchor = "middle",
  fontFamily = family.display,
  letterSpacing = 0,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  width?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shadow?: string | null;
  shadowOffset?: [number, number];
  skew?: number;
  rotate?: number;
  anchor?: "start" | "middle" | "end";
  fontFamily?: string;
  letterSpacing?: number;
}) {
  const sw = strokeWidth ?? size * 0.12;
  const so = shadowOffset ?? [size * 0.07, size * 0.08];
  const common = {
    x: 0,
    y: 0,
    fontFamily,
    fontSize: size,
    textAnchor: anchor,
    letterSpacing,
    textLength: width,
    lengthAdjust: width ? ("spacingAndGlyphs" as const) : undefined,
    strokeLinejoin: "round" as const,
    paintOrder: "stroke" as const,
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) skewX(${skew})`}>
      {shadow ? (
        <text {...common} x={so[0]} y={so[1]} fill={shadow} stroke={stroke} strokeWidth={sw}>
          {children}
        </text>
      ) : null}
      <text {...common} fill={fill} stroke={stroke} strokeWidth={sw}>
        {children}
      </text>
    </g>
  );
}

// ───────────────────────────── Print marks ─────────────────────────────

export function RegistrationMark({ x, y, r = 14, stroke = color.ink, strokeWidth = 1.5 }: { x: number; y: number; r?: number; stroke?: string; strokeWidth?: number }) {
  return (
    <g stroke={stroke} strokeWidth={strokeWidth} fill="none">
      <circle cx={x} cy={y} r={r * 0.62} />
      <path d={`M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}`} />
      <circle cx={x} cy={y} r={r * 0.28} fill={stroke} />
    </g>
  );
}

export function CropMarks({ x, y, width, height, len = 22, gap = 8, stroke = color.ink, strokeWidth = 1.5 }: { x: number; y: number; width: number; height: number; len?: number; gap?: number; stroke?: string; strokeWidth?: number }) {
  const x1 = x + width;
  const y1 = y + height;
  const d = [
    `M${x - gap - len} ${y}H${x - gap}M${x} ${y - gap - len}V${y - gap}`,
    `M${x1 + gap} ${y}H${x1 + gap + len}M${x1} ${y - gap - len}V${y - gap}`,
    `M${x - gap - len} ${y1}H${x - gap}M${x} ${y1 + gap}V${y1 + gap + len}`,
    `M${x1 + gap} ${y1}H${x1 + gap + len}M${x1} ${y1 + gap}V${y1 + gap + len}`,
  ].join("");
  return <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" />;
}

/** Deterministic barcode from a string. */
export function Barcode({ x, y, width, height, value, fill = color.ink }: { x: number; y: number; width: number; height: number; value: string; fill?: string }) {
  const bars = useMemo(() => {
    const rand = rng(value);
    const out: [number, number][] = [];
    let cx = 0;
    while (cx < 1) {
      const w = 0.006 + rand() * 0.018;
      if (rand() > 0.42) out.push([cx, w]);
      cx += w + 0.006 + rand() * 0.012;
    }
    return out;
  }, [value]);
  return (
    <g fill={fill}>
      {bars.map(([bx, bw], i) => (
        <rect key={i} x={x + bx * width} y={y} width={Math.max(1, bw * width)} height={height} />
      ))}
    </g>
  );
}

/** Process colour bar swatches. */
export function ColorBar({ x, y, size = 16, colors }: { x: number; y: number; size?: number; colors: string[] }) {
  return (
    <g>
      {colors.map((c, i) => (
        <rect key={i} x={x + i * size} y={y} width={size} height={size} fill={c} />
      ))}
    </g>
  );
}

// ───────────────────────────── Stat hexagon ─────────────────────────────

export function StatHex({
  values,
  labels,
  size = 200,
  fill,
  stroke = color.ink,
  grid = "rgba(14,13,18,.28)",
  labelColor = color.ink,
  progress = 1,
  fontSize,
  floor = 4,
}: {
  /** Stat values on a 0–10 scale. */
  values: number[];
  /** Value mapped to the centre — exaggerates differences between strong stats. */
  floor?: number;
  labels: string[];
  size?: number;
  fill: string;
  stroke?: string;
  grid?: string;
  labelColor?: string;
  progress?: number;
  fontSize?: number;
}) {
  const c = size / 2;
  const R = size * 0.36;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i / values.length) * Math.PI * 2;
    return [c + Math.cos(a) * r, c + Math.sin(a) * r] as const;
  };
  const ring = (r: number) => values.map((_, i) => pt(i, r).map(r1).join(",")).join(" ");
  const norm = (v: number) => Math.max(0.08, (v - floor) / (10 - floor));
  const shape = values.map((v, i) => pt(i, R * norm(v) * Math.max(0, Math.min(1, progress))).map(r1).join(",")).join(" ");
  const fs = fontSize ?? size * 0.07;
  return (
    <g>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={ring(R * k)} fill="none" stroke={grid} strokeWidth={1} />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke={grid} strokeWidth={1} />;
      })}
      <polygon points={shape} fill={fill} fillOpacity={0.85} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
      {labels.map((l, i) => {
        const [x, y] = pt(i, R + fs * 1.5);
        return (
          <text key={l} x={x} y={y + fs * 0.35} fontFamily={family.pixel} fontSize={fs} fill={labelColor} textAnchor="middle">
            {l}
          </text>
        );
      })}
    </g>
  );
}

// ───────────────────────────── Grain ─────────────────────────────

const grainSvg = (freq: number) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.45'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;

export const grainUrl = (freq = 0.85) => `url("data:image/svg+xml;utf8,${encodeURIComponent(grainSvg(freq))}")`;

/** Full-bleed film/print grain. Pass `frame` to re-seed position on twos. */
export function Grain({ opacity = fx.grainOpacity, frame, style }: { opacity?: number; frame?: number; style?: CSSProperties }) {
  const k = frame === undefined ? 0 : Math.floor(frame / 2);
  const rand = rng(`grain${k}`);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: grainUrl(),
        backgroundPosition: `${Math.floor(rand() * 220)}px ${Math.floor(rand() * 220)}px`,
        opacity,
        mixBlendMode: "multiply",
        ...style,
      }}
    />
  );
}

// ───────────────────────────── Comic panel ─────────────────────────────

/** Polygon panel with an ink keyline; children are clipped to the panel. Use inside an <svg>. */
export function ComicPanel({
  points,
  children,
  fill = color.paper,
  stroke = color.ink,
  strokeWidth = 6,
}: {
  points: [number, number][];
  children?: ReactNode;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const id = useSvgId("panel");
  const pts = points.map((p) => p.join(",")).join(" ");
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <polygon points={pts} />
        </clipPath>
      </defs>
      <polygon points={pts} fill={fill} />
      <g clipPath={`url(#${id})`}>{children}</g>
      <polygon points={pts} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </g>
  );
}

// ───────────────────────────── Halftone wipe ─────────────────────────────

/**
 * Halftone dot wipe: dots grow along a direction until they merge into a solid cover.
 * progress 0 → nothing, 1 → fully covered. Use `1 - p` to reveal. Use inside an <svg>.
 */
export const HalftoneWipe = memo(function HalftoneWipe({
  width,
  height,
  progress,
  cell = 64,
  color: fill = color.ink,
  angle = 20,
  spread = 0.9,
}: {
  width: number;
  height: number;
  progress: number;
  cell?: number;
  color?: string;
  /** Direction of travel in degrees (0 = left → right). */
  angle?: number;
  /** How staggered the wave is (0 = all dots at once). */
  spread?: number;
}) {
  if (progress <= 0) return null;
  if (progress >= 1) return <rect width={width} height={height} fill={fill} />;
  const a = (angle * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const ext = Math.abs(width * ca) + Math.abs(height * sa);
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  const dots: ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * cell + (j % 2 ? cell / 2 : 0);
      const y = j * cell;
      const d = ((x - width / 2) * ca + (y - height / 2) * sa) / ext + 0.5;
      const t = Math.min(1, Math.max(0, progress * (1 + spread) - d * spread));
      if (t <= 0) continue;
      const r = cell * 0.78 * (1 - (1 - t) * (1 - t));
      dots.push(<circle key={`${i}-${j}`} cx={r1(x)} cy={r1(y)} r={r1(r)} />);
    }
  }
  return <g fill={fill}>{dots}</g>;
});
