/**
 * The IVE HERO UNIVERSE sound library — every effect as a synth recipe.
 * Retro-game UI blips, comic impacts, print-shop swishes and one signature move per hero.
 * Self-contained (relative imports only) so it can be bundled for the WAV export script.
 */
import { SR, crackle, crush, drive, echo, env, filter, finish, fm, gain, mix, noise, osc, shape, silence, st, type Buf } from "./synth";

const exp = (from: number, to: number, dur: number) => (t: number) => from * (to / from) ** Math.min(1, t / dur);

function kick(sec = 0.5, from = 150, to = 40, drop = 0.12) {
  return env(osc(sec, exp(from, to, drop)), 0.001, sec * 0.35);
}
function swish(sec: number, from: number, to: number, q = 1.4, seed = 1) {
  const n = noise(sec, seed);
  filter(n, "bandpass", exp(from, to, sec), q);
  return shape(n, (t) => Math.sin(Math.PI * Math.min(1, t / sec)) ** 1.5);
}
function bell(sec: number, f: number, decay = 0.6) {
  return env(mix([osc(sec, f), 1], [osc(sec, f * 2.01), 0.4], [osc(sec, f * 3.03), 0.18]), 0.002, decay);
}

export const recipes = {
  // ───── UI ─────
  cursor: () => finish(filter(env(osc(0.09, (t) => (t < 0.018 ? 880 : 1320), "square"), 0.001, 0.035), "lowpass", 5200), 0.55),
  select: () => finish(mix([env(osc(0.08, 660, "square"), 0.001, 0.05), 0.6], [env(osc(0.14, 990, "square"), 0.001, 0.07), 0.6, 0.06], [env(osc(0.2, 1980), 0.001, 0.08), 0.3, 0.06]), 0.6),
  confirm: () => {
    const notes = [0, 4, 7, 12].map((n, i) => [env(osc(0.5, 523.25 * st(n), "saw"), 0.002, 0.18), 0.35, i * 0.035] as [Buf, number, number]);
    const stab = mix(...notes, [env(noise(0.04, 7), 0.001, 0.01), 0.3]);
    return finish(echo(filter(stab, "lowpass", exp(9000, 1800, 0.4)), 0.11, 0.3, 0.25, 0.4), 0.75);
  },
  type: () => finish(env(osc(0.02, 2100, "square"), 0.0005, 0.006), 0.35),
  menuOpen: () => finish(mix([swish(0.32, 400, 5200, 1.2, 4), 0.8], [env(osc(0.25, exp(300, 1200, 0.25), "tri"), 0.01, 0.12), 0.25]), 0.6),
  menuClose: () => finish(mix([swish(0.28, 5200, 400, 1.2, 5), 0.8], [env(osc(0.22, exp(1200, 300, 0.22), "tri"), 0.01, 0.1), 0.25]), 0.55),
  tick: () => finish(mix([env(osc(0.05, 1500), 0.0005, 0.012)], [env(filter(noise(0.02, 9), "highpass", 4000), 0.0005, 0.004), 0.5]), 0.4),
  static: () => {
    const n = filter(noise(0.32, 21), "bandpass", 2600, 0.7);
    const burst = mix([shape(n, (t) => 0.6 + 0.4 * Math.sin(t * 900)), 0.8], [crackle(0.32, 0.05, 2), 0.5], [env(osc(0.32, 60, "square"), 0.001, 0.2), 0.15]);
    return finish(env(burst, 0.004, 0.1, 0.12), 0.55);
  },

  // ───── opening ─────
  boot: () => {
    const pad = mix(...[0, 7, 12, 16, 19].map((n) => [shape(osc(2.4, 130.81 * st(n), n % 2 ? "tri" : "sine"), (t) => Math.min(1, t / 0.35) * Math.exp(-t / 1.1)), 0.22] as [Buf, number]));
    const sparkle = mix(...[24, 28, 31, 36].map((n, i) => [bell(0.9, 130.81 * st(n), 0.3), 0.12, 0.25 + i * 0.09] as [Buf, number, number]));
    return finish(echo(mix([pad, 1], [sparkle, 1]), 0.18, 0.4, 0.3, 1), 0.7);
  },
  barSlam: () => finish(drive(mix([kick(0.32, 120, 45, 0.08), 1], [env(filter(noise(0.08, 11), "lowpass", 1400), 0.001, 0.03), 0.6], [env(osc(0.01, 3000, "square"), 0.0005, 0.003), 0.2]), 1.6), 0.8),
  wipe: () => finish(swish(0.38, 500, 7000, 1.1, 13), 0.65),
  impact: () => {
    const body = kick(0.7, 170, 36, 0.14);
    const crack = env(filter(noise(0.2, 15), "lowpass", 3200), 0.0005, 0.06);
    const sub = env(osc(0.9, 42), 0.005, 0.35);
    return finish(drive(mix([body, 1], [crack, 0.7], [sub, 0.5]), 2.4), 0.9);
  },
  bigImpact: () => {
    const base = mix([kick(1.2, 140, 30, 0.2), 1], [env(filter(noise(0.5, 17), "lowpass", exp(5000, 300, 0.5)), 0.001, 0.15), 0.8], [env(osc(1.4, 36), 0.01, 0.6), 0.6]);
    return finish(echo(drive(base, 2.8), 0.14, 0.32, 0.25, 0.9), 0.95);
  },
  collide: () => {
    const clang = env(fm(0.8, 410, 1.414, (t) => 6 * Math.exp(-t * 7)), 0.001, 0.3);
    return finish(mix([clang, 0.55], [kick(0.4, 130, 50, 0.09), 0.7], [env(filter(noise(0.1, 19), "highpass", 2500), 0.001, 0.04), 0.4]), 0.85);
  },
  pop: () => finish(mix([env(osc(0.13, exp(950, 180, 0.07)), 0.001, 0.05), 1], [env(filter(noise(0.015, 23), "highpass", 3000), 0.0005, 0.004), 0.4]), 0.65),
  stamp: () => finish(mix([kick(0.3, 110, 55, 0.05), 0.9], [env(filter(noise(0.12, 25), "bandpass", 1200, 0.8), 0.001, 0.05), 0.8]), 0.8),

  // ───── motion ─────
  whoosh: () => finish(swish(0.46, 300, 2600, 1.3, 27), 0.7),
  zip: () => finish(mix([swish(0.2, 1500, 7000, 1, 29), 0.9], [env(osc(0.18, exp(380, 1900, 0.18), "saw"), 0.002, 0.07), 0.18]), 0.7),
  pageTurn: () => {
    const n = noise(0.42, 31);
    filter(n, "bandpass", exp(900, 3800, 0.42), 0.9);
    return finish(shape(n, (t) => (t < 0.06 ? t / 0.06 : Math.exp(-(t - 0.06) / 0.12)) * (1 + 0.3 * Math.sin(t * 160))), 0.55);
  },
  flip: () => finish(mix([env(filter(noise(0.07, 33), "highpass", 2200), 0.001, 0.02), 1], [env(filter(noise(0.06, 35), "highpass", 3200), 0.001, 0.015), 0.6, 0.045]), 0.6),
  deal: () => finish(swish(0.18, 2800, 2200, 2, 37), 0.5),
  glint: () => finish(echo(mix(...[2637, 3136, 3520, 4186].map((f, i) => [bell(0.5, f, 0.16), 0.4, i * 0.045] as [Buf, number, number])), 0.07, 0.3, 0.3, 0.3), 0.55),
  ting: () => finish(echo(bell(1.2, 1760, 0.45), 0.13, 0.25, 0.2, 0.4), 0.6),

  // ───── charge / power ─────
  charge: () => {
    const sec = 1.2;
    const tone = mix(
      [osc(sec, (t) => exp(110, 880, sec)(t) * (1 + 0.012 * Math.sin(t * 40 * (1 + t * 3))), "saw"), 0.5],
      [osc(sec, (t) => exp(165, 1320, sec)(t), "square"), 0.25],
    );
    filter(tone, "lowpass", exp(400, 6000, sec), 2);
    const air = filter(noise(sec, 39), "bandpass", exp(800, 6000, sec), 0.8);
    return finish(shape(mix([tone, 1], [air, 0.35]), (t) => (t / sec) ** 1.4), 0.7);
  },
  freeze: () => {
    const sec = 0.38;
    let ph = 0;
    const tape = silence(sec);
    for (let i = 0; i < tape.length; i++) {
      const t = i / SR;
      ph += (330 * (1 - t / sec) ** 2) / SR;
      tape[i] = ((ph % 1) * 2 - 1) * 0.6 + Math.sin(ph * Math.PI * 4) * 0.4;
    }
    return finish(filter(tape, "lowpass", 2400), 0.6);
  },
  glitch: () => {
    const sec = 0.42;
    const parts: [Buf, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const seg = i % 3 === 0 ? osc(0.03, 200 + ((i * 397) % 1600), "square") : filter(noise(0.03, 41 + i), "bandpass", 600 + ((i * 1231) % 5000), 2);
      parts.push([env(seg, 0.0005, 0.02), i % 4 === 3 ? 0.2 : 0.8, i * 0.033]);
    }
    return finish(crush(mix(...parts, [silence(sec), 0]), 4, 5), 0.65);
  },
  tear: () => finish(env(crush(mix([filter(noise(0.22, 43), "highpass", 1200), 0.8], [osc(0.22, (t) => (Math.floor(t * 60) % 2 ? 180 : 1400), "square"), 0.4]), 3, 8), 0.002, 0.09, 0.05), 0.6),
  zap: () => {
    const sec = 0.45;
    const sweep = env(osc(sec, exp(3200, 140, 0.28), "saw"), 0.001, 0.16);
    const arc = env(filter(crackle(sec, 0.06, 45), "highpass", 900), 0.001, 0.2);
    return finish(drive(mix([sweep, 0.6], [arc, 0.9], [kick(0.35, 120, 45, 0.06), 0.5, 0.02]), 2), 0.85);
  },

  // hero signature moves
  gust: () => {
    const sec = 0.95;
    const wind = filter(noise(sec, 47), "lowpass", (t) => 300 + 2200 * Math.sin(Math.PI * Math.min(1, t / sec)) ** 2, 1.2);
    const whistle = osc(sec, (t) => 820 + 120 * Math.sin(t * 9), "sine");
    return finish(shape(mix([wind, 1], [whistle, 0.06]), (t) => Math.sin(Math.PI * Math.min(1, t / sec)) ** 0.8), 0.7);
  },
  shot: () => {
    const crackN = env(filter(noise(0.05, 49), "highpass", 900), 0.0003, 0.012);
    const thump = kick(0.25, 200, 60, 0.04);
    const ring = env(osc(0.25, 2300), 0.001, 0.06);
    return finish(drive(mix([crackN, 1], [thump, 0.8], [ring, 0.12]), 3), 0.85);
  },
  slash: () => {
    const shing = env(fm(1.0, exp(2600, 2350, 1), 1.414, (t) => 3 * Math.exp(-t * 4)), 0.002, 0.4);
    const air = swish(0.24, 5000, 9000, 1, 51);
    return finish(echo(mix([shing, 0.45], [air, 0.7]), 0.08, 0.3, 0.2, 0.3), 0.75);
  },
  tok: () => {
    const block = mix([env(osc(0.08, 1150), 0.0005, 0.025), 1], [env(osc(0.08, 1730), 0.0005, 0.018), 0.5], [env(filter(noise(0.01, 53), "highpass", 3000), 0.0003, 0.003), 0.5]);
    const wave = env(osc(0.6, exp(260, 180, 0.6)), 0.005, 0.22);
    return finish(mix([block, 1], [wave, 0.35, 0.02]), 0.8);
  },
  whirl: () => {
    const sec = 0.7;
    const boing = osc(sec, (t) => 240 * (1 + 0.55 * Math.exp(-t * 5) * Math.sin(2 * Math.PI * 11 * t)) * (1 + t * 0.4), "tri");
    return finish(mix([env(boing, 0.004, 0.3), 1], [swish(0.3, 900, 2600, 1.4, 55), 0.35]), 0.7);
  },

  // ───── trailer ─────
  braam: () => {
    const sec = 2.4;
    const voices = [55, 55 * 1.006, 110, 82.41, 110 * 0.995].map((f) => [osc(sec, f, "saw"), 0.25] as [Buf, number]);
    const stack = filter(mix(...voices), "lowpass", (t) => 300 + 1500 * Math.sin(Math.PI * Math.min(1, t / 1.6)) ** 2, 1.4);
    return finish(drive(shape(stack, (t) => Math.min(1, t / 0.06) * Math.exp(-t / 1.3)), 2.2), 0.95);
  },
  riser: () => {
    const sec = 2;
    const n = filter(noise(sec, 57), "bandpass", exp(300, 6000, sec), 1.2);
    const tone = osc(sec, exp(180, 1600, sec), "saw");
    filter(tone, "lowpass", exp(500, 5000, sec));
    return finish(shape(mix([n, 0.8], [tone, 0.3]), (t) => (t / sec) ** 2), 0.75);
  },
  drone: () => {
    const sec = 3.2;
    return finish(shape(filter(mix([osc(sec, 55, "saw"), 0.5], [osc(sec, 82.4, "tri"), 0.4], [noise(sec, 59), 0.05]), "lowpass", 420), (t) => Math.min(1, t / 0.6) * Math.min(1, (sec - t) / 0.8)), 0.5);
  },
} satisfies Record<string, () => Buf>;

export type SoundId = keyof typeof recipes;
export const soundIds = Object.keys(recipes) as SoundId[];

/** Mixing levels (0–1) per sound so web and video balance the same way. */
export const level: Partial<Record<SoundId, number>> = {
  cursor: 0.35,
  type: 0.3,
  tick: 0.3,
  pop: 0.55,
  select: 0.5,
  flip: 0.85,
  deal: 0.7,
  glint: 0.75,
  drone: 0.5,
  braam: 0.6,
  bigImpact: 0.75,
};

export function render(id: SoundId): Buf {
  return gain(recipes[id](), level[id] ?? 0.8);
}
