import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { claimSession, releaseSession } from "../lib/sessionGuard";

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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        // Reafirma a sessão deste dispositivo (idempotente pro mesmo session_id).
        // Só falha de verdade se um admin liberou a vaga e outra máquina assumiu
        // enquanto esta aba estava aberta/adormecida — nesse caso desloga aqui.
        const claim = await claimSession();
        if (!claim.ok) {
          await supabase.auth.signOut();
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
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateAuthError(error.message) };

    const claim = await claimSession();
    if (!claim.ok) {
      await supabase.auth.signOut();
      if (claim.error === "session_in_use") {
        return { error: null, sessionBlock: { deviceLabel: claim.deviceLabel, claimedAt: claim.claimedAt } };
      }
      return { error: "Não foi possível entrar. Tente novamente." };
    }
    return { error: null };
  };

  const signOut = async () => {
    await releaseSession();
    await supabase.auth.signOut();
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
    <AuthContext.Provider value={{ session, loading, signIn, signOut, sendPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
