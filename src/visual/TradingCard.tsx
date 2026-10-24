/**
 * Glossy hero trading card — front and back — as a single SVG (630×880, 2.5:3.5).
 * Used by the web gallery fallback, the Remotion HeroTradingCards composition, the
 * YUJIN GLITCH end card, and rasterised into WebGL textures for the 3D gallery.
 */
import { memo, useMemo } from "react";
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroes, statLabels, statOrder } from "@/heroes/roster";
import type { Hero } from "@/heroes/types";
import { HeroEmblem } from "./HeroGraphics";
import { HeroPortrait } from "./HeroPortrait";
import { Barcode, RadialSpeedLines, StatHex } from "./Fx";
import { HalftoneDots, fields } from "./Halftone";
import { useSvgId } from "./useSvgId";

export const CARD_W = 630;
export const CARD_H = 880;
export const CARD_R = 30;

export function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

const artField = fields.radial(0.5, 0.42, 0.05, 0.9, 0.75);
const frameField = fields.linear(35, 0.05, 0.55);
const NAME_SIZE = 52;
const NAME_MAX = CARD_W - 190;
/** Only compress long names; Dela Gothic averages ~0.9em per uppercase glyph. */
const nameLength = (name: string) => (name.length * NAME_SIZE * 0.9 > NAME_MAX ? NAME_MAX : undefined);

type CardProps = {
  hero: Hero;
  side?: "front" | "back";
  width?: number | string;
  /** Renders white where holographic foil should apply (for WebGL foil masks). */
  foilMask?: boolean;
  /** Serial shown in the footer. */
  serial?: string;
};

function CardFront({ hero, foilMask, serial }: CardProps) {
  const id = useSvgId("card");
  const lines = useMemo(() => wrapText(hero.powerFX.description, 46).slice(0, 3), [hero]);
  const ink = color.ink;
  const paper = color.paper;
  const F = (c: string) => (foilMask ? "#000" : c);
  const FOIL = foilMask ? "#fff" : undefined;
  const artX = 40;
  const artY = 82;
  const artW = CARD_W - 80;
  const artH = 452;

  return (
    <g>
      <defs>
        <clipPath id={`${id}-card`}>
          <rect width={CARD_W} height={CARD_H} rx={CARD_R} />
        </clipPath>
        <clipPath id={`${id}-art`}>
          <rect x={artX} y={artY} width={artW} height={artH} rx={6} />
        </clipPath>
        <linearGradient id={`${id}-frame`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hero.primaryColor} />
          <stop offset="0.5" stopColor={hero.secondaryColor} />
          <stop offset="1" stopColor={hero.primaryColor} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-card)`}>
        {/* Frame */}
        <rect width={CARD_W} height={CARD_H} fill={FOIL ?? ink} />
        <rect x={14} y={14} width={CARD_W - 28} height={CARD_H - 28} rx={CARD_R - 12} fill={FOIL ?? `url(#${id}-frame)`} />
        {!foilMask ? <HalftoneDots x={14} y={14} width={CARD_W - 28} height={CARD_H - 28} cell={9} angle={45} color={hero.deepColor} field={frameField} opacity={0.35} /> : null}

        {/* Top bar */}
        <text x={40} y={60} fontFamily={family.wide} fontWeight={800} fontStretch="125%" fontSize={17} letterSpacing={3} fill={F(hero.onPrimary)}>
          IVE HERO UNIVERSE
        </text>
        <text x={CARD_W - 40} y={60} fontFamily={family.pixel} fontSize={20} textAnchor="end" fill={F(hero.onPrimary)}>
          {`Nº ${String(hero.index).padStart(2, "0")}/06`}
        </text>

        {/* Art window */}
        <rect x={artX - 4} y={artY - 4} width={artW + 8} height={artH + 8} rx={9} fill={F(ink)} />
        <g clipPath={`url(#${id}-art)`}>
          <rect x={artX} y={artY} width={artW} height={artH} fill={F(hero.secondaryColor)} />
          {!foilMask ? (
            <>
              <HalftoneDots x={artX} y={artY} width={artW} height={artH} cell={13} angle={15} color={hero.primaryColor} field={artField} opacity={0.75} />
              <g opacity={0.9}>
                <RadialSpeedLines width={artW} height={artH} cx={artX + artW / 2} cy={artY + artH * 0.42} inner={0.34} count={46} color={paper} seed={`card-${hero.id}`} />
              </g>
              <text
                x={artX + artW - 14}
                y={artY + 112}
                fontFamily={family.display}
                fontSize={128}
                textAnchor="end"
                fill={hero.deepColor}
                opacity={0.22}
              >
                {hero.glyph}
              </text>
              <g transform={`translate(${artX + artW / 2 - 225} ${artY + 26}) scale(1.125)`}>
                <HeroPortrait hero={hero} asGroup />
              </g>
            </>
          ) : (
            <text x={artX + artW - 14} y={artY + 112} fontFamily={family.display} fontSize={128} textAnchor="end" fill="#fff">
              {hero.glyph}
            </text>
          )}
        </g>

        {/* Emblem badge overlapping the art window */}
        <circle cx={CARD_W - 84} cy={artY + artH - 6} r={50} fill={FOIL ?? paper} stroke={F(ink)} strokeWidth={5} />
        <g transform={`translate(${CARD_W - 84 - 34} ${artY + artH - 6 - 34}) scale(0.68)`}>
          {foilMask ? <HeroEmblem hero={hero} asGroup flat="#fff" /> : <HeroEmblem hero={hero} asGroup />}
        </g>

        {/* Name plate */}
        <rect x={28} y={artY + artH + 22} width={CARD_W - 56} height={92} fill={F(ink)} />
        <text
          x={46}
          y={artY + artH + 88}
          fontFamily={family.display}
          fontSize={NAME_SIZE}
          fill={FOIL ?? hero.primaryColor}
          textLength={nameLength(hero.heroName)}
          lengthAdjust="spacingAndGlyphs"
        >
          {hero.heroName}
        </text>
        <text x={CARD_W - 46} y={artY + artH + 62} fontFamily={family.hangul} fontSize={26} textAnchor="end" fill={F(paper)}>
          {hero.nameKo}
        </text>
        <text x={CARD_W - 46} y={artY + artH + 94} fontFamily={family.wide} fontWeight={800} fontStretch="112%" fontSize={16} letterSpacing={2} textAnchor="end" fill={F(paper)}>
          {hero.name}
        </text>

        {/* Info panel */}
        <rect x={28} y={artY + artH + 124} width={CARD_W - 56} height={176} fill={F(paper)} />
        <text x={46} y={artY + artH + 156} fontFamily={family.wide} fontWeight={800} fontStretch="125%" fontSize={15} letterSpacing={2.5} fill={F(hero.deepColor)}>
          {hero.heroClass}
        </text>
        <text x={46} y={artY + artH + 188} fontFamily={family.display} fontSize={24} fill={F(ink)}>
          {hero.powerFX.name}
        </text>
        {lines.map((l, i) => (
          <text key={i} x={46} y={artY + artH + 216 + i * 21} fontFamily={family.wide} fontSize={15.5} fontWeight={500} fill={F(ink)}>
            {l}
          </text>
        ))}
        <g transform={`translate(${CARD_W - 196} ${artY + artH + 120}) `}>
          {!foilMask ? (
            <StatHex
              size={176}
              values={statOrder.map((k) => hero.stats[k])}
              labels={statOrder.map((k) => statLabels[k])}
              fill={hero.primaryColor}
              fontSize={11}
            />
          ) : null}
        </g>

        {/* Footer */}
        <Barcode x={40} y={CARD_H - 52} width={120} height={22} value={`${hero.id}-${serial ?? "001"}`} fill={F(hero.onPrimary)} />
        <text x={CARD_W / 2} y={CARD_H - 34} textAnchor="middle" fontFamily={family.pixel} fontSize={15} fill={F(hero.onPrimary)}>
          UNOFFICIAL FAN-MADE · GIRL HERO
        </text>
        <text x={CARD_W - 40} y={CARD_H - 34} textAnchor="end" fontFamily={family.display} fontSize={18} fill={FOIL ?? hero.onPrimary}>
          ★ SSR
        </text>
      </g>
      <rect x={1.5} y={1.5} width={CARD_W - 3} height={CARD_H - 3} rx={CARD_R} fill="none" stroke={F(ink)} strokeWidth={3} />
    </g>
  );
}

function CardBack({ hero, foilMask }: CardProps) {
  const id = useSvgId("cardback");
  const F = (c: string) => (foilMask ? "#000" : c);
  return (
    <g>
      <defs>
        <clipPath id={`${id}-c`}>
          <rect width={CARD_W} height={CARD_H} rx={CARD_R} />
        </clipPath>
        <pattern id={`${id}-mono`} width={120} height={120} patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          {heroes.slice(0, 4).map((h, i) => (
            <g key={h.id} transform={`translate(${(i % 2) * 60 + 12} ${Math.floor(i / 2) * 60 + 12}) scale(0.36)`}>
              <HeroEmblem hero={h} asGroup flat={foilMask ? "#fff" : hero.primaryColor} />
            </g>
          ))}
        </pattern>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect width={CARD_W} height={CARD_H} fill={F(color.ink)} />
        <rect width={CARD_W} height={CARD_H} fill={`url(#${id}-mono)`} opacity={foilMask ? 1 : 0.28} />
        <rect x={40} y={40} width={CARD_W - 80} height={CARD_H - 80} rx={18} fill="none" stroke={foilMask ? "#fff" : hero.primaryColor} strokeWidth={4} />
        <circle cx={CARD_W / 2} cy={CARD_H / 2 - 40} r={150} fill={F(hero.primaryColor)} stroke={F(color.paper)} strokeWidth={6} />
        <g transform={`translate(${CARD_W / 2 - 95} ${CARD_H / 2 - 135}) scale(1.9)`}>
          <HeroEmblem hero={hero} asGroup flat={foilMask ? "#fff" : undefined} />
        </g>
        <text x={CARD_W / 2} y={CARD_H / 2 + 200} textAnchor="middle" fontFamily={family.display} fontSize={96} fill={foilMask ? "#fff" : color.paper}>
          IVE
        </text>
        <text
          x={CARD_W / 2}
          y={CARD_H / 2 + 240}
          textAnchor="middle"
          fontFamily={family.wide}
          fontWeight={900}
          fontStretch="125%"
          fontSize={26}
          letterSpacing={6}
          fill={F(color.paper)}
        >
          HERO UNIVERSE
        </text>
        <text x={CARD_W / 2} y={CARD_H - 70} textAnchor="middle" fontFamily={family.pixel} fontSize={16} fill={F(color.paper)} opacity={0.8}>
          UNOFFICIAL FAN-MADE TRADING CARD · NOT FOR SALE
        </text>
      </g>
    </g>
  );
}

export const TradingCard = memo(function TradingCard({ side = "front", width = CARD_W, ...rest }: CardProps) {
  return (
    <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} width={width} style={{ overflow: "visible", display: "block" }} aria-label={`${rest.hero.heroName} trading card`}>
      {side === "front" ? <CardFront {...rest} /> : <CardBack {...rest} />}
    </svg>
  );
});

/** Group version for embedding inside a larger SVG scene. */
export function TradingCardGroup({ side = "front", ...rest }: CardProps) {
  return side === "front" ? <CardFront {...rest} /> : <CardBack {...rest} />;
}
