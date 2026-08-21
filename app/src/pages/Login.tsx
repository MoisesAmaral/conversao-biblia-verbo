import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const to = searchParams.get("to") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    navigate(to, { replace: true });
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para continuar"
      footer={
        <p className="text-center text-dark-text-muted text-xs">
          Ainda não é assinante?{" "}
          <a
            href="https://bibliaverbo.com.br"
            className="text-primary-light hover:brightness-110 underline"
          >
            Conheça a Bíblia Verbo
          </a>
        </p>
      }
    >
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-dark-text-muted text-xs font-mono font-medium uppercase tracking-wider">
              Senha
            </label>
            <Link to="/forgot-password" className="text-primary-light text-xs hover:brightness-110">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dark-surface border border-dark-border2 rounded-xl px-4 py-3 pr-11 text-dark-text-primary text-sm outline-none focus:border-primary transition-colors placeholder-dark-text-muted"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-dark-text-primary transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-xl">
            <p className="text-danger text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!email || !password || loading}
          className="w-full py-3.5 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #8257e5, #6842c2)" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
