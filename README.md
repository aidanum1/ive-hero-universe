# IVE HERO UNIVERSE

An **unofficial, non-commercial fan-made** interactive motion universe inspired by IVE's
*Looks Can Kill* / **GIRL HERO** era. Created and owned by **[@emisayda](https://x.com/emisayda)** on X.
Not affiliated with, endorsed by or connected to IVE or Starship Entertainment. Every
illustration, emblem, mask, story beat and motion piece is an original fan interpretation.
No official photography or footage is used.

The project is two things built from one design system:

1. **A responsive interactive website** (Next.js 16 · React 19 · GSAP · SVG · React Three Fiber).
2. **Reusable Remotion compositions** that render 1080×1920 vertical MP4s for social.

---

## Run it

```bash
npm install
npm run dev            # website → http://localhost:3000
npm run studio         # Remotion Studio → http://localhost:3100
npm run render:all     # every composition (with soundtrack) → renders/*.mp4
npm run sfx            # re-synthesise public/sfx/*.wav after editing src/audio/sounds.ts
npm run build:pages    # static export → out/ (what GitHub Pages serves)
```

Single renders:

```bash
npx remotion render YujinGlitchVertical renders/yujin-glitch-vertical.mp4
npx remotion render HeroPowerVertical --props='{"heroId":"liz"}'
npx remotion still OgImage public/og.png
```

`/system` is a living design-system sheet: colour, type roles, easing curves you can run,
hero data, FX primitives, the trading card and the composition registry.

## What's on the site

| Section | What it does |
| --- | --- |
| **Opening** | Title sequence, not a hero banner: PS2-style boot → six hero bars slam → diagonal panel wipe → I·V·E impact slams (inverted impact frames) → HERO / UNIVERSE collision → print furniture → PRESS START. Any input skips to the composed end frame. |
| **Hero Select** | Character select built from hero data. Hover / tap / arrow keys / swipe. Each switch: colour panel wipe, cursor jump, the incoming hero's own **motion personality**, name collision, SFX pop. **HOLD TO CHARGE** (mouse, touch or Space) plays her power — Yujin's is the full YUJIN GLITCH. ENTER confirms with an impact frame. |
| **Hero pages** `/heroes/[id]` | Intro cinematic in her personality, editorial dossier (bio, signature move, her actual easing curve plotted from the tokens, annotated mask, palette, stats), Remotion Player power cut, CSS-3D holo card, prev/next wipe. |
| **Hero Comics** | A full comic page (*Issue Nº05: Training Day*). Scroll flies a guided-view camera panel to panel with dutch angles; balloons and SFX pop on arrival; pull-back reveal. |
| **Holo Cards** | The one Three.js scene: the shared SVG cards rasterised to textures (fonts embedded), a holographic foil shader with halftone sparkle, a halftone "printed" floor, a scroll-choreographed camera dolly, then drag / tap / flip. |
| **Now Showing** | Four original posters (Saul-Bass one-sheet, 90s anime ensemble print, fashion magazine cover, "HERO ON SET" teaser). Pinned horizontal dolly on desktop, swipe on phones. |
| **Motion Theatre** | Every composition playable via `@remotion/player`, with its render command. |
| **Release** | Live countdown to **26.10.2026 18:00 KST**, stage-select tracklist, switches to OUT NOW after release. |
| **Credits** | Film-style roll + explicit fan-made notice. |

## Remotion compositions (1080×1920 @ 30fps)

| id | Length | Notes |
| --- | --- | --- |
| `YujinGlitchVertical` | 5.2s | Fancam that drops frames: freeze → purple silhouette split → afterimages → directional displacement → frame tear → energy streak → impact frame → CAPTAIN PURPLE card |
| `HeroSelectVertical` | 9.9s | Cursor visits all six heroes in their personalities, confirms Captain Purple |
| `SixHeroesIntro` | 17.5s | Title open, six power bursts back to back, team line-up |
| `HeroTradingCards` | 9.7s | Deal, fan flip, spotlight + holo glint per card, collector grid |
| `FakeHeroTrailer` | 21.3s | Ident, title cards, hero flashes, comic dolly, on-set twist, glitch, montage, title slam, poster |
| `HeroPowerVertical` | 2.4s | Any hero's power (`heroId` prop) |
| `OgImage` (still) | 1200×630 | Share card in `public/og.png` |

Every video carries the `UNOFFICIAL FAN-MADE BY @EMISAYDA` watermark and its own soundtrack.

## Sound

Every sound effect is **synthesised from code** (`src/audio/synth.ts` + `src/audio/sounds.ts`) —
36 original, licence-free recipes: retro-game UI blips, comic impacts, print-shop swishes,
trailer braams and risers, plus one signature move per hero (Captain Purple's zap, Wonder
Green's gust, Jean Yellow's finger-gun shots, Bat Pink's staff *shing*, Super Blue's
bullseye *tok*, Spider Red's yo-yo *whirl*). Each hero also has a note in the select-screen
scale, so moving the cursor plays a little melody.

- **Website:** a Web Audio engine (`src/web/audio/sfx.ts`) synthesises sounds on demand — no
  audio downloads for interactions. A PRESS START gate asks SOUND ON / OFF (browsers require a
  gesture), the nav has an SFX toggle (remembered), and HOLD TO CHARGE drives a live,
  pitch-rising synth voice.
- **Video:** `scripts/build-sfx.mjs` renders the same recipes to `public/sfx/*.wav`; each
  composition's cue sheet (`src/sequences/soundtrack.ts`) is keyed to the same beat
  constants as its visuals and laid onto the timeline as `<Audio>` clips. The site's power
  sequences fire the same cue sheets through the web engine, so the site and the MP4s sound the same.

## Architecture: one system, three renderers

```
src/
  design/        tokens.ts (colour, spacing, fx intensity) · typography.ts · motion.ts (durations
                 in 30fps base frames, bezier curves → GSAP *and* Remotion) · fonts.ts (manifest)
                 · cssVars.ts (tokens → CSS custom properties)
  heroes/        types.ts · roster.ts (the six hero configs) · shapes.ts (path generators)
  content/       release.ts (real release facts, disclaimer) · project.ts (owner) · sections.ts
  lib/           ease.ts (cubic-bezier solver) · timeline.ts (frame helpers) · random.ts (seeded)
  visual/        Pure SVG primitives — HeroPortrait, HeroMask/Emblem, Halftone, speed lines,
                 bursts, SFX lettering, print marks, StatHex, Monogram, TradingCard, ComicPage, Posters
  sequences/     Frame-driven sequences: SeqProps { frame } → SVG. registry.ts is the single list
                 used by Remotion's Root and by the website's Players.
  remotion/      index.ts · Root.tsx · fonts.ts
  web/           sections/, hero/, ui/, motion/ (GSAP setup, personalities, sequence clock),
                 three/ (lazy WebGL gallery)
```

- **Hero config** (`src/heroes/roster.ts`) drives everything per hero: name, heroName,
  primary/secondary/accent/deep colours, logo, mask, portrait, texture,
  motionPersonality (kind, ease, frames, direction, echoes, shake, hold), powerFX, stats, SFX.
- **Motion is authored in base frames.** `sec()` converts for GSAP; `toBaseFrame()` lets
  sequences play at 60fps on the web and 30fps in MP4 with identical choreography.
- **Same component, three clocks.** A sequence such as `YujinGlitch` is rendered by Remotion,
  embedded via `@remotion/player`, *and* driven directly by GSAP (`useSequenceClock`) for
  HOLD TO CHARGE.
- **Same fonts everywhere.** `scripts/fetch-fonts.mjs` self-hosts the fonts and subsets
  Korean/Japanese glyphs by scanning `src/` — re-run it after adding CJK copy.

## Performance & accessibility

- 60fps scroll measured across sections on desktop; ~58–60fps on a 4× CPU-throttled phone profile.
- The WebGL gallery is lazy-loaded near the viewport, stops rendering offscreen, rasterises
  textures in idle slices and falls back to CSS-3D cards without WebGL.
- `prefers-reduced-motion`: sequences resolve to their composed end frames, pins and camera
  moves are removed, players show still frames, holds still work.
- Keyboard: roster arrows, Space/Enter hold-to-charge, Escape closes the menu, visible focus.

## Deploy (GitHub Pages)

`.github/workflows/pages.yml` builds on every push to `main`: typecheck → lint →
`npm run build:pages` (Next static export with the repo sub-path from `actions/configure-pages`)
→ deploy. Live at **https://aidanum1.github.io/ive-hero-universe/**.

## References

- `references/SOURCES.md` — research notes and sources for the real release facts.
- `references/promo/` — official promo images saved for study only (git-ignored, never shipped).
- `public/references/` — drop your own visual research here.
- QA helpers: `scripts/shot.mjs`, `scripts/interact.mjs`, `scripts/perf.mjs`, `scripts/contact-sheet.py`.
