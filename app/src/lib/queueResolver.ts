import { QueueItem } from "./liveQueue";
import { ServiceItemType } from "./serviceOrder";
import { HYMNS, getHymnSlides } from "./hymns";
import { getFolders } from "./folders";
import { fetchVerses } from "./bible";
import type { Version, BibleBook } from "./bible";
import { PresentVerseData } from "../types";

export interface ResolvedSlide {
  id: string;
  label: string | null;
  text: string;
  presentData: PresentVerseData;
}

export interface ResolvedQueueItem {
  label: string;
  type: ServiceItemType;
  slides: ResolvedSlide[];
  /** Slide a preselecionar (ex.: um versículo específico dentro de uma leitura de capítulo). */
  startIndex: number;
}

export async function resolveQueueItem(
  item: QueueItem,
  ctx: { books: BibleBook[]; currentVersion: Version | null },
): Promise<ResolvedQueueItem> {
  const empty: ResolvedQueueItem = { label: item.label, type: item.type, slides: [], startIndex: 0 };

  if (item.ref.kind === "hymn") {
    const { number } = item.ref;
    const hymn = HYMNS.find((h) => h.number === number);
    if (!hymn) return empty;
    const slides = getHymnSlides(hymn).map((s) => ({
      id: s.id,
      label: s.label,
      text: s.text,
      presentData: {
        text: s.text,
        reference: s.label || `Hino ${hymn.number}`,
        bookName: hymn.title,
        chapter: 0,
        verseNumber: 0,
      },
    }));
    return { label: item.label, type: item.type, slides, startIndex: 0 };
  }

  if (item.ref.kind === "verse") {
    if (!ctx.currentVersion) return empty;
    const { bookOrderNum, chapter, verse } = item.ref;
    const book = ctx.books.find((b) => b.order_num === bookOrderNum);
    const verses = await fetchVerses(bookOrderNum, chapter, ctx.currentVersion.id);
    const slides = verses.map((v) => {
      const reference = `${book?.name ?? ""} ${chapter}:${v.number}`;
      return {
        id: `v-${v.id}`,
        label: reference,
        text: v.text,
        presentData: {
          text: v.text,
          reference,
          bookName: book?.name ?? "",
          chapter,
          verseNumber: v.number,
        },
      };
    });
    const startIndex = verse ? Math.max(0, verses.findIndex((v) => v.number === verse)) : 0;
    return { label: item.label, type: item.type, slides, startIndex };
  }

  if (item.ref.kind === "presentation") {
    const { folderId, presentationId } = item.ref;
    const folders = await getFolders();
    const folder = folders.find((f) => f.id === folderId);
    const pres = folder?.presentations.find((p) => p.id === presentationId);
    if (!pres) return empty;
    const slides = pres.slides.map((s) => ({
      id: s.id,
      label: s.label,
      text: s.text,
      presentData: {
        text: s.text,
        reference: s.label || pres.name,
        bookName: "",
        chapter: 0,
        verseNumber: 0,
        title: s.title,
        background: s.style?.background,
        titleColor: s.style?.titleColor,
        align: s.style?.align,
      },
    }));
    return { label: item.label, type: item.type, slides, startIndex: 0 };
  }

  return empty;
}
