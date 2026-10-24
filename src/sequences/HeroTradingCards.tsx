/**
 * HERO TRADING CARDS — cards are dealt into a fan, each is pulled into the spotlight with
 * a faux-3D flip and a holo glint sweep, then all six settle into a collector grid.
 */
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroes } from "@/heroes/roster";
import { keys, lerp, prog } from "@/lib/timeline";
import { HalftoneDots, fields } from "@/visual/Halftone";
import { RadialSpeedLines, SfxText } from "@/visual/Fx";
import { CARD_H, CARD_R, CARD_W, TradingCardGroup } from "@/visual/TradingCard";
import { useSvgId } from "@/visual/useSvgId";
import { FanMark, H, Hud, SeqSvg, W, defaultFx, type SeqProps } from "./kit";

export const TC = { deal: 10, fan: 40, spot: 30 } as const;
const DEAL = TC.deal;
const FAN = TC.fan;
const SPOT = TC.spot;
export const TC_GRID = FAN + SPOT * heroes.length;
const GRID = TC_GRID;
export const TRADING_CARDS_DURATION = GRID + 70;

const bgDots = fields.radial(0.5, 0.5, 0.75, 0.05, 0.75);

type Pose = { x: number; y: number; s: number; r: number; flip: number; dim: number };

function fanPose(i: number): Pose {
  const a = ((i - 2.5) / 2.5) * 0.5;
  return { x: 540 + Math.sin(a) * 760, y: 1650 - Math.cos(a) * 260, s: 0.38, r: (a * 180) / Math.PI, flip: 0, dim: 0 };
}
function gridPose(i: number): Pose {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return { x: 200 + col * 340, y: 760 + row * 520, s: 0.5, r: 0, flip: 0, dim: 0 };
}
const spotPose: Pose = { x: 540, y: 960, s: 1.12, r: 0, flip: 0, dim: 0 };
const mix = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  s: lerp(a.s, b.s, t),
  r: lerp(a.r, b.r, t),
  flip: lerp(a.flip, b.flip, t),
  dim: lerp(a.dim, b.dim, t),
});

function poseAt(i: number, f: number): Pose {
  // deal: fly up from below, face down (flip = 1 → back showing)
  const dealT = prog(f, DEAL + i * 3, 12, "overshoot");
  const start: Pose = { x: 540, y: 2400, s: 0.38, r: -40 + i * 12, flip: 1, dim: 0 };
  let p = mix(start, { ...fanPose(i), flip: 1 }, dealT);
  // flip in the fan
  p.flip = 1 - prog(f, FAN - 8 + i * 1.5, 8, "snap");
  if (f >= FAN) {
    const active = Math.floor((f - FAN) / SPOT);
    const local = f - FAN - active * SPOT;
    if (f < GRID) {
      if (active === i) {
        const inT = prog(local, 0, 8, "overshootSoft");
        const outT = prog(local, SPOT - 6, 6, "accel");
        p = mix(mix(fanPose(i), spotPose, inT), fanPose(i), outT);
        p.flip = keys(local, [0, 6, 12], [0, 1, 2], ["accel", "punch"]) % 2;
      } else {
        p = { ...fanPose(i), dim: 0.55 };
      }
    } else {
      p = mix(fanPose(i), gridPose(i), prog(f, GRID + i * 2, 12, "overshoot"));
    }
  }
  return p;
}

function Card({ i, f }: { i: number; f: number }) {
  const id = useSvgId(`tc${i}`);
  const p = poseAt(i, f);
  const h = heroes[i];
  // faux-3D flip: flip ∈ [0,1] → angle 0..π
  const ang = p.flip * Math.PI;
  const sx = Math.cos(ang);
  const showBack = sx < 0;
  const skew = Math.sin(ang) * 10;
  const glint = (() => {
    if (f < FAN || f >= GRID) return f >= GRID ? prog(f, GRID + 20 + i * 3, 14, "glide") : -1;
    const active = Math.floor((f - FAN) / SPOT);
    return active === i ? prog(f - FAN - active * SPOT, 12, 12, "glide") : -1;
  })();
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s}) skewY(${skew}) scale(${Math.max(0.02, Math.abs(sx))} 1) translate(${-CARD_W / 2} ${-CARD_H / 2})`}>
      <defs>
        <clipPath id={id}>
          <rect width={CARD_W} height={CARD_H} rx={CARD_R} />
        </clipPath>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-holo`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3cac" />
          <stop offset="0.25" stopColor="#ffe14a" />
          <stop offset="0.5" stopColor="#2bd9a6" />
          <stop offset="0.75" stopColor="#3f8cff" />
          <stop offset="1" stopColor="#b44dff" />
        </linearGradient>
      </defs>
      <rect x={18} y={26} width={CARD_W} height={CARD_H} rx={CARD_R} fill={color.ink} opacity={0.5} />
      {/* |cos| scaling never mirrors, so the back face reads correctly like a real card. */}
      <TradingCardGroup hero={h} side={showBack ? "back" : "front"} />
      <g clipPath={`url(#${id})`}>
        <rect width={CARD_W} height={CARD_H} fill={`url(#${id}-holo)`} opacity={0.16 + Math.abs(Math.sin(ang)) * 0.4} style={{ mixBlendMode: "color-dodge" }} />
        {glint > 0 && glint < 1 ? <rect x={lerp(-CARD_W, CARD_W * 1.6, glint)} y={-300} width={CARD_W * 0.5} height={CARD_H + 600} fill={`url(#${id}-g)`} transform={`rotate(20 ${CARD_W / 2} ${CARD_H / 2})`} /> : null}
        {p.dim > 0 ? <rect width={CARD_W} height={CARD_H} fill={color.ink} opacity={p.dim} /> : null}
      </g>
    </g>
  );
}

export function HeroTradingCards({ frame, fx = defaultFx }: SeqProps) {
  const f = frame;
  const active = f >= FAN && f < GRID ? Math.floor((f - FAN) / SPOT) : -1;
  const hero = active >= 0 ? heroes[active] : null;
  const local = active >= 0 ? f - FAN - active * SPOT : 0;
  const bg = hero ? hero.deepColor : color.ink;
  const order = heroes.map((_, i) => i).sort((a, b) => (a === active ? 1 : b === active ? -1 : 0));

  return (
    <SeqSvg background={bg}>
      <rect width={W} height={H} fill={bg} />
      <HalftoneDots width={W} height={H} cell={26} angle={45} color={hero ? hero.primaryColor : "#2A2635"} field={bgDots} opacity={0.6} />
      {hero ? (
        <g opacity={0.5}>
          <RadialSpeedLines width={W} height={H} cx={540} cy={960} inner={0.34} count={fx.speedLineCount} color={hero.secondaryColor} seed={`tc-${active}-${Math.floor(f / 3)}`} />
        </g>
      ) : null}

      {order.map((i) => (
        <Card key={i} i={i} f={f} />
      ))}

      {hero && local > 8 && local < SPOT - 4 ? (
        <g transform={`translate(540 ${300 - (1 - prog(local, 8, 6, "punch")) * 200})`}>
          <SfxText x={0} y={0} size={hero.heroName.length > 11 ? 104 : 124} width={940} fill={hero.primaryColor} stroke={color.ink} shadow={color.paper} skew={-9}>
            {hero.heroName}
          </SfxText>
          <Hud x={0} y={90} size={34} anchor="middle" fill={color.paper}>
            {`CARD ${String(hero.index).padStart(2, "0")}/06 · ★ SSR · ${hero.powerFX.name}`}
          </Hud>
        </g>
      ) : null}

      {f < FAN ? (
        <g opacity={keys(f, [0, 8, FAN - 6, FAN], [0, 1, 1, 0])}>
          <text x={540} y={420} textAnchor="middle" fontFamily={family.serif} fontStyle="italic" fontSize={92} fill={color.paper}>
            Collector&apos;s edition.
          </text>
          <Hud x={540} y={500} size={34} anchor="middle" fill={color.plateYellow}>
            IVE HERO UNIVERSE · HOLO CARDS
          </Hud>
        </g>
      ) : null}

      {f >= GRID ? (
        <g opacity={prog(f, GRID + 10, 8)}>
          <SfxText x={540} y={330} size={130} width={900} fill={color.plateYellow} shadow={color.plateMagenta}>
            COLLECT ALL SIX
          </SfxText>
          <Hud x={540} y={1610} size={32} anchor="middle" fill={color.paper}>
            FAN-MADE TRADING CARDS · NOT FOR SALE
          </Hud>
        </g>
      ) : null}
      <FanMark opacity={0.6} />
    </SeqSvg>
  );
}
