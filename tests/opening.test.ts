import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleOpening } from "../src/motion/sample";
import { motion, type MotionInput } from "../src/motion/config";
import { createRuntime } from "../src/controllers/runtime";
import { shouldCancelOnScroll } from "../src/controllers/interaction";
import { assetUrl } from "../src/utils/assets";
import { SceneManager, type SceneModule } from "../src/scenes/SceneManager";

const base: MotionInput = {
  progress: 0,
  charge: 0,
  eventMs: 0,
  action: "idle",
  reduced: false,
  pointerX: 0,
  pointerY: 0,
};
test("jumping ahead and seeking backwards does not depend on previous frames", () => {
  const expected = sampleOpening({ ...base, progress: 0.31 });
  sampleOpening({ ...base, progress: 1, action: "completed" });
  assert.deepEqual(sampleOpening({ ...base, progress: 0.31 }), expected);
  assert.equal(sampleOpening({ ...base, progress: -4 }).scene, "signal");
  assert.equal(sampleOpening({ ...base, progress: 4 }).scene, "released");
});
test("all beat boundaries yield finite poses and correctly bounded opacities", () => {
  for (const p of Object.values(motion.beats)) {
    const f = sampleOpening({ ...base, progress: p });
    Object.values(f).forEach((value) => {
      if (typeof value === "number") assert.ok(Number.isFinite(value));
    });
    for (const key of [
      "heroOpacity",
      "pageOpacity",
      "purpleOpacity",
      "finish",
    ] as const)
      assert.ok(f[key] >= 0 && f[key] <= 1);
  }
  assert.equal(sampleOpening({ ...base, progress: 0.64 }).heroOpacity, 1);
});
test("impact is confined to one short interval, and reduced motion removes every burst effect", () => {
  const burst = {
    ...base,
    progress: 0.64,
    action: "bursting" as const,
    charge: 1,
  };
  assert.equal(sampleOpening({ ...burst, eventMs: 299 }).impact, 0);
  assert.equal(sampleOpening({ ...burst, eventMs: 300 }).impact, 1);
  assert.equal(sampleOpening({ ...burst, eventMs: 340 }).impact, 0);
  const reduced = sampleOpening({ ...burst, eventMs: 310, reduced: true });
  for (const key of [
    "echo",
    "tear",
    "impact",
    "streak",
    "cameraPunch",
  ] as const)
    assert.equal(reduced[key], 0);
});
test("a completed activation cannot bring the hero back when forward scroll catches up", () => {
  for (const progress of [0.6, 0.65, 0.8, 1]) {
    const f = sampleOpening({ ...base, action: "completed", progress });
    assert.equal(f.finish, 1);
    assert.equal(f.heroOpacity, 0);
  }
});
test("scroll cancels a partial charge, exits an action, and releases completion on reverse only", () => {
  assert.equal(shouldCancelOnScroll("charging", 0.65, 0.64), true);
  assert.equal(shouldCancelOnScroll("charging", 0.64, 0.64), false);
  assert.equal(shouldCancelOnScroll("bursting", 0.9, 0.64), true);
  assert.equal(shouldCancelOnScroll("bursting", 0.65, 0.64), false);
  assert.equal(shouldCancelOnScroll("completed", 0.7, 0.64), false);
  assert.equal(shouldCancelOnScroll("completed", 0.63, 0.64), true);
});
test("subscribers and runtime resources are released when their owner exits", () => {
  const runtime = createRuntime();
  let calls = 0;
  const unsubscribe = runtime.subscribe(() => calls++);
  runtime.setInput({ progress: 0.64 });
  runtime.update();
  assert.equal(calls, 1);
  unsubscribe();
  runtime.update();
  assert.equal(calls, 1);
  runtime.subscribe(() => calls++);
  runtime.dispose();
  runtime.update();
  assert.equal(calls, 1);
});
test("public assets work both at the root and a GitHub project subpath", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    process.env.NEXT_PUBLIC_BASE_PATH = "";
    assert.equal(
      assetUrl("/heroes/captain-purple.webp"),
      "/heroes/captain-purple.webp",
    );
    process.env.NEXT_PUBLIC_BASE_PATH = "/ive-hero/";
    assert.equal(
      assetUrl("heroes/captain-purple.webp"),
      "/ive-hero/heroes/captain-purple.webp",
    );
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("scenes enter once, update with local progress, exit on seek, and cannot update after disposal", () => {
  const log: string[] = [];
  const adapter = (id: string): SceneModule => ({
    enter() {
      log.push(`${id}:enter`);
    },
    update(p) {
      assert.ok(p >= 0 && p <= 1);
      log.push(`${id}:update`);
    },
    exit() {
      log.push(`${id}:exit`);
    },
    dispose() {
      log.push(`${id}:dispose`);
    },
  });
  const manager = new SceneManager({
    signal: adapter("signal"),
    purple: adapter("purple"),
    released: adapter("released"),
  });
  manager.update(sampleOpening(base));
  manager.update(sampleOpening({ ...base, progress: 0.1 }));
  assert.equal(log.filter((x) => x === "signal:enter").length, 1);
  manager.update(sampleOpening({ ...base, progress: 0.64 }));
  assert.ok(log.includes("signal:exit") && log.includes("purple:enter"));
  manager.update(
    sampleOpening({ ...base, progress: 0.64, action: "completed" }),
  );
  assert.ok(log.includes("purple:exit") && log.includes("released:enter"));
  manager.dispose();
  const length = log.length;
  manager.update(sampleOpening(base));
  manager.dispose();
  assert.equal(log.length, length);
  assert.equal(log.filter((x) => x.endsWith(":dispose")).length, 3);
});
