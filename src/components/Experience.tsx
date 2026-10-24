"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameArt, frameStyle } from "./FrameArt";
import { Arrow, IVELogo, SignalMarks, Star } from "@/design-system/Marks";
import { createRuntime } from "@/controllers/runtime";
import { AudioController } from "@/controllers/audio";
import { motion, type ActionState, type SceneId } from "@/motion/config";
import { assetUrl } from "@/utils/assets";
import { AboutDialog } from "./AboutDialog";
import { shouldCancelOnScroll } from "@/controllers/interaction";
import { SceneManager, domScene } from "@/scenes/SceneManager";

const WorldCanvas = dynamic(() => import("@/webgl/WorldCanvas"), {
  ssr: false,
});

class WebGLBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Experience() {
  const [runtime] = useState(createRuntime);
  const [audio] = useState(() => new AudioController());
  const root = useRef<HTMLDivElement>(null),
    rail = useRef<HTMLElement>(null);
  const [scene, setScene] = useState<SceneId>("signal");
  const [action, setAction] = useState<ActionState>("idle");
  const [reduced, setReduced] = useState(false),
    [sound, setSound] = useState(false);
  const [worldReady, setWorldReady] = useState(false),
    [worldFailed, setWorldFailed] = useState(false);
  const [help, setHelp] = useState(false);
  const currentScene = useRef<SceneId>("signal");
  const eventTween = useRef<gsap.core.Tween | null>(null),
    chargeTween = useRef<gsap.core.Tween | null>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const setWorldReadyStable = useCallback(() => setWorldReady(true), []);
  const loseWorld = useCallback(() => setWorldReady(false), []);
  const failWorld = useCallback(() => {
    setWorldReady(false);
    setWorldFailed(true);
  }, []);

  const changeAction = useCallback(
    (value: ActionState) => {
      runtime.setInput({ action: value });
      setAction(value);
    },
    [runtime],
  );
  const cancel = useCallback(() => {
    chargeTween.current?.kill();
    eventTween.current?.kill();
    pointerOrigin.current = null;
    audio.stop();
    runtime.setInput({ charge: 0, eventMs: 0 });
    changeAction("idle");
    runtime.update();
  }, [audio, runtime, changeAction]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const manager = new SceneManager({
      signal: domScene(
        element.querySelector<HTMLElement>(".prologueArt")!,
        "prologueOpacity",
      ),
      purple: domScene(
        element.querySelector<HTMLElement>(".purpleArt")!,
        "purpleOpacity",
      ),
      released: domScene(
        element.querySelector<HTMLElement>(".finishArt")!,
        "finish",
      ),
    });
    const unsubscribe = runtime.subscribe((frame) => {
      const el = root.current;
      if (!el) return;
      Object.entries(frameStyle(frame)).forEach(([key, value]) =>
        el.style.setProperty(key, String(value)),
      );
      el.dataset.progress = frame.progress.toFixed(4);
      manager.update(frame);
      if (currentScene.current !== frame.scene) {
        currentScene.current = frame.scene;
        setScene(frame.scene);
        if (frame.scene !== "signal") setWorldReady(false);
      }
    });
    runtime.update();
    return () => {
      unsubscribe();
      manager.dispose();
    };
  }, [runtime]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (media.matches && runtime.input.action === "bursting") {
        eventTween.current?.kill();
        runtime.setInput({ charge: 0, action: "completed" });
        setAction("completed");
        audio.stop();
      } else if (runtime.input.action === "charging") {
        cancel();
      }
      runtime.setInput({ reduced: media.matches });
      if (media.matches) setWorldReady(false);
      setReduced(media.matches);
      runtime.update();
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [runtime, audio, cancel]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const driver = { progress: 0 };
    let previousRaw = 0;
    const context = gsap.context(() => {
      gsap.to(driver, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: rail.current,
          start: "top top",
          end: "bottom bottom",
          scrub: motion.scrollScrub,
          onUpdate: (self) => {
            const a = runtime.input.action;
            if (shouldCancelOnScroll(a, self.progress, previousRaw)) cancel();
            previousRaw = self.progress;
          },
        },
        onUpdate: () => {
          runtime.setInput({ progress: driver.progress });
          runtime.update();
        },
      });
    }, root);
    let alive = true;
    void document.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });
    const onVisibility = () => {
      if (document.hidden) {
        if (runtime.input.action === "charging") cancel();
        eventTween.current?.pause();
        audio.stop();
      } else {
        eventTween.current?.resume();
        ScrollTrigger.refresh();
      }
    };
    const onBlur = () => {
      if (runtime.input.action === "charging") cancel();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      alive = false;
      context.revert();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [runtime, cancel, audio]);

  useEffect(
    () => () => {
      chargeTween.current?.kill();
      eventTween.current?.kill();
      audio.dispose();
    },
    [audio],
  );

  const goTo = useCallback(
    (p: number) => {
      if (!rail.current) return;
      const distance = rail.current.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: Math.max(0, distance * p),
        behavior: runtime.input.reduced ? "instant" : "smooth",
      });
    },
    [runtime],
  );

  const activate = useCallback(() => {
    if (
      runtime.input.action === "bursting" ||
      runtime.input.action === "completed" ||
      runtime.input.progress < 0.42
    )
      return;
    chargeTween.current?.kill();
    runtime.setInput({ charge: 1, eventMs: 0 });
    pointerOrigin.current = null;
    audio.stop();
    audio.cue("burst");
    if (runtime.input.reduced) {
      changeAction("completed");
      runtime.update();
      return;
    }
    changeAction("bursting");
    eventTween.current = gsap.to(runtime.input, {
      eventMs: motion.burstMs,
      duration: motion.burstMs / 1000,
      ease: "none",
      onUpdate: () => runtime.update(),
      onComplete: () => {
        runtime.setInput({ charge: 0 });
        changeAction("completed");
        runtime.update();
      },
    });
  }, [runtime, audio, changeAction]);

  const startCharge = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (
      event.button !== 0 ||
      runtime.input.action === "bursting" ||
      runtime.input.action === "completed"
    )
      return;
    pointerOrigin.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    chargeTween.current?.kill();
    runtime.setInput({ charge: 0 });
    changeAction("charging");
    audio.cue("charge");
    chargeTween.current = gsap.to(runtime.input, {
      charge: 1,
      duration: motion.chargeMs / 1000,
      ease: "none",
      onUpdate: () => runtime.update(),
      onComplete: activate,
    });
  };
  const pointerMove = (event: ReactPointerEvent) => {
    if (
      pointerOrigin.current &&
      Math.hypot(
        event.clientX - pointerOrigin.current.x,
        event.clientY - pointerOrigin.current.y,
      ) > motion.cancelDistance
    )
      cancel();
    if (event.pointerType === "mouse") {
      runtime.setInput({
        pointerX: (event.clientX / window.innerWidth - 0.5) * 2,
        pointerY: (event.clientY / window.innerHeight - 0.5) * 2,
      });
      runtime.update();
    }
  };
  const toggleMotion = () => {
    const keepCompleted =
      runtime.input.action === "completed" ||
      runtime.input.action === "bursting";
    cancel();
    const next = !runtime.input.reduced;
    runtime.setInput({ reduced: next });
    if (keepCompleted) changeAction("completed");
    setReduced(next);
    setWorldReady(false);
    runtime.update();
  };
  const replay = () => {
    cancel();
    goTo(0);
  };
  const closeHelp = useCallback(() => setHelp(false), []);
  const isPurple = scene === "purple",
    isFinished = scene === "released" || action === "completed";
  return (
    <main
      ref={rail}
      className="scrollRail"
      style={
        { "--scroll-screens": motion.scrollScreens + 1 } as React.CSSProperties
      }
    >
      <a href="#story" className="skipLink" onClick={() => setHelp(true)}>
        Read the story
      </a>
      <div className="srOnly">
        <h1>IVE Hero Universe</h1>
        <p>
          An unofficial interactive comic experiment. Enter a layered comic page
          and awaken Captain Purple, the first of six original fictional heroes.
        </p>
      </div>
      <div
        ref={root}
        className="experience"
        data-scene={scene}
        data-action={action}
        data-reduced={reduced}
        data-world-ready={worldReady && !reduced && !worldFailed}
        data-progress="0"
        onPointerMove={pointerMove}
        style={frameStyle(runtime.frame)}
      >
        <div className="stage">
          <FrameArt
            portraitSrc={assetUrl("/heroes/captain-purple.webp")}
            pageSrc={assetUrl("/assets/comic-page.svg")}
          />
          {!reduced && !worldFailed && scene === "signal" && (
            <WebGLBoundary onError={failWorld}>
              <WorldCanvas
                runtime={runtime}
                onReady={setWorldReadyStable}
                onLost={loseWorld}
              />
            </WebGLBoundary>
          )}
        </div>
        <header className="hudHeader">
          <button
            className="brand"
            aria-label="IVE Hero Universe, return to the beginning"
            onClick={replay}
          >
            <IVELogo />
            <span>
              HERO
              <br />
              UNIVERSE
            </span>
          </button>
          <div className="headerEdition">
            AN UNOFFICIAL CREATIVE EXPERIMENT
            <span>VOLUME 01 — THE AWAKENING</span>
          </div>
          <div className="utilities">
            <button
              className="soundButton"
              onClick={async () => setSound(await audio.toggle())}
              aria-pressed={sound}
              aria-label={sound ? "Turn sound off" : "Turn sound on"}
            >
              <span className="soundBars">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>SOUND {sound ? "ON" : "OFF"}</span>
            </button>
            <button
              className="motionButton"
              onClick={toggleMotion}
              aria-pressed={reduced}
              aria-label={reduced ? "Enable full motion" : "Reduce motion"}
            >
              {reduced ? "MOTION −" : "MOTION +"}
            </button>
            <button
              className="infoButton"
              onClick={() => setHelp(true)}
              aria-label="About this experiment"
            >
              i
            </button>
          </div>
        </header>
        <div className="sideCoordinate">
          {isFinished
            ? "SIGNAL RELEASED"
            : isPurple
              ? "CP—001 / POWER UNLOCKED"
              : "TRANSMISSION 00.001 / STANDBY"}
        </div>
        <div className="sceneControls">
          {scene === "signal" && (
            <button className="enterButton" onClick={() => goTo(0.64)}>
              <span className="buttonStar">
                <Star />
              </span>
              <span>
                ENTER THE PAGE<small>SCROLL TO EXPLORE</small>
              </span>
              <Arrow direction="right" />
            </button>
          )}
          {isPurple && !isFinished && (
            <div className="activation">
              <button
                className="holdButton"
                onPointerDown={startCharge}
                onPointerUp={() => {
                  if (runtime.input.action === "charging") cancel();
                }}
                onPointerCancel={() => {
                  if (runtime.input.action === "charging") cancel();
                }}
                onClick={(e) => {
                  if (e.detail === 0) activate();
                }}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Hold to activate Captain Purple, or press Enter"
                disabled={action === "bursting"}
              >
                <span className="holdFill" />
                <Star />
                <span>
                  {action === "charging"
                    ? "CHARGING THE SIGNAL"
                    : action === "bursting"
                      ? "BREAKING THE FRAME"
                      : "HOLD TO ACTIVATE"}
                  <small>CAPTAIN PURPLE / 900 MS</small>
                </span>
                <span className="holdArrow">↗</span>
              </button>
              <button
                className="activateAlternative"
                onClick={activate}
                disabled={action === "bursting"}
              >
                OR TAP TO ACTIVATE <span>↗</span>
              </button>
            </div>
          )}
          {isFinished && (
            <button className="replayButton" onClick={replay}>
              <span>↺</span> REPLAY SIGNAL
              <Arrow direction="right" />
            </button>
          )}
        </div>
        <footer className="hudFooter">
          <div className="chapterNav">
            <button
              aria-current={scene === "signal" ? "step" : undefined}
              onClick={() => goTo(0)}
            >
              <span>00</span> SIGNAL
            </button>
            <span className="chapterDash" />
            <button
              aria-current={isPurple || isFinished ? "step" : undefined}
              onClick={() => goTo(0.64)}
            >
              <span>01</span> CAPTAIN PURPLE
            </button>
          </div>
          <div className="footerCenter">
            <SignalMarks active={isPurple || isFinished} />
            <span>
              {isFinished
                ? "01 / 06 SIGNALS RELEASED"
                : "SIX HEROES. NO ORDINARY RULES."}
            </span>
          </div>
          <div className="footerProgress">
            <span className="scrollIcon">
              <Arrow />
            </span>
            <span>{isFinished ? "END OF ISSUE 00" : "SCROLL TO EXPLORE"}</span>
            <span className="progressTrack">
              <i />
            </span>
          </div>
        </footer>
        <div className="liveStatus srOnly" role="status" aria-live="polite">
          {isFinished
            ? "Captain Purple has broken the frame. Five signals remain."
            : action === "charging"
              ? "Charging Captain Purple."
              : action === "bursting"
                ? "Captain Purple activated."
                : isPurple
                  ? "Captain Purple. Hold or tap to activate."
                  : "Signal zero. Scroll or choose Enter the Page to discover Captain Purple."}
        </div>
        {help && <AboutDialog onClose={closeHelp} />}
      </div>
      <noscript>
        <section className="noScript">
          <h1>IVE HERO UNIVERSE</h1>
          <p>
            Six signals. One universe. Captain Purple breaks free from a
            comic-book frame. Enable JavaScript for the interactive experience.
          </p>
        </section>
      </noscript>
    </main>
  );
}
