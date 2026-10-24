/**
 * HERO SELECT (vertical) — the character-select screen as a 9:16 social cut.
 * The cursor visits all six heroes (each entering in her own motion personality),
 * returns to Captain Purple and confirms with an impact frame.
 */
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroes, statLabels, statOrder } from "@/heroes/roster";
import { keys, lerp, prog, shake, within } from "@/lib/timeline";
import { HalftoneDots, HeroTexture, fields } from "@/visual/Halftone";
import { HeroEmblem } from "@/visual/HeroGraphics";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { ImpactBurst, RadialSpeedLines, SfxText } from "@/visual/Fx";
import { entranceAt } from "./entrances";
import { FanMark, H, Hud, Label, SeqSvg, W, defaultFx, type SeqProps } from "./kit";

export const HS = { intro: 18, slot: 36 } as const;
const INTRO = HS.intro;
const SLOT = HS.slot;
const FINAL = INTRO + SLOT * heroes.length;
export const HS_CONFIRM = FINAL + 16;
const CONFIRM = HS_CONFIRM;
export const HERO_SELECT_DURATION = CONFIRM + 46;

const burstDots = fields.radial(0.5, 0.5, 0.95, 0.05, 0.62);
const TILE_W = 152;
const TILE_GAP = 10;
const ROSTER_X = (W - (TILE_W * 6 + TILE_GAP * 5)) / 2;
const ROSTER_Y = 1560;
const tileX = (i: number) => ROSTER_X + i * (TILE_W + TILE_GAP);
const FIG_S = 1.95;
const FIG_BASE = 1250;

function slotAt(f: number) {
  if (f < INTRO) return { index: 0, start: -100, prev: 0 };
  if (f < FINAL) {
    const i = Math.floor((f - INTRO) / SLOT);
    return { index: i, start: INTRO + i * SLOT, prev: Math.max(0, i - 1) };
  }
  return { index: 0, start: FINAL, prev: heroes.length - 1 };
}

export function HeroSelectVertical({ frame, fx = defaultFx }: SeqProps) {
  const f = frame;
  const F = Math.floor(f);
  const { index, start, prev } = slotAt(f);
  const hero = heroes[index];
  const before = heroes[prev];
  const t = f - start;
  const wipe = prog(t, 0, 9, "snap");
  const st = entranceAt(hero, t, 760);
  const sh = shake(f, start + hero.motionPersonality.enterFrames, fx.shake * hero.motionPersonality.shake, 10, `hs${index}`);
  const confirmed = f >= CONFIRM;
  const impact = within(f, CONFIRM, 2);

  const hudIn = prog(f, 0, 10, "punch");
  const cursorX = (() => {
    const from = tileX(prev) + TILE_W / 2;
    const to = tileX(index) + TILE_W / 2;
    return f < INTRO ? to : lerp(from, to, prog(t, 0, 6, "overshootSoft"));
  })();
  const words = hero.heroName.split(" ");
  const sfxIn = prog(t, hero.motionPersonality.enterFrames, 6, "overshoot");
  const sfxOn = t >= hero.motionPersonality.enterFrames && t < hero.motionPersonality.enterFrames + 18 && !confirmed;

  const figT = (dx = 0, dy = 0, sx = 1, sy = 1) => `translate(${540 + dx} ${FIG_BASE + dy}) scale(${FIG_S * sx} ${FIG_S * sy}) translate(-200 -520)`;

  return (
    <SeqSvg background={hero.secondaryColor}>
      {/* background + diagonal colour wipe */}
      <rect width={W} height={H} fill={before.secondaryColor} />
      <polygon points={`${lerp(-400, 0, wipe) - 400},0 ${lerp(-400, W + 400, wipe)},0 ${lerp(-800, W, wipe)},${H} -800,${H}`} fill={hero.secondaryColor} />
      <g opacity={0.25}>
        <svg x={0} y={0} width={W} height={H}>
          <HeroTexture texture={hero.texture} color={hero.primaryColor} scale={1.6} />
        </svg>
      </g>
      <text x={-40} y={1480} fontFamily={family.display} fontSize={300} fill="none" stroke={hero.primaryColor} strokeWidth={3} opacity={0.5}>
        {words[0]}
      </text>

      <g transform={`translate(${sh.x} ${sh.y})`}>
        {/* showcase */}
        <g transform={`translate(540 800) scale(${keys(f, [0, 12], [0.3, 1], "overshoot")}) rotate(${f * 0.2})`}>
          <ImpactBurst cx={0} cy={0} r={470} spikes={22} fill={hero.primaryColor} stroke={color.ink} strokeWidth={9} seed={`hsv-${hero.id}`} inner={0.84} />
        </g>
        <HalftoneDots x={190} y={450} width={700} height={700} cell={20} angle={30} color={hero.deepColor} field={burstDots} opacity={0.5} />
        <g transform="translate(400 640) scale(2.8)" opacity={0.25}>
          <HeroEmblem hero={hero} asGroup flat={hero.deepColor} />
        </g>
        <text x={90} y={420} fontFamily={family.display} fontSize={190} fill={hero.deepColor} opacity={0.85}>
          {hero.glyph}
        </text>

        {/* accent layers */}
        {st.accent > 0 && hero.motionPersonality.kind === "precision"
          ? [140, 250, 360].map((r, i) => <circle key={r} cx={540} cy={760} r={r * lerp(2.2, 1, st.accent)} fill="none" stroke={i === 1 ? color.paper : hero.accentColor} strokeWidth={14} opacity={1 - prog(t, 18, 8)} />)
          : null}
        {st.accent > 0 && hero.motionPersonality.kind === "bounce" ? <line x1={540} y1={0} x2={540} y2={FIG_BASE - 520 * FIG_S + st.dy + 120} stroke={color.ink} strokeWidth={8} opacity={st.accent} /> : null}

        {/* echoes + figure */}
        {st.echoes.map((e, k) => (
          <g key={k} transform={figT(e.dx, e.dy)} opacity={e.opacity}>
            <HeroPortrait hero={hero} asGroup mode="flat" flatColor={k % 2 ? hero.secondaryColor : hero.primaryColor} />
          </g>
        ))}
        <g opacity={st.opacity}>
          {st.reveal < 1 ? (
            <>
              <clipPath id="hsv-reveal">
                <rect x={540 + 400 * FIG_S * (0.5 - st.reveal)} y={0} width={W} height={H} />
              </clipPath>
              <g clipPath="url(#hsv-reveal)">
                <g transform={figT(st.dx, st.dy, st.scale * st.sx, st.scale * st.sy)}>
                  <HeroPortrait hero={hero} asGroup />
                </g>
              </g>
            </>
          ) : (
            <g transform={figT(st.dx, st.dy, st.scale * st.sx, st.scale * st.sy)}>
              <HeroPortrait hero={hero} asGroup />
            </g>
          )}
        </g>
        {hero.motionPersonality.kind === "glamour" && st.accent > 0 && st.accent < 1 ? (
          <rect x={lerp(-400, 1200, st.accent)} y={300} width={140} height={1000} fill="#fff" opacity={0.55} transform="skewX(-20)" />
        ) : null}
        {hero.motionPersonality.kind === "gust" && st.accent > 0 && st.accent < 1 ? (
          <g transform={`translate(${lerp(-300, 1300, st.accent)} 760)`}>
            <path d="M -200 -260 Q 140 0 -200 260" fill="none" stroke={color.paper} strokeWidth={36} strokeLinecap="round" />
            <path d="M -320 -200 Q 0 0 -320 200" fill="none" stroke={hero.accentColor} strokeWidth={22} strokeLinecap="round" />
          </g>
        ) : null}
        {st.accent > 0 && hero.motionPersonality.kind === "snap" ? <ImpactBurst cx={860} cy={720} r={110} spikes={8} fill={hero.accentColor} seed="hsv-muzzle" /> : null}

        {sfxOn ? (
          <g transform={`translate(800 380) scale(${sfxIn}) rotate(-6)`}>
            <SfxText x={0} y={0} size={160} fill={hero.accentColor} shadow={hero.primaryColor}>
              {hero.sfx.ko}
            </SfxText>
            <SfxText x={20} y={110} size={70} fill={color.paper} shadow={null}>
              {hero.sfx.en}
            </SfxText>
          </g>
        ) : null}
      </g>

      {/* name panel */}
      <g>
        <polygon points={`60,1250 1000,1250 1020,1270 1020,1520 80,1520 60,1500`} fill={color.ink} />
        <Label x={100} y={1300} size={24} fill={hero.primaryColor}>
          {hero.heroClass}
        </Label>
        <text x={100 + (1 - prog(t, 2, 8, "overshoot")) * -900} y={1388} fontFamily={family.display} fontSize={86} fill={hero.primaryColor} textLength={hero.heroName.length > 11 ? 880 : undefined} lengthAdjust="spacingAndGlyphs">
          {hero.heroName}
        </text>
        <text x={100} y={1450} fontFamily={family.hangulText} fontWeight={700} fontSize={34} fill={color.paper}>
          {`${hero.name} · ${hero.nameKo} · ${hero.heroNameKo}`}
        </text>
        {statOrder.map((k, i) => {
          const v = hero.stats[k] / 10;
          const x = 100 + i * 150;
          return (
            <g key={k}>
              <text x={x} y={1495} fontFamily={family.pixel} fontSize={20} fill={color.paper} opacity={0.8}>
                {statLabels[k]}
              </text>
              <rect x={x + 52} y={1481} width={80} height={12} fill="rgba(242,237,227,.15)" />
              <rect x={x + 52} y={1481} width={80 * v * prog(t, 6 + i, 10, "overshootSoft")} height={12} fill={hero.primaryColor} />
            </g>
          );
        })}
      </g>

      {/* roster */}
      {heroes.map((h, i) => {
        const tin = prog(f, 2 + i * 2, 8, "overshoot");
        const sel = i === index;
        return (
          <g key={h.id} transform={`translate(${tileX(i)} ${ROSTER_Y + (1 - tin) * 400 - (sel ? 14 : 0)})`}>
            <g transform="skewX(-10)">
              <clipPath id={`hsv-tile-${i}`}>
                <rect x={0} y={0} width={TILE_W} height={190} />
              </clipPath>
              <rect x={0} y={0} width={TILE_W} height={190} fill={h.primaryColor} />
              <g clipPath={`url(#hsv-tile-${i})`}>
                <g transform="skewX(10) translate(-30 -40) scale(0.62)">
                  <HeroPortrait hero={h} asGroup showEmblem={false} />
                </g>
              </g>
              <rect x={0} y={156} width={TILE_W} height={34} fill={color.ink} />
              <text x={TILE_W / 2} y={181} textAnchor="middle" fontFamily={family.wide} fontWeight={800} fontStretch="75%" fontSize={20} letterSpacing={1} fill={color.paper}>
                {h.name}
              </text>
              <rect x={0} y={0} width={TILE_W} height={190} fill="none" stroke={sel ? color.paper : color.ink} strokeWidth={sel ? 8 : 4} />
            </g>
          </g>
        );
      })}
      <g transform={`translate(${cursorX} ${ROSTER_Y - 40})`} opacity={f >= INTRO ? 1 : 0}>
        <rect x={-34} y={-30} width={68} height={40} fill={color.signal} />
        <path d="M -12 10 L 12 10 L 0 26 Z" fill={color.signal} />
        <text x={0} y={-2} textAnchor="middle" fontFamily={family.pixel} fontSize={28} fill={color.white}>
          1P
        </text>
      </g>

      {/* HUD */}
      <g transform={`translate(0 ${(1 - hudIn) * -200})`}>
        <rect x={60} y={118} width={70} height={56} fill={color.signal} />
        <Hud x={95} y={158} size={30} anchor="middle" fill={color.white}>
          1P
        </Hud>
        <Label x={150} y={160} size={46} fill={color.ink} weight={900} spacing={0.02}>
          SELECT YOUR HERO
        </Label>
        <text x={1020} y={164} textAnchor="end" fontFamily={family.display} fontSize={64} fill={color.ink}>
          {`0${hero.index}`}
        </text>
        <rect x={60} y={196} width={960} height={6} fill={color.ink} />
      </g>

      {/* confirm */}
      {confirmed ? (
        <g transform={`translate(540 760) scale(${keys(f, [CONFIRM + 2, CONFIRM + 8], [2.2, 1], "punch")}) rotate(-8)`}>
          <rect x={-380} y={-130} width={760} height={260} fill={color.paper} stroke={color.signal} strokeWidth={14} />
          <text x={0} y={-12} textAnchor="middle" fontFamily={family.display} fontSize={100} fill={color.signal}>
            HERO
          </text>
          <text x={0} y={92} textAnchor="middle" fontFamily={family.display} fontSize={88} fill={color.signal}>
            CONFIRMED
          </text>
        </g>
      ) : null}
      {impact ? (
        <g>
          <rect width={W} height={H} fill={F % 2 ? color.ink : color.paper} />
          <RadialSpeedLines width={W} height={H} cx={540} cy={800} inner={0.16} count={80} color={F % 2 ? color.paper : color.ink} seed={`hsv-imp${F}`} />
        </g>
      ) : null}
      <FanMark fill={color.ink} opacity={0.7} />
    </SeqSvg>
  );
}
