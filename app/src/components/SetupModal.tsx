import { useRef, useState, ChangeEvent } from "react";
import { X } from "@phosphor-icons/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

interface Props {
  onClose?: () => void;
}

export default function SetupModal({ onClose }: Props) {
  const { session } = useAuth();
  const { profile, refreshProfile } = useApp();
  const [churchName, setChurchName] = useState(profile?.church_name ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickLogo() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!churchName.trim() || !session) return;
    setSaving(true);
    setError("");

    try {
      let logoPath = profile?.church_logo_path ?? null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop() || "png";
        const path = `${session.user.id}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage.from("church-logos").upload(path, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        logoPath = path;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ church_name: churchName.trim(), church_logo_path: logoPath })
        .eq("id", session.user.id);
      if (updateError) throw updateError;

      await refreshProfile();
      onClose?.();
    } catch (e: any) {
      setError(e.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const currentLogoUrl = profile?.church_logo_path
    ? supabase.storage.from("church-logos").getPublicUrl(profile.church_logo_path).data.publicUrl
    : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-dark-surface border border-dark-border rounded-2xl p-8 w-full max-w-md shadow-window">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg grid place-items-center text-dark-text-muted hover:bg-dark-card hover:text-dark-text-primary transition-colors">
            <X size={16} />
          </button>
        )}

        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">⛪</span>
          <h2 className="text-dark-text-primary text-xl font-bold">Dados da igreja</h2>
          <p className="text-dark-text-muted text-sm mt-1">Personalize o app para sua igreja</p>
        </div>

        <div className="mb-5">
          <label className="text-dark-text-muted text-xs uppercase tracking-wider block mb-2">Logo da Igreja</label>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-xl border-2 border-dashed border-dark-border2 flex items-center justify-center bg-dark-bg shrink-0 overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={pickLogo}
            >
              {logoPreview || currentLogoUrl ? (
                <img src={logoPreview || currentLogoUrl || ""} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl">🖼</span>
              )}
            </div>
            <div>
              <button onClick={pickLogo} className="bg-dark-bg border border-dark-border2 hover:border-primary text-dark-text-secondary text-sm px-4 py-2 rounded-lg transition-colors block mb-1">
                Escolher imagem
              </button>
              <p className="text-dark-text-muted text-xs">PNG, JPG ou WebP</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-dark-text-muted text-xs uppercase tracking-wider block mb-2">Nome da Igreja *</label>
          <input
            type="text"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Ex: Igreja Batista Central"
            className="w-full bg-dark-bg border border-dark-border2 focus:border-primary rounded-lg px-4 py-3 text-dark-text-primary placeholder-dark-text-muted outline-none text-sm transition-colors"
            autoFocus
          />
        </div>

        {error && <p className="text-danger text-xs mb-4 text-center">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!churchName.trim() || saving}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? "Salvando..." : "Confirmar e entrar"}
        </button>

        <p className="text-dark-text-muted text-xs text-center mt-4">Você pode alterar estas informações depois pelo ícone de engrenagem.</p>
      </div>
    </div>
  );
}
