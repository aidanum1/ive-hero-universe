/**
 * The six heroes of the GIRL HERO universe.
 * Hero names follow IVE's official "Looks Can Kill" concept; every emblem, mask and
 * portrait shape below is an original fan design.
 */
import { arc, burst, circle, ellipse, poly, star, waveBand } from "./shapes";
import type { Hero, HeroId, StatKey } from "./types";

const heart = (cx: number, cy: number, s: number) =>
  `M ${cx} ${cy + 0.42 * s} L ${cx - 0.4 * s} ${cy} C ${cx - 0.52 * s} ${cy - 0.13 * s}, ${cx - 0.44 * s} ${cy - 0.37 * s}, ${cx - 0.24 * s} ${cy - 0.38 * s} ` +
  `C ${cx - 0.12 * s} ${cy - 0.39 * s}, ${cx - 0.03 * s} ${cy - 0.31 * s}, ${cx} ${cy - 0.22 * s} C ${cx + 0.03 * s} ${cy - 0.31 * s}, ${cx + 0.12 * s} ${cy - 0.39 * s}, ${cx + 0.24 * s} ${cy - 0.38 * s} ` +
  `C ${cx + 0.44 * s} ${cy - 0.37 * s}, ${cx + 0.52 * s} ${cy - 0.13 * s}, ${cx + 0.4 * s} ${cy} Z`;

// ───────────────────────────── Captain Purple ─────────────────────────────
const yujin: Hero = {
  id: "yujin",
  index: 1,
  name: "YUJIN",
  nameKo: "유진",
  heroName: "CAPTAIN PURPLE",
  heroNameKo: "캡틴 퍼플",
  glyph: "雷",
  heroClass: "LEADER · VELOCITY",
  tagline: "Blink and you missed her.",
  bio: "Leader of the six. She lands every move a frame before you see it — the internet swore she teleported. When the beat drops, she calls the lightning.",
  primaryColor: "#7A3CF0",
  secondaryColor: "#DCCBFF",
  accentColor: "#FFE14A",
  deepColor: "#2E0F6E",
  onPrimary: "#FFFFFF",
  logo: {
    viewBox: "0 0 100 100",
    layers: [
      { d: star(50, 53, 46, 20, 5), fill: "primary", stroke: "ink", strokeWidth: 4 },
      { d: poly([[58, 6], [30, 54], [48, 54], [38, 96], [74, 42], [55, 42], [68, 6]]), fill: "accent", stroke: "ink", strokeWidth: 3.5 },
    ],
  },
  mask: {
    viewBox: "0 0 240 100",
    layers: [
      {
        d:
          poly([[2, 16], [40, 30], [58, 22], [74, 34], [104, 40], [120, 48], [136, 40], [166, 34], [182, 22], [200, 30], [238, 16], [216, 48], [196, 68], [166, 76], [138, 66], [120, 58], [102, 66], [74, 76], [44, 68], [24, 48]]) +
          " " +
          poly([[52, 48], [98, 52], [90, 63], [62, 61]]) +
          " " +
          poly([[188, 48], [142, 52], [150, 63], [178, 61]]),
        fill: "primary",
        stroke: "ink",
        strokeWidth: 3,
        fillRule: "evenodd",
      },
    ],
  },
  portrait: {
    hairBack:
      "M 200 92 C 126 92, 104 146, 106 214 C 108 300, 98 390, 86 476 C 120 486, 150 478, 166 458 L 234 458 C 250 478, 280 486, 314 476 C 302 390, 292 300, 294 214 C 296 146, 274 92, 200 92 Z",
    hairFront:
      "M 132 186 C 128 124, 162 100, 200 100 C 238 100, 272 124, 268 186 L 254 174 L 242 188 L 228 172 L 214 188 L 200 174 L 186 188 L 172 172 L 158 188 L 146 174 Z " +
      "M 132 180 C 128 230, 132 280, 146 330 L 156 330 C 148 280, 146 230, 150 186 Z M 268 180 C 272 230, 268 280, 254 330 L 244 330 C 252 280, 254 230, 250 186 Z",
    streak: "M 138 190 C 134 240, 138 292, 148 330 L 156 330 C 148 290, 146 240, 148 190 Z M 150 176 L 158 188 L 172 172 L 166 160 Z",
    light: "right",
  },
  texture: { kind: "speed", angle: 0, scale: 14 },
  motionPersonality: {
    kind: "velocity",
    note: "Arrives before the frame does: micro-freeze, afterimages, hard stop.",
    enter: "punch",
    exit: "accel",
    enterFrames: 8,
    direction: [1, 0],
    echoes: 5,
    shake: 1,
    hold: 4,
  },
  powerFX: {
    kind: "glitch",
    name: "QUICKSILVER STEP",
    description: "Splits a single second into afterimages, tears the frame and lands as lightning.",
    intensity: 1,
  },
  stats: { speed: 10, power: 8, glamour: 8, precision: 9, focus: 9, energy: 9 },
  sfx: { ko: "번쩍", en: "ZZAP" },
  sound: { note: 0, entrance: "zip", power: "zap" },
};

// ───────────────────────────── Wonder Green ─────────────────────────────
const gaeul: Hero = {
  id: "gaeul",
  index: 2,
  name: "GAEUL",
  nameKo: "가을",
  heroName: "WONDER GREEN",
  heroNameKo: "원더 그린",
  glyph: "風",
  heroClass: "TACTICIAN · WIND",
  tagline: "Calm before the gust.",
  bio: "Reads the room like a book — then turns the page with a single palm blast. Quiet, exact and impossible to knock off balance.",
  primaryColor: "#12B76A",
  secondaryColor: "#C4F2D8",
  accentColor: "#FF7AB8",
  deepColor: "#064D2C",
  onPrimary: "#0E0D12",
  logo: {
    viewBox: "0 0 100 100",
    layers: [
      { d: circle(50, 50, 46), fill: "primary", stroke: "ink", strokeWidth: 4 },
      { d: arc(50, 50, 32, 200, 470), stroke: "ink", strokeWidth: 9, fill: "none" },
      { d: arc(50, 50, 18, 160, 390), stroke: "paper", strokeWidth: 8, fill: "none" },
      { d: circle(50, 50, 6), fill: "accent", stroke: "ink", strokeWidth: 2.5 },
    ],
  },
  mask: {
    viewBox: "0 0 240 100",
    layers: [
      {
        d:
          "M 4 14 C 34 30, 70 32, 100 40 L 120 46 L 140 40 C 170 30, 200 30, 222 40 C 238 48, 230 68, 210 74 C 186 82, 156 78, 138 66 L 120 58 L 102 66 C 84 78, 54 82, 34 72 C 18 62, 14 40, 4 14 Z " +
          "M 52 52 C 64 42, 88 44, 98 54 C 86 63, 64 63, 52 52 Z M 188 52 C 176 42, 152 44, 142 54 C 154 63, 176 63, 188 52 Z",
        fill: "primary",
        stroke: "ink",
        strokeWidth: 3,
        fillRule: "evenodd",
      },
      { d: "M 14 30 C 26 44, 40 52, 58 56", stroke: "paper", strokeWidth: 3, fill: "none", opacity: 0.7 },
    ],
  },
  portrait: {
    hairBack:
      "M 200 94 C 130 94, 108 150, 110 220 C 112 300, 104 390, 96 470 C 126 480, 152 472, 168 454 L 232 454 C 248 472, 274 480, 304 470 C 296 390, 288 300, 290 220 C 292 150, 270 94, 200 94 Z",
    hairFront:
      "M 200 102 C 160 102, 134 128, 132 182 C 130 230, 136 270, 142 300 L 152 300 C 148 260, 150 220, 160 184 C 170 150, 186 128, 200 116 C 214 128, 230 150, 240 184 C 250 220, 252 260, 248 300 L 258 300 C 264 270, 270 230, 268 182 C 266 128, 240 102, 200 102 Z",
    streak: "M 244 184 C 252 220, 254 262, 248 300 L 258 300 C 264 262, 262 220, 254 184 C 246 156, 232 134, 214 120 L 208 126 C 224 142, 238 162, 244 184 Z",
    light: "left",
  },
  texture: { kind: "hatch", angle: -28, scale: 12 },
  motionPersonality: {
    kind: "gust",
    note: "Long stillness, then one clean release that sweeps everything sideways.",
    enter: "glide",
    exit: "snap",
    enterFrames: 14,
    direction: [-1, -0.15],
    echoes: 2,
    shake: 0.4,
    hold: 10,
  },
  powerFX: {
    kind: "gust",
    name: "PALM GALE",
    description: "Gathers the air, then releases a single crescent of wind across the panel.",
    intensity: 0.85,
  },
  stats: { speed: 8, power: 9, glamour: 8, precision: 9, focus: 10, energy: 8 },
  sfx: { ko: "휘익", en: "FWOOSH" },
  sound: { note: 2, entrance: "gust", power: "gust" },
};

// ───────────────────────────── Jean Yellow ─────────────────────────────
const rei: Hero = {
  id: "rei",
  index: 3,
  name: "REI",
  nameKo: "레이",
  heroName: "JEAN YELLOW",
  heroNameKo: "진 옐로우",
  glyph: "撃",
  heroClass: "BRAWLER · SHOT",
  tagline: "Point. Wink. Bang.",
  bio: "Bandaged fists, finger guns, zero hesitation. Plays it quirky right up until the shot lands dead centre.",
  primaryColor: "#FFD000",
  secondaryColor: "#FFF2A6",
  accentColor: "#8E6BFF",
  deepColor: "#7A5A00",
  onPrimary: "#0E0D12",
  logo: {
    viewBox: "0 0 100 100",
    layers: [
      { d: burst(50, 50, 48, 30, 10), fill: "primary", stroke: "ink", strokeWidth: 4 },
      { d: heart(50, 52, 46), fill: "ink" },
      { d: circle(41, 44, 4), fill: "paper" },
    ],
  },
  mask: {
    viewBox: "0 0 240 100",
    layers: [
      {
        d:
          "M 2 8 C 30 26, 56 34, 100 38 L 120 46 L 140 38 C 184 34, 210 26, 238 8 C 236 36, 224 58, 200 70 C 178 80, 152 76, 136 66 L 120 58 L 104 66 C 88 76, 62 80, 40 70 C 16 58, 4 36, 2 8 Z " +
          "M 50 46 C 66 40, 88 42, 100 52 C 86 62, 64 60, 50 46 Z M 190 46 C 174 40, 152 42, 140 52 C 154 62, 176 60, 190 46 Z",
        fill: "primary",
        stroke: "ink",
        strokeWidth: 3,
        fillRule: "evenodd",
      },
    ],
  },
  portrait: {
    hairBack:
      "M 200 94 C 132 94, 110 146, 112 206 C 114 252, 116 284, 122 306 C 146 316, 168 312, 176 302 L 224 302 C 232 312, 254 316, 278 306 C 284 284, 286 252, 288 206 C 290 146, 268 94, 200 94 Z",
    hairFront:
      "M 132 178 C 130 122, 162 102, 200 102 C 238 102, 270 122, 268 178 C 248 172, 224 170, 200 170 C 176 170, 152 172, 132 178 Z " +
      "M 132 172 C 128 220, 130 270, 136 304 L 148 304 C 142 262, 144 220, 148 180 Z M 268 172 C 272 220, 270 270, 264 304 L 252 304 C 258 262, 256 220, 252 180 Z",
    streak: "M 172 171 C 174 140, 184 116, 198 104 L 212 104 C 198 120, 190 144, 188 170 Z M 232 172 C 234 146, 228 122, 218 106 L 228 108 C 238 124, 244 148, 244 174 Z",
    light: "right",
  },
  texture: { kind: "dots", angle: 45, scale: 12 },
  motionPersonality: {
    kind: "snap",
    note: "Quirky, stepped timing — pose, hold, pop. Animates on twos.",
    enter: "overshoot",
    exit: "snap",
    enterFrames: 9,
    direction: [0, 1],
    echoes: 0,
    shake: 0.8,
    hold: 3,
  },
  powerFX: {
    kind: "shot",
    name: "FINGER-GUN FLASH",
    description: "Point, wink, fire: a star-shaped muzzle flash and a streak straight to the target.",
    intensity: 0.9,
  },
  stats: { speed: 8, power: 10, glamour: 8, precision: 9, focus: 8, energy: 9 },
  sfx: { ko: "탕", en: "BANG!" },
  sound: { note: 4, entrance: "pop", power: "shot" },
};

// ───────────────────────────── Bat Pink ─────────────────────────────
const wonyoung: Hero = {
  id: "wonyoung",
  index: 4,
  name: "WONYOUNG",
  nameKo: "원영",
  heroName: "BAT PINK",
  heroNameKo: "뱃 핑크",
  glyph: "輝",
  heroClass: "DUELIST · STAFF",
  tagline: "Every entrance is a cover shot.",
  bio: "Spins a staff like a runway turn. Glamour is her armour — and the glint is the last thing anyone sees.",
  primaryColor: "#FF4FA8",
  secondaryColor: "#FFD0E6",
  accentColor: "#20D3C2",
  deepColor: "#7E0E4C",
  onPrimary: "#0E0D12",
  logo: {
    viewBox: "0 0 100 100",
    layers: [
      {
        d: "M 50 34 C 40 24, 26 18, 4 22 C 12 30, 12 38, 8 46 C 16 44, 22 48, 24 56 C 30 50, 38 50, 42 56 L 50 64 L 58 56 C 62 50, 70 50, 76 56 C 78 48, 84 44, 92 46 C 88 38, 88 30, 96 22 C 74 18, 60 24, 50 34 Z",
        fill: "ink",
      },
      { d: heart(50, 52, 52), fill: "primary", stroke: "ink", strokeWidth: 4 },
      { d: "M 50 41 L 57 52 L 50 63 L 43 52 Z", fill: "paper", stroke: "ink", strokeWidth: 2 },
    ],
  },
  mask: {
    viewBox: "0 0 240 100",
    layers: [
      {
        d:
          "M 120 44 C 108 26, 90 14, 62 12 C 58 22, 48 24, 40 18 C 34 26, 22 26, 14 22 C 10 40, 14 58, 30 70 C 52 84, 84 80, 104 66 L 120 58 L 136 66 C 156 80, 188 84, 210 70 C 226 58, 230 40, 226 22 C 218 26, 206 26, 200 18 C 192 24, 182 22, 178 12 C 150 14, 132 26, 120 44 Z " +
          "M 44 48 C 58 36, 86 40, 98 52 C 84 62, 58 62, 44 48 Z M 196 48 C 182 36, 154 40, 142 52 C 156 62, 182 62, 196 48 Z",
        fill: "primary",
        stroke: "ink",
        strokeWidth: 3,
        fillRule: "evenodd",
      },
      { d: "M 120 26 L 129 38 L 120 50 L 111 38 Z", fill: "accent", stroke: "ink", strokeWidth: 2.5 },
    ],
  },
  portrait: {
    hairBack:
      "M 200 88 C 124 88, 98 150, 102 222 C 106 282, 86 322, 98 370 C 110 420, 84 452, 92 492 C 124 498, 150 486, 166 466 L 234 466 C 250 486, 276 498, 308 492 C 316 452, 290 420, 302 370 C 314 322, 294 282, 298 222 C 302 150, 276 88, 200 88 Z",
    hairFront:
      "M 136 196 C 128 130, 164 98, 210 100 C 246 102, 270 126, 268 184 C 250 150, 220 134, 186 140 C 162 146, 146 166, 136 196 Z " +
      "M 268 180 C 274 230, 268 290, 252 340 L 242 336 C 254 290, 256 230, 252 190 Z",
    ornament:
      "M 150 106 C 126 76, 96 84, 104 110 C 110 130, 136 122, 150 106 Z M 150 106 C 172 74, 200 82, 194 106 C 188 126, 162 120, 150 106 Z " +
      ellipse(150, 106, 9, 8),
    ornamentFill: "ink",
    streak: "M 186 140 C 212 134, 238 146, 256 172 L 262 160 C 242 136, 214 126, 190 130 Z",
    light: "left",
  },
  texture: { kind: "diamond", angle: 0, scale: 22 },
  motionPersonality: {
    kind: "glamour",
    note: "Slow push, frame hold, a single glint. Never rushes.",
    enter: "glide",
    exit: "glide",
    enterFrames: 22,
    direction: [0, -0.35],
    echoes: 1,
    shake: 0,
    hold: 12,
  },
  powerFX: {
    kind: "slash",
    name: "STAFF CRESCENT",
    description: "One sweeping staff arc that leaves a pink crescent and a diamond glint hanging in the air.",
    intensity: 0.8,
  },
  stats: { speed: 8, power: 8, glamour: 10, precision: 9, focus: 9, energy: 8 },
  sfx: { ko: "챙", en: "SHING" },
  sound: { note: 7, entrance: "glint", power: "slash" },
};

// ───────────────────────────── Super Blue ─────────────────────────────
const liz: Hero = {
  id: "liz",
  index: 5,
  name: "LIZ",
  nameKo: "리즈",
  heroName: "SUPER BLUE",
  heroNameKo: "슈퍼 블루",
  glyph: "的",
  heroClass: "SHARPSHOOTER · TARGET",
  tagline: "Never misses the high note.",
  bio: "The squad's sharpshooter. Hits the bullseye from across the training hall — and holds the note while she does it.",
  primaryColor: "#2E6BFF",
  secondaryColor: "#C6D8FF",
  accentColor: "#FFB627",
  deepColor: "#0B2470",
  onPrimary: "#FFFFFF",
  logo: {
    viewBox: "0 0 100 100",
    layers: [
      { d: circle(50, 50, 46), fill: "primary", stroke: "ink", strokeWidth: 4 },
      { d: circle(50, 50, 31), fill: "paper", stroke: "ink", strokeWidth: 3 },
      { d: circle(50, 50, 17), fill: "primary", stroke: "ink", strokeWidth: 3 },
      { d: star(50, 50, 11, 4, 4, -90), fill: "accent", stroke: "ink", strokeWidth: 1.5 },
    ],
  },
  mask: {
    viewBox: "0 0 240 100",
    layers: [
      {
        d: waveBand(4, 236, 26, 76, 5, 2.5) + " " + ellipse(76, 52, 21, 10) + " " + ellipse(164, 52, 21, 10),
        fill: "primary",
        stroke: "ink",
        strokeWidth: 3,
        fillRule: "evenodd",
      },
    ],
  },
  portrait: {
    hairBack:
      "M 200 96 C 136 96, 116 144, 118 202 C 120 232, 126 254, 134 268 L 266 268 C 274 254, 280 232, 282 202 C 284 144, 264 96, 200 96 Z",
    hairFront:
      "M 134 190 C 132 130, 166 102, 206 104 C 240 106, 266 130, 266 176 C 246 140, 214 126, 182 132 C 158 138, 142 158, 134 190 Z",
    ornament:
      "M 236 98 C 290 70, 336 110, 328 182 C 320 250, 338 310, 358 350 C 318 344, 296 300, 292 246 C 288 196, 286 146, 244 118 Z",
    ornamentFill: "ink",
    streak: "M 298 118 C 322 150, 318 210, 322 262 L 332 264 C 328 210, 332 150, 306 112 Z",
    light: "left",
  },
  texture: { kind: "rings", angle: 0, scale: 26 },
  motionPersonality: {
    kind: "precision",
    note: "Measured aim, a beat of stillness, then a dead-straight release.",
    enter: "snap",
    exit: "snap",
    enterFrames: 10,
    direction: [-1, 0],
    echoes: 0,
    shake: 0.5,
    hold: 6,
  },
  powerFX: {
    kind: "target",
    name: "BULLSEYE NOTE",
    description: "Locks the target rings, then one straight throw lands dead centre with a ringing shockwave.",
    intensity: 0.85,
  },
  stats: { speed: 8, power: 8, glamour: 9, precision: 10, focus: 9, energy: 8 },
  sfx: { ko: "딱", en: "TOK!" },
  sound: { note: 9, entrance: "tok", power: "tok" },
};

// ───────────────────────────── Spider Red ─────────────────────────────
const leeseo: Hero = {
  id: "leeseo",
  index: 6,
  name: "LEESEO",
  nameKo: "이서",
  heroName: "SPIDER RED",
  heroNameKo: "스파이더 레드",
  glyph: "糸",
  heroClass: "WILDCARD · THREAD",
  tagline: "Youngest. Loudest. Fastest yo-yo.",
  bio: "Swings into frame on a rope of her own hair, yo-yo already spinning. Kitsch, chaotic and always in the middle of the panel.",
  primaryColor: "#F02D3A",
  secondaryColor: "#FFC9CC",
  accentColor: "#3FD0FF",
  deepColor: "#6E0A14",
  onPrimary: "#FFFFFF",
  logo: {
    viewBox: "0 0 100 100",
    layers: [
      { d: "M 50 6 L 50 34", stroke: "ink", strokeWidth: 4, fill: "none" },
      { d: circle(50, 8, 5), fill: "paper", stroke: "ink", strokeWidth: 3 },
      { d: circle(50, 62, 34), fill: "primary", stroke: "ink", strokeWidth: 4 },
      { d: circle(50, 62, 20), fill: "none", stroke: "ink", strokeWidth: 3 },
      { d: heart(50, 64, 22), fill: "paper", stroke: "ink", strokeWidth: 2.5 },
    ],
  },
  mask: {
    viewBox: "0 0 240 100",
    layers: [
      {
        d: heart(74, 56, 104) + " " + heart(166, 56, 104) + " " + heart(76, 54, 44) + " " + heart(164, 54, 44),
        fill: "primary",
        stroke: "ink",
        strokeWidth: 3,
        fillRule: "evenodd",
      },
      { d: "M 112 50 C 116 46, 124 46, 128 50", stroke: "ink", strokeWidth: 5, fill: "none" },
    ],
  },
  portrait: {
    hairBack:
      "M 200 94 C 134 94, 112 144, 114 204 C 116 236, 122 260, 130 276 L 270 276 C 278 260, 284 236, 286 204 C 288 144, 266 94, 200 94 Z",
    hairFront:
      "M 134 180 C 132 124, 164 102, 200 102 C 236 102, 268 124, 266 180 C 254 168, 240 162, 226 166 C 214 158, 200 156, 188 164 C 172 158, 152 162, 134 180 Z",
    ornament:
      "M 128 150 C 86 156, 62 210, 70 280 C 76 340, 60 390, 48 430 C 86 420, 104 380, 106 320 C 108 260, 120 210, 140 176 Z " +
      "M 272 150 C 314 156, 338 210, 330 280 C 324 340, 340 390, 352 430 C 314 420, 296 380, 294 320 C 292 260, 280 210, 260 176 Z",
    ornamentFill: "ink",
    streak: ellipse(132, 160, 13, 11) + " " + ellipse(268, 160, 13, 11),
    light: "right",
  },
  texture: { kind: "zigzag", angle: 0, scale: 16 },
  motionPersonality: {
    kind: "bounce",
    note: "Yo-yo physics: drop, stretch, spring back with an elastic overshoot.",
    enter: "bounce",
    exit: "accel",
    enterFrames: 18,
    direction: [0, -1],
    echoes: 2,
    shake: 0.7,
    hold: 2,
  },
  powerFX: {
    kind: "thread",
    name: "HAIR-ROPE SWING",
    description: "Rope lines snap taut across the frame and a yo-yo whips back on an elastic recoil.",
    intensity: 0.9,
  },
  stats: { speed: 9, power: 8, glamour: 8, precision: 8, focus: 8, energy: 10 },
  sfx: { ko: "휘리릭", en: "WHIRL" },
  sound: { note: 12, entrance: "whirl", power: "whirl" },
};

export const heroes: Hero[] = [yujin, gaeul, rei, wonyoung, liz, leeseo];

export const heroById = Object.fromEntries(heroes.map((h) => [h.id, h])) as Record<HeroId, Hero>;

export const heroIds = heroes.map((h) => h.id);

export const statLabels: Record<StatKey, string> = {
  speed: "SPD",
  power: "PWR",
  glamour: "GLM",
  precision: "PRC",
  focus: "FCS",
  energy: "NRG",
};

export const statOrder: StatKey[] = ["speed", "power", "glamour", "precision", "focus", "energy"];

/** Resolve a paint role to a concrete colour for a hero. */
export function paint(hero: Hero, role: string | undefined, inkColor = "#0E0D12", paperColor = "#F2EDE3") {
  switch (role) {
    case "primary":
      return hero.primaryColor;
    case "secondary":
      return hero.secondaryColor;
    case "accent":
      return hero.accentColor;
    case "ink":
      return inkColor;
    case "paper":
      return paperColor;
    case "none":
    case undefined:
      return "none";
    default:
      return role;
  }
}
