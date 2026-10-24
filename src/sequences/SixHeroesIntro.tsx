/**
 * SIX HEROES INTRO — the title open (bars → wipe → I·V·E impact slams → HERO UNIVERSE),
 * then each hero's POWER BURST back to back with hard cuts, then the team line-up.
 */
import { color, type FxProfile } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroes } from "@/heroes/roster";
import { keys, prog, shake, within } from "@/lib/timeline";
import { HalftoneDots, fields } from "@/visual/Halftone";
import { HeroEmblem } from "@/visual/HeroGraphics";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { Monogram } from "@/visual/Monogram";
import { HalftoneWipe, RadialSpeedLines, SfxText } from "@/visual/Fx";
import { PowerBurst } from "./PowerBurst";
import { FanMark, H, Hud, Label, SeqSvg, W, defaultFx, type SeqProps } from "./kit";

export const SIX = { title: 56, per: 66 } as const;
const TITLE = SIX.title;
const PER = SIX.per;
export const SIX_OUTRO = TITLE + PER * heroes.length;
const OUTRO = SIX_OUTRO;
export const SIX_HEROES_DURATION = OUTRO + 74;

const lineupDots = fields.linear(90, 0.05, 0.6);
const IVE_EXTRUDE = heroes.map((h) => h.primaryColor);

function Title({ f, fx }: { f: number; fx: FxProfile }) {
  const F = Math.floor(f);
  const sh = shake(f, 26, fx.shake, 10, "si-title");
  const letters = ["I", "V", "E"];
  const landAt = [24, 29, 34];
  const wipe = prog(f, 14, 8, "snap");
  return (
    <g>
      <rect width={W} height={H} fill={color.paper} />
      <svg x={0} y={0} width={W} height={H}>
        <Monogram tile={190} tint={color.lilac} />
      </svg>
      <g transform={`translate(${sh.x} ${sh.y})`}>
        {f >= 24 ? (
          <g opacity={keys(f, [24, 30, 50], [0, 1, 0.35])}>
            <RadialSpeedLines width={W} height={H} cx={540} cy={820} inner={0.22} count={fx.speedLineCount} color={color.ink} seed="si-lines" />
          </g>
        ) : null}
        {letters.map((l, i) => {
          const p = prog(f, landAt[i] - 4, 5, "punch");
          if (f < landAt[i] - 4) return null;
          const x = 250 + i * 290;
          return (
            <g key={l} transform={`translate(${x} 900) scale(${2.6 - 1.6 * p})`}>
              {IVE_EXTRUDE.slice()
                .reverse()
                .map((c, k) => (
                  <text key={k} x={(6 - k) * 7} y={(6 - k) * 7} textAnchor="middle" fontFamily={family.display} fontSize={360} fill={c}>
                    {l}
                  </text>
                ))}
              <text x={0} y={0} textAnchor="middle" fontFamily={family.display} fontSize={360} fill={color.ink}>
                {l}
              </text>
            </g>
          );
        })}
        {f >= 38 ? (
          <g transform="translate(540 1080) rotate(-4)">
            <rect x={-700} y={-80} width={1400 * prog(f, 38, 6, "snap")} height={150} fill={color.ink} />
            <g transform={`translate(${(1 - prog(f, 40, 7, "overshoot")) * -900} 0)`}>
              <Label x={-151} y={28} size={80} anchor="end" weight={900} fill={color.paper} spacing={0}>
                HERO
              </Label>
            </g>
            <g transform={`translate(${(1 - prog(f, 40, 7, "overshoot")) * 900} 0)`}>
              <Label x={-121} y={28} size={80} anchor="start" weight={900} fill={color.paper} spacing={0}>
                UNIVERSE
              </Label>
            </g>
          </g>
        ) : null}
        {f >= 44 ? (
          <text x={540} y={1300} textAnchor="middle" fontFamily={family.serif} fontStyle="italic" fontSize={68} fill={color.ink} opacity={prog(f, 44, 6)}>
            Six heroes. One universe.
          </text>
        ) : null}
      </g>
      {/* bars slam then wipe away */}
      {f < 24
        ? heroes.map((h, i) => {
            const drop = prog(f, i * 1.5, 6, "punch");
            const bw = W / 6;
            const cut = wipe * (H + 400);
            return (
              <g key={h.id}>
                <polygon
                  points={`${i * bw},${-H + drop * H + (i % 2 ? cut : 0)} ${(i + 1) * bw},${-H + drop * H + (i % 2 ? cut : 0)} ${(i + 1) * bw},${drop * H - (i % 2 ? 0 : cut)} ${i * bw},${drop * H - (i % 2 ? 0 : cut)}`}
                  fill={h.primaryColor}
                />
                {drop > 0.5 && wipe < 0.3 ? (
                  <g transform={`translate(${i * bw + bw / 2 - 40} 1500) scale(0.8)`}>
                    <HeroEmblem hero={h} asGroup />
                  </g>
                ) : null}
              </g>
            );
          })
        : null}
      {within(f, 24, 2) || within(f, 29, 1) || within(f, 34, 1) ? <rect width={W} height={H} fill={F % 2 ? "#fff" : color.ink} opacity={0.9} style={{ mixBlendMode: "difference" }} /> : null}
      {/* halftone reveal into the first power: dots in Yujin's deep colour grow and merge */}
      <HalftoneWipe width={W} height={H} progress={prog(f, TITLE - 9, 9)} cell={90} color={heroes[0].deepColor} angle={-70} />
    </g>
  );
}

function Lineup({ f }: { f: number }) {
  const t = f - OUTRO;
  return (
    <g>
      <rect width={W} height={H} fill={color.lilac} />
      <HalftoneDots width={W} height={H} cell={22} angle={15} color={color.plateMagenta} field={lineupDots} opacity={0.4} />
      {heroes.map((h, i) => {
        const p = prog(t, i * 2, 10, "overshoot");
        const row = i < 3 ? 0 : 1;
        const col = i % 3;
        const x = 200 + col * 340 + (row ? 0 : 0);
        const by = row ? 1640 : 1140;
        return (
          <g key={h.id} transform={`translate(0 ${(1 - p) * 900})`}>
            <circle cx={x} cy={by - 260} r={190} fill={h.primaryColor} stroke={color.ink} strokeWidth={8} />
            <g transform={`translate(${x} ${by}) scale(0.95) translate(-200 -520)`}>
              <HeroPortrait hero={h} asGroup />
            </g>
            <Label x={x} y={by + 40} size={24} anchor="middle" fill={color.ink} stretch="62%" spacing={0.08}>
              {h.heroName}
            </Label>
          </g>
        );
      })}
      <g transform={`translate(540 300) scale(${keys(t, [16, 22], [1.8, 1], "punch")})`} opacity={t >= 16 ? 1 : 0}>
        <SfxText x={0} y={0} size={150} width={900} fill={color.plateYellow} shadow={color.plateMagenta}>
          LOOKS CAN KILL
        </SfxText>
      </g>
      <Hud x={540} y={420} size={34} anchor="middle" fill={color.ink} opacity={prog(t, 24, 6)}>
        THE GIRL HERO ERA · 26.10.2026
      </Hud>
    </g>
  );
}

export function SixHeroesIntro({ frame, fx = defaultFx }: SeqProps) {
  const f = frame;
  if (f < TITLE) {
    return (
      <SeqSvg background={color.ink}>
        <Title f={f} fx={fx} />
        <FanMark fill={color.ink} opacity={0.6} />
      </SeqSvg>
    );
  }
  if (f < OUTRO) {
    const i = Math.floor((f - TITLE) / PER);
    const local = f - TITLE - i * PER;
    return <PowerBurst frame={local} heroId={heroes[i].id} fx={fx} />;
  }
  return (
    <SeqSvg background={color.lilac}>
      <Lineup f={f} />
      <FanMark fill={color.ink} opacity={0.7} />
    </SeqSvg>
  );
}
