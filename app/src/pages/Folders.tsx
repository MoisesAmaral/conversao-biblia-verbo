import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder as FolderIcon, Plus, PencilSimple, CaretUp, CaretDown, Trash } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { Folder, getFolders, createFolder, renameFolder, deleteFolder, reorderFolders } from "../lib/folders";

export default function Folders() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    const f = await getFolders();
    setFolders(f);
    setLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setError("");
    try {
      const folder = await createFolder(newFolderName);
      setFolders((prev) => [...prev, folder]);
      setNewFolderName("");
      setActionMsg(`Departamento "${folder.name}" criado!`);
      setTimeout(() => setActionMsg(""), 3000);
    } catch (e: any) {
      setError(e.message ?? "Não foi possível criar o departamento.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!editingName.trim()) return;
    const ok = await renameFolder(folderId, editingName);
    if (ok) {
      setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, name: editingName } : f)));
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;
    const ok = await deleteFolder(folderId);
    if (ok) {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setActionMsg("Departamento removido!");
      setTimeout(() => setActionMsg(""), 3000);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...folders];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    const ok = await reorderFolders(newOrder.map((f) => f.id));
    if (ok) setFolders(newOrder);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= folders.length - 1) return;
    const newOrder = [...folders];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const ok = await reorderFolders(newOrder.map((f) => f.id));
    if (ok) setFolders(newOrder);
  };

  const mutedClass = theme === "dark" ? "text-dark-text-muted" : "text-light-text-muted";
  const headerClass = theme === "dark" ? "border-dark-border" : "border-light-border";
  const cardClass =
    theme === "dark" ? "bg-dark-card border-dark-border hover:border-primary/40" : "bg-light-card border-light-border hover:border-primary/40 shadow-sm";
  const chipClass = theme === "dark" ? "bg-dark-card2 hover:bg-dark-border" : "bg-light-card2 hover:bg-light-border";
  const inputClass = theme === "dark" ? "bg-dark-surface border-dark-border2" : "bg-light-surface border-light-border2";
  const badgeClass = theme === "dark" ? "bg-primary-soft text-primary-light" : "bg-primary/10 text-primary";

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className={`border-b ${headerClass} px-8 py-5 shrink-0`}>
        <div className="mb-4">
          <h1 className="text-xl font-bold">Departamentos</h1>
          <p className={`text-xs mt-0.5 ${mutedClass}`}>Louvor, Infantil, Jovens... crie apresentações por área</p>
        </div>

        <div className={`flex items-center gap-2 rounded-lg border p-1.5 ${inputClass}`}>
          <input
            type="text"
            placeholder="Nome do departamento (ex: Jovens, Culto, Crianças...)"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            className="flex-1 bg-transparent outline-none text-sm px-2.5 py-1.5"
          />
          <button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || folders.length >= 10}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Plus size={14} weight="bold" />
            Criar
          </button>
        </div>
        <p className={`text-[11px] mt-1.5 ${mutedClass}`}>{folders.length}/10 departamentos</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-7">
        {actionMsg && (
          <div className="mb-5 rounded-lg bg-success/15 border border-success/30 text-success px-4 py-2.5 text-sm font-medium">{actionMsg}</div>
        )}
        {error && <div className="mb-5 rounded-lg bg-danger/15 border border-danger/30 text-danger px-4 py-2.5 text-sm font-medium">{error}</div>}

        {loading ? (
          <p className={mutedClass}>Carregando...</p>
        ) : folders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-primary/30 p-12 text-center">
            <p className="text-lg font-bold mb-2">Nenhum departamento</p>
            <p className={`text-sm ${mutedClass}`}>Comece criando um novo departamento acima</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {folders.map((folder, i) => (
              <div key={folder.id} className={`rounded-xl border p-5 transition-all ${cardClass}`}>
                <div className="flex items-start gap-3.5 mb-4">
                  <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${badgeClass}`}>
                    <FolderIcon size={19} weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === folder.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameFolder(folder.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => handleRenameFolder(folder.id)}
                        className={`w-full rounded-lg border px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary text-sm ${inputClass}`}
                      />
                    ) : (
                      <>
                        <h3 className="font-bold text-[15px] truncate">{folder.name}</h3>
                        <p className={`text-xs mt-0.5 ${mutedClass}`}>
                          {folder.presentations.length} apresentação{folder.presentations.length !== 1 ? "ões" : ""}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => navigate(`/folders/${folder.id}`)}
                    className="flex-1 px-3.5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(folder.id);
                      setEditingName(folder.name);
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
                    disabled={i >= folders.length - 1}
                    className={`w-9 h-9 rounded-lg grid place-items-center transition ${i >= folders.length - 1 ? "opacity-30 cursor-not-allowed" : chipClass}`}
                    title="Descer"
                  >
                    <CaretDown size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
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
