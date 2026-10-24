import { sampleOpening } from "@/motion/sample";
import type { MotionInput, VisualState } from "@/motion/config";

export function createRuntime() {
  const input: MotionInput = {
    progress: 0,
    charge: 0,
    eventMs: 0,
    action: "idle",
    reduced: false,
    pointerX: 0,
    pointerY: 0,
  };
  const listeners = new Set<(frame: VisualState) => void>();
  let frame = sampleOpening(input);
  return {
    input,
    setInput(patch: Partial<MotionInput>) {
      Object.assign(input, patch);
    },
    get frame() {
      return frame;
    },
    update() {
      frame = sampleOpening(input);
      listeners.forEach((listener) => listener(frame));
    },
    subscribe(listener: (frame: VisualState) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      listeners.clear();
    },
  };
}
export type MotionRuntime = ReturnType<typeof createRuntime>;
