import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const { error: resetError } = await sendPasswordReset(email.trim());
    setLoading(false);
    // Sempre mostramos sucesso, mesmo se o e-mail não existir — não confirmamos
    // pra quem tenta adivinhar e-mails cadastrados se uma conta existe ou não.
    if (resetError) {
      setError(resetError);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthLayout title="Verifique seu e-mail" subtitle="Enviamos um link de recuperação">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-success/15 grid place-items-center text-success">
            <CheckCircle size={28} weight="fill" />
          </div>
          <p className="text-dark-text-muted text-sm max-w-xs">
            Se <strong className="text-dark-text-primary">{email}</strong> estiver cadastrado, você vai
            receber um link para redefinir sua senha em instantes.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-primary-light text-sm hover:brightness-110 mt-2"
          >
            <ArrowLeft size={14} />
            Voltar para o login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Esqueci minha senha" subtitle="Informe seu e-mail para receber o link de redefinição">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-dark-text-muted text-xs font-mono font-medium uppercase tracking-wider mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@igreja.com"
            className="w-full bg-dark-surface border border-dark-border2 rounded-xl px-4 py-3 text-dark-text-primary text-sm outline-none focus:border-primary transition-colors placeholder-dark-text-muted"
            autoComplete="email"
            autoFocus
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-xl">
            <p className="text-danger text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!email || loading}
          className="w-full py-3.5 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #b23a45, #7a1622)" }}
        >
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </button>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-1.5 text-dark-text-muted text-sm hover:text-dark-text-primary transition"
        >
          <ArrowLeft size={14} />
          Voltar para o login
        </Link>
      </form>
    </AuthLayout>
  );
}
