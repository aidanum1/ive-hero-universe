/** Deterministic seeded randomness — identical on web, in Remotion and on the server. */

export function hashSeed(seed: string | number): number {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG. */
export function rng(seed: string | number) {
  let a = hashSeed(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Single deterministic value in [0,1). */
export const rand = (seed: string | number) => rng(seed)();

/** Deterministic value in [min,max). */
export const randRange = (seed: string | number, min: number, max: number) => min + rand(seed) * (max - min);
