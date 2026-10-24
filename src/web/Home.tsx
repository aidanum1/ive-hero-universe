"use client";
import { Opening } from "./sections/Opening";
import { HeroSelect } from "./sections/HeroSelect";
import { HeroComics } from "./sections/HeroComics";
import { CardGallery } from "./sections/CardGallery";
import { Posters } from "./sections/Posters";
import { MotionTheatre } from "./sections/MotionTheatre";
import { Release } from "./sections/Release";
import { Credits } from "./sections/Credits";
import { SiteNav } from "./ui/SiteNav";

export function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Opening onStart={() => document.getElementById("select")?.scrollIntoView({ behavior: "smooth" })} />
        <HeroSelect />
        <HeroComics />
        <CardGallery />
        <Posters />
        <MotionTheatre />
        <Release />
      </main>
      <Credits />
    </>
  );
}
