import { supabase } from "./supabase";

export interface Version { id: string; name: string; abbreviation: string; }
export interface BibleBook { id: string; name: string; abbreviation: string; testament: "OT" | "NT"; order_num: number; chapters_count: number; }
export interface Verse { id: string; number: number; text: string; chapter_id: string; }

export async function fetchVersions(): Promise<Version[]> {
  const { data, error } = await supabase.from("versions").select("id, name, abbreviation").order("abbreviation");
  if (error || !data) return [];
  return data as Version[];
}

export async function fetchBooks(): Promise<BibleBook[]> {
  const { data, error } = await supabase.from("books").select("*").order("order_num");
  if (error || !data) return [];
  return data as BibleBook[];
}

// Some rows can be duplicated at a pagination boundary on the write side — cheap safety net.
function dedupeVerses(verses: Verse[]): Verse[] {
  const seen = new Set<string>();
  return verses.filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)));
}

export async function fetchVerses(bookOrderNum: number, chapterNum: number, versionId: string): Promise<Verse[]> {
  const { data: book } = await supabase.from("books").select("id").eq("order_num", bookOrderNum).single();
  if (!book) return [];

  const { data: chapter } = await supabase.from("chapters").select("id").eq("book_id", book.id).eq("number", chapterNum).single();
  if (!chapter) return [];

  const { data } = await supabase
    .from("verses")
    .select("id, number, text, chapter_id")
    .eq("chapter_id", chapter.id)
    .eq("version_id", versionId)
    .order("number");
  return dedupeVerses((data ?? []) as Verse[]);
}
