/* eslint-disable @next/next/no-img-element */
import { Star } from "@/design-system/Marks";
import type { VisualState } from "@/motion/config";
import type { CSSProperties } from "react";

export function frameStyle(f: VisualState): CSSProperties {
  return {
    "--progress": f.progress,
    "--prologue": f.prologueOpacity,
    "--purple": f.purpleOpacity,
    "--finish": f.finish,
    "--title-reveal": f.titleReveal,
    "--hero-opacity": f.heroOpacity,
    "--hero-scale": f.heroScale,
    "--hero-x": `${f.heroX}cqw`,
    "--hero-y": `${f.heroY}cqh`,
    "--energy": f.energy,
    "--echo": f.echo,
    "--tear": f.tear,
    "--impact": f.impact,
    "--streak": f.streak,
    "--charge": f.charge,
    "--page-travel": f.pageTravel,
    "--page-opacity": f.pageOpacity,
    "--pointer-x": f.pointerX,
    "--pointer-y": f.pointerY,
  } as CSSProperties;
}

export function FrameArt({
  portraitSrc,
  pageSrc,
}: {
  portraitSrc: string;
  pageSrc: string;
}) {
  return (
    <div className="frameArt" aria-hidden="true">
      <div className="prologueArt">
        <div className="ghostType">IVE</div>
        <div className="prologueTitle">
          <div className="eyebrow">SIX SIGNALS. ONE UNIVERSE.</div>
          <div className="display prologueWord">
            HERO<span className="tinyStar">✳</span>
          </div>
          <div className="display universeWord">UNIVERSE</div>
          <div className="introCaption">
            Some heroes save the world.
            <br />
            <em>These ones rewrite it.</em>
          </div>
        </div>
        <div className="pageMock">
          <img className="pagePaper" src={pageSrc} alt="" />
          <img className="pagePortrait" src={portraitSrc} alt="" />
          <div className="pageLabel">
            THE FIRST
            <br />
            SIGNAL.
          </div>
          <div className="pageSerial">001 / CP — AN ORIGIN STORY</div>
        </div>
        <div className="pageOrbit orbitOne" />
        <div className="pageOrbit orbitTwo" />
        <div className="prologueNote">
          <span className="smallCross">+</span> A COMIC BOOK YOU CAN ENTER.
          <br />
          <span className="noteIndent">SCROLL TO BREAK THE FRAME.</span>
        </div>
      </div>
      <div className="purpleArt">
        <div className="purplePrint" />
        <div className="speedBackground" />
        <Star className="heroStar" />
        <div className="chapterKicker">
          CHAPTER 01 <span>—</span> THE FIRST AWAKENING
        </div>
        <div className="heroTitle display">
          <div className="titleClip">
            <span>CAPTAIN</span>
          </div>
          <div className="titleClip secondTitle">
            <span>
              PURPLE<span className="titlePeriod">.</span>
            </span>
          </div>
        </div>
        <div className="heroIndex display">
          01<span>/06</span>
        </div>
        <div className="heroDescriptor">
          <span className="descriptorLine" />
          SUPERSONIC
          <br />
          DISPLACEMENT
        </div>
        <div className="heroEcho echoOne">
          <img src={portraitSrc} alt="" />
        </div>
        <div className="heroEcho echoTwo">
          <img src={portraitSrc} alt="" />
        </div>
        <div className="heroFigure">
          <img src={portraitSrc} alt="" fetchPriority="high" />
        </div>
        <div className="heroSignature">
          TOO FAST TO BE REAL.
          <br />
          <span>TOO REAL TO IGNORE.</span>
        </div>
        <div className="speedStreaks">
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} style={{ "--line": i } as CSSProperties} />
          ))}
        </div>
        <div className="tearStrip" />
        <div className="impactStar">
          <Star />
        </div>
        <div className="heroSideLabel">
          ORIGIN FILE — CAPTAIN PURPLE — NO LIMITS
        </div>
      </div>
      <div className="finishArt">
        <div className="finishCoordinate">
          SIGNAL 001 / TRANSMISSION COMPLETE
        </div>
        <Star className="finishStar" />
        <div className="display finishTitle">
          FRAME
          <br />
          <span>BROKEN.</span>
        </div>
        <div className="finishNote">
          CAPTAIN PURPLE IS OUT OF THE FRAME.
          <br />
          FIVE SIGNALS REMAIN.
        </div>
        <div className="finishIssue">
          TO BE CONTINUED <span>↗</span>
        </div>
      </div>
      <div className="printGrain" />
      <div className="registerTop" />
      <div className="registerBottom" />
    </div>
  );
}
