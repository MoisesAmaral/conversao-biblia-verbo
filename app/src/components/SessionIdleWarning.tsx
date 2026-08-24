import { useAuth } from "../context/AuthContext";

export function SessionIdleWarning() {
  const { idleWarning, continueSession, signOut } = useAuth();

  if (!idleWarning) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 flex items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-2xl border border-dark-border bg-dark-card p-6 text-dark-text-primary shadow-2xl">
        <h2 className="text-lg font-bold">Você ainda está aí?</h2>
        <p className="mt-2 text-sm text-dark-text-muted">Por segurança, sua sessão será encerrada em menos de um minuto por inatividade.</p>
        <div className="mt-5 flex gap-3">
          <button onClick={() => void signOut()} className="flex-1 rounded-xl border border-dark-border px-4 py-2.5 text-sm font-semibold text-dark-text-muted hover:bg-dark-card2">Sair</button>
          <button onClick={() => void continueSession()} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">Continuar</button>
        </div>
      </div>
    </div>
  );
}
