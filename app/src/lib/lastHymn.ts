const LAST_HYMN_KEY = "lastHymn";

export function getHymnEntryPath(): string {
  try {
    const raw = localStorage.getItem(LAST_HYMN_KEY);
    if (raw) return `/hymns/${raw}`;
  } catch {}
  return "/hymns/1";
}

export function setLastHymn(number: number) {
  try {
    localStorage.setItem(LAST_HYMN_KEY, String(number));
  } catch {}
}
