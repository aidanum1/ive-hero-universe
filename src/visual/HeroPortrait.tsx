/**
 * Vector bust illustration for a hero — fashion-croquis face (no likeness), glossy
 * mask, pop-art Ben-Day shading, signature-colour hair streak.
 * viewBox 0 0 400 520. Pure SVG; renders identically on web, in Remotion and as a texture.
 */
import { memo, useMemo, type CSSProperties } from "react";
import { color } from "@/design/tokens";
import { paint } from "@/heroes/roster";
import type { Hero } from "@/heroes/types";
import { HeroEmblem, HeroMask } from "./HeroGraphics";
import { HalftoneDots, type Field } from "./Halftone";
import { useSvgId } from "./useSvgId";

export const PORTRAIT_VIEWBOX = "0 0 400 520";

const FACE =
  "M 200 120 C 240 120, 262 152, 262 198 C 262 248, 236 286, 200 294 C 164 286, 138 248, 138 198 C 138 152, 160 120, 200 120 Z";
const NECK_TORSO =
  "M 176 268 L 174 350 C 128 362, 80 384, 60 438 L 44 520 L 356 520 L 340 438 C 320 384, 272 362, 226 350 L 224 268 Z";
const SUIT =
  "M 44 520 L 60 438 C 80 384, 128 362, 174 350 L 200 412 L 226 350 C 272 362, 320 384, 340 438 L 356 520 Z";
const COLLAR = "M 174 350 L 200 412 L 226 350";
const LIPS = "M 186 254 C 192 248, 198 250, 200 252 C 202 250, 208 248, 214 254 C 206 261, 194 261, 186 254 Z";
const NOSE = "M 203 222 C 206 230, 205 236, 199 238";
const EYE_L = "M 156 200 C 162 193, 174 193, 180 200 C 174 205, 162 205, 156 200 Z";
const EYE_R = "M 220 200 C 226 193, 238 193, 244 200 C 238 205, 226 205, 220 200 Z";

/** Mask placement: 240×100 mask scaled to 176 wide with eye-line on y=200. */
const MASK_W = 176;
const MASK_S = MASK_W / 240;
const MASK_X = 200 - MASK_W / 2;
const MASK_Y = 200 - 52 * MASK_S;

export type PortraitMode = "full" | "flat" | "duotone";

type Props = {
  hero: Hero;
  /** full = illustrated; flat = single-colour silhouette (for echoes); duotone = ink + primary only. */
  mode?: PortraitMode;
  flatColor?: string;
  width?: number | string;
  height?: number | string;
  asGroup?: boolean;
  showEmblem?: boolean;
  inkColor?: string;
  paperColor?: string;
  style?: CSSProperties;
  className?: string;
};

function PortraitBody({ hero, mode = "full", flatColor, showEmblem = true, inkColor = color.ink, paperColor = color.paper }: Props) {
  const id = useSvgId("portrait");
  const p = hero.portrait;
  const light = p.light;
  const shadeField = useMemo<Field>(
    () => (u, v) => {
      const side = light === "right" ? 1 - u : u;
      return Math.max(0, side * 1.9 - 0.95) * (0.7 + v * 0.4);
    },
    [light],
  );

  if (mode === "flat") {
    const c = flatColor ?? hero.primaryColor;
    return (
      <g fill={c}>
        <path d={p.hairBack} />
        {p.ornament ? <path d={p.ornament} /> : null}
        <path d={NECK_TORSO} />
        <path d={FACE} />
        <path d={p.hairFront} />
      </g>
    );
  }

  const skin = paperColor;
  const ornamentFill = paint(hero, p.ornamentFill ?? "ink", inkColor, paperColor);

  return (
    <g>
      <defs>
        <clipPath id={`${id}-skin`}>
          <path d={FACE} />
          <path d={NECK_TORSO} />
        </clipPath>
      </defs>
      {/* Back hair with a signature-colour rim on the lit side. */}
      <path d={p.hairBack} fill={hero.primaryColor} transform={light === "right" ? "translate(5 -2)" : "translate(-5 -2)"} />
      <path d={p.hairBack} fill={inkColor} />
      {/* Skin */}
      <path d={NECK_TORSO} fill={skin} />
      <path d={FACE} fill={skin} />
      <g clipPath={`url(#${id}-skin)`}>
        <HalftoneDots x={120} y={110} width={160} height={260} cell={6.5} angle={15} color={hero.primaryColor} field={shadeField} opacity={0.8} />
        {/* jaw / neck shadow */}
        <path d="M 160 286 C 180 298, 220 298, 240 286 L 240 312 L 160 312 Z" fill={hero.primaryColor} opacity={0.28} />
      </g>
      {/* Suit */}
      <path d={SUIT} fill={inkColor} />
      <path d={COLLAR} fill="none" stroke={hero.primaryColor} strokeWidth={7} strokeLinejoin="miter" />
      <path d="M 66 470 L 112 440 M 334 470 L 288 440" stroke={hero.primaryColor} strokeWidth={10} strokeLinecap="butt" />
      {showEmblem ? (
        <g transform="translate(176 430) scale(0.48)">
          <HeroEmblem hero={hero} asGroup inkColor={inkColor} paperColor={paperColor} />
        </g>
      ) : null}
      {/* Face details */}
      <path d={EYE_L} fill={inkColor} />
      <path d={EYE_R} fill={inkColor} />
      <circle cx={171} cy={198} r={2.2} fill={paperColor} />
      <circle cx={235} cy={198} r={2.2} fill={paperColor} />
      <path d={NOSE} fill="none" stroke={inkColor} strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
      <path d={LIPS} fill={color.lip} />
      <path d="M 190 254 C 196 256, 204 256, 210 254" stroke={inkColor} strokeWidth={1.4} fill="none" opacity={0.5} />
      {/* Ornaments (bow, tails, ponytail) sit between face and fringe. */}
      {p.ornament ? <path d={p.ornament} fill={ornamentFill} /> : null}
      <path d={p.hairFront} fill={inkColor} />
      {p.streak ? <path d={p.streak} fill={hero.primaryColor} /> : null}
      {/* Mask */}
      <g transform={`translate(${MASK_X} ${MASK_Y}) scale(${MASK_S})`}>
        <HeroMask hero={hero} asGroup inkColor={inkColor} paperColor={paperColor} />
      </g>
    </g>
  );
}

export const HeroPortrait = memo(function HeroPortrait({ width = 400, height, asGroup, style, className, ...rest }: Props) {
  const body = <PortraitBody {...rest} />;
  if (asGroup) return body;
  return (
    <svg viewBox={PORTRAIT_VIEWBOX} width={width} height={height} style={{ overflow: "visible", ...style }} className={className} aria-hidden>
      {body}
    </svg>
  );
});
