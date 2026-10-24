// Downloads the self-hosted font files into /public/fonts.
// Latin fonts use Google's latin subset; CJK fonts are subset to the exact
// glyphs listed in scripts/font-glyphs.json (re-run after adding Korean/Japanese copy).
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "public/fonts");
const extra = JSON.parse(await fs.readFile(path.join(root, "scripts/font-glyphs.json"), "utf8"));

// Collect every Hangul / CJK character used anywhere in src so subsets never go stale.
async function scan(dir, acc = "") {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) acc = await scan(p, acc);
    else if (/\.(tsx?|css|json)$/.test(entry.name)) acc += await fs.readFile(p, "utf8");
  }
  return acc;
}
const source = await scan(path.join(root, "src"));
const pick = (re) => [...new Set(source.match(re) ?? [])].join("");
const glyphs = {
  hangul: extra.hangul + pick(/[\uAC00-\uD7AF\u3130-\u318F]/g),
  japanese: extra.japanese + pick(/[\u3040-\u30FF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/g),
};
console.log(`hangul glyphs: ${new Set(glyphs.hangul).size}, japanese glyphs: ${new Set(glyphs.japanese).size}`);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const fonts = [
  { file: "display.woff2", query: "family=Dela+Gothic+One", subset: "latin" },
  { file: "display-jp.woff2", query: "family=Dela+Gothic+One", text: glyphs.japanese },
  { file: "wide.woff2", query: "family=Archivo:wdth,wght@62..125,100..900", subset: "latin" },
  { file: "serif.woff2", query: "family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900", subset: "latin" },
  { file: "serif-italic.woff2", query: "family=Bodoni+Moda:ital,opsz,wght@1,6..96,400..900", subset: "latin" },
  { file: "pixel.woff2", query: "family=DotGothic16", subset: "latin" },
  { file: "pixel-jp.woff2", query: "family=DotGothic16", text: glyphs.japanese },
  { file: "hangul.woff2", query: "family=Black+Han+Sans", text: glyphs.hangul },
  { file: "hangul-text.woff2", query: "family=Gothic+A1:wght@700", text: glyphs.hangul },
];

for (const f of fonts) {
  const textParam = f.text ? `&text=${encodeURIComponent([...new Set(f.text)].join(""))}` : "";
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${f.query}${textParam}&display=swap`, {
    headers: { "user-agent": UA },
  })).text();
  let url;
  if (f.subset) {
    const block = css.split("/* ").find((b) => b.startsWith(`${f.subset} */`));
    url = block?.match(/url\((.+?)\)/)?.[1];
  } else {
    url = css.match(/url\((.+?)\)/)?.[1];
  }
  if (!url) throw new Error(`No font url for ${f.file}`);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  await fs.writeFile(path.join(out, f.file), buf);
  console.log(`${f.file.padEnd(22)} ${(buf.length / 1024).toFixed(1)} KB`);
}
