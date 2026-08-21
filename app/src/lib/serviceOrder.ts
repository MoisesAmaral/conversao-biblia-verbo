export type ServiceItemType = "hymn" | "verse" | "presentation" | "message" | "other";

export type ServiceItemRef =
  | { kind: "hymn"; number: number }
  | { kind: "verse"; bookOrderNum: number; chapter: number; verse?: number }
  | { kind: "presentation"; folderId: string; presentationId: string };

export interface ServiceOrderItem {
  id: string;
  label: string;
  type: ServiceItemType;
  /** Ponteiro estruturado para o conteúdo real. Ausente em itens livres (ex.: "mensagem") sem conteúdo do app pra resolver. */
  ref?: ServiceItemRef;
}

const KEY = "serviceOrder";

export function getServiceOrder(): ServiceOrderItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveServiceOrder(items: ServiceOrderItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}
