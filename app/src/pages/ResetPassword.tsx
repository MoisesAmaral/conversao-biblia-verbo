import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { supabase } from "../lib/supabase";
import { claimSession } from "../lib/sessionGuard";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // O link do e-mail de recuperação abre uma sessão temporária via
  // detectSessionInUrl — esperamos esse evento antes de liberar o formulário,
  // pra não mostrar "link inválido" só porque o Supabase ainda não processou.
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setValidLink(true);
        setReady(true);
      }
    });

    // Se o evento já tiver disparado antes deste componente montar, confirma
    // pela sessão atual em vez de ficar esperando pra sempre.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidLink(true);
      setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: updateError } = await updatePassword(password);
    setLoading(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    // A sessão desta página não passou pela reivindicação de dispositivo (ver
    // AuthContext) — reivindica agora, com a senha já definida, pra não cair
    // sem sessão no primeiro heartbeat depois de entrar em "/".
    await claimSession();
    setDone(true);
    setTimeout(() => navigate("/", { replace: true }), 2000);
  }

  if (!ready) return null;

  if (!validLink) {
    return (
      <AuthLayout title="Link inválido ou expirado" subtitle="Peça um novo link de redefinição">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-danger/15 grid place-items-center text-danger">
            <Warning size={28} weight="fill" />
          </div>
          <p className="text-dark-text-muted text-sm max-w-xs">
            Esse link já foi usado ou expirou. Solicite um novo na tela de "esqueci minha senha".
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #b23a45, #7a1622)" }}
          >
            Pedir novo link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Senha redefinida" subtitle="Redirecionando...">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-success/15 grid place-items-center text-success">
            <CheckCircle size={28} weight="fill" />
          </div>
          <p className="text-dark-text-muted text-sm">Sua senha foi atualizada com sucesso.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Defina sua nova senha" subtitle="Escolha uma senha forte para sua conta">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-dark-text-muted text-xs font-mono font-medium uppercase tracking-wider mb-2">
            Nova senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-dark-surface border border-dark-border2 rounded-xl px-4 py-3 text-dark-text-primary text-sm outline-none focus:border-primary transition-colors placeholder-dark-text-muted"
            autoComplete="new-password"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-dark-text-muted text-xs font-mono font-medium uppercase tracking-wider mb-2">
            Confirmar nova senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-dark-surface border border-dark-border2 rounded-xl px-4 py-3 text-dark-text-primary text-sm outline-none focus:border-primary transition-colors placeholder-dark-text-muted"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-xl">
            <p className="text-danger text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!password || !confirmPassword || loading}
          className="w-full py-3.5 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #b23a45, #7a1622)" }}
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </AuthLayout>
  );
}
