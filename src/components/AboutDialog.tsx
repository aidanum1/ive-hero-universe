import { useEffect, useRef } from "react";
import { Arrow } from "@/design-system/Marks";

export function AboutDialog({ onClose }: { onClose: () => void }) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = panel.current;
    node?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const buttons = Array.from(
        node.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
      );
      const first = buttons[0],
        last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div className="aboutBackdrop" onClick={onClose}>
      <section
        ref={panel}
        id="story"
        className="aboutPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="closeAbout"
          onClick={onClose}
          aria-label="Close about"
        >
          ×
        </button>
        <div className="eyebrow">IVE HERO UNIVERSE / ISSUE 00</div>
        <h2 id="about-title" className="display">
          BREAK
          <br />
          THE FRAME.
        </h2>
        <p>
          A comic book you can enter. Follow the signal into a layered world and
          awaken Captain Purple, the first of six heroes.
        </p>
        <p>
          Scroll or use the chapter controls. Hold the activation button for 900
          milliseconds, or use the single-tap alternative. Sound is optional.
          Motion can be reduced at any time.
        </p>
        <p className="aboutCredit">
          An unofficial fan-made creative experiment inspired by IVE. Original
          fictional hero illustration; no affiliation with IVE or its
          representatives. This first issue contains the prologue and Captain
          Purple.
        </p>
        <button className="aboutReturn" onClick={onClose}>
          RETURN TO THE SIGNAL <Arrow direction="right" />
        </button>
      </section>
    </div>
  );
}
