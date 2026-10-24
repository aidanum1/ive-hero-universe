// Dev QA helper: scroll the page section by section and report rAF frame-time stats.
// usage: node scripts/perf.mjs <url> [w] [h] [--throttle=4]
import puppeteer from "puppeteer-core";

const [url, w = "1440", h = "900", ...flags] = process.argv.slice(2);
const throttle = Number((flags.find((f) => f.startsWith("--throttle=")) ?? "=1").split("=")[1]);
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  protocolTimeout: 120000,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"],
});
const page = await browser.newPage();
const mobile = Number(w) < 720;
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const cdp = await page.createCDPSession();
if (throttle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 4500));
const ids = ["select", "comics", "cards", "posters", "theatre", "release", "credits"];
const results = {};
for (const id of ids) {
  const stats = await page.evaluate(async (id) => {
    const el = document.getElementById(id);
    const top = el.getBoundingClientRect().top + scrollY;
    const span = Math.max(innerHeight, el.getBoundingClientRect().height + (el.parentElement?.classList.contains("pin-spacer") ? el.parentElement.offsetHeight - el.offsetHeight : 0));
    scrollTo(0, top - innerHeight * 0.3);
    await new Promise((r) => setTimeout(r, 600));
    const frames = [];
    let last = performance.now();
    const t0 = last;
    const dur = 2600;
    await new Promise((resolve) => {
      const step = (now) => {
        frames.push(now - last);
        last = now;
        const p = (now - t0) / dur;
        scrollTo(0, top - innerHeight * 0.3 + span * Math.min(1, p));
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    frames.shift();
    frames.sort((a, b) => a - b);
    const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
    const p95 = frames[Math.floor(frames.length * 0.95)];
    const slow = frames.filter((f) => f > 20).length / frames.length;
    return { fps: +(1000 / avg).toFixed(1), p95: +p95.toFixed(1), slowPct: +(slow * 100).toFixed(1) };
  }, id);
  results[id] = stats;
}
console.table(results);
await browser.close();
