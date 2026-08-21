import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import SetupModal from "./components/SetupModal";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Bible from "./pages/Bible";
import Chapter from "./pages/Chapter";
import Search from "./pages/Search";
import HymnDetail from "./pages/HymnDetail";
import Launcher from "./pages/Launcher";
import Presentation from "./pages/Presentation";
import Admin from "./pages/Admin";
import { getHymnEntryPath } from "./lib/lastHymn";

function ShellApp() {
  const { profile } = useApp();
  const [showSetup, setShowSetup] = useState(false);
  const needsSetup = profile !== null && !profile.church_name;

  return (
    <>
      <AppShell onOpenSettings={() => setShowSetup(true)}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bible" element={<Bible />} />
          <Route path="/chapter/:bookId/:chapter" element={<Chapter />} />
          <Route path="/search" element={<Search />} />
          <Route path="/hymns" element={<Navigate to={getHymnEntryPath()} replace />} />
          <Route path="/hymns/:number" element={<HymnDetail />} />
          <Route path="/launcher" element={<Launcher />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>

      {(showSetup || needsSetup) && <SetupModal onClose={needsSetup ? undefined : () => setShowSetup(false)} />}
    </>
  );
}

// A Tela 2 (rota /presentation) fica fora do AppShell de propósito — é uma janela
// separada, tela cheia, sem sidebar/header, aberta via window.open() a partir do
// AppContext.
function AuthenticatedApp() {
  const { loading, error } = useApp();

  if (loading) return null;

  if (error) {
    return (
      <div className="fixed inset-0 bg-dark-bg text-dark-text-primary flex items-center justify-center p-6">
        <p className="text-danger text-sm text-center max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/presentation" element={<Presentation />} />
      <Route path="/*" element={<ShellApp />} />
    </Routes>
  );
}

function Root() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            {session && (
              <AppProvider>
                <AuthenticatedApp />
              </AppProvider>
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}
