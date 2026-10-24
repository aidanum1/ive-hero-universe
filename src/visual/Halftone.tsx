/**
 * Print-surface primitives: true variable-size halftone, hero texture patterns,
 * screen-tone helpers. Deterministic, renderer-agnostic SVG.
 */
import { useMemo, type CSSProperties } from "react";
import type { TextureKind, TextureSpec } from "@/heroes/types";
import { useSvgId } from "./useSvgId";

export type Field = (u: number, v: number) => number;

/** Common field presets (u,v in 0..1 → coverage 0..1). */
export const fields = {
  linear:
    (angleDeg = 0, from = 0, to = 1): Field =>
    (u, v) => {
      const a = (angleDeg * Math.PI) / 180;
      const t = (u - 0.5) * Math.cos(a) + (v - 0.5) * Math.sin(a) + 0.5;
      return from + (to - from) * t;
    },
  radial:
    (cx = 0.5, cy = 0.5, inner = 1, outer = 0, spread = 0.7): Field =>
    (u, v) => {
      const d = Math.hypot(u - cx, v - cy) / spread;
      return inner + (outer - inner) * Math.min(1, d);
    },
  flat: (value = 0.5): Field => () => value,
};

type HalftoneProps = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  /** Grid pitch in user units. */
  cell?: number;
  /** Screen angle in degrees (classic: 15 / 45 / 75). */
  angle?: number;
  color?: string;
  field: Field;
  /** Coverage below this is dropped (keeps highlights clean). */
  threshold?: number;
  opacity?: number;
};

/** Variable-size dot screen rendered as circles. Use inside an <svg>. */
export function HalftoneDots({ x = 0, y = 0, width, height, cell = 10, angle = 45, color = "#000", field, threshold = 0.04, opacity = 1 }: HalftoneProps) {
  const dots = useMemo(() => {
    const out: { cx: number; cy: number; r: number }[] = [];
    const a = (angle * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const cxm = x + width / 2;
    const cym = y + height / 2;
    const reach = Math.hypot(width, height) / 2 + cell;
    const n = Math.ceil(reach / cell);
    const maxR = cell * 0.62;
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        const gx = i * cell;
        const gy = j * cell;
        const px = cxm + gx * cos - gy * sin;
        const py = cym + gx * sin + gy * cos;
        if (px < x - cell || px > x + width + cell || py < y - cell || py > y + height + cell) continue;
        const cov = field((px - x) / width, (py - y) / height);
        if (cov <= threshold) continue;
        out.push({ cx: Math.round(px * 10) / 10, cy: Math.round(py * 10) / 10, r: Math.round(maxR * Math.sqrt(Math.min(1, cov)) * 10) / 10 });
      }
    }
    return out;
  }, [x, y, width, height, cell, angle, field, threshold]);

  return (
    <g fill={color} opacity={opacity}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
      ))}
    </g>
  );
}

/** Standalone full-bleed halftone SVG (absolutely positioned by the caller). */
export function HalftoneLayer({
  width = 1000,
  height = 1000,
  style,
  className,
  preserveAspectRatio = "xMidYMid slice",
  ...rest
}: Omit<HalftoneProps, "x" | "y"> & { style?: CSSProperties; className?: string; preserveAspectRatio?: string }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio={preserveAspectRatio} style={style} className={className} aria-hidden>
      <HalftoneDots width={width} height={height} {...rest} />
    </svg>
  );
}

/** Pattern tile for each hero texture kind. Returns a <pattern> element body. */
function TextureTile({ kind, s, stroke }: { kind: TextureKind; s: number; stroke: string }) {
  switch (kind) {
    case "speed":
      return (
        <g fill={stroke}>
          <rect x={0} y={s * 0.15} width={s * 5.2} height={s * 0.16} />
          <rect x={s * 3.4} y={s * 0.62} width={s * 3.8} height={s * 0.1} />
          <rect x={s * 1.2} y={s * 0.86} width={s * 1.6} height={s * 0.07} />
        </g>
      );
    case "hatch":
      return <rect x={0} y={0} width={s} height={s * 0.18} fill={stroke} />;
    case "dots":
      return <circle cx={s / 2} cy={s / 2} r={s * 0.24} fill={stroke} />;
    case "diamond":
      return <path d={`M ${s / 2} 0 L ${s} ${s / 2} L ${s / 2} ${s} L 0 ${s / 2} Z`} fill="none" stroke={stroke} strokeWidth={s * 0.06} />;
    case "zigzag":
      return (
        <path
          d={`M 0 ${s * 0.7} L ${s * 0.25} ${s * 0.3} L ${s * 0.5} ${s * 0.7} L ${s * 0.75} ${s * 0.3} L ${s} ${s * 0.7}`}
          fill="none"
          stroke={stroke}
          strokeWidth={s * 0.1}
          strokeLinejoin="miter"
        />
      );
    case "rings":
      return <circle cx={s / 2} cy={s / 2} r={s * 0.34} fill="none" stroke={stroke} strokeWidth={s * 0.08} />;
  }
}

const tileSize = (kind: TextureKind, s: number) => (kind === "speed" ? { w: s * 8, h: s } : { w: s, h: s });

/** Full-bleed hero texture (absolutely positioned by caller). */
export function HeroTexture({
  texture,
  color: stroke,
  opacity = 1,
  scale = 1,
  style,
  className,
}: {
  texture: TextureSpec;
  color: string;
  opacity?: number;
  scale?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const id = useSvgId("tex");
  const s = texture.scale * scale;
  const { w, h } = tileSize(texture.kind, s);
  return (
    <svg width="100%" height="100%" style={style} className={className} aria-hidden>
      <defs>
        <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse" patternTransform={`rotate(${texture.angle})`}>
          <TextureTile kind={texture.kind} s={s} stroke={stroke} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/** Cheap uniform dot screen as a CSS background (for large static web surfaces). */
export const dotScreenCss = (dot: string, size = 10, radius = 26) =>
  `radial-gradient(circle at center, ${dot} ${radius}%, transparent ${radius + 1}%) 0 0 / ${size}px ${size}px`;
