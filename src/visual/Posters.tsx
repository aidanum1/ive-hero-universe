/**
 * Fake one-sheets & editorial covers (800×1200, 2:3). Pure SVG, shared by the website's
 * NOW SHOWING section and the Remotion trailer. All original fan designs.
 */
import type { ReactNode } from "react";
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroById, heroes } from "@/heroes/roster";
import { owner } from "@/content/project";
import { burst, poly, star } from "@/heroes/shapes";
import { HeroEmblem, HeroMask } from "./HeroGraphics";
import { HeroPortrait } from "./HeroPortrait";
import { Barcode, RadialSpeedLines, SfxText } from "./Fx";
import { HalftoneDots, fields } from "./Halftone";
import { useSvgId } from "./useSvgId";

export const POSTER_W = 800;
export const POSTER_H = 1200;

const fig = (cx: number, by: number, s: number) => `translate(${cx} ${by}) scale(${s}) translate(-200 -520)`;
const dotsDown = fields.linear(90, 0.0, 0.85);
const dotsRadial = fields.radial(0.5, 0.45, 0.85, 0.0, 0.7);

/** Classic condensed billing block. */
function Billing({ y, fill, lines }: { y: number; fill: string; lines: string[] }) {
  return (
    <g>
      {lines.map((l, i) => (
        <text key={i} x={POSTER_W / 2} y={y + i * 22} textAnchor="middle" fontFamily={family.wide} fontWeight={700} fontStretch="62%" fontSize={i === 0 ? 20 : 17} letterSpacing={1.5} fill={fill}>
          {l}
        </text>
      ))}
    </g>
  );
}

function Frame({ children, background }: { children: ReactNode; background: string }) {
  const id = useSvgId("poster");
  return (
    <svg viewBox={`0 0 ${POSTER_W} ${POSTER_H}`} width="100%" style={{ display: "block" }} aria-hidden>
      <defs>
        <clipPath id={id}>
          <rect width={POSTER_W} height={POSTER_H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width={POSTER_W} height={POSTER_H} fill={background} />
        {children}
      </g>
    </svg>
  );
}

const BILLING = [
  `AN ${owner.handle.toUpperCase()} FAN PICTURE · SIX HEROES IN AN UNOFFICIAL UNIVERSE`,
  "YUJIN · GAEUL · REI · WONYOUNG · LIZ · LEESEO",
  "MOTION BY GSAP · REMOTION · THREE.JS   TYPE BY DELA GOTHIC · ARCHIVO · BODONI",
  "NOT AFFILIATED WITH IVE OR STARSHIP ENTERTAINMENT · NO PURCHASE NECESSARY",
];

/** 1 · Saul-Bass-ish solo one-sheet. */
export function PosterCaptainPurple() {
  const h = heroById.yujin;
  return (
    <Frame background={color.paper}>
      <path d={poly([[0, 0], [800, 0], [800, 380], [0, 980]])} fill={h.primaryColor} />
      <path d={poly([[470, 120], [250, 640], [400, 640], [300, 1040], [620, 470], [460, 470], [600, 120]])} fill={h.accentColor} stroke={color.ink} strokeWidth={10} strokeLinejoin="miter" />
      <g transform={fig(260, 1130, 1.25)}>
        <HeroPortrait hero={h} asGroup mode="flat" flatColor={color.ink} />
      </g>
      <g transform="translate(150 620) scale(0.95)">
        <HeroMask hero={h} asGroup flat={h.primaryColor} />
      </g>
      <text x={60} y={110} fontFamily={family.pixel} fontSize={26} fill={color.paper} letterSpacing={2}>
        BLINK AND YOU MISSED HER
      </text>
      <text x={740} y={760} textAnchor="end" fontFamily={family.display} fontSize={112} fill={color.paper} stroke={color.ink} strokeWidth={10} paintOrder="stroke">
        CAPTAIN
      </text>
      <text x={740} y={870} textAnchor="end" fontFamily={family.display} fontSize={112} fill={h.primaryColor} stroke={color.ink} strokeWidth={6} paintOrder="stroke">
        PURPLE
      </text>
      <text x={740} y={930} textAnchor="end" fontFamily={family.serif} fontStyle="italic" fontSize={38} fill={color.ink}>
        a quicksilver picture
      </text>
      <rect x={500} y={980} width={240} height={46} fill={color.ink} />
      <text x={620} y={1012} textAnchor="middle" fontFamily={family.pixel} fontSize={24} fill={color.paper}>
        26.10 · 18:00 KST
      </text>
      <Billing y={1090} fill={color.ink} lines={BILLING} />
    </Frame>
  );
}

/** 2 · Dense 90s ensemble poster. */
export function PosterLooksCanKill() {
  return (
    <Frame background={color.ink}>
      <RadialSpeedLines width={POSTER_W} height={POSTER_H} cx={400} cy={520} inner={0.1} count={80} color="#26222F" seed="poster-lck" />
      <HalftoneDots width={POSTER_W} height={POSTER_H} cell={18} angle={45} color={color.plateMagenta} field={dotsRadial} opacity={0.35} />
      {heroes.map((h, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <g key={h.id}>
            <circle cx={150 + col * 250} cy={300 + row * 300 + (col === 1 ? 60 : 0)} r={118} fill={h.primaryColor} stroke={color.paper} strokeWidth={6} />
            <g transform={fig(150 + col * 250, 420 + row * 300 + (col === 1 ? 60 : 0), 0.62)}>
              <HeroPortrait hero={h} asGroup showEmblem={false} />
            </g>
          </g>
        );
      })}
      <path d={burst(400, 1000, 300, 220, 22)} fill={color.plateYellow} stroke={color.ink} strokeWidth={8} />
      <SfxText x={400} y={985} size={112} width={640} fill={color.ink} stroke={color.paper} shadow={color.plateMagenta} skew={-10}>
        LOOKS CAN
      </SfxText>
      <SfxText x={400} y={1090} size={150} width={430} fill={color.signal} stroke={color.ink} shadow={color.ink} skew={-10}>
        KILL
      </SfxText>
      <text x={60} y={90} fontFamily={family.display} fontSize={44} fill={color.paper}>
        六人の英雄
      </text>
      <text x={60} y={128} fontFamily={family.pixel} fontSize={22} fill={color.plateYellow} letterSpacing={2}>
        THE GIRL HERO EPISODE · ISSUE Nº05
      </text>
      <text x={740} y={90} textAnchor="end" fontFamily={family.hangul} fontSize={40} fill={color.paper}>
        여섯 명의 영웅
      </text>
      <Billing y={1160} fill={color.paper} lines={[BILLING[1]]} />
    </Frame>
  );
}

/** 3 · Fashion magazine cover. */
export function PosterMagazine() {
  const h = heroById.wonyoung;
  return (
    <Frame background={h.secondaryColor}>
      <HalftoneDots width={POSTER_W} height={POSTER_H} cell={14} angle={15} color={h.primaryColor} field={dotsDown} opacity={0.45} />
      <text x={400} y={250} textAnchor="middle" fontFamily={family.serif} fontWeight={900} fontStyle="italic" fontSize={290} letterSpacing={-14} fill={color.ink}>
        Hero
      </text>
      <text x={400} y={88} textAnchor="middle" fontFamily={family.wide} fontWeight={800} fontStretch="125%" fontSize={18} letterSpacing={6} fill={color.ink}>
        THE GIRL HERO ISSUE · Nº05 · OCTOBER
      </text>
      <g transform={fig(420, 1240, 2.1)}>
        <HeroPortrait hero={h} asGroup />
      </g>
      <g fontFamily={family.wide} fill={color.ink}>
        <text x={50} y={400} fontWeight={900} fontStretch="125%" fontSize={34}>
          BAT PINK
        </text>
        <text x={50} y={436} fontFamily={family.serif} fontStyle="italic" fontSize={30}>
          on glamour as armour
        </text>
        <text x={50} y={600} fontWeight={900} fontStretch="62%" fontSize={58} fill={h.deepColor}>
          6 MASKS
        </text>
        <text x={50} y={650} fontWeight={900} fontStretch="62%" fontSize={58} fill={h.deepColor}>
          TO KILL FOR
        </text>
        <text x={750} y={420} textAnchor="end" fontWeight={800} fontStretch="112%" fontSize={20} letterSpacing={2}>
          THE QUICKSILVER
        </text>
        <text x={750} y={446} textAnchor="end" fontWeight={800} fontStretch="112%" fontSize={20} letterSpacing={2}>
          STEP, DECODED
        </text>
        <text x={750} y={474} textAnchor="end" fontFamily={family.pixel} fontSize={18}>
          p.47
        </text>
      </g>
      <g transform="translate(610 880) rotate(-12)">
        <path d={star(0, 0, 100, 80, 16)} fill={color.plateYellow} stroke={color.ink} strokeWidth={5} />
        <text x={0} y={-6} textAnchor="middle" fontFamily={family.display} fontSize={30} fill={color.ink}>
          FREE
        </text>
        <text x={0} y={26} textAnchor="middle" fontFamily={family.wide} fontWeight={800} fontSize={16} fill={color.ink}>
          HOLO CARD
        </text>
      </g>
      <rect x={40} y={1060} width={210} height={104} fill={color.white} />
      <Barcode x={52} y={1070} width={186} height={62} value="HERO-05-WONYOUNG" />
      <text x={145} y={1152} textAnchor="middle" fontFamily={family.pixel} fontSize={14} fill={color.ink}>
        FAN EDITION ₩0
      </text>
    </Frame>
  );
}

/** 4 · "HERO ON SET" teaser — the meta twist. */
export function PosterOnSet() {
  return (
    <Frame background={color.ink}>
      <g transform="translate(400 470) rotate(-8)">
        <rect x={-280} y={-60} width={560} height={300} fill={color.paper} stroke={color.paper} strokeWidth={6} />
        <g transform="translate(0 -60) rotate(-14 -280 0)">
          <rect x={-280} y={-70} width={560} height={70} fill={color.ink} stroke={color.paper} strokeWidth={6} />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={poly([[-260 + i * 80, -70], [-220 + i * 80, -70], [-260 + i * 80, 0], [-300 + i * 80, 0]])} fill={color.paper} />
          ))}
        </g>
        <g fontFamily={family.pixel} fill={color.ink}>
          <text x={-250} y={-10} fontSize={26}>
            PROD. LOOKS CAN KILL
          </text>
          <text x={-250} y={60} fontSize={48}>
            SCENE 26
          </text>
          <text x={60} y={60} fontSize={48}>
            TAKE 10
          </text>
          <text x={-250} y={130} fontSize={24}>
            DIR. ANYONE · CAM. FANCAM A
          </text>
          <text x={-250} y={200} fontSize={24}>
            ROLL ▶ 18:00 KST
          </text>
        </g>
      </g>
      {heroes.map((h, i) => (
        <g key={h.id} transform={`translate(${100 + i * 120} 900) scale(0.62)`}>
          <HeroEmblem hero={h} asGroup />
        </g>
      ))}
      <text x={400} y={170} textAnchor="middle" fontFamily={family.serif} fontStyle="italic" fontSize={60} fill={color.paper}>
        They&apos;re only acting.
      </text>
      <text x={400} y={232} textAnchor="middle" fontFamily={family.serif} fontStyle="italic" fontSize={60} fill={color.signal}>
        Or are they?
      </text>
      <text x={400} y={1040} textAnchor="middle" fontFamily={family.display} fontSize={86} fill={color.paper}>
        HERO ON SET
      </text>
      <Billing y={1100} fill={color.chrome} lines={BILLING.slice(0, 3)} />
    </Frame>
  );
}

export const posters = [
  { id: "captain-purple", title: "Captain Purple", note: "Solo one-sheet · Saul-Bass cut", Component: PosterCaptainPurple, accent: heroById.yujin.primaryColor },
  { id: "looks-can-kill", title: "Looks Can Kill", note: "Ensemble · 90s anime print", Component: PosterLooksCanKill, accent: color.plateMagenta },
  { id: "hero-magazine", title: "HERO Magazine", note: "Editorial cover · Bat Pink", Component: PosterMagazine, accent: heroById.wonyoung.primaryColor },
  { id: "hero-on-set", title: "Hero On Set", note: "Teaser · the meta twist", Component: PosterOnSet, accent: color.signal },
] as const;
