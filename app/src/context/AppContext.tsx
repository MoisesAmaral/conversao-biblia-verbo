import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { fetchVersions, fetchBooks, Version, BibleBook } from "../lib/bible";
import { presentationBus } from "../lib/presentationBus";
import { useAuth } from "./AuthContext";

export interface Profile {
  id: string;
  church_name: string;
  church_logo_path: string | null;
  ui_theme: string;
  default_version_id: string | null;
  safe_margins: boolean;
  auto_fit_font: boolean;
  transition: "fade" | "none";
  default_theme: "dark" | "light" | "blue" | "sepia";
  default_font_size: number;
}

interface AppContextType {
  versions: Version[];
  books: BibleBook[];
  currentVersion: Version | null;
  setVersion: (v: Version) => void;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isSeller: boolean;
  presentationActive: boolean;
  openPresentation: () => void;
  closePresentation: () => void;
  toggleFullscreen: () => void;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PROFILE_FIELDS = {
  church_name: "",
  church_logo_path: null,
  ui_theme: "dark",
  default_version_id: null,
  safe_margins: true,
  auto_fit_font: true,
  transition: "fade" as const,
  default_theme: "dark" as const,
  default_font_size: 72,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentationActive, setPresentationActive] = useState(presentationBus.isOpen);
  const presentationWindowRef = useRef<Window | null>(null);

  useEffect(() => presentationBus.onOpenChange(setPresentationActive), []);

  const openPresentation = useCallback(() => {
    // Nome fixo na janela: clicar de novo com o mesmo nome só foca a mesma aba, sem abrir outra.
    const win = window.open("/presentation", "biblia-verbo-tela2", "popup,width=1280,height=720");
    if (win) {
      presentationWindowRef.current = win;
      win.focus();
    }
  }, []);

  const closePresentation = useCallback(() => {
    presentationWindowRef.current?.close();
    presentationWindowRef.current = null;
  }, []);

  const toggleFullscreen = useCallback(() => {
    // Best-effort: navegadores só permitem tela cheia via gesto do usuário no próprio
    // documento. Se isso for bloqueado nesta janela, o caminho manual (arrastar pra
    // TV e apertar tela cheia lá) continua funcionando — é a limitação já documentada
    // no plano.
    try {
      const win = presentationWindowRef.current;
      if (!win || win.closed) return;
      const doc = win.document;
      if (doc.fullscreenElement) doc.exitFullscreen?.();
      else doc.documentElement.requestFullscreen?.();
    } catch {}
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) return data as Profile;

    // Primeiro acesso: cria a linha de perfil com valores padrão (permitido pela
    // policy profiles_insert_own — só da própria linha).
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: userId, ...DEFAULT_PROFILE_FIELDS })
      .select("*")
      .single();
    return (created as Profile) ?? null;
  }, []);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [vs, bs, p, statusRes] = await Promise.all([
          fetchVersions(),
          fetchBooks(),
          loadProfile(session!.user.id),
          supabase.from("account_status").select("role").eq("id", session!.user.id).maybeSingle(),
        ]);
        if (cancelled) return;
        setVersions(vs);
        setBooks(bs);
        setProfile(p);
        setIsAdmin(statusRes.data?.role === "admin");
        setIsSeller(statusRes.data?.role === "seller");

        const match = vs.find((v) => v.id === p?.default_version_id) ?? vs[0] ?? null;
        setCurrentVersion(match);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Erro ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [session, loadProfile]);

  const setVersion = (v: Version) => {
    setCurrentVersion(v);
    if (session) {
      supabase.from("profiles").update({ default_version_id: v.id }).eq("id", session.user.id).then();
    }
  };

  const refreshProfile = async () => {
    if (!session) return;
    const p = await loadProfile(session.user.id);
    setProfile(p);
  };

  return (
    <AppContext.Provider
      value={{
        versions, books, currentVersion, setVersion,
        profile, refreshProfile, isAdmin, isSeller,
        presentationActive, openPresentation, closePresentation, toggleFullscreen,
        loading, error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de um AppProvider");
  return ctx;
}
