/**
 * FAKE HERO TRAILER — trailer grammar in 9:16: ident sting, title cards, hard-cut hero
 * flashes, a camera dolly across the HERO COMICS page, the on-set twist, an excerpt of
 * the YUJIN GLITCH, a power montage, the title slam and a poster end card.
 * Reuses the shared sequences and print assets — one system, many cuts.
 */
import type { ReactNode } from "react";
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroes } from "@/heroes/roster";
import { rng } from "@/lib/random";
import { keys, lerp, prog, shake, within } from "@/lib/timeline";
import { comicPanels, ComicPage, PAGE_H, PAGE_W } from "@/visual/ComicPage";
import { HeroEmblem } from "@/visual/HeroGraphics";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { HalftoneDots, fields } from "@/visual/Halftone";
import { RadialSpeedLines, SfxText } from "@/visual/Fx";
import { POSTER_H, POSTER_W, PosterLooksCanKill } from "@/visual/Posters";
import { PowerBurst, POWER } from "./PowerBurst";
import { YujinGlitch } from "./YujinGlitch";
import { FanMark, H, Hud, SeqSvg, W, defaultFx, type SeqProps } from "./kit";

/** Beat sheet (base frames). */
export const TRAILER = {
  ident: 0,
  card1: 40,
  flashes: 66,
  card2: 114,
  comic: 144,
  twist: 262,
  twist2: 300,
  glitch: 330,
  montage: 410,
  title: 458,
  poster: 512,
  outro: 600,
  end: 640,
} as const;
export const TRAILER_DURATION = TRAILER.end;
const T = TRAILER;

const posterDots = fields.radial(0.5, 0.5, 0.6, 0.0, 0.8);

function TitleCard({ f, start, lines, accent = color.paper, size = 96 }: { f: number; start: number; lines: ReactNode[]; accent?: string; size?: number }) {
  const t = f - start;
  return (
    <SeqSvg background={color.ink}>
      {lines.map((l, i) => (
        <text
          key={i}
          x={540}
          y={900 + (i - (lines.length - 1) / 2) * size * 1.15}
          textAnchor="middle"
          fontFamily={family.serif}
          fontStyle="italic"
          fontWeight={500}
          fontSize={size}
          fill={i === lines.length - 1 ? accent : color.paper}
          opacity={prog(t, i * 6, 8, "glide")}
          transform={`translate(0 ${(1 - prog(t, i * 6, 10, "glide")) * 30})`}
        >
          {l}
        </text>
      ))}
      <FanMark opacity={0.45} />
    </SeqSvg>
  );
}

function Ident({ f }: { f: number }) {
  const typed = "A FAN-MADE PICTURE".slice(0, Math.max(0, Math.floor((f - 2) / 1.2)));
  const bars = prog(f, 20, 6, "punch");
  return (
    <SeqSvg background={color.ink}>
      <Hud x={540} y={900} size={44} anchor="middle" fill={color.paper}>
        {typed}
      </Hud>
      {f >= 20
        ? heroes.map((h, i) => <rect key={h.id} x={i * 180} y={(1 - bars) * -H + (f > 32 ? prog(f, 32, 6, "snap") * H * (i % 2 ? 1 : -1) : 0)} width={180} height={H} fill={h.primaryColor} />)
        : null}
      {f >= 26 && f < 36 ? (
        <g>
          <text x={540} y={1040} textAnchor="middle" fontFamily={family.display} fontSize={300} fill={color.ink}>
            IVE
          </text>
          <text x={540} y={1120} textAnchor="middle" fontFamily={family.wide} fontWeight={900} fontStretch="125%" fontSize={56} letterSpacing={10} fill={color.ink}>
            HERO UNIVERSE
          </text>
        </g>
      ) : null}
    </SeqSvg>
  );
}

function Flashes({ f, fx }: { f: number; fx: typeof defaultFx }) {
  const t = f - T.flashes;
  const i = Math.min(5, Math.floor(t / 8));
  const h = heroes[i];
  const local = t - i * 8;
  const F = Math.floor(f);
  return (
    <SeqSvg background={h.primaryColor}>
      <rect width={W} height={H} fill={h.primaryColor} />
      <RadialSpeedLines width={W} height={H} cx={540} cy={900} inner={0.2} count={fx.speedLineCount} color={h.secondaryColor} seed={`fl${i}`} />
      <text x={540} y={760} textAnchor="middle" fontFamily={family.display} fontSize={700} fill={h.deepColor} opacity={0.35}>
        {h.glyph}
      </text>
      <g transform={`translate(540 ${1900}) scale(${keys(local, [0, 7], [3.3, 3.0])}) translate(-200 -520)`}>
        <HeroPortrait hero={h} asGroup />
      </g>
      <SfxText x={540} y={1650} size={110} width={Math.min(940, h.heroName.length * 80)} fill={color.paper} shadow={color.ink} skew={-10}>
        {h.heroName}
      </SfxText>
      {local < 1 ? <rect width={W} height={H} fill={F % 2 ? "#fff" : color.ink} opacity={0.85} /> : null}
      <FanMark opacity={0.45} />
    </SeqSvg>
  );
}

function ComicDolly({ f }: { f: number }) {
  const t = f - T.comic;
  const stops = [
    { cx: PAGE_W / 2, cy: PAGE_H / 2, s: 0.62, r: 0 },
    ...["yujin", "rei", "leeseo", "finale"].map((id) => {
      const p = comicPanels.find((c) => c.id === id)!;
      const [x, y, w, h] = p.box;
      return { cx: x + w / 2, cy: y + h / 2, s: Math.min((W * 0.94) / w, (H * 0.6) / h), r: p.tilt * 1.6 };
    }),
  ];
  const seg = [0, 24, 52, 80, 104];
  const at = (k: "cx" | "cy" | "s" | "r") =>
    keys(
      t,
      seg,
      stops.map((s) => s[k]),
      ["snap", "snap", "snap", "glide"],
    );
  const cam = { cx: at("cx"), cy: at("cy"), s: at("s"), r: at("r") };
  const sh = shake(t, 52, 14, 8, "cd");
  return (
    <SeqSvg background={color.ink}>
      <g transform={`translate(${540 + sh.x} ${960 + sh.y}) rotate(${cam.r}) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
        <ComicPage />
      </g>
      <rect x={0} y={0} width={W} height={150} fill={color.ink} />
      <rect x={0} y={H - 150} width={W} height={150} fill={color.ink} />
      <Hud x={60} y={100} size={30} fill={color.paper}>
        HERO COMICS · ISSUE Nº05
      </Hud>
      <FanMark opacity={0.5} />
    </SeqSvg>
  );
}

function Twist({ f }: { f: number }) {
  if (f < T.twist2) return <TitleCard f={f} start={T.twist} lines={["They're only", "acting."]} />;
  const F = Math.floor(f);
  const t = f - T.twist2;
  return (
    <SeqSvg background={color.ink}>
      <text x={540} y={960} textAnchor="middle" fontFamily={family.serif} fontStyle="italic" fontWeight={600} fontSize={130} fill={color.signal}>
        Or are they?
      </text>
      {t > 14
        ? Array.from({ length: 7 }, (_, i) => {
            const r = rng(`tw${F}${i}`);
            return <rect key={i} x={(r() - 0.5) * 300} y={700 + r() * 500} width={W} height={10 + r() * 60} fill={i % 2 ? color.plateCyan : color.plateMagenta} opacity={0.55} style={{ mixBlendMode: "screen" }} />;
          })
        : null}
      <FanMark opacity={0.45} />
    </SeqSvg>
  );
}

function Montage({ f, fx }: { f: number; fx: typeof defaultFx }) {
  const t = f - T.montage;
  const i = Math.min(5, Math.floor(t / 8));
  return <PowerBurst frame={POWER.fx + 3 + (t - i * 8)} heroId={heroes[i].id} fx={fx} showCard={false} />;
}

function TitleSlam({ f, fx }: { f: number; fx: typeof defaultFx }) {
  const t = f - T.title;
  const F = Math.floor(f);
  const sh = shake(t, 6, fx.shake * 1.6, 12, "ts");
  const sh2 = shake(t, 16, fx.shake, 10, "ts2");
  const impact = within(t, 6, 2) || within(t, 16, 2);
  return (
    <SeqSvg background={color.ink}>
      <g transform={`translate(${sh.x + sh2.x} ${sh.y + sh2.y})`}>
        <RadialSpeedLines width={W} height={H} cx={540} cy={900} inner={0.24} count={fx.speedLineCount} color="#2A2635" seed="ts" />
        {t >= 2 ? (
          <g transform={`translate(540 820) scale(${keys(t, [2, 6], [2.4, 1], "punch")})`}>
            <SfxText x={0} y={0} size={210} width={900} fill={color.paper} shadow={color.plateMagenta} skew={-10}>
              LOOKS CAN
            </SfxText>
          </g>
        ) : null}
        {t >= 12 ? (
          <g transform={`translate(540 1100) scale(${keys(t, [12, 16], [2.6, 1], "punch")})`}>
            <SfxText x={0} y={0} size={330} width={720} fill={color.signal} shadow={color.paper} skew={-10}>
              KILL
            </SfxText>
          </g>
        ) : null}
        {t >= 26 ? (
          <Hud x={540} y={1300} size={38} anchor="middle" fill={color.plateYellow} opacity={prog(t, 26, 6)}>
            THE GIRL HERO ERA
          </Hud>
        ) : null}
      </g>
      {impact ? <rect width={W} height={H} fill={F % 2 ? color.paper : "#fff"} style={{ mixBlendMode: "difference" }} /> : null}
      <FanMark opacity={0.5} />
    </SeqSvg>
  );
}

function PosterEnd({ f }: { f: number }) {
  const t = f - T.poster;
  const s = 1.18 * keys(t, [0, 10, 88], [0.8, 1, 1.05], ["overshoot", "linear"]);
  return (
    <SeqSvg background={color.ink}>
      <HalftoneDots width={W} height={H} cell={24} angle={45} color={color.plateMagenta} field={posterDots} opacity={0.35} />
      <g transform={`translate(540 880) scale(${s}) rotate(${keys(t, [0, 10], [-6, 0], "overshoot")}) translate(${-POSTER_W / 2} ${-POSTER_H / 2})`}>
        <rect x={16} y={20} width={POSTER_W} height={POSTER_H} fill={color.paper} opacity={0.2} />
        <svg width={POSTER_W} height={POSTER_H} viewBox={`0 0 ${POSTER_W} ${POSTER_H}`} overflow="hidden">
          <PosterLooksCanKill />
        </svg>
      </g>
      <g opacity={prog(t, 16, 8)}>
        <text x={540} y={1690} textAnchor="middle" fontFamily={family.display} fontSize={86} fill={color.paper}>
          26.10 · 18:00 KST
        </text>
        <Hud x={540} y={1760} size={30} anchor="middle" fill={color.plateYellow}>
          5TH MINI ALBUM · LOOKS CAN KILL
        </Hud>
      </g>
      <FanMark opacity={0.6} />
    </SeqSvg>
  );
}

function Outro({ f }: { f: number }) {
  const t = f - T.outro;
  return (
    <SeqSvg background={color.ink}>
      {heroes.map((h, i) => (
        <g key={h.id} transform={`translate(${155 + i * 154} 760) scale(${prog(t, i * 1.5, 8, "overshoot") * 1.1})`}>
          <HeroEmblem hero={h} asGroup />
        </g>
      ))}
      <text x={540} y={1000} textAnchor="middle" fontFamily={family.display} fontSize={140} fill={color.paper}>
        IVE
      </text>
      <text x={540} y={1070} textAnchor="middle" fontFamily={family.wide} fontWeight={900} fontStretch="125%" fontSize={40} letterSpacing={10} fill={color.paper}>
        HERO UNIVERSE
      </text>
      <Hud x={540} y={1200} size={30} anchor="middle" fill={color.signal}>
        UNOFFICIAL FAN-MADE TRAILER
      </Hud>
      <Hud x={540} y={1250} size={24} anchor="middle" fill={color.chrome}>
        NOT AFFILIATED WITH IVE OR STARSHIP ENTERTAINMENT
      </Hud>
    </SeqSvg>
  );
}

export function FakeHeroTrailer({ frame, fx = defaultFx }: SeqProps) {
  const f = frame;
  if (f < T.card1) return <Ident f={f} />;
  if (f < T.flashes) return <TitleCard f={f} start={T.card1} lines={["Every city", "needs a hero."]} />;
  if (f < T.card2) return <Flashes f={f} fx={fx} />;
  if (f < T.comic) return <TitleCard f={f} start={T.card2} lines={["This one", "needs six."]} accent={color.plateYellow} />;
  if (f < T.twist) return <ComicDolly f={f} />;
  if (f < T.glitch) return <Twist f={f} />;
  if (f < T.montage) return <YujinGlitch frame={lerp(36, 96, (f - T.glitch) / (T.montage - T.glitch))} fx={fx} />;
  if (f < T.title) return <Montage f={f} fx={fx} />;
  if (f < T.poster) return <TitleSlam f={f} fx={fx} />;
  if (f < T.outro) return <PosterEnd f={f} />;
  return <Outro f={f} />;
}
