import { ServiceItemType, ServiceItemRef } from "./serviceOrder";

export interface QueueItem {
  label: string;
  type: ServiceItemType;
  ref: ServiceItemRef;
}

interface QueueState {
  items: QueueItem[];
  index: number;
}

const KEY = "liveQueue";

export function getLiveQueue(): QueueState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLiveQueue(items: QueueItem[], index = 0) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ items, index }));
  } catch {}
}

export function updateLiveQueueIndex(index: number) {
  const state = getLiveQueue();
  if (!state) return;
  setLiveQueue(state.items, index);
}

export function clearLiveQueue() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
