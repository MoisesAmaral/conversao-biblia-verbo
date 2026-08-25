import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { claimSession, heartbeatSession, releaseSession } from "../lib/sessionGuard";

export interface SessionBlock {
  deviceLabel: string | null;
  claimedAt: string | null;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; sessionBlock?: SessionBlock }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  idleWarning: boolean;
  continueSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Traduz as mensagens de erro mais comuns do Supabase Auth — o resto (raro)
// passa a mensagem original, melhor que nada. Não cobre o bloqueio de sessão
// única: isso não é um erro do Supabase Auth, é uma regra nossa por cima de
// um login que teve sucesso — por isso signIn() retorna sessionBlock à parte.
function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (message.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (message.includes("For security purposes")) return "Muitas tentativas seguidas. Aguarde um instante e tente de novo.";
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [idleWarning, setIdleWarning] = useState(false);
  const lastActivityAt = useRef(Date.now());
  const lastHeartbeatAt = useRef(0);

  useEffect(() => {
    // /reset-password é onde os links de convite e recuperação de senha caem
    // (redirect_to fixo em AuthContext/admin-create-seller/hotmart-webhook).
    // A sessão que chega ali é temporária, só pra trocar a senha — reivindicar
    // o dispositivo agora derrubaria essa mesma sessão se a conta já estiver
    // em uso em outra máquina (ex.: app desktop aberto), fazendo o link parecer
    // "inválido" mesmo sendo válido. A reivindicação de verdade acontece depois,
    // no próximo carregamento normal da página (já fora de /reset-password).
    const isRecoveryLanding = window.location.pathname === "/reset-password";

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session && !isRecoveryLanding) {
        // Reafirma a sessão deste dispositivo (idempotente pro mesmo session_id).
        // Só falha de verdade se um admin liberou a vaga e outra máquina assumiu
        // enquanto esta aba estava aberta/adormecida — nesse caso desloga aqui.
        const claim = await claimSession();
        if (!claim.ok) {
          await supabase.auth.signOut({ scope: "local" });
          setSession(null);
          setLoading(false);
          return;
        }
      }
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) lastActivityAt.current = Date.now();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fechar a aba não é um evento confiável para liberar uma sessão (e uma aba
  // pode fechar enquanto outra da mesma conta continua em uso). Por isso a
  // presença é renovada só enquanto há atividade e expira no banco após 5 min.
  useEffect(() => {
    if (!session) {
      setIdleWarning(false);
      return;
    }

    let disposed = false;
    const signOutInactive = async () => {
      if (disposed) return;
      await releaseSession();
      await supabase.auth.signOut({ scope: "local" });
      setSession(null);
      setIdleWarning(false);
    };
    const touch = async () => {
      if (disposed) return;
      lastActivityAt.current = Date.now();
      setIdleWarning(false);
      if (lastActivityAt.current - lastHeartbeatAt.current < 30_000) return;
      lastHeartbeatAt.current = lastActivityAt.current;
      if (!(await heartbeatSession())) await signOutInactive();
    };
    const onActivity = () => { void touch(); };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    const timer = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityAt.current;
      if (idleFor >= 5 * 60_000) {
        void signOutInactive();
      } else if (idleFor >= 4 * 60_000) {
        setIdleWarning(true);
      }
    }, 10_000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      events.forEach((event) => window.removeEventListener(event, onActivity));
    };
  }, [session?.access_token]);

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateAuthError(error.message) };

    const claim = await claimSession();
    if (!claim.ok) {
      await supabase.auth.signOut({ scope: "local" });
      if (claim.error === "session_in_use") {
        return { error: null, sessionBlock: { deviceLabel: claim.deviceLabel, claimedAt: claim.claimedAt } };
      }
      if (claim.error === "account_inactive") return { error: "Esta conta está inativa. Fale com o suporte." };
      return { error: "Não foi possível entrar. Tente novamente." };
    }
    return { error: null };
  };

  const signOut = async () => {
    await releaseSession();
    await supabase.auth.signOut({ scope: "local" });
  };

  const continueSession = async () => {
    lastActivityAt.current = Date.now();
    lastHeartbeatAt.current = lastActivityAt.current;
    setIdleWarning(false);
    if (!(await heartbeatSession())) {
      await supabase.auth.signOut({ scope: "local" });
      setSession(null);
    }
  };

  const sendPasswordReset: AuthContextType["sendPasswordReset"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? translateAuthError(error.message) : null };
  };

  const updatePassword: AuthContextType["updatePassword"] = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? translateAuthError(error.message) : null };
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, sendPasswordReset, updatePassword, idleWarning, continueSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
