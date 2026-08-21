import { useCallback, useEffect, useRef, useState } from "react";
import { PresentVerseData } from "../types";
import { presentationBus } from "../lib/presentationBus";

/**
 * Preview/Program model — ported do app desktop. `goLive()` manda o item do preview
 * pra Tela 2 e o promove a "programa" (o que está de fato no ar). Uma vez ao vivo,
 * `previewPrev/Next` avançam o programa diretamente (controle em tempo real, como um
 * clicker físico durante o culto) em vez de só mexer no preview — nenhuma constraint
 * em T: quem chama decide o shape do item (Verse, Slide, ...), só `toPresentData` sabe
 * convertê-lo.
 */
export function usePresentableList<T>(
  items: T[],
  toPresentData: (item: T) => PresentVerseData,
) {
  const [previewIdx, setPreviewIdx] = useState(0);
  const [programIdx, setProgramIdx] = useState<number | null>(null);

  const itemsRef = useRef<T[]>([]);
  const previewIdxRef = useRef(0);
  const programIdxRef = useRef<number | null>(null);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { previewIdxRef.current = previewIdx; }, [previewIdx]);
  useEffect(() => { programIdxRef.current = programIdx; }, [programIdx]);

  // Setas apertadas na própria aba de apresentação (se o operador clicar nela) avançam
  // o programa do mesmo jeito que as setas na aba do operador.
  useEffect(() => {
    return presentationBus.subscribe((msg) => {
      if (msg.type !== "verse-navigate") return;
      const base = programIdxRef.current ?? previewIdxRef.current;
      const newIdx = msg.dir === "next" ? Math.min(itemsRef.current.length - 1, base + 1) : Math.max(0, base - 1);
      const item = itemsRef.current[newIdx];
      if (!item) return;
      setPreviewIdx(newIdx);
      setProgramIdx(newIdx);
      presentationBus.sendVerse(toPresentData(item));
    });
  }, [toPresentData]);

  const setPreview = (index: number) => setPreviewIdx(index);

  const goLive = useCallback(() => {
    const item = itemsRef.current[previewIdxRef.current];
    if (!item) return;
    presentationBus.sendVerse(toPresentData(item));
    setProgramIdx(previewIdxRef.current);
  }, [toPresentData]);

  const advance = useCallback((dir: 1 | -1) => {
    const base = programIdxRef.current;
    if (base === null) {
      setPreviewIdx((i) => Math.max(0, Math.min(itemsRef.current.length - 1, i + dir)));
      return;
    }
    const newIdx = Math.max(0, Math.min(itemsRef.current.length - 1, base + dir));
    const item = itemsRef.current[newIdx];
    if (item) presentationBus.sendVerse(toPresentData(item));
    setPreviewIdx(newIdx);
    setProgramIdx(newIdx);
  }, [toPresentData]);

  const previewPrev = () => advance(-1);
  const previewNext = () => advance(1);

  const reset = useCallback(() => {
    setPreviewIdx(0);
    setProgramIdx(null);
  }, []);

  return { previewIdx, programIdx, isLive: programIdx !== null, setPreview, goLive, previewPrev, previewNext, reset };
}
