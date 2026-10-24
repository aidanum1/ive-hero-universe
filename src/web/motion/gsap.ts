"use client";
/**
 * Single GSAP entry point for the site. Registers plugins once and exposes the shared
 * easing functions so web motion uses exactly the curves the videos use.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ease, sec } from "@/design/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: ease.glide, duration: sec(12) });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, useGSAP, ease, sec };
