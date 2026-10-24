import { motion, type ActionState } from "@/motion/config";

export function shouldCancelOnScroll(
  action: ActionState,
  progress: number,
  previous: number,
) {
  if (action === "charging") return Math.abs(progress - previous) > 0.00001;
  if (action === "bursting")
    return progress < motion.beats.purple || progress >= motion.beats.departure;
  return action === "completed" && progress < previous - 0.0001;
}
