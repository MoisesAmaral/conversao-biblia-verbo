import { supabase } from "./supabase";

const SESSION_ID_KEY = "biblia_verbo_session_id";

// Identidade do dispositivo — gerada uma vez e reaproveitada em todo login
// futuro nesta mesma máquina/navegador, pra que reabrir/atualizar a página
// nunca se autobloqueie (claim_session é idempotente pro mesmo session_id).
export function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export function deviceLabel(): string {
  const ua = navigator.userAgent;
  const os = /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Navegador";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : "Navegador";
  return `${os} · ${browser}`;
}

export type ClaimResult =
  | { ok: true }
  | { ok: false; error: "session_in_use"; deviceLabel: string | null; claimedAt: string | null }
  | { ok: false; error: "account_inactive" }
  | { ok: false; error: "unknown"; message: string };

export async function claimSession(): Promise<ClaimResult> {
  const sessionId = getOrCreateSessionId();
  const { data, error } = await supabase.rpc("claim_session", {
    p_session_id: sessionId,
    p_device_label: deviceLabel(),
  });
  if (error) return { ok: false, error: "unknown", message: error.message };
  if (data?.ok) return { ok: true };
  if (data?.error === "session_in_use") {
    return { ok: false, error: "session_in_use", deviceLabel: data.device_label ?? null, claimedAt: data.claimed_at ?? null };
  }
  if (data?.error === "account_inactive") return { ok: false, error: "account_inactive" };
  return { ok: false, error: "unknown", message: data?.error ?? "Erro desconhecido." };
}

export async function releaseSession(): Promise<void> {
  const sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) return;
  await supabase.rpc("release_session", { p_session_id: sessionId });
}

export async function heartbeatSession(): Promise<boolean> {
  const sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) return false;

  const { data, error } = await supabase.rpc("heartbeat_session", { p_session_id: sessionId });
  return !error && data?.ok === true;
}
