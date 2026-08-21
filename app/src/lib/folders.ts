import { supabase } from "./supabase";
import { Folder, FolderPresentation, Slide } from "../types";

export type { Folder, FolderPresentation };

const FOLDER_LIMIT_MSG = "Limite de 10 departamentos atingido.";
const PRESENTATION_LIMIT_MSG = "Limite de 20 apresentações neste departamento atingido.";

function friendlyError(error: { message: string }, limitMsg: string, fallback: string): Error {
  if (error.message.includes("folder_limit_reached") || error.message.includes("presentation_limit_reached")) {
    return new Error(limitMsg);
  }
  return new Error(fallback);
}

export async function getFolders(): Promise<Folder[]> {
  const { data: folderRows, error } = await supabase
    .from("folders")
    .select("id, name, position")
    .order("position", { ascending: true });
  if (error || !folderRows) return [];

  const folderIds = folderRows.map((f) => f.id);
  let presRows: { id: string; folder_id: string; name: string; slides: Slide[]; updated_at: string }[] = [];
  if (folderIds.length > 0) {
    const { data } = await supabase
      .from("presentations")
      .select("id, folder_id, name, slides, updated_at")
      .in("folder_id", folderIds)
      .order("position", { ascending: true });
    presRows = data ?? [];
  }

  return folderRows.map((f) => ({
    id: f.id,
    name: f.name,
    presentations: presRows
      .filter((p) => p.folder_id === f.id)
      .map((p) => ({ id: p.id, name: p.name, slides: p.slides ?? [], updatedAt: p.updated_at })),
  }));
}

export async function createFolder(name: string): Promise<Folder> {
  const { count } = await supabase.from("folders").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("folders")
    .insert({ name, position: count ?? 0 })
    .select("id, name")
    .single();
  if (error || !data) throw friendlyError(error!, FOLDER_LIMIT_MSG, "Não foi possível criar o departamento.");
  return { id: data.id, name: data.name, presentations: [] };
}

export async function renameFolder(folderId: string, name: string): Promise<boolean> {
  const { error } = await supabase.from("folders").update({ name }).eq("id", folderId);
  return !error;
}

export async function deleteFolder(folderId: string): Promise<boolean> {
  const { error } = await supabase.from("folders").delete().eq("id", folderId);
  return !error;
}

export async function reorderFolders(orderedIds: string[]): Promise<boolean> {
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from("folders").update({ position: i }).eq("id", id)),
  );
  return results.every((r) => !r.error);
}

export async function createPresentation(folderId: string, name: string): Promise<FolderPresentation> {
  const { count } = await supabase
    .from("presentations")
    .select("id", { count: "exact", head: true })
    .eq("folder_id", folderId);
  const { data, error } = await supabase
    .from("presentations")
    .insert({ folder_id: folderId, name, position: count ?? 0 })
    .select("id, name, slides, updated_at")
    .single();
  if (error || !data) throw friendlyError(error!, PRESENTATION_LIMIT_MSG, "Não foi possível criar a apresentação.");
  return { id: data.id, name: data.name, slides: data.slides ?? [], updatedAt: data.updated_at };
}

export async function renamePresentation(_folderId: string, presentationId: string, name: string): Promise<boolean> {
  const { error } = await supabase.from("presentations").update({ name }).eq("id", presentationId);
  return !error;
}

export async function deletePresentation(_folderId: string, presentationId: string): Promise<boolean> {
  const { error } = await supabase.from("presentations").delete().eq("id", presentationId);
  return !error;
}

export async function reorderPresentations(_folderId: string, orderedIds: string[]): Promise<boolean> {
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from("presentations").update({ position: i }).eq("id", id)),
  );
  return results.every((r) => !r.error);
}

export async function savePresentationSlides(
  _folderId: string,
  presentationId: string,
  slides: Slide[],
): Promise<boolean> {
  const { error } = await supabase
    .from("presentations")
    .update({ slides, updated_at: new Date().toISOString() })
    .eq("id", presentationId);
  return !error;
}
