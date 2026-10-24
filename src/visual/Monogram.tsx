/**
 * Kitsch "monogram" wallpaper — the six hero emblems tiled small, like a
 * luxury-house pattern gone pop. Standalone SVG filling its container.
 */
import type { CSSProperties } from "react";
import { heroes } from "@/heroes/roster";
import { HeroEmblem } from "./HeroGraphics";
import { useSvgId } from "./useSvgId";

export function Monogram({
  tile = 132,
  rotate = -8,
  tint,
  opacity = 1,
  style,
  className,
}: {
  tile?: number;
  rotate?: number;
  /** Flatten all emblems to one colour (e.g. a pastel). */
  tint?: string;
  opacity?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const id = useSvgId("mono");
  const cell = tile / 3;
  return (
    <svg width="100%" height="100%" style={style} className={className} aria-hidden>
      <defs>
        <pattern id={id} width={tile} height={tile * (2 / 3)} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rotate})`}>
          {heroes.map((h, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const s = (cell * 0.5) / 100;
            const x = col * cell + cell * 0.25 + (row ? cell * 0.5 : 0);
            const y = row * cell + cell * 0.25;
            return (
              <g key={h.id} transform={`translate(${x % tile} ${y}) scale(${s})`}>
                <HeroEmblem hero={h} asGroup flat={tint} />
              </g>
            );
          })}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}
