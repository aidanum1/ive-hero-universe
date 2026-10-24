/**
 * YUJIN GLITCH — the "Quicksilver step".
 * A fancam viewfinder that literally drops frames:
 * normal → micro freeze → purple silhouette separation → temporal afterimages →
 * directional displacement → horizontal frame tear → energy streak → impact frame →
 * CAPTAIN PURPLE hero card.
 *
 * Pure function of `frame` (base 30fps). Built entirely from graphics — no footage.
 */
import { useMemo } from "react";
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroById } from "@/heroes/roster";
import { rand, rng } from "@/lib/random";
import { blink, clamp, keys, prog, shake, within } from "@/lib/timeline";
import { HalftoneDots, fields } from "@/visual/Halftone";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { ImpactBurst, LinearSpeedLines, RadialSpeedLines, SfxText } from "@/visual/Fx";
import { CARD_H, CARD_R, CARD_W, TradingCardGroup } from "@/visual/TradingCard";
import { useSvgId } from "@/visual/useSvgId";
import { FanMark, H, Hud, Label, SeqSvg, W, defaultFx, timecode, type SeqProps } from "./kit";

const hero = heroById.yujin;

/** Beat sheet in base frames. */
export const YUJIN_BEATS = {
  freeze: 22,
  separate: 28,
  echoes: 40,
  displace: 58,
  tear: 70,
  streak: 76,
  land: 82,
  impact: 86,
  wipe: 91,
  card: 96,
  end: 156,
} as const;
export const YUJIN_GLITCH_DURATION = YUJIN_BEATS.end;

const B = YUJIN_BEATS;
const VF = { x: 60, y: 250, w: 960, h: 1400 }; // viewfinder
const S = 2.3; // figure scale
const X0 = 372;
const X1 = 716;
const BASE_Y = VF.y + VF.h + 6;

const spotField = fields.radial(0.5, 0.0, 0.85, 0, 1.05);
const cardBgField = fields.radial(0.5, 0.58, 0.05, 0.9, 0.8);

/** Figure group transform for a bust centred at `cx`. */
const figT = (cx: number, sx = 1, sy = 1) =>
  `translate(${cx} ${BASE_Y}) scale(${S * sx} ${S * sy}) translate(-200 -520)`;

function lightningPoints(seed: string, x0: number, y0: number, x1: number, y1: number, segs = 8, amp = 70) {
  const r = rng(seed);
  const pts: [number, number][] = [[x0, y0]];
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const off = (r() - 0.5) * 2 * amp * (i % 2 ? 1 : -0.6);
    pts.push([x0 + dx * t + nx * off, y0 + dy * t + ny * off]);
  }
  pts.push([x1, y1]);
  return pts;
}

export function YujinGlitch({ frame, fx = defaultFx }: SeqProps) {
  const f = frame;
  const F = Math.floor(f);
  const ids = useSvgId("yg");
  const sceneId = `${ids}-scene`;
  const vfClip = `${ids}-vf`;
  const cardClip = `${ids}-card`;

  // ── Clock: freezes, then drops frames.
  const tcFrame = f < B.freeze ? f : f < B.separate ? B.freeze : f < B.tear ? f - (B.separate - B.freeze) : f + 6;
  const dropped = f >= B.tear && f < B.wipe;

  // ── Camera: slow push, snap zoom on freeze, shake on landing/impact.
  const push = keys(f, [0, B.freeze, B.freeze + 1, B.tear], [1, 1.025, 1.06, 1.08], ["linear", "punch", "glide"]);
  const sh = shake(f, B.impact, fx.shake * 1.6, 12, "yg");
  const sh2 = shake(f, B.land, fx.shake * 0.8, 6, "yg2");
  const camX = sh.x + sh2.x;
  const camY = sh.y + sh2.y;

  // ── Separation plates.
  const sep = keys(f, [B.separate, B.echoes], [0, 70], "glide");
  const plateFade = 1 - prog(f, B.displace, 8);

  // ── The figure runs (anticipation back-step, then accelerating dash) with echoes trailing.
  const run = (t: number) => keys(t, [B.echoes, B.echoes + 5, B.displace], [X0, X0 - 34, X0 + 300], ["glide", "accel"]);
  const runX = run(Math.min(f, B.displace));
  const echoFade = 1 - prog(f, B.displace + 6, 10);
  const echoCount = Math.min(fx.echoCount + 1, 6);

  // ── Original figure: dims while echoes run, then displaced into strips.
  const dim = 0;
  const smear = prog(f, B.displace, B.tear - B.displace, "accel");
  const originalVisible = f < B.tear;

  // ── Landing.
  const landed = f >= B.land;
  const squashX = keys(f, [B.land, B.land + 3, B.land + 9], [1.12, 0.96, 1], ["punch", "overshoot"]);
  const squashY = keys(f, [B.land, B.land + 3, B.land + 9], [0.88, 1.04, 1], ["punch", "overshoot"]);

  const strips = 18;
  const stripH = 520 / strips;

  const bolt = useMemo(() => lightningPoints("yg-bolt", 90, 1380, X1 + 30, 620, 10, 95), []);
  const boltLen = useMemo(() => bolt.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - bolt[i - 1][0], p[1] - bolt[i - 1][1]) : 0), 0), [bolt]);
  const boltD = `M ${bolt.map((p) => p.join(" ")).join(" L ")}`;
  const boltDraw = prog(f, B.streak, 5, "punch");
  const boltFade = 1 - prog(f, B.impact + 3, 8);

  const caption =
    f < B.freeze
      ? "▶ PLAY   1.0×"
      : f < B.separate
        ? "❚❚ FRAME HOLD"
        : f < B.displace
          ? "◀ ▶ FRAME-BY-FRAME"
          : f < B.tear
            ? "▶▶ 0.04× ... ERROR"
            : f < B.land
              ? "⚠ SIGNAL TEAR"
              : "⚡ CAPTAIN PURPLE DETECTED";

  const inCard = f >= B.wipe;
  const isImpact = within(f, B.impact, 3);

  return (
    <SeqSvg background={color.ink}>
      <defs>
        <clipPath id={vfClip}>
          <rect x={VF.x} y={VF.y} width={VF.w} height={VF.h} />
        </clipPath>
        <clipPath id={cardClip}>
          <rect width={CARD_W} height={CARD_H} rx={CARD_R} />
        </clipPath>
        <linearGradient id={`${ids}-glint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {!inCard || f < B.card ? (
        <g transform={`translate(${camX} ${camY})`}>
          {/* ───────── Viewfinder scene ───────── */}
          <g clipPath={`url(#${vfClip})`}>
            <g id={sceneId} transform={`translate(${W / 2} ${H / 2}) scale(${push}) translate(${-W / 2} ${-H / 2})`}>
              <rect x={0} y={0} width={W} height={H} fill="#140C2B" />
              <HalftoneDots x={VF.x} y={VF.y} width={VF.w} height={VF.h * 0.8} cell={24} angle={45} color={hero.primaryColor} field={spotField} opacity={0.55} />
              {/* stage floor */}
              <g stroke={hero.primaryColor} strokeWidth={2} opacity={0.5}>
                <line x1={VF.x} y1={1410} x2={VF.x + VF.w} y2={1410} />
                {Array.from({ length: 11 }, (_, i) => (
                  <line key={i} x1={W / 2 + (i - 5) * 40} y1={1410} x2={W / 2 + (i - 5) * 260} y2={VF.y + VF.h} />
                ))}
              </g>

              {/* misregistration plates */}
              {f >= B.separate && plateFade > 0 ? (
                <>
                  <g transform={figT(runX - sep * 0.35)} opacity={0.75 * plateFade} style={{ mixBlendMode: "screen" }}>
                    <HeroPortrait hero={hero} asGroup mode="flat" flatColor={hero.accentColor} />
                  </g>
                  <g transform={figT(runX + sep)} opacity={0.9 * plateFade}>
                    <HeroPortrait hero={hero} asGroup mode="flat" flatColor={hero.primaryColor} />
                  </g>
                </>
              ) : null}

              {/* temporal echoes — trail behind the moving figure */}
              {f >= B.echoes && echoFade > 0
                ? Array.from({ length: echoCount }, (_, k) => {
                    const lag = (echoCount - k) * 2.4;
                    const t = Math.min(f, B.displace) - lag;
                    if (t < B.echoes - 1) return null;
                    const op = (0.3 + 0.7 * ((k + 1) / echoCount)) * echoFade;
                    return (
                      <g key={k} transform={figT(run(t))} opacity={op}>
                        <HeroPortrait hero={hero} asGroup mode="flat" flatColor={k % 2 ? hero.secondaryColor : hero.primaryColor} />
                      </g>
                    );
                  })
                : null}

              {/* original figure (full colour), sliced during displacement */}
              {originalVisible ? (
                smear <= 0 ? (
                  <g transform={figT(runX)}>
                    <HeroPortrait hero={hero} asGroup />
                    {dim > 0 ? <g opacity={dim}><HeroPortrait hero={hero} asGroup mode="flat" flatColor="#140C2B" /></g> : null}
                  </g>
                ) : (
                  Array.from({ length: strips }, (_, i) => {
                    const n = rand(`strip${i}`);
                    const dx = smear * (260 + n * 900) * (0.4 + 0.6 * Math.sin(i * 0.7 + 1) ** 2);
                    return (
                      <g key={i} transform={`translate(${dx} 0)`} opacity={1 - smear * 0.7}>
                        <svg x={0} y={0} width={W} height={H} overflow="visible">
                          <clipPath id={`${ids}-s${i}`}>
                            <rect x={-2000} y={BASE_Y - 520 * S + i * stripH * S} width={6000} height={stripH * S + 1} />
                          </clipPath>
                          <g clipPath={`url(#${ids}-s${i})`}>
                            <g transform={figT(runX)}>
                              <HeroPortrait hero={hero} asGroup />
                            </g>
                          </g>
                        </svg>
                      </g>
                    );
                  })
                )
              ) : null}

              {/* directional speed lines during displacement */}
              {f >= B.displace && f < B.land ? (
                <g opacity={0.85}>
                  <LinearSpeedLines width={W} height={H} angle={0} count={fx.speedLineCount} color={hero.secondaryColor} seed={`yg-sl-${Math.floor(f / 2)}`} progress={0.4 + smear * 0.6} maxThickness={9} />
                </g>
              ) : null}

              {/* energy streak */}
              {f >= B.streak && boltFade > 0 ? (
                <g opacity={boltFade}>
                  <path d={boltD} fill="none" stroke={hero.primaryColor} strokeWidth={70} strokeLinejoin="miter" opacity={0.45} strokeDasharray={`${boltLen * boltDraw} ${boltLen}`} />
                  <path d={boltD} fill="none" stroke={hero.accentColor} strokeWidth={30} strokeLinejoin="miter" strokeDasharray={`${boltLen * boltDraw} ${boltLen}`} />
                  <path d={boltD} fill="none" stroke="#fff" strokeWidth={10} strokeLinejoin="miter" strokeDasharray={`${boltLen * boltDraw} ${boltLen}`} />
                </g>
              ) : null}

              {/* landing */}
              {landed ? (
                <>
                  {f < B.land + 6 ? (
                    <>
                      <g transform={figT(X1 - 110)} opacity={0.35 * (1 - prog(f, B.land, 6))}>
                        <HeroPortrait hero={hero} asGroup mode="flat" flatColor={hero.primaryColor} />
                      </g>
                      <g transform={figT(X1 - 50)} opacity={0.6 * (1 - prog(f, B.land, 6))}>
                        <HeroPortrait hero={hero} asGroup mode="flat" flatColor={hero.secondaryColor} />
                      </g>
                    </>
                  ) : null}
                  <g transform={figT(X1, squashX, squashY)}>
                    <HeroPortrait hero={hero} asGroup />
                  </g>
                </>
              ) : null}
            </g>

            {/* horizontal frame tear (re-uses the scene) */}
            {f >= B.tear && f < B.land + 1
              ? Array.from({ length: 5 }, (_, i) => {
                  const r = rng(`tear${F}-${i}`);
                  const y = VF.y + r() * VF.h;
                  const h = 30 + r() * 170;
                  const dx = (r() - 0.35) * 520;
                  return (
                    <g key={i}>
                      <clipPath id={`${ids}-t${i}`}>
                        <rect x={0} y={y} width={W} height={h} />
                      </clipPath>
                      <g clipPath={`url(#${ids}-t${i})`}>
                        <use href={`#${sceneId}`} transform={`translate(${dx} 0)`} />
                        <rect x={0} y={y} width={W} height={h} fill={i % 2 ? color.plateCyan : color.plateMagenta} opacity={0.35} style={{ mixBlendMode: "screen" }} />
                      </g>
                    </g>
                  );
                })
              : null}
            {f >= B.tear && f < B.land
              ? Array.from({ length: 40 }, (_, i) => {
                  const r = rng(`noise${F}-${i}`);
                  return <rect key={i} x={VF.x + r() * VF.w} y={VF.y + r() * VF.h} width={20 + r() * 160} height={4 + r() * 10} fill={r() > 0.5 ? color.paper : hero.primaryColor} opacity={0.7} />;
                })
              : null}

            {/* impact frame: inverted, hard */}
            {isImpact ? (
              <g>
                <rect x={0} y={0} width={W} height={H} fill={F % 2 ? color.paper : color.ink} />
                <RadialSpeedLines width={W} height={H} cx={X1} cy={1050} inner={0.16} count={fx.speedLineCount + 20} color={F % 2 ? color.ink : color.paper} seed={`yg-imp${F}`} />
                <g transform={figT(X1)}>
                  <HeroPortrait hero={hero} asGroup mode="flat" flatColor={F % 2 ? color.ink : hero.primaryColor} />
                </g>
              </g>
            ) : null}
          </g>

          {/* ───────── HUD ───────── */}
          <g>
            {[
              [VF.x, VF.y, 1, 1],
              [VF.x + VF.w, VF.y, -1, 1],
              [VF.x, VF.y + VF.h, 1, -1],
              [VF.x + VF.w, VF.y + VF.h, -1, -1],
            ].map(([x, y, sx, sy], i) => (
              <path key={i} d={`M ${x} ${y + 70 * sy} V ${y} H ${x + 70 * sx}`} fill="none" stroke={color.paper} strokeWidth={6} />
            ))}
            <circle cx={VF.x + 22} cy={170} r={14} fill={color.signal} opacity={blink(f, 10, 6) ? 1 : 0.15} />
            <Hud x={VF.x + 50} y={181} size={34}>REC</Hud>
            <Hud x={VF.x + VF.w} y={181} size={34} anchor="end" fill={dropped ? color.signal : color.paper}>
              {timecode(tcFrame)}
            </Hud>
            <Label x={VF.x} y={225} size={22} fill={color.chrome}>CAM A · STAGE FANCAM · 4K</Label>
            <Hud x={VF.x + VF.w} y={225} size={24} anchor="end" fill={color.chrome}>
              {`FRM ${String(Math.floor(tcFrame)).padStart(4, "0")}`}
            </Hud>
            <Hud x={VF.x} y={VF.y + VF.h + 74} size={36} fill={f >= B.tear && f < B.land ? color.signal : color.paper}>
              {caption}
            </Hud>
            {dropped ? (
              <g>
                <rect x={VF.x + VF.w - 420} y={VF.y + VF.h + 36} width={420} height={54} fill={color.signal} />
                <Hud x={VF.x + VF.w - 210} y={VF.y + VF.h + 74} size={30} anchor="middle" fill={color.white}>
                  6 FRAMES DROPPED
                </Hud>
              </g>
            ) : null}
            {isImpact ? <SfxText x={X1 - 40} y={760} size={190} rotate={-8} fill={hero.accentColor} shadow={hero.primaryColor}>번쩍!</SfxText> : null}
          </g>
        </g>
      ) : null}

      {/* ───────── Wipe → CAPTAIN PURPLE card ───────── */}
      {inCard ? <CardBeat f={f} ids={ids} cardClip={cardClip} /> : null}

      <FanMark opacity={0.6} />
    </SeqSvg>
  );
}

function CardBeat({ f, ids, cardClip }: { f: number; ids: string; cardClip: string }) {
  const wipe = prog(f, B.wipe, 6, "snap");
  // Diagonal comic-panel wipe: a slanted edge sweeping left→right.
  const edge = -400 + wipe * (W + 900);
  const showCard = f >= B.card;
  const titleIn = (d: number) => prog(f, B.card + d, 7, "punch");
  const cardIn = prog(f, B.card + 4, 16, "overshoot");
  const cardY = 1150 + (1 - cardIn) * 1100;
  const cardRot = (1 - cardIn) * -22;
  const cardScale = 1.24 * (0.86 + 0.14 * cardIn) * keys(f, [B.card + 20, B.end], [1, 1.035], "linear");
  const glint1 = prog(f, B.card + 22, 14, "glide");
  const glint2 = prog(f, B.card + 44, 10, "glide");
  const flash = 1 - prog(f, B.card, 5);

  return (
    <g>
      <polygon points={`${edge - 420},0 ${edge},0 ${edge - 300},${H} ${edge - 720},${H}`} fill={hero.accentColor} opacity={showCard ? 0 : 1} />
      <g clipPath={undefined}>
        <polygon points={`-800,0 ${edge - 440},0 ${edge - 740},${H} -800,${H}`} fill={hero.primaryColor} />
      </g>
      {showCard ? (
        <g>
          <rect x={0} y={0} width={W} height={H} fill={hero.primaryColor} />
          <HalftoneDots x={0} y={0} width={W} height={H} cell={26} angle={45} color={hero.deepColor} field={cardBgField} opacity={0.6} />
          <g opacity={0.55}>
            <RadialSpeedLines width={W} height={H} cx={W / 2} cy={1150} inner={0.32} count={64} color={hero.secondaryColor} seed={`yg-card${Math.floor(f / 3)}`} />
          </g>

          <g transform={`translate(${W / 2} 330) scale(${1.8 - 0.8 * titleIn(0)})`} opacity={titleIn(0) > 0 ? 1 : 0}>
            <SfxText x={0} y={0} size={168} width={820} fill={color.paper} shadow={hero.accentColor} skew={-10}>
              CAPTAIN
            </SfxText>
          </g>
          <g transform={`translate(${W / 2} 492) scale(${1.8 - 0.8 * titleIn(3)})`} opacity={titleIn(3) > 0 ? 1 : 0}>
            <SfxText x={0} y={0} size={168} width={760} fill={color.paper} shadow={hero.accentColor} skew={-10}>
              PURPLE
            </SfxText>
          </g>

          <g transform={`translate(${W / 2} ${cardY}) rotate(${cardRot}) scale(${cardScale}) translate(${-CARD_W / 2} ${-CARD_H / 2})`}>
            <rect x={14} y={22} width={CARD_W} height={CARD_H} rx={CARD_R} fill={color.ink} opacity={0.55} />
            <TradingCardGroup hero={hero} />
            <g clipPath={`url(#${cardClip})`}>
              {glint1 > 0 && glint1 < 1 ? (
                <rect x={-CARD_W + glint1 * CARD_W * 2.4} y={-200} width={CARD_W * 0.7} height={CARD_H + 400} fill={`url(#${ids}-glint)`} transform={`rotate(18 ${CARD_W / 2} ${CARD_H / 2})`} />
              ) : null}
              {glint2 > 0 && glint2 < 1 ? (
                <rect x={-CARD_W + glint2 * CARD_W * 2.4} y={-200} width={CARD_W * 0.4} height={CARD_H + 400} fill={`url(#${ids}-glint)`} transform={`rotate(18 ${CARD_W / 2} ${CARD_H / 2})`} opacity={0.7} />
              ) : null}
            </g>
          </g>

          {cardIn > 0.9 ? (
            <g opacity={prog(f, B.card + 18, 6)}>
              <ImpactBurst cx={880} cy={640} r={92} spikes={12} fill={hero.accentColor} seed="yg-spd" rotate={8} />
              <text x={880} y={630} textAnchor="middle" fontFamily={family.display} fontSize={30} fill={color.ink}>
                SPD
              </text>
              <text x={880} y={672} textAnchor="middle" fontFamily={family.display} fontSize={46} fill={color.ink}>
                10
              </text>
            </g>
          ) : null}

          <Label x={W / 2} y={1800} size={26} anchor="middle" fill={color.paper}>
            HERO 01 · YUJIN 유진 · QUICKSILVER STEP
          </Label>
          {flash > 0 ? <rect x={0} y={0} width={W} height={H} fill="#fff" opacity={flash * 0.9} /> : null}
        </g>
      ) : null}
    </g>
  );
}

/** Convenience for web previews: which beat a frame falls in. */
export function yujinBeatAt(frame: number) {
  const entries = Object.entries(B).sort((a, b) => a[1] - b[1]);
  let current = "normal";
  for (const [k, v] of entries) if (frame >= v) current = k;
  return clamp(frame, 0, B.end) >= B.end ? "end" : current;
}
