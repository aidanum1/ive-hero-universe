/** Emits the design tokens as CSS custom properties so stylesheets never hardcode values. */
import { heroes } from "@/heroes/roster";
import { cssEase, dur, sec } from "./motion";
import { color, fx, space, z } from "./tokens";
import { family, fluid } from "./typography";

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export function rootCssVars() {
  const vars: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(color)) vars[`--c-${kebab(k)}`] = v;
  space.forEach((v, i) => (vars[`--s-${i}`] = `${v}px`));
  for (const [k, v] of Object.entries(family)) vars[`--f-${k}`] = v;
  for (const [k, v] of Object.entries(fluid)) vars[`--t-${k}`] = v;
  for (const [k, v] of Object.entries(cssEase)) vars[`--ease-${kebab(k)}`] = v;
  for (const [k, v] of Object.entries(dur)) vars[`--d-${k}`] = `${Math.round(sec(v) * 1000)}ms`;
  for (const [k, v] of Object.entries(z)) vars[`--z-${k}`] = v;
  vars["--fx-halftone"] = fx.halftoneOpacity;
  vars["--fx-grain"] = fx.grainOpacity;
  for (const h of heroes) {
    vars[`--${h.id}`] = h.primaryColor;
    vars[`--${h.id}-2`] = h.secondaryColor;
    vars[`--${h.id}-deep`] = h.deepColor;
  }
  return `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;
}

/** Inline style that sets the per-hero theme variables on an element. */
export const heroThemeVars = (h: (typeof heroes)[number]) =>
  ({
    "--hero": h.primaryColor,
    "--hero-2": h.secondaryColor,
    "--hero-accent": h.accentColor,
    "--hero-deep": h.deepColor,
    "--hero-on": h.onPrimary,
  }) as React.CSSProperties;
