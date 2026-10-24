import { useId } from "react";

/** SVG-safe unique id (React ids contain characters that break url(#id) references). */
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
