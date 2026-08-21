import harpaData from "../data/harpa-crista.json";
import { Slide } from "../types";

export interface Hymn {
  number: number;
  title: string;
  chorus: string | null;
  stanzas: string[];
}

export const HYMNS: Hymn[] = harpaData as Hymn[];

export function getHymnSlides(hymn: Hymn): Slide[] {
  const slides: Slide[] = [];
  for (let i = 0; i < hymn.stanzas.length; i++) {
    slides.push({ id: `hymn-${hymn.number}-stanza-${i}`, label: `Estrofe ${i + 1}`, text: hymn.stanzas[i] });
    if (hymn.chorus) {
      slides.push({ id: `hymn-${hymn.number}-chorus-${i}`, label: "Coro", text: hymn.chorus });
    }
  }
  return slides;
}

export function searchHymns(query: string): Hymn[] {
  const q = query.toLowerCase();
  return HYMNS.filter(
    (h) => h.number.toString() === q || h.title.toLowerCase().includes(q) || h.stanzas.some((s) => s.toLowerCase().includes(q)),
  ).slice(0, 100);
}
