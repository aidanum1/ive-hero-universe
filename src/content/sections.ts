/** Site map — drives the nav indicator, the menu and section anchors. */
export const sections = [
  { id: "opening", no: "00", title: "Title", label: "PRESS START" },
  { id: "select", no: "01", title: "Hero Select", label: "SELECT YOUR HERO" },
  { id: "comics", no: "02", title: "Hero Comics", label: "ISSUE Nº05" },
  { id: "cards", no: "03", title: "Holo Cards", label: "TRADING CARDS" },
  { id: "posters", no: "04", title: "Now Showing", label: "POSTERS & EDITORIAL" },
  { id: "theatre", no: "05", title: "Motion Theatre", label: "VERTICAL CUTS" },
  { id: "release", no: "06", title: "Looks Can Kill", label: "EP COUNTDOWN" },
  { id: "credits", no: "07", title: "Credits", label: "FAN-MADE NOTICE" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
