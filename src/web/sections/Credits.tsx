"use client";
/**
 * END CREDITS — film-style credit roll and the explicit unofficial fan-made notice.
 */
import { useRef } from "react";
import { disclaimer, release } from "@/content/release";
import { owner } from "@/content/project";
import { heroes } from "@/heroes/roster";
import { HeroEmblem } from "@/visual/HeroGraphics";
import { ease, gsap, useGSAP } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import s from "./Credits.module.css";

const ROLES: [string, string][] = [
  ["A FAN-MADE PICTURE", "IVE HERO UNIVERSE"],
  ["CREATED & OWNED BY", `${owner.handle} on ${owner.platform}`],
  ["CONCEPT INSPIRED BY", `“${release.title}” — the ${release.concept} era`],
  ["MOTION SYSTEM", "GSAP · Remotion · React Three Fiber · SVG"],
  ["FRAMEWORK", "Next.js · React · TypeScript"],
  ["TYPOGRAPHY", "Dela Gothic One · Archivo · Bodoni Moda · DotGothic16 · Black Han Sans · Gothic A1"],
  ["ILLUSTRATION", "Original vector heroes, masks & emblems — no official photography used"],
  ["SPECIAL THANKS", "Every fan who slowed a fancam down to 0.25×"],
];

export function Credits() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);
      gsap.from(q("[data-roll]"), {
        y: 60,
        autoAlpha: 0,
        ease: ease.glide,
        stagger: 0.08,
        duration: 0.9,
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    },
    { scope: root, revertOnUpdate: true, dependencies: [reduce] },
  );

  return (
    <footer ref={root} id="credits" className={s.credits} aria-labelledby="credits-title">
      <h2 id="credits-title" className={s.end} data-roll>
        THE END<span>?</span>
      </h2>

      <p className={s.byline} data-roll>
        A fan project by{" "}
        <a href={owner.url} target="_blank" rel="noopener noreferrer">
          {owner.handle}
        </a>{" "}
        <span>on {owner.platform}</span>
      </p>

      <div className={s.cast} data-roll>
        <p className={s.castLabel}>STARRING</p>
        <ul className={s.castList}>
          {heroes.map((h) => (
            <li key={h.id}>
              <span className={s.actor}>
                <HeroEmblem hero={h} width={30} />
                {h.name}
              </span>
              <span className={s.as}>as</span>
              <span className={s.role} style={{ color: h.primaryColor }}>
                {h.heroName}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <dl className={s.roles}>
        {ROLES.map(([k, v]) => (
          <div key={k} data-roll>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className={s.notice} data-roll role="note" aria-label="Unofficial fan-made project notice">
        <p className={s.noticeHead}>{disclaimer.short}</p>
        <p className={s.noticeBody}>{disclaimer.long}</p>
        <p className={s.noticeBody}>
          Release facts (dates, tracklist, hero names) are cited from public reporting for fan context only. Please support the artists through official channels.
        </p>
      </div>

      <a href="#opening" className={s.again} data-roll>
        <span>▲</span> PRESS START TO PLAY AGAIN
      </a>
      <p className={s.small}>No heroes were harmed in the making of this fan project. © fan work, non-commercial.</p>
    </footer>
  );
}
