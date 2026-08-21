import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, PencilSimple, CaretUp, CaretDown, Trash, CardsThree, Broadcast } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { Folder, getFolders, createPresentation, renamePresentation, deletePresentation, reorderPresentations } from "../lib/folders";

export default function FolderDetail() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPresName, setNewPresName] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    loadFolder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const loadFolder = async () => {
    if (!folderId) return;
    setLoading(true);
    const folders = await getFolders();
    const f = folders.find((f) => f.id === folderId);
    setFolder(f ?? null);
    setLoading(false);
  };

  const handleCreatePresentation = async () => {
    if (!folderId || !newPresName.trim()) return;
    setError("");
    try {
      const pres = await createPresentation(folderId, newPresName);
      navigate(`/folders/${folderId}/presentations/${pres.id}/edit`);
    } catch (e: any) {
      setError(e.message ?? "Não foi possível criar a apresentação.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleRenamePresentation = async (presId: string) => {
    if (!folderId || !editingName.trim()) return;
    const ok = await renamePresentation(folderId, presId, editingName);
    if (ok && folder) {
      setFolder({
        ...folder,
        presentations: folder.presentations.map((p) => (p.id === presId ? { ...p, name: editingName } : p)),
      });
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDeletePresentation = async (presId: string) => {
    if (!folderId || !confirm("Excluir esta apresentação?")) return;
    const ok = await deletePresentation(folderId, presId);
    if (ok && folder) {
      setFolder({ ...folder, presentations: folder.presentations.filter((p) => p.id !== presId) });
      setActionMsg("Apresentação excluída!");
      setTimeout(() => setActionMsg(""), 3000);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!folder || index === 0) return;
    const newOrder = [...folder.presentations];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    const ok = await reorderPresentations(folder.id, newOrder.map((p) => p.id));
    if (ok) setFolder({ ...folder, presentations: newOrder });
  };

  const handleMoveDown = async (index: number) => {
    if (!folder || index >= folder.presentations.length - 1) return;
    const newOrder = [...folder.presentations];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const ok = await reorderPresentations(folder.id, newOrder.map((p) => p.id));
    if (ok) setFolder({ ...folder, presentations: newOrder });
  };

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const cardClass =
    theme === "dark" ? "bg-dark-card border-dark-border hover:border-primary/40" : "bg-light-card border-light-border hover:border-primary/40 shadow-sm";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const inputClass = theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border2";
  const badgeClass = theme === "dark" ? "bg-primary-soft text-primary-light" : "bg-primary/10 text-primary";

  if (loading) return <div className="flex-1 min-h-0 flex items-center justify-center">Carregando...</div>;
  if (!folder) return <div className="flex-1 min-h-0 flex items-center justify-center">Departamento não encontrado</div>;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className={`border-b ${headerClass} px-8 py-5 shrink-0`}>
        <button
          onClick={() => navigate("/folders")}
          className={`inline-flex items-center gap-2 px-3 py-1.5 -ml-3 mb-3 rounded-lg text-sm font-medium transition ${chipClass}`}
        >
          <ArrowLeft size={14} />
          Departamentos
        </button>
        <h1 className="text-xl font-bold mb-4">{folder.name}</h1>

        <div className={`flex items-center gap-2 rounded-lg border p-1.5 ${inputClass}`}>
          <input
            type="text"
            placeholder="Nome da nova apresentação..."
            value={newPresName}
            onChange={(e) => setNewPresName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePresentation()}
            className="flex-1 bg-transparent outline-none text-sm px-2.5 py-1.5"
          />
          <button
            onClick={handleCreatePresentation}
            disabled={!newPresName.trim() || folder.presentations.length >= 20}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Plus size={14} weight="bold" />
            Criar
          </button>
        </div>
        <p className={`text-[11px] mt-1.5 ${mutedClass}`}>{folder.presentations.length}/20 apresentações</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-7">
        {actionMsg && (
          <div className="mb-5 rounded-lg bg-success/15 border border-success/30 text-success px-4 py-2.5 text-sm font-medium">{actionMsg}</div>
        )}
        {error && <div className="mb-5 rounded-lg bg-danger/15 border border-danger/30 text-danger px-4 py-2.5 text-sm font-medium">{error}</div>}

        {folder.presentations.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-primary/30 p-12 text-center">
            <p className="text-lg font-bold mb-2">Nenhuma apresentação</p>
            <p className={`text-sm ${mutedClass}`}>Crie uma nova para começar!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {folder.presentations.map((pres, i) => (
              <div key={pres.id} className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${cardClass}`}>
                <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${badgeClass}`}>
                  <CardsThree size={18} />
                </div>

                {editingId === pres.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenamePresentation(pres.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => handleRenamePresentation(pres.id)}
                    className={`flex-1 rounded-lg border px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary text-sm ${inputClass}`}
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] truncate">{pres.name}</h3>
                    <p className={`text-xs ${mutedClass}`}>
                      {pres.slides.length} slide{pres.slides.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate(`/folders/${folder.id}/presentations/${pres.id}/edit`)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${chipClass}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => navigate(`/folders/${folder.id}/presentations/${pres.id}/present`)}
                    className="px-3.5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition flex items-center gap-1.5"
                  >
                    <Broadcast size={14} />
                    Apresentar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(pres.id);
                      setEditingName(pres.name);
                    }}
                    className={`w-9 h-9 rounded-lg grid place-items-center transition ${chipClass}`}
                    title="Renomear"
                  >
                    <PencilSimple size={15} />
                  </button>
                  <button
                    onClick={() => handleMoveUp(i)}
                    disabled={i === 0}
                    className={`w-9 h-9 rounded-lg grid place-items-center transition ${i === 0 ? "opacity-30 cursor-not-allowed" : chipClass}`}
                    title="Subir"
                  >
                    <CaretUp size={15} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(i)}
                    disabled={i >= folder.presentations.length - 1}
                    className={`w-9 h-9 rounded-lg grid place-items-center transition ${i >= folder.presentations.length - 1 ? "opacity-30 cursor-not-allowed" : chipClass}`}
                    title="Descer"
                  >
                    <CaretDown size={15} />
                  </button>
                  <button
                    onClick={() => handleDeletePresentation(pres.id)}
                    className="w-9 h-9 rounded-lg grid place-items-center transition text-danger hover:bg-danger/15"
                    title="Excluir"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
