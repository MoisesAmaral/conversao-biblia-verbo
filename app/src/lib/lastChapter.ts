const LAST_CHAPTER_KEY = "lastChapter";

export function getBibleEntryPath(hasBooks: boolean): string {
  if (!hasBooks) return "/bible";
  try {
    const raw = localStorage.getItem(LAST_CHAPTER_KEY);
    if (raw) {
      const { book, chapter } = JSON.parse(raw);
      if (book && chapter) return `/chapter/${book}/${chapter}`;
    }
  } catch {}
  return "/chapter/1/1";
}
