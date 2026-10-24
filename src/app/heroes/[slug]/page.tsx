import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { heroById, heroIds } from "@/heroes/roster";
import type { HeroId } from "@/heroes/types";
import { disclaimer } from "@/content/release";
import { HeroPage } from "@/web/hero/HeroPage";

export function generateStaticParams() {
  return heroIds.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/heroes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const hero = heroById[slug as HeroId];
  if (!hero) return {};
  return {
    title: `${hero.heroName} (${hero.name}) — IVE HERO UNIVERSE · fan-made`,
    description: `${hero.tagline} ${hero.bio} ${disclaimer.short}.`,
  };
}

async function HeroRoute({ params }: { params: PageProps<"/heroes/[slug]">["params"] }) {
  const { slug } = await params;
  const hero = heroById[slug as HeroId];
  if (!hero) notFound();
  return <HeroPage heroId={hero.id} />;
}

function HeroLoading() {
  return (
    <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: "var(--c-ink)", color: "var(--c-paper)", fontFamily: "var(--f-pixel)", letterSpacing: "0.1em" }}>
      LOADING HERO…
    </div>
  );
}

export default function Page({ params }: PageProps<"/heroes/[slug]">) {
  return (
    <Suspense fallback={<HeroLoading />}>
      <HeroRoute params={params} />
    </Suspense>
  );
}
