// Pre-renders every synth recipe in src/audio/sounds.ts to public/sfx/<id>.wav (16-bit mono)
// so Remotion compositions can use them with <Audio>. The website synthesises them live.
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { build } from "esbuild";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tmp = path.join(os.tmpdir(), `ive-sfx-${process.pid}.mjs`);
await build({ entryPoints: [path.join(root, "src/audio/sounds.ts")], bundle: true, format: "esm", platform: "node", outfile: tmp, logLevel: "error" });
const { soundIds, render } = await import(tmp);
const { SR } = await import(tmp).then(() => ({ SR: 44100 }));

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) data.writeInt16LE(Math.max(-1, Math.min(1, samples[i])) * 32767, i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const out = path.join(root, "public/sfx");
await fs.mkdir(out, { recursive: true });
let total = 0;
for (const id of soundIds) {
  const t0 = performance.now();
  const buf = render(id);
  let peak = 0;
  let sum = 0;
  for (const v of buf) {
    peak = Math.max(peak, Math.abs(v));
    sum += v * v;
  }
  const file = wav(buf);
  total += file.length;
  await fs.writeFile(path.join(out, `${id}.wav`), file);
  console.log(`${id.padEnd(11)} ${(buf.length / SR).toFixed(2)}s  peak ${peak.toFixed(2)}  rms ${Math.sqrt(sum / buf.length).toFixed(3)}  ${(performance.now() - t0).toFixed(0)}ms`);
}
await fs.rm(tmp);
console.log(`${soundIds.length} sounds, ${(total / 1024).toFixed(0)} KB`);
