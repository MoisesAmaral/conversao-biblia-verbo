export type RecentType = "verse" | "hymn" | "presentation";

export interface RecentItem {
  id: string;
  type: RecentType;
  title: string;
  subtitle: string;
  href: string;
  timestamp: number;
}

const KEY = "recentItems";
const MAX = 5;

export function addRecent(item: Omit<RecentItem, "timestamp">) {
  try {
    const list = getRecent().filter((i) => i.id !== item.id);
    list.unshift({ ...item, timestamp: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {}
}

export function getRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function formatRelative(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}
