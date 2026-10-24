import type { Metadata } from "next";
import { SystemSheet } from "./SystemSheet";

export const metadata: Metadata = { title: "Design System — IVE HERO UNIVERSE (fan-made)" };

export default function SystemPage() {
  return <SystemSheet />;
}
