/**
 * Hero emblem + mask renderers. Pure SVG, inline styles only — safe for the web,
 * Remotion and SVG→texture rasterising.
 */
import type { CSSProperties } from "react";
import { color } from "@/design/tokens";
import { paint } from "@/heroes/roster";
import type { Hero, ShapeSet } from "@/heroes/types";
import { useSvgId } from "./useSvgId";

type ShapeProps = {
  hero: Hero;
  /** Render inside an existing <svg> as a <g> instead of a standalone <svg>. */
  asGroup?: boolean;
  width?: number | string;
  height?: number | string;
  /** Flatten every layer to one colour (echo / silhouette use). */
  flat?: string;
  inkColor?: string;
  paperColor?: string;
  style?: CSSProperties;
  className?: string;
};

function ShapeLayers({ set, hero, flat, inkColor = color.ink, paperColor = color.paper }: { set: ShapeSet } & Omit<ShapeProps, "asGroup">) {
  return (
    <>
      {set.layers.map((l, i) => {
        const fill = flat ? (l.fill && l.fill !== "none" ? flat : "none") : paint(hero, l.fill ?? "none", inkColor, paperColor);
        const stroke = flat ? (l.stroke ? flat : "none") : paint(hero, l.stroke, inkColor, paperColor);
        return (
          <path
            key={i}
            d={l.d}
            fill={fill}
            fillRule={l.fillRule}
            stroke={stroke}
            strokeWidth={l.strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={l.opacity}
          />
        );
      })}
    </>
  );
}

export function HeroEmblem({ hero, asGroup, width = 100, height, style, className, ...rest }: ShapeProps) {
  const body = <ShapeLayers set={hero.logo} hero={hero} {...rest} />;
  if (asGroup) return <g>{body}</g>;
  return (
    <svg viewBox={hero.logo.viewBox} width={width} height={height ?? width} style={{ overflow: "visible", ...style }} className={className} aria-hidden>
      {body}
    </svg>
  );
}

/** Glossy candy-acrylic mask: base shape + clipped specular sweep + inner shade. */
export function HeroMask({
  hero,
  asGroup,
  width = 240,
  height,
  gloss = true,
  style,
  className,
  ...rest
}: ShapeProps & { gloss?: boolean }) {
  const id = useSvgId("mask");
  const main = hero.mask.layers[0];
  const body = (
    <>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={main.d} clipRule={main.fillRule} />
        </clipPath>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.32" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor={hero.deepColor} stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <ShapeLayers set={hero.mask} hero={hero} {...rest} />
      {gloss && !rest.flat ? (
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="0" y="0" width="240" height="100" fill={`url(#${id}-gloss)`} />
          <path d="M 20 20 C 60 34, 100 36, 120 40 C 140 36, 180 34, 222 20 L 222 30 C 180 42, 140 46, 120 50 C 100 46, 60 42, 20 30 Z" fill="#fff" opacity="0.55" />
        </g>
      ) : null}
    </>
  );
  if (asGroup) return <g>{body}</g>;
  return (
    <svg viewBox={hero.mask.viewBox} width={width} height={height} style={{ overflow: "visible", ...style }} className={className} aria-hidden>
      {body}
    </svg>
  );
}
