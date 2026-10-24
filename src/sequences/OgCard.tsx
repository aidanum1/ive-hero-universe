/**
 * Social share card (1200×630) — rendered as a Remotion <Still> into /public/og.png,
 * from the same tokens, portraits and print FX as the site.
 */
import { color } from "@/design/tokens";
import { family } from "@/design/typography";
import { heroes } from "@/heroes/roster";
import { owner } from "@/content/project";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { Monogram } from "@/visual/Monogram";
import { RadialSpeedLines } from "@/visual/Fx";

export const OG_W = 1200;
export const OG_H = 630;

export function OgCard() {
  return (
    <svg viewBox={`0 0 ${OG_W} ${OG_H}`} width="100%" height="100%" style={{ display: "block", background: color.paper }}>
      <svg x={0} y={0} width={OG_W} height={OG_H}>
        <Monogram tile={120} tint={color.lilac} />
      </svg>
      <g opacity={0.3}>
        <RadialSpeedLines width={OG_W} height={OG_H} cx={360} cy={250} inner={0.2} count={70} color={color.ink} seed="og" />
      </g>
      {heroes.map((h, i) => (
        <g key={h.id}>
          <rect x={660 + i * 90} y={0} width={90} height={OG_H} fill={h.primaryColor} />
          <g transform={`translate(${705 + i * 90} ${OG_H + 40}) scale(0.62) translate(-200 -520)`}>
            <HeroPortrait hero={h} asGroup showEmblem={false} />
          </g>
        </g>
      ))}
      {heroes
        .map((h) => h.primaryColor)
        .reverse()
        .map((c, k) => (
          <text key={k} x={60 + (6 - k) * 4} y={330 + (6 - k) * 4} fontFamily={family.display} fontSize={250} fill={c}>
            IVE
          </text>
        ))}
      <text x={60} y={330} fontFamily={family.display} fontSize={250} fill={color.ink}>
        IVE
      </text>
      <g transform="rotate(-3 300 420)">
        <rect x={30} y={360} width={640} height={92} fill={color.ink} />
        <text x={60} y={426} fontFamily={family.wide} fontWeight={900} fontStretch="125%" fontSize={58} fill={color.paper}>
          HERO UNIVERSE
        </text>
      </g>
      <text x={60} y={520} fontFamily={family.serif} fontStyle="italic" fontSize={40} fill={color.ink}>
        Six heroes. One universe.
      </text>
      <rect x={60} y={556} width={520} height={40} fill={color.signal} />
      <text x={76} y={584} fontFamily={family.pixel} fontSize={22} fill={color.white}>
        {`UNOFFICIAL FAN-MADE PROJECT · BY ${owner.handle.toUpperCase()}`}
      </text>
    </svg>
  );
}
