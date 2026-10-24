#!/usr/bin/env bash
# Renders every vertical composition to out/<kebab-id>.mp4 and the share still.
set -euo pipefail
mkdir -p renders
for id in YujinGlitchVertical HeroSelectVertical SixHeroesIntro HeroTradingCards FakeHeroTrailer HeroPowerVertical; do
  slug=$(echo "$id" | sed -E 's/([a-z])([A-Z])/\1-\2/g' | tr 'A-Z' 'a-z')
  npx remotion render "$id" "renders/$slug.mp4" --codec=h264 --crf=18
done
npx remotion still OgImage public/og.png
