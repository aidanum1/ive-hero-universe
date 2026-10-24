// Dev QA helper: drive interactions and capture a burst of screenshots.
// usage: node scripts/interact.mjs <url> <outdir> <w> <h> <script.json>
// script: [{ "do": "eval"|"click"|"hover"|"down"|"up"|"wait"|"shot"|"key", ... }]
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const [url, outdir, w, h, scriptPath] = process.argv.slice(2);
const steps = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
fs.mkdirSync(outdir, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  protocolTimeout: 60000,
  args: ["--hide-scrollbars", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
const mobile = Number(w) < 720;
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
let n = 0;
for (const s of steps) {
  if (s.do === "eval") await page.evaluate(`(()=>{${s.js}; return 0})()`);
  if (s.do === "wait") await new Promise((r) => setTimeout(r, s.ms));
  if (s.do === "click") await page.click(s.sel);
  if (s.do === "hover") await page.hover(s.sel);
  if (s.do === "key") await page.keyboard.press(s.key);
  if (s.do === "down" || s.do === "up") {
    const el = await page.$(s.sel);
    const box = await el.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await (s.do === "down" ? page.mouse.down() : page.mouse.up());
  }
  if (s.do === "shot") {
    const name = `${String(n++).padStart(2, "0")}-${s.name ?? "shot"}.png`;
    await page.screenshot({ path: `${outdir}/${name}` });
  }
}
if (logs.length) console.log([...new Set(logs)].slice(0, 15).join("\n"));
await browser.close();
console.log("done");
