import {
  clamp,
  mix,
  motion,
  out,
  range,
  smooth,
  type MotionInput,
  type VisualState,
} from "./config";
import {
  cameraPunch,
  impactFrame,
  screenTear,
  speedBurst,
  temporalEcho,
} from "./primitives";

export function sampleOpening(input: MotionInput): VisualState {
  const p = clamp(input.progress);
  const reduced = input.reduced;
  const burst = input.action === "bursting";
  const completed = input.action === "completed";
  const finish = completed ? 1 : smooth(range(p, ...motion.ranges.finish));
  const departure = reduced
    ? Number(p > motion.reduced.departureAt)
    : out(range(p, ...motion.ranges.departure));
  const speed = burst ? speedBurst(input.eventMs) : departure;
  const reveal = reduced
    ? Number(p >= motion.beats.purple)
    : out(range(p, ...motion.ranges.hero));
  return {
    progress: p,
    scene:
      finish > 0.98
        ? "released"
        : p >= motion.beats.purple
          ? "purple"
          : "signal",
    pageTravel: reduced
      ? Number(p > motion.reduced.pageAt) * motion.reduced.pageTravel
      : smooth(range(p, ...motion.ranges.pageTravel)),
    pageSplit: reduced ? 0 : smooth(range(p, ...motion.ranges.pageSplit)),
    pageOpacity: 1 - range(p, ...motion.ranges.pageFade),
    heroReveal: reveal,
    heroOpacity: reveal * (1 - speed) * (completed ? 0 : 1),
    heroScale:
      mix(motion.pose.heroRestScale, 1, reveal) +
      (reduced
        ? 0
        : speed * motion.pose.heroBurstScale +
          input.charge * motion.pose.chargeScale),
    heroX: reduced ? 0 : speed * motion.pose.exitX,
    heroY: reduced ? 0 : speed * motion.pose.exitY,
    titleReveal: reduced
      ? Number(p >= motion.beats.purple)
      : out(range(p, ...motion.ranges.title)),
    prologueOpacity: 1 - range(p, ...motion.ranges.prologueFade),
    purpleOpacity: range(p, ...motion.ranges.purpleFade) * (1 - finish),
    finish,
    energy: completed ? 0 : Math.max(input.charge, burst ? 1 - speed : 0),
    echo: reduced || !burst ? 0 : temporalEcho(input.eventMs),
    tear: reduced || !burst ? 0 : screenTear(input.eventMs),
    impact: reduced || !burst ? 0 : impactFrame(input.eventMs),
    streak: reduced
      ? 0
      : burst
        ? range(input.eventMs, motion.burst.echo, motion.burst.tear) *
          (1 - range(input.eventMs, motion.burst.exit, motion.burst.end))
        : 0,
    cameraPunch: reduced || !burst ? 0 : cameraPunch(input.eventMs),
    charge: input.charge,
    reduced,
    pointerX: reduced ? 0 : input.pointerX,
    pointerY: reduced ? 0 : input.pointerY,
  };
}
