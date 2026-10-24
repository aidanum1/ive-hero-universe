"use client";
/**
 * Living design-system reference — every swatch, type role, curve and primitive below is
 * rendered from the same tokens/components the site and the Remotion videos use.
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { color, fx, fxProfile } from "@/design/tokens";
import { role } from "@/design/typography";
import { cssEase, curve, dur, ease, sec } from "@/design/motion";
import { heroes } from "@/heroes/roster";
import { motionPieces } from "@/sequences/registry";
import { disclaimer } from "@/content/release";
import { HeroEmblem, HeroMask } from "@/visual/HeroGraphics";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { HalftoneLayer, HeroTexture, fields } from "@/visual/Halftone";
import { Barcode, ColorBar, CropMarks, ImpactBurst, LinearSpeedLines, RadialSpeedLines, RegistrationMark, SfxText, StatHex } from "@/visual/Fx";
import { Monogram } from "@/visual/Monogram";
import { TradingCard } from "@/visual/TradingCard";
import s from "./system.module.css";

const sampleField = fields.linear(0, 0, 1);

const SAMPLE: Record<keyof typeof role, string> = {
  impact: "CAPTAIN PURPLE",
  headline: "HERO UNIVERSE",
  condensed: "SIX HEROES IN AN UNOFFICIAL FAN PICTURE",
  voice: "Looks can kill.",
  body: "Every value on this page is read from the shared tokens.",
  label: "LEADER · VELOCITY",
  hud: "PRESS START ▶ 01/06",
  hangul: "캡틴 퍼플 · 번쩍",
};

function Curve({ name }: { name: keyof typeof curve }) {
  const fn = ease[name];
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return `${(t * 160).toFixed(1)},${(110 - fn(t) * 80).toFixed(1)}`;
  }).join(" ");
  return (
    <figure className={s.curve} style={{ "--e": cssEase[name] } as CSSProperties}>
      <svg viewBox="0 -10 160 130" aria-hidden>
        <line x1={0} x2={160} y1={30} y2={30} stroke={color.ink} strokeOpacity={0.15} strokeDasharray="3 3" />
        <line x1={0} x2={160} y1={110} y2={110} stroke={color.ink} strokeOpacity={0.4} />
        <polyline points={pts} fill="none" stroke={color.ink} strokeWidth={3} />
      </svg>
      <span className={s.runner} aria-hidden />
      <figcaption>
        <b>{name}</b>
        <code>{`cubic-bezier(${curve[name].join(", ")})`}</code>
      </figcaption>
    </figure>
  );
}

export function SystemSheet() {
  return (
    <main className={s.page}>
      <header className={s.head}>
        <Link href="/" className={s.back}>
          ◀ IVE HERO UNIVERSE
        </Link>
        <h1 className={s.title}>
          Design <em>system.</em>
        </h1>
        <p className={s.lede}>One source for the website, the Remotion videos and the WebGL card textures. {disclaimer.short}.</p>
      </header>

      <section className={s.block}>
        <h2 className={s.h2}>01 · Colour</h2>
        <div className={s.swatches}>
          {(Object.entries(color) as [string, string][]).map(([k, v]) => (
            <div key={k} className={s.swatch}>
              <span style={{ background: v }} />
              <b>{k}</b>
              <code>{v}</code>
            </div>
          ))}
        </div>
        <div className={s.heroColors}>
          {heroes.map((h) => (
            <div key={h.id} className={s.heroColor}>
              <p>{h.heroName}</p>
              <div>
                {[h.primaryColor, h.secondaryColor, h.accentColor, h.deepColor].map((c) => (
                  <span key={c} style={{ background: c }} title={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={s.block}>
        <h2 className={s.h2}>02 · Type roles</h2>
        <div className={s.types}>
          {(Object.keys(role) as (keyof typeof role)[]).map((k) => (
            <div key={k} className={s.typeRow}>
              <code>{k}</code>
              <p style={{ ...role[k], fontSize: k === "body" || k === "label" || k === "hud" ? "1.1rem" : "clamp(1.6rem, 3.4vw, 3rem)" }}>{SAMPLE[k]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={s.block}>
        <h2 className={s.h2}>03 · Motion — curves & durations</h2>
        <p className={s.note}>Hover a curve to run it. Choreography is authored in 30fps base frames; GSAP gets seconds, Remotion gets frames.</p>
        <div className={s.curves}>
          {(Object.keys(curve) as (keyof typeof curve)[]).map((k) => (
            <Curve key={k} name={k} />
          ))}
        </div>
        <dl className={s.durs}>
          {(Object.entries(dur) as [string, number][]).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>
                {v}f · {Math.round(sec(v) * 1000)}ms
              </dd>
            </div>
          ))}
        </dl>
        <dl className={`${s.durs} ${s.fxRows}`}>
          {(Object.entries(fxProfile) as [string, typeof fx][]).map(([k, p]) => (
            <div key={k}>
              <dt>fx · {k}</dt>
              <dd>
                lines {p.speedLineCount} · echoes {p.echoCount} · shake {p.shake} · chroma {p.chroma}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={s.block}>
        <h2 className={s.h2}>04 · Heroes (data-driven)</h2>
        <div className={s.heroes}>
          {heroes.map((h) => (
            <article key={h.id} className={s.hero} style={{ background: h.secondaryColor }}>
              <HeroTexture texture={h.texture} color={h.primaryColor} opacity={0.3} className={s.heroTex} />
              <HeroPortrait hero={h} width="100%" className={s.heroPortrait} />
              <div className={s.heroMeta}>
                <div className={s.heroIcons}>
                  <HeroEmblem hero={h} width={48} />
                  <HeroMask hero={h} width={110} />
                </div>
                <p className={s.heroName}>{h.heroName}</p>
                <dl>
                  <dt>motion</dt>
                  <dd>
                    {h.motionPersonality.kind} · {h.motionPersonality.enter} · {h.motionPersonality.enterFrames}f
                  </dd>
                  <dt>power</dt>
                  <dd>
                    {h.powerFX.kind} · {h.powerFX.name}
                  </dd>
                  <dt>texture</dt>
                  <dd>
                    {h.texture.kind} · {h.texture.angle}°
                  </dd>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={s.block}>
        <h2 className={s.h2}>05 · Print & FX primitives</h2>
        <div className={s.fx}>
          <figure>
            <HalftoneLayer width={300} height={200} cell={12} angle={45} color={color.ink} field={sampleField} />
            <figcaption>HalftoneDots — variable-size screen</figcaption>
          </figure>
          <figure>
            <svg viewBox="0 0 300 200">
              <RadialSpeedLines width={300} height={200} inner={0.25} count={48} seed="sys" />
            </svg>
            <figcaption>RadialSpeedLines</figcaption>
          </figure>
          <figure>
            <svg viewBox="0 0 300 200">
              <LinearSpeedLines width={300} height={200} count={40} seed="sys2" maxThickness={4} />
            </svg>
            <figcaption>LinearSpeedLines</figcaption>
          </figure>
          <figure>
            <svg viewBox="0 0 300 200">
              <ImpactBurst cx={150} cy={100} r={90} spikes={14} seed="sys3" />
              <SfxText x={150} y={118} size={56}>
                POW!
              </SfxText>
            </svg>
            <figcaption>ImpactBurst + SfxText</figcaption>
          </figure>
          <figure>
            <svg viewBox="0 0 300 200">
              <CropMarks x={60} y={40} width={180} height={120} />
              <RegistrationMark x={150} y={100} r={20} />
              <Barcode x={70} y={150} width={160} height={30} value="sys" />
              <ColorBar x={66} y={14} size={14} colors={heroes.map((h) => h.primaryColor).concat([color.plateCyan, color.plateMagenta, color.plateYellow, color.ink])} />
            </svg>
            <figcaption>Print furniture</figcaption>
          </figure>
          <figure>
            <svg viewBox="0 0 300 200">
              <g transform="translate(60 0)">
                <StatHex size={200} values={[10, 8, 8, 9, 9, 9]} labels={["SPD", "PWR", "GLM", "PRC", "FCS", "NRG"]} fill={heroes[0].primaryColor} />
              </g>
            </svg>
            <figcaption>StatHex</figcaption>
          </figure>
          <figure className={s.mono}>
            <Monogram tile={100} />
            <figcaption>Monogram wallpaper</figcaption>
          </figure>
        </div>
      </section>

      <section className={s.block}>
        <h2 className={s.h2}>06 · Trading card</h2>
        <div className={s.cards}>
          <TradingCard hero={heroes[3]} width="100%" />
          <TradingCard hero={heroes[3]} side="back" width="100%" />
          <div className={s.foil}>
            <TradingCard hero={heroes[3]} foilMask width="100%" />
          </div>
        </div>
        <p className={s.note}>Front · back · foil mask (white = holographic foil in the WebGL shader).</p>
      </section>

      <section className={s.block}>
        <h2 className={s.h2}>07 · Compositions</h2>
        <table className={s.table}>
          <thead>
            <tr>
              <th>id</th>
              <th>size</th>
              <th>frames</th>
              <th>render</th>
            </tr>
          </thead>
          <tbody>
            {motionPieces.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.width}×{p.height} @{p.fps}
                </td>
                <td>{p.durationInFrames}</td>
                <td>
                  <code>npx remotion render {p.id}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
