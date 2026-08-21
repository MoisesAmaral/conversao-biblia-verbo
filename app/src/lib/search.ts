import { supabase } from "./supabase";
import { BibleBook } from "./bible";

export interface FlatVerse {
  bookOrderNum: number;
  bookName: string;
  bookAbbr: string;
  testament: "OT" | "NT";
  chapterNum: number;
  verseNumber: number;
  text: string;
  reference: string; // e.g. "João 3:16"
}

function normalizeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export interface ParsedReference {
  book: BibleBook;
  chapter: number;
  verse?: number;
}

export function parseReference(query: string, books: BibleBook[]): ParsedReference | null {
  const trimmed = query.trim();
  // Match: "Livro Capítulo[:Versículo]" — e.g. "João 3:16", "Jo 3:16", "1 Coríntios 13"
  const match = trimmed.match(/^\s*(\d?\s?[\p{L}.]+)\s+(\d+)(?::(\d+))?\s*$/u);
  if (!match) return null;

  const [, bookPart, chapterStr, verseStr] = match;
  const queryNorm = normalizeAccents(bookPart.replace(/\s+/g, ""));
  const chapter = parseInt(chapterStr, 10);
  const verse = verseStr ? parseInt(verseStr, 10) : undefined;

  for (const book of books) {
    const nameNorm = normalizeAccents(book.name.replace(/\s+/g, ""));
    const abbrNorm = normalizeAccents(book.abbreviation.replace(/\s+/g, ""));
    if (nameNorm.startsWith(queryNorm) || abbrNorm === queryNorm) {
      return { book, chapter, verse };
    }
  }
  return null;
}

interface SearchRow {
  number: number;
  text: string;
  chapters: {
    number: number;
    books: { name: string; abbreviation: string; order_num: number; testament: "OT" | "NT" } | null;
  } | null;
}

// Full-text search against Supabase directly — there's no offline flat index in the web
// app (that's an Electron-only concept from the desktop cache), so this hits the network
// on every debounced keystroke. `ilike` on ~31k rows without an index is a sequential scan;
// fine for a church-sized userbase, but worth a Postgres trigram/GIN index if it ever feels slow.
export async function searchVersesRemote(query: string, scope: "ALL" | "OT" | "NT", versionId: string): Promise<FlatVerse[]> {
  let q = supabase
    .from("verses")
    .select("number, text, chapters!inner(number, books!inner(name, abbreviation, order_num, testament))")
    .eq("version_id", versionId)
    .ilike("text", `%${query}%`)
    .limit(200);

  if (scope !== "ALL") {
    q = q.eq("chapters.books.testament", scope);
  }

  const { data, error } = await q;
  if (error || !data) return [];

  return (data as unknown as SearchRow[])
    .filter((row) => row.chapters?.books)
    .map((row) => {
      const book = row.chapters!.books!;
      const chapterNum = row.chapters!.number;
      return {
        bookOrderNum: book.order_num,
        bookName: book.name,
        bookAbbr: book.abbreviation,
        testament: book.testament,
        chapterNum,
        verseNumber: row.number,
        text: row.text,
        reference: `${book.name} ${chapterNum}:${row.number}`,
      };
    });
}
