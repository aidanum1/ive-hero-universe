// Dev QA helper: headless screenshots at exact viewport sizes.
// usage: node scripts/shot.mjs <url> <out.png> [width] [height] [--full] [--wait=ms] [--scroll=px] [--dpr=n] [--eval=js]
import puppeteer from "puppeteer-core";

const [url, out, w = "1440", h = "900", ...flags] = process.argv.slice(2);
const flag = (name, def) => {
  const f = flags.find((x) => x.startsWith(`--${name}`));
  if (!f) return def;
  const [, v] = f.split("=");
  return v ?? true;
};
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=metal"],
});
const page = await browser.newPage();
const mobile = Number(w) < 720;
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: Number(flag("dpr", mobile ? 2 : 1)), isMobile: mobile, hasTouch: mobile });
if (flag("reduce", false)) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
const scroll = Number(flag("scroll", 0));
if (scroll) await page.evaluate((y) => window.scrollTo(0, y), scroll);
const ev = flag("eval", null);
if (ev) await page.evaluate(ev);
await new Promise((r) => setTimeout(r, Number(flag("wait", 1200))));
await page.screenshot({ path: out, fullPage: Boolean(flag("full", false)) });
if (logs.length) console.log(logs.slice(0, 20).join("\n"));
console.log("saved", out);
await browser.close();
