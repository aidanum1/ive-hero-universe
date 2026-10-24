/**
 * POWER BURST — one short, authored power move per hero (≈2.4s @30fps).
 * charge (focus lines converge) → freeze + impact → hero-specific FX → SFX slam →
 * name card. Pure function of `frame`; used by the web (hold-to-charge, hero pages)
 * and by Remotion (SixHeroesIntro).
 *
 * Key action is kept inside the centre square (y 420–1500) so the piece also reads
 * when cropped to a landscape stage.
 */
import { useMemo } from "react";
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroById } from "@/heroes/roster";
import type { Hero, HeroId } from "@/heroes/types";
import { arc, star } from "@/heroes/shapes";
import { rng } from "@/lib/random";
import { clamp, keys, lerp, prog, shake, within } from "@/lib/timeline";
import { HalftoneDots, fields } from "@/visual/Halftone";
import { HeroEmblem } from "@/visual/HeroGraphics";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { ImpactBurst, LinearSpeedLines, RadialSpeedLines, SfxText } from "@/visual/Fx";
import { FanMark, H, Hud, Label, SeqSvg, W, defaultFx, type SeqProps } from "./kit";

export const POWER = { charge: 0, freeze: 10, fx: 13, sfx: 40, card: 50, end: 72 } as const;
export const POWER_DURATION = POWER.end;
const P = POWER;

const CX = W / 2;
const CY = 960;
const FIG_S = 1.9;
const bgField = fields.radial(0.5, 0.5, 0.8, 0.05, 0.75);

const figT = (cx: number, cy: number, s = FIG_S) => `translate(${cx} ${cy}) scale(${s}) translate(-200 -300)`;

export type PowerBurstProps = SeqProps & { heroId: HeroId; showCard?: boolean; transparent?: boolean };

export function PowerBurst({ frame, heroId, fx = defaultFx, showCard = true, transparent = false }: PowerBurstProps) {
  const hero = heroById[heroId];
  const f = frame;
  const F = Math.floor(f);
  const charge = prog(f, P.charge, P.freeze, "accel");
  const sh = shake(f, P.fx, fx.shake * 1.4 * hero.motionPersonality.shake + 4, 12, `pb${heroId}`);
  const impact = within(f, P.freeze + 1, 2);
  const card = showCard && f >= P.card;
  const push = keys(f, [0, P.freeze, P.fx, P.card], [1, 1.08, 0.98, 1.02], ["accel", "punch", "glide"]);

  return (
    <SeqSvg background={transparent ? "transparent" : hero.deepColor}>
      <g transform={`translate(${sh.x} ${sh.y})`}>
        {!transparent ? (
          <>
            <rect width={W} height={H} fill={hero.deepColor} />
            <HalftoneDots width={W} height={H} cell={30} angle={45} color={hero.primaryColor} field={bgField} opacity={0.55} />
          </>
        ) : null}

        {/* charge: focus lines converge */}
        {f < P.fx + 4 ? (
          <g opacity={0.9}>
            <RadialSpeedLines width={W} height={H} cx={CX} cy={CY} inner={lerp(0.9, 0.3, charge)} count={fx.speedLineCount} color={hero.secondaryColor} seed={`pbc${Math.floor(f / 2)}`} />
          </g>
        ) : null}

        {/* figure */}
        <g transform={`translate(${CX} ${CY}) scale(${push}) translate(${-CX} ${-CY})`}>
          <g transform={figT(CX, CY + 80)}>
            <HeroPortrait hero={hero} asGroup />
          </g>
        </g>

        {/* hero-specific FX */}
        {f >= P.fx ? <PowerFx hero={hero} f={f} F={F} /> : null}

        {/* SFX slam */}
        {f >= P.sfx && f < P.card + 10 ? (
          <g transform={`translate(${CX} 560) scale(${keys(f, [P.sfx, P.sfx + 4], [1.7, 1], "punch")})`}>
            <SfxText x={0} y={0} size={210} rotate={-7} fill={hero.accentColor} shadow={hero.primaryColor}>
              {hero.sfx.ko}
            </SfxText>
            <SfxText x={40} y={150} size={92} rotate={-7} fill={color.paper} shadow={null}>
              {hero.sfx.en}
            </SfxText>
          </g>
        ) : null}

        {/* impact frame */}
        {impact ? (
          <g>
            <rect width={W} height={H} fill={F % 2 ? color.paper : color.ink} />
            <RadialSpeedLines width={W} height={H} cx={CX} cy={CY} inner={0.18} count={fx.speedLineCount + 16} color={F % 2 ? color.ink : color.paper} seed={`pbi${F}`} />
            <g transform={figT(CX, CY + 80)}>
              <HeroPortrait hero={hero} asGroup mode="flat" flatColor={F % 2 ? color.ink : hero.primaryColor} />
            </g>
          </g>
        ) : null}

        {/* HUD */}
        {!card ? (
          <g>
            <Hud x={84} y={200} size={30} fill={color.paper}>
              {`POWER ▸ ${hero.powerFX.name}`}
            </Hud>
            <rect x={84} y={228} width={420} height={18} fill="none" stroke={color.paper} strokeWidth={3} />
            <rect x={88} y={232} width={412 * clamp(f / P.freeze)} height={10} fill={hero.accentColor} />
            <Hud x={W - 84} y={200} size={30} anchor="end" fill={color.paper}>
              {`${String(hero.index).padStart(2, "0")}/06`}
            </Hud>
          </g>
        ) : null}
      </g>

      {card ? <NameCard hero={hero} f={f} /> : null}
      <FanMark opacity={0.55} />
    </SeqSvg>
  );
}

function NameCard({ hero, f }: { hero: Hero; f: number }) {
  const t = prog(f, P.card, 8, "snap");
  const edge = lerp(-300, W + 300, t);
  const titleIn = prog(f, P.card + 4, 7, "punch");
  const nameSize = hero.heroName.length > 11 ? 116 : 140;
  return (
    <g>
      <polygon points={`-400,0 ${edge + 200},0 ${edge - 200},${H} -400,${H}`} fill={hero.primaryColor} />
      {t >= 1 ? (
        <g>
          <rect width={W} height={H} fill={hero.primaryColor} />
          <g opacity={0.5}>
            <RadialSpeedLines width={W} height={H} cx={CX} cy={1040} inner={0.3} count={60} color={hero.secondaryColor} seed={`pbn${Math.floor(f / 3)}`} />
          </g>
          <g transform={`translate(${CX - 230} 700) scale(4.6)`} opacity={0.18}>
            <HeroEmblem hero={hero} asGroup flat={hero.deepColor} />
          </g>
          <g transform={figT(CX, 1300, 2.1)}>
            <HeroPortrait hero={hero} asGroup />
          </g>
          <g transform={`translate(${CX} 470) scale(${1.6 - 0.6 * titleIn})`} opacity={titleIn > 0 ? 1 : 0}>
            <SfxText x={0} y={0} size={nameSize} width={900} fill={color.paper} shadow={hero.deepColor} skew={-9}>
              {hero.heroName}
            </SfxText>
          </g>
          <Label x={CX} y={590} size={30} anchor="middle" fill={hero.onPrimary}>
            {`${hero.name} · ${hero.heroClass}`}
          </Label>
          <text x={CX} y={650} textAnchor="middle" fontFamily={family.hangul} fontSize={44} fill={hero.onPrimary}>
            {`${hero.nameKo} · ${hero.heroNameKo}`}
          </text>
        </g>
      ) : null}
    </g>
  );
}

// ───────────────────────────── per-kind FX ─────────────────────────────

function PowerFx({ hero, f, F }: { hero: Hero; f: number; F: number }) {
  switch (hero.powerFX.kind) {
    case "glitch":
      return <GlitchFx hero={hero} f={f} F={F} />;
    case "gust":
      return <GustFx hero={hero} f={f} />;
    case "shot":
      return <ShotFx hero={hero} f={f} />;
    case "slash":
      return <SlashFx hero={hero} f={f} />;
    case "target":
      return <TargetFx hero={hero} f={f} />;
    case "thread":
      return <ThreadFx hero={hero} f={f} />;
  }
}

/** Condensed Quicksilver step: echoes + frame tear + lightning. */
function GlitchFx({ hero, f, F }: { hero: Hero; f: number; F: number }) {
  const t0 = P.fx;
  const run = (t: number) => keys(t, [t0, t0 + 12], [CX - 260, CX + 260], "accel");
  const bolt = useMemo(() => {
    const r = rng("pb-glitch");
    const pts: string[] = [];
    for (let i = 0; i <= 9; i++) pts.push(`${80 + i * 102} ${1380 - i * 100 + (r() - 0.5) * 120}`);
    return `M ${pts.join(" L ")}`;
  }, []);
  const draw = prog(f, t0 + 12, 6, "punch");
  return (
    <g>
      {f < t0 + 16
        ? Array.from({ length: 5 }, (_, k) => (
            <g key={k} transform={figT(run(f - k * 2.2), CY + 80)} opacity={(1 - k / 5) * (1 - prog(f, t0 + 12, 5))}>
              <HeroPortrait hero={hero} asGroup mode="flat" flatColor={k % 2 ? hero.secondaryColor : hero.primaryColor} />
            </g>
          ))
        : null}
      {within(f, t0 + 9, 4)
        ? Array.from({ length: 6 }, (_, i) => {
            const r = rng(`pbt${F}${i}`);
            return <rect key={i} x={0} y={420 + r() * 1080} width={W} height={20 + r() * 90} fill={i % 2 ? color.plateCyan : color.plateMagenta} opacity={0.45} transform={`translate(${(r() - 0.5) * 300} 0)`} />;
          })
        : null}
      <path d={bolt} fill="none" stroke={hero.accentColor} strokeWidth={34} strokeDasharray={`${draw * 1600} 1600`} opacity={1 - prog(f, t0 + 24, 6)} />
      <path d={bolt} fill="none" stroke="#fff" strokeWidth={10} strokeDasharray={`${draw * 1600} 1600`} opacity={1 - prog(f, t0 + 24, 6)} />
    </g>
  );
}

/** Wonder Green: gather, then crescents of wind sweep the panel. */
function GustFx({ hero, f }: { hero: Hero; f: number }) {
  const t0 = P.fx;
  return (
    <g>
      <g opacity={0.6 * (1 - prog(f, t0 + 20, 8))}>
        <LinearSpeedLines width={W} height={H} angle={-8} count={46} color={hero.secondaryColor} seed={`gust${Math.floor(f / 2)}`} progress={prog(f, t0, 8, "glide")} maxThickness={8} />
      </g>
      {[0, 4, 8].map((d, i) => {
        const p = prog(f, t0 + d, 16, "glide");
        if (p <= 0 || p >= 1) return null;
        const x = lerp(-200, W + 500, p);
        const r = 520 - i * 90;
        return (
          <g key={i} transform={`translate(${x} ${CY - 120 + i * 140})`} opacity={1 - p * 0.6}>
            <path d={arc(0, 0, r, 120, 240)} fill="none" stroke={i === 1 ? hero.accentColor : color.paper} strokeWidth={46 - i * 10} strokeLinecap="round" />
            <path d={arc(0, 0, r - 60, 130, 230)} fill="none" stroke={hero.primaryColor} strokeWidth={14} strokeLinecap="round" />
          </g>
        );
      })}
      {/* palm shockwave */}
      {[0, 3].map((d) => {
        const p = prog(f, t0 + d, 14, "glide");
        return p > 0 && p < 1 ? <circle key={d} cx={CX - 120} cy={CY} r={lerp(40, 760, p)} fill="none" stroke={color.paper} strokeWidth={lerp(30, 2, p)} opacity={1 - p} /> : null;
      })}
    </g>
  );
}

/** Jean Yellow: three finger-gun shots — flash, streak, star hole. */
function ShotFx({ hero, f }: { hero: Hero; f: number }) {
  const shots = [
    { t: P.fx, y: 760 },
    { t: P.fx + 8, y: 1040 },
    { t: P.fx + 16, y: 900 },
  ];
  return (
    <g>
      {shots.map((s, i) => {
        const age = f - s.t;
        if (age < 0) return null;
        const streak = prog(f, s.t, 3, "punch");
        return (
          <g key={i}>
            {age < 3 ? <ImpactBurst cx={150} cy={s.y} r={130} spikes={8} fill={hero.primaryColor} seed={`muzzle${i}`} strokeWidth={8} /> : null}
            {age < 6 ? <path d={`M 200 ${s.y} L ${lerp(200, 980, streak)} ${s.y - 6} L ${lerp(200, 980, streak)} ${s.y + 6} Z`} fill={color.paper} /> : null}
            {streak >= 1 ? (
              <g transform={`translate(940 ${s.y}) scale(${keys(age, [3, 6], [1.6, 1], "punch")})`}>
                <path d={star(0, 0, 70, 26, 6)} fill={color.ink} stroke={hero.primaryColor} strokeWidth={8} />
                <path d="M 0 0 L 90 -60 M 0 0 L 110 30 M 0 0 L -40 90" stroke={color.ink} strokeWidth={5} />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

/** Bat Pink: one sweeping staff crescent + diamond glints. */
function SlashFx({ hero, f }: { hero: Hero; f: number }) {
  const t0 = P.fx;
  const sweep = prog(f, t0, 9, "punch");
  const end = lerp(-150, 60, sweep);
  const fade = 1 - prog(f, t0 + 16, 10);
  const glints = [
    [820, 640, 0],
    [260, 1240, 4],
    [900, 1180, 7],
  ];
  return (
    <g opacity={fade}>
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={arc(CX, CY, 560 - k * 26, -170, end - k * 18)} fill="none" stroke={k === 0 ? "#fff" : hero.primaryColor} strokeWidth={k === 0 ? 26 : 50 - k * 10} strokeLinecap="round" opacity={1 - k * 0.22} />
      ))}
      {glints.map(([x, y, d], i) => {
        const p = prog(f, t0 + 8 + d, 10, "overshoot");
        return p > 0 ? <path key={i} d={star(x, y, 90 * p, 14 * p, 4, -90)} fill="#fff" stroke={hero.primaryColor} strokeWidth={4} opacity={1 - prog(f, t0 + 18 + d, 6)} /> : null;
      })}
    </g>
  );
}

/** Super Blue: rings lock on, a dart lands dead centre, shockwave. */
function TargetFx({ hero, f }: { hero: Hero; f: number }) {
  const t0 = P.fx;
  const lock = prog(f, t0, 8, "snap");
  const fly = prog(f, t0 + 8, 5, "accel");
  const hit = f >= t0 + 13;
  const tx = 760;
  const ty = 760;
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={tx} cy={ty} r={lerp(600, 70 + i * 60, lock)} fill="none" stroke={i === 1 ? color.paper : hero.accentColor} strokeWidth={14 - i * 3} opacity={hit ? 1 - prog(f, t0 + 20, 8) : 1} />
      ))}
      <path d={`M ${tx - 260} ${ty} H ${tx + 260} M ${tx} ${ty - 260} V ${ty + 260}`} stroke={color.paper} strokeWidth={4} opacity={lock * (1 - prog(f, t0 + 20, 8))} />
      {!hit ? (
        <g transform={`translate(${lerp(120, tx, fly)} ${lerp(1500, ty, fly)}) rotate(-47)`}>
          <path d="M -120 -6 L 40 -6 L 70 0 L 40 6 L -120 6 Z" fill={color.paper} stroke={color.ink} strokeWidth={3} />
          <path d="M -120 -6 L -150 -26 L -100 -6 Z M -120 6 L -150 26 L -100 6 Z" fill={hero.accentColor} />
        </g>
      ) : (
        <g>
          {[0, 3, 6].map((d) => {
            const p = prog(f, t0 + 13 + d, 12, "glide");
            return p > 0 && p < 1 ? <circle key={d} cx={tx} cy={ty} r={lerp(30, 520, p)} fill="none" stroke={hero.accentColor} strokeWidth={lerp(26, 2, p)} opacity={1 - p} /> : null;
          })}
          <path d={star(tx, ty, 46, 16, 4, -90)} fill={hero.accentColor} stroke={color.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
}

/** Spider Red: rope lines snap taut; a yo-yo whips out and recoils. */
function ThreadFx({ hero, f }: { hero: Hero; f: number }) {
  const t0 = P.fx;
  const anchors: [number, number][] = [
    [40, 420],
    [1040, 470],
    [60, 1500],
    [1020, 1460],
  ];
  const ox = CX;
  const oy = CY - 60;
  const yoyo = keys(f, [t0 + 4, t0 + 11, t0 + 22], [0, 1, 0.12], ["accel", "bounce"]);
  const yx = lerp(ox, 1000, yoyo);
  const yy = lerp(oy, 1420, yoyo);
  return (
    <g>
      {anchors.map(([ax, ay], i) => {
        const p = prog(f, t0 + i, 5, "punch");
        const wob = Math.sin((f - t0) * 1.4) * 40 * (1 - prog(f, t0 + i, 14));
        const ex = lerp(ox, ax, p);
        const ey = lerp(oy, ay, p);
        return (
          <path key={i} d={`M ${ox} ${oy} Q ${(ox + ex) / 2 + wob} ${(oy + ey) / 2 - wob} ${ex} ${ey}`} fill="none" stroke={i % 2 ? hero.primaryColor : color.paper} strokeWidth={10} strokeLinecap="round" />
        );
      })}
      <line x1={ox} y1={oy} x2={yx} y2={yy} stroke={color.ink} strokeWidth={6} />
      <g transform={`translate(${yx} ${yy}) rotate(${f * 40})`}>
        <circle r={74} fill={hero.primaryColor} stroke={color.ink} strokeWidth={8} />
        <circle r={36} fill="none" stroke={color.ink} strokeWidth={6} />
        <path d="M -60 -20 A 64 64 0 0 1 -10 -64" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}
