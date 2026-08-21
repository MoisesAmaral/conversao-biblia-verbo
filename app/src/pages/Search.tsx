import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MagnifyingGlass, Broadcast, ArrowLeft, Star } from "@phosphor-icons/react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { parseReference, searchVersesRemote, FlatVerse } from "../lib/search";
import { fetchVerses } from "../lib/bible";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { presentationBus } from "../lib/presentationBus";

type Scope = "ALL" | "OT" | "NT";

const SCOPES: { key: Scope; label: string }[] = [
  { key: "ALL", label: "Toda a Bíblia" },
  { key: "OT", label: "Antigo Testamento" },
  { key: "NT", label: "Novo Testamento" },
];

export default function Search() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { books, currentVersion } = useApp();

  const [rawQuery, setRawQuery] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(rawQuery, 350);
  const [scope, setScope] = useState<Scope>("ALL");
  const [loading, setLoading] = useState(false);
  const [referenceMatch, setReferenceMatch] = useState<FlatVerse | null>(null);
  const [results, setResults] = useState<FlatVerse[]>([]);

  useEffect(() => {
    if (!debouncedQuery.trim() || !currentVersion) {
      setReferenceMatch(null);
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const ref = parseReference(debouncedQuery, books);
      if (ref) {
        const verses = await fetchVerses(ref.book.order_num, ref.chapter, currentVersion.id);
        const verse = ref.verse ? verses.find((v) => v.number === ref.verse) : verses[0];
        if (!cancelled && verse) {
          setReferenceMatch({
            bookOrderNum: ref.book.order_num,
            bookName: ref.book.name,
            bookAbbr: ref.book.abbreviation,
            testament: ref.book.testament,
            chapterNum: ref.chapter,
            verseNumber: verse.number,
            text: verse.text,
            reference: `${ref.book.name} ${ref.chapter}:${verse.number}`,
          });
        } else if (!cancelled) {
          setReferenceMatch(null);
        }
      } else if (!cancelled) {
        setReferenceMatch(null);
      }

      const found = await searchVersesRemote(debouncedQuery, scope, currentVersion.id);
      if (!cancelled) setResults(found);
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [debouncedQuery, scope, books, currentVersion]);

  const handlePresentVerse = (verse: FlatVerse) => {
    presentationBus.sendVerse({
      text: verse.text,
      reference: verse.reference,
      bookName: verse.bookName,
      chapter: verse.chapterNum,
      verseNumber: verse.verseNumber,
    });
  };

  const handleOpenChapter = (verse: FlatVerse) => {
    navigate(`/chapter/${verse.bookOrderNum}/${verse.chapterNum}?verse=${verse.verseNumber}`);
  };

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const secondaryClass = theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border" : "bg-light-card border-light-border";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const inputClass = theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border2";

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className={`border-b ${headerClass} px-8 py-5 shrink-0`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold">Buscar versículos</h1>
            <p className={`text-xs mt-0.5 ${mutedClass}`}>Por referência ou por palavra-chave</p>
          </div>
          <button onClick={() => navigate("/bible")} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${chipClass}`}>
            <ArrowLeft size={15} />
            Bíblia
          </button>
        </div>

        <div className={`flex items-center gap-2.5 rounded-lg border px-4 py-3.5 ${inputClass}`}>
          <MagnifyingGlass size={17} className={mutedClass} />
          <input
            type="text"
            placeholder="Ex: João 3:16 ou Amor é paciente..."
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none text-[15px]"
          />
        </div>

        <div className="mt-3 flex gap-2">
          {SCOPES.map((s) => (
            <button
              key={s.key}
              onClick={() => setScope(s.key)}
              className={`rounded-lg px-4 py-1.5 text-[12.5px] font-semibold transition ${scope === s.key ? "bg-primary text-white" : chipClass}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-7">
        {!rawQuery.trim() ? (
          <div className="rounded-xl border-2 border-dashed border-primary/20 p-12 text-center">
            <p className="text-lg font-bold mb-2">Digite algo para começar</p>
            <p className={`text-sm ${mutedClass}`}>Busque por referência (João 3:16) ou palavra-chave</p>
          </div>
        ) : loading ? (
          <p className={mutedClass}>Buscando...</p>
        ) : (
          <>
            {referenceMatch && (
              <div className="mb-8">
                <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${mutedClass}`}>
                  <Star size={12} weight="fill" className="text-primary" />
                  Referência exata
                </h3>
                <div className={`rounded-xl border-2 border-primary/50 p-6 ${cardClass}`}>
                  <p className="text-2xl font-bold text-primary mb-3">{referenceMatch.reference}</p>
                  <p className={`text-base leading-relaxed mb-6 font-serif ${secondaryClass}`}>{referenceMatch.text}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handlePresentVerse(referenceMatch)} title="Apresentar" className="px-5 py-2 rounded-lg font-bold bg-primary text-white hover:bg-primary-dark transition flex items-center gap-2">
                      <Broadcast size={15} />
                      Apresentar
                    </button>
                    <button onClick={() => handleOpenChapter(referenceMatch)} className={`px-5 py-2 rounded-lg font-semibold transition ${chipClass}`}>Abrir capítulo</button>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${mutedClass}`}>Resultados · {results.length > 200 ? "200+" : results.length}</h3>
                <div className="space-y-3">
                  {results.map((verse, i) => (
                    <div key={`${verse.reference}-${i}`} className={`rounded-xl border p-5 ${cardClass} hover:border-primary/40 transition`}>
                      <p className="text-sm font-bold text-primary mb-2">{verse.reference}</p>
                      <p className={`text-[15px] leading-relaxed mb-4 font-serif ${secondaryClass}`}>{verse.text}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handlePresentVerse(verse)} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary-dark transition flex items-center gap-1.5" title="Apresentar">
                          <Broadcast size={14} />
                          Apresentar
                        </button>
                        <button onClick={() => handleOpenChapter(verse)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${chipClass}`}>Abrir capítulo</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {debouncedQuery.trim() && results.length === 0 && !referenceMatch && (
              <div className="rounded-xl border-2 border-dashed border-primary/20 p-12 text-center">
                <p className="text-xl font-bold mb-2">Nenhum resultado</p>
                <p className={`text-sm ${mutedClass}`}>Tente outra busca para "{debouncedQuery}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
