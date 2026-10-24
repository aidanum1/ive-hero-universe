/**
 * HERO COMICS — "ISSUE Nº05: TRAINING DAY". One comic page (1600×2400) of tilted panels,
 * a picture-in-picture circle inset, balloons and SFX lettering. Pure SVG; the website
 * flies a guided-view camera across it and the trailer reuses the same page.
 * Story is fan fiction riffing on the GIRL HERO "training centre" and "on set" ideas.
 */
import { memo, type ReactNode } from "react";
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroById, heroes } from "@/heroes/roster";
import type { Hero, HeroId } from "@/heroes/types";
import { arc, star } from "@/heroes/shapes";
import { HeroEmblem } from "./HeroGraphics";
import { HeroPortrait } from "./HeroPortrait";
import { HalftoneDots, fields } from "./Halftone";
import { ComicPanel, ImpactBurst, LinearSpeedLines, RadialSpeedLines, SfxText } from "./Fx";

export const PAGE_W = 1600;
export const PAGE_H = 2400;

export type ComicPanelMeta = {
  id: string;
  hero?: HeroId;
  /** Camera framing box (x, y, w, h) and dutch angle in degrees. */
  box: [number, number, number, number];
  tilt: number;
};

export const comicPanels: ComicPanelMeta[] = [
  { id: "title", box: [40, 40, 960, 590], tilt: -2 },
  { id: "yujin", hero: "yujin", box: [1020, 40, 540, 600], tilt: 3 },
  { id: "gaeul", hero: "gaeul", box: [40, 660, 720, 570], tilt: -3 },
  { id: "rei", hero: "rei", box: [620, 690, 480, 480], tilt: 4 },
  { id: "wonyoung", hero: "wonyoung", box: [960, 660, 600, 570], tilt: -2 },
  { id: "liz", hero: "liz", box: [40, 1250, 940, 520], tilt: 2 },
  { id: "leeseo", hero: "leeseo", box: [1000, 1250, 560, 540], tilt: -4 },
  { id: "finale", box: [40, 1810, 1520, 550], tilt: 0 },
];

const P = (pts: number[]) => {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length; i += 2) out.push([pts[i], pts[i + 1]]);
  return out;
};

const fig = (cx: number, by: number, s: number) => `translate(${cx} ${by}) scale(${s}) translate(-200 -520)`;

/** Comic speech balloon with tail. Lines are pre-broken. */
function Balloon({ x, y, w, h, tail, lines, size = 30, shout = false }: { x: number; y: number; w: number; h: number; tail: [number, number]; lines: string[]; size?: number; shout?: boolean }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const body = shout
    ? star(cx, cy, Math.max(w, h) * 0.62, Math.max(w, h) * 0.5, 14, -90)
    : `M ${x + w * 0.5} ${y} C ${x + w * 1.02} ${y}, ${x + w * 1.02} ${y + h}, ${x + w * 0.5} ${y + h} C ${x - w * 0.02} ${y + h}, ${x - w * 0.02} ${y}, ${x + w * 0.5} ${y} Z`;
  const [tx, ty] = tail;
  const tailD = `M ${cx - w * 0.08} ${cy + h * 0.32} L ${tx} ${ty} L ${cx + w * 0.06} ${cy + h * 0.38} Z`;
  return (
    <g data-balloon>
      <path d={tailD} fill={color.white} stroke={color.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={body} fill={color.white} stroke={color.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${cx - w * 0.06} ${cy + h * 0.3} L ${cx + w * 0.04} ${cy + h * 0.34}`} stroke={color.white} strokeWidth={8} />
      {lines.map((l, i) => (
        <text
          key={i}
          x={cx}
          y={cy + (i - (lines.length - 1) / 2) * size * 1.12 + size * 0.36}
          textAnchor="middle"
          fontFamily={family.wide}
          fontWeight={800}
          fontStretch="100%"
          fontSize={size}
          fill={color.ink}
        >
          {l}
        </text>
      ))}
    </g>
  );
}

function Caption({ x, y, w, children, fill = color.plateYellow, size = 24 }: { x: number; y: number; w: number; children: ReactNode; fill?: string; size?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={size * 2} fill={fill} stroke={color.ink} strokeWidth={4} />
      <text x={x + 16} y={y + size * 1.32} fontFamily={family.wide} fontWeight={800} fontStretch="112%" fontSize={size} letterSpacing={size * 0.06} fill={color.ink}>
        {children}
      </text>
    </g>
  );
}

const panelDots = fields.radial(0.5, 0.5, 0.9, 0.08, 0.7);

function HeroPanel({ hero, points, children, dots = true }: { hero: Hero; points: [number, number][]; children: ReactNode; dots?: boolean }) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const w = Math.max(...xs) - x;
  const h = Math.max(...ys) - y;
  return (
    <ComicPanel points={points} fill={hero.secondaryColor} strokeWidth={7}>
      {dots ? <HalftoneDots x={x} y={y} width={w} height={h} cell={20} angle={45} color={hero.primaryColor} field={panelDots} opacity={0.5} /> : null}
      {children}
    </ComicPanel>
  );
}

export const ComicPage = memo(function ComicPage({ background = color.paper }: { background?: string }) {
  const H = heroById;
  return (
    <g>
      <rect width={PAGE_W} height={PAGE_H} fill={background} />

      {/* ───────── 1 · title splash ───────── */}
      <g data-panel="title">
        <ComicPanel points={P([40, 40, 1000, 40, 980, 630, 40, 610])} fill={color.ink} strokeWidth={7}>
          <RadialSpeedLines width={PAGE_W} height={PAGE_H} cx={520} cy={330} inner={0.08} count={70} color="#2A2635" seed="comic-title" />
          {heroes.map((h, i) => (
            <g key={h.id} transform={`translate(${110 + i * 140} 430) scale(1.05)`}>
              <HeroEmblem hero={h} asGroup />
            </g>
          ))}
          <text x={80} y={140} fontFamily={family.pixel} fontSize={30} fill={color.paper} letterSpacing={2}>
            HERO COMICS · ISSUE Nº05
          </text>
          <g data-sfx>
            <SfxText x={510} y={300} size={150} width={860} fill={color.plateYellow} shadow={color.plateMagenta} skew={-12} rotate={-3}>
              TRAINING DAY
            </SfxText>
          </g>
          <text x={510} y={380} textAnchor="middle" fontFamily={family.serif} fontStyle="italic" fontSize={40} fill={color.paper}>
            six heroes, one very long morning
          </text>
        </ComicPanel>
        <Caption x={70} y={560} w={560}>
          HERO TRAINING CENTER — 06:00
        </Caption>
      </g>

      {/* ───────── 2 · Yujin ───────── */}
      <g data-panel="yujin">
        <HeroPanel hero={H.yujin} points={P([1020, 40, 1560, 40, 1560, 640, 1040, 620])}>
          <LinearSpeedLines width={PAGE_W} height={PAGE_H} angle={0} count={60} color={color.paper} seed="comic-yujin" maxThickness={8} />
          {[3, 2, 1].map((k) => (
            <g key={k} transform={fig(1290 - k * 70, 660, 1.0)} opacity={0.18 + (3 - k) * 0.18}>
              <HeroPortrait hero={H.yujin} asGroup mode="flat" flatColor={H.yujin.primaryColor} />
            </g>
          ))}
          <g transform={fig(1300, 660, 1.0)}>
            <HeroPortrait hero={H.yujin} asGroup />
          </g>
        </HeroPanel>
        <Balloon x={1060} y={70} w={330} h={140} tail={[1210, 250]} lines={["WARM-UP'S OVER.", "POSITIONS!"]} size={30} />
        <g data-sfx>
          <SfxText x={1470} y={300} size={90} rotate={10} fill={H.yujin.accentColor} shadow={H.yujin.primaryColor}>
            번쩍
          </SfxText>
        </g>
      </g>

      {/* ───────── 3 · Gaeul ───────── */}
      <g data-panel="gaeul">
        <HeroPanel hero={H.gaeul} points={P([40, 660, 760, 660, 720, 1230, 40, 1230])}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={arc(560, 900 + i * 60, 360 - i * 50, 140, 230)} fill="none" stroke={i === 1 ? H.gaeul.accentColor : color.paper} strokeWidth={26 - i * 6} strokeLinecap="round" />
          ))}
          <g transform={fig(280, 1250, 1.05)}>
            <HeroPortrait hero={H.gaeul} asGroup />
          </g>
          {/* the book */}
          <g transform="translate(470 1080) rotate(-12)">
            <path d="M 0 0 L 120 -20 L 120 80 L 0 100 Z" fill={color.paper} stroke={color.ink} strokeWidth={5} />
            <path d="M 0 0 L -120 -20 L -120 80 L 0 100 Z" fill={color.white} stroke={color.ink} strokeWidth={5} />
            <path d="M -100 10 L -20 22 M -100 32 L -20 44 M 20 22 L 100 10 M 20 44 L 100 32" stroke={color.ink} strokeWidth={3} />
          </g>
        </HeroPanel>
        <Balloon x={350} y={690} w={360} h={130} tail={[330, 860]} lines={["PAGE 47.", "PALM TECHNIQUE."]} size={28} />
        <g data-sfx>
          <SfxText x={170} y={790} size={92} rotate={-8} fill={H.gaeul.accentColor} shadow={H.gaeul.deepColor}>
            휘익
          </SfxText>
        </g>
      </g>

      {/* ───────── 5 · Wonyoung ───────── */}
      <g data-panel="wonyoung">
        <HeroPanel hero={H.wonyoung} points={P([960, 680, 1560, 660, 1560, 1230, 1000, 1230])}>
          {[0, 1, 2].map((k) => (
            <path key={k} d={arc(1270, 1010, 300 - k * 18, -170, 10 - k * 20)} fill="none" stroke={k === 0 ? "#fff" : H.wonyoung.primaryColor} strokeWidth={k === 0 ? 14 : 30 - k * 8} strokeLinecap="round" />
          ))}
          <g transform={fig(1300, 1250, 1.05)}>
            <HeroPortrait hero={H.wonyoung} asGroup />
          </g>
          <path d={star(1480, 760, 46, 8, 4)} fill="#fff" stroke={H.wonyoung.primaryColor} strokeWidth={3} />
          <path d={star(1060, 1150, 30, 6, 4)} fill="#fff" stroke={H.wonyoung.primaryColor} strokeWidth={3} />
        </HeroPanel>
        <Balloon x={1110} y={700} w={330} h={120} tail={[1250, 880]} lines={["WAS THAT", "THE COVER SHOT?"]} size={27} />
        <g data-sfx>
          <SfxText x={1490} y={980} size={88} rotate={9} fill={H.wonyoung.accentColor} shadow={H.wonyoung.deepColor}>
            챙
          </SfxText>
        </g>
      </g>

      {/* ───────── 4 · Rei (circle inset, drawn above neighbours) ───────── */}
      <g data-panel="rei">
        <circle cx={860} cy={930} r={238} fill={color.ink} />
        <ComicPanel points={Array.from({ length: 48 }, (_, i) => [860 + Math.cos((i / 48) * Math.PI * 2) * 226, 930 + Math.sin((i / 48) * Math.PI * 2) * 226] as [number, number])} fill={H.rei.secondaryColor} strokeWidth={8}>
          <RadialSpeedLines width={PAGE_W} height={PAGE_H} cx={860} cy={900} inner={0.06} count={40} color={H.rei.primaryColor} seed="comic-rei" />
          <g transform={fig(860, 1200, 0.92)}>
            <HeroPortrait hero={H.rei} asGroup />
          </g>
          <ImpactBurst cx={1000} cy={860} r={70} spikes={8} fill={H.rei.primaryColor} seed="comic-rei-flash" strokeWidth={5} />
        </ComicPanel>
        <Balloon x={640} y={700} w={240} h={110} tail={[760, 860]} lines={["BANG.", "YOU'RE IT."]} size={26} shout />
        <g data-sfx>
          <SfxText x={1040} y={1130} size={96} rotate={-12} fill={H.rei.primaryColor} shadow={color.ink}>
            탕!
          </SfxText>
        </g>
      </g>

      {/* ───────── 6 · Liz ───────── */}
      <g data-panel="liz">
        <HeroPanel hero={H.liz} points={P([40, 1260, 990, 1250, 970, 1770, 40, 1770])}>
          {[60, 120, 180].map((r, i) => (
            <circle key={r} cx={740} cy={1440} r={r} fill={i === 1 ? color.paper : "none"} stroke={i === 1 ? color.ink : H.liz.primaryColor} strokeWidth={i === 1 ? 6 : 22} />
          ))}
          <circle cx={740} cy={1440} r={34} fill={H.liz.primaryColor} stroke={color.ink} strokeWidth={6} />
          <g transform="translate(740 1440) rotate(-38)">
            <path d="M -260 -5 L 0 -5 L 22 0 L 0 5 L -260 5 Z" fill={color.ink} />
            <path d="M -260 -5 L -290 -24 L -240 -5 Z M -260 5 L -290 24 L -240 5 Z" fill={H.liz.accentColor} stroke={color.ink} strokeWidth={3} />
          </g>
          <g transform={fig(300, 1790, 1.0)}>
            <HeroPortrait hero={H.liz} asGroup />
          </g>
        </HeroPanel>
        <Balloon x={520} y={1610} w={360} h={120} tail={[440, 1580]} lines={["DEAD CENTRE.", "AGAIN."]} size={28} />
        <g data-sfx>
          <SfxText x={880} y={1350} size={90} rotate={8} fill={H.liz.accentColor} shadow={H.liz.deepColor}>
            딱!
          </SfxText>
        </g>
      </g>

      {/* ───────── 7 · Leeseo ───────── */}
      <g data-panel="leeseo">
        <HeroPanel hero={H.leeseo} points={P([1010, 1250, 1560, 1270, 1560, 1790, 1030, 1770])}>
          <path d="M 1290 1260 Q 1250 1380 1300 1460" fill="none" stroke={color.ink} strokeWidth={6} />
          <path d="M 1020 1300 L 1290 1460 L 1560 1320" fill="none" stroke={color.paper} strokeWidth={8} />
          <g transform={fig(1290, 1800, 0.98)}>
            <HeroPortrait hero={H.leeseo} asGroup />
          </g>
          <line x1={1380} y1={1640} x2={1490} y2={1720} stroke={color.ink} strokeWidth={5} />
          <g transform="translate(1495 1722) rotate(20)">
            <circle r={44} fill={H.leeseo.primaryColor} stroke={color.ink} strokeWidth={6} />
            <circle r={20} fill="none" stroke={color.ink} strokeWidth={4} />
          </g>
        </HeroPanel>
        <Balloon x={1050} y={1290} w={320} h={120} tail={[1190, 1450]} lines={["WHO WANTS", "TO SEE A TRICK?"]} size={26} />
        <g data-sfx>
          <SfxText x={1440} y={1440} size={70} rotate={-10} fill={H.leeseo.accentColor} shadow={H.leeseo.deepColor}>
            휘리릭
          </SfxText>
        </g>
      </g>

      {/* ───────── 8 · finale: lineup + "CUT!" ───────── */}
      <g data-panel="finale">
        <ComicPanel points={P([40, 1810, 1560, 1810, 1560, 2360, 40, 2360])} fill={color.lilac} strokeWidth={7}>
          <rect x={40} y={1810} width={1520} height={550} fill={color.lilac} />
          <HalftoneDots x={40} y={1810} width={1520} height={550} cell={18} angle={15} color={color.plateMagenta} field={fields.linear(90, 0.05, 0.5)} opacity={0.35} />
          {heroes.map((h, i) => (
            <g key={h.id} transform={fig(190 + i * 244, 2380, 0.9)}>
              <HeroPortrait hero={h} asGroup />
            </g>
          ))}
        </ComicPanel>
        <Balloon x={1060} y={1830} w={440} h={150} tail={[1580, 1830]} lines={["...AND CUT!", "THAT'S A WRAP, HEROES."]} size={30} shout />
        <Caption x={70} y={1840} w={600} fill={color.paper}>
          MEANWHILE, ON SET…
        </Caption>
        <g data-sfx>
          <SfxText x={800} y={2050} size={120} width={1180} rotate={-4} fill={color.plateYellow} shadow={color.plateMagenta}>
            TO BE CONTINUED
          </SfxText>
        </g>
      </g>
    </g>
  );
});
