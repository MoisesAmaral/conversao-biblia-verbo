import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { BibleBook } from "../lib/bible";

export default function Bible() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { versions, books, currentVersion, setVersion, loading } = useApp();

  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);

  const textClass = theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary";
  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const cardClass = theme === "dark" ? "bg-dark-card border-dark-border hover:border-primary/50" : "bg-light-card border-light-border hover:border-primary/50 shadow-sm";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const inputClass = theme === "dark" ? "bg-dark-surface border-dark-border2 placeholder-dark-text-muted" : "bg-light-surface border-light-border2 placeholder-light-text-muted";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";

  const normalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

  const filtered = useMemo(() => {
    if (!query.trim()) return books;
    const q = normalize(query);
    return books.filter((b) => normalize(b.name).includes(q) || normalize(b.abbreviation).includes(q));
  }, [query, books]);

  const oldTestament = filtered.filter((b) => b.testament === "OT");
  const newTestament = filtered.filter((b) => b.testament === "NT");

  const renderBookGrid = (list: BibleBook[], title: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-9">
        <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${mutedClass}`}>{title} · {list.length}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {list.map((book) => (
            <button key={book.order_num} onClick={() => setSelectedBook(book)} className={`rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}>
              <p className={`font-bold text-sm mb-1 ${textClass}`}>{book.name}</p>
              <p className={`text-xs ${mutedClass}`}>{book.chapters_count} capítulo{book.chapters_count !== 1 ? "s" : ""}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className={`border-b ${headerClass} px-8 py-5 shrink-0`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {selectedBook && (
              <button onClick={() => setSelectedBook(null)} className={`w-9 h-9 rounded-lg grid place-items-center transition ${chipClass}`} title="Voltar aos livros">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold">{selectedBook ? selectedBook.name : "Bíblia"}</h1>
              <p className={`text-xs ${mutedClass}`}>
                {selectedBook ? "Escolha o capítulo" : currentVersion ? `Versão atual: ${currentVersion.name}` : "Escolha o livro para ler"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {versions.length > 1 && (
              <div className={`relative rounded-lg text-sm font-medium ${chipClass}`}>
                <select
                  value={currentVersion?.id ?? ""}
                  onChange={(e) => {
                    const v = versions.find((v) => v.id === e.target.value);
                    if (v) setVersion(v);
                  }}
                  className="appearance-none bg-transparent pl-3 pr-8 py-2 outline-none cursor-pointer"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>{v.abbreviation}</option>
                  ))}
                </select>
                <CaretDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            )}
            <button onClick={() => navigate("/search")} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${chipClass}`}>
              <MagnifyingGlass size={15} />
              Buscar
            </button>
          </div>
        </div>

        {!selectedBook && (
          <div className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 ${inputClass}`}>
            <MagnifyingGlass size={15} className={mutedClass} />
            <input
              type="text"
              placeholder="Filtrar livros (ex: João, Gn, Salmos...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-7">
        {loading ? (
          <p className={mutedClass}>Carregando livros...</p>
        ) : selectedBook ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
            {Array.from({ length: selectedBook.chapters_count }, (_, i) => i + 1).map((ch) => (
              <button
                key={ch}
                onClick={() => navigate(`/chapter/${selectedBook.order_num}/${ch}`)}
                className={`aspect-square rounded-xl border flex items-center justify-center text-base font-bold transition-all hover:scale-105 hover:bg-primary hover:text-white hover:border-transparent ${cardClass}`}
              >
                {ch}
              </button>
            ))}
          </div>
        ) : (
          <>
            {renderBookGrid(oldTestament, "Antigo Testamento")}
            {renderBookGrid(newTestament, "Novo Testamento")}
            {filtered.length === 0 && <p className={`text-center py-12 ${mutedClass}`}>Nenhum livro encontrado para "{query}"</p>}
          </>
        )}
      </div>
    </div>
  );
}
