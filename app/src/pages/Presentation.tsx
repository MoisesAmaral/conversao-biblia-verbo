import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { presentationBus } from "../lib/presentationBus";
import { PresentVerseData } from "../types";
import logoMark from "../assets/logo-mark.png";

type Theme = "dark" | "light" | "blue" | "sepia";

const THEME_STYLES: Record<Theme, { bg: string; text: string; ref: string }> = {
  dark: { bg: "#000000", text: "#ffffff", ref: "#94a3b8" },
  light: { bg: "#f8f8f0", text: "#1a1a1a", ref: "#555555" },
  blue: { bg: "#0a1628", text: "#e0f0ff", ref: "#7eb8f7" },
  sepia: { bg: "#1a0f00", text: "#f5ddb0", ref: "#c4a96a" },
};

export default function Presentation() {
  const { profile } = useApp();

  const [verse, setVerse] = useState<PresentVerseData | null>(null);
  const [fontSize, setFontSize] = useState(72);
  const [theme, setTheme] = useState<Theme>((profile?.default_theme as Theme) || "dark");
  const [visible, setVisible] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [fitScale, setFitScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const churchName = profile?.church_name ?? "";
  const churchLogo = profile?.church_logo_path ? supabase.storage.from("church-logos").getPublicUrl(profile.church_logo_path).data.publicUrl : "";
  const safeMargins = profile?.safe_margins ?? true;
  const autoFitFont = profile?.auto_fit_font ?? true;
  const transitionMode = profile?.transition ?? "fade";

  useEffect(() => {
    if (profile?.default_font_size) setFontSize(profile.default_font_size);
    if (profile?.default_theme) setTheme(profile.default_theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Anuncia presença pra aba do operador (que reenvia o último verso/comando, se houver)
  // e avisa quando fecha, pra o operador saber que a Tela 2 não está mais aberta.
  useEffect(() => {
    presentationBus.announceOpen();
    const handleBeforeUnload = () => presentationBus.announceClosed();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      presentationBus.announceClosed();
    };
  }, []);

  useEffect(() => {
    return presentationBus.subscribe((msg) => {
      if (msg.type === "show-verse") {
        setVerse(msg.data);
        setVisible(true);
        setBlackout(false);
        setAnimKey((k) => k + 1);
      } else if (msg.type === "command") {
        if (msg.cmd.type === "theme") setTheme(msg.cmd.value);
        if (msg.cmd.type === "fontSize") setFontSize(msg.cmd.value);
        if (msg.cmd.type === "clear") { setVisible(false); setBlackout(false); }
        if (msg.cmd.type === "black") { setVisible(false); setBlackout(true); }
      }
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") presentationBus.requestNavigate("next");
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") presentationBus.requestNavigate("prev");
      else if (e.key === "Escape") window.close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Auto-fit: single-pass measurement — shrink to fit the safe area, never grow past authored size
  useLayoutEffect(() => {
    if (!autoFitFont || !visible || blackout) {
      setFitScale(1);
      return;
    }
    setFitScale(1);
    const raf = requestAnimationFrame(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      const availableH = container.clientHeight;
      const neededH = content.scrollHeight;
      if (neededH > availableH && neededH > 0) {
        setFitScale(Math.max(0.35, availableH / neededH));
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [autoFitFont, visible, blackout, verse?.text, verse?.title, fontSize]);

  const t = THEME_STYLES[theme];
  const isCustomSlide = visible && !!verse?.background;
  const effectiveFontSize = fontSize * fitScale;
  const bgTransition = transitionMode === "fade" ? "background 0.4s ease" : "none";
  const contentAnimation = transitionMode === "fade" ? "fadeIn 0.5s ease" : "none";

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: blackout ? "#000000" : isCustomSlide ? verse!.background : t.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: safeMargins ? "10vw" : "4vw",
        overflow: "hidden",
        transition: bgTransition,
      }}
    >
      {blackout ? null : visible && verse && isCustomSlide ? (
        <div
          key={animKey}
          ref={contentRef}
          style={{
            width: "100%",
            textAlign: verse.align || "center",
            display: "flex",
            flexDirection: "column",
            alignItems: verse.align === "left" ? "flex-start" : verse.align === "right" ? "flex-end" : "center",
            animation: contentAnimation,
          }}
        >
          {verse.title && (
            <p style={{ color: verse.titleColor || "#ffffff", fontSize: `${effectiveFontSize}px`, lineHeight: 1.2, fontFamily: "Archivo, system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.01em", margin: "0 0 3vh", whiteSpace: "pre-line" }}>
              {verse.title}
            </p>
          )}
          {verse.text && (
            <p style={{ color: verse.titleColor || "#ffffff", opacity: 0.85, fontSize: `${Math.round(effectiveFontSize * 0.5)}px`, lineHeight: 1.5, fontFamily: "Archivo, system-ui, sans-serif", fontWeight: 500, whiteSpace: "pre-line", margin: 0 }}>
              {verse.text}
            </p>
          )}
        </div>
      ) : visible && verse ? (
        <div key={animKey} ref={contentRef} style={{ textAlign: "center", maxWidth: "90vw", animation: contentAnimation }}>
          <p style={{ color: t.text, fontSize: `${effectiveFontSize}px`, lineHeight: 1.45, fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: "italic", fontWeight: 400, textShadow: theme === "dark" ? "0 2px 20px rgba(0,0,0,0.8)" : "none", marginBottom: "5vh", letterSpacing: "0.01em", whiteSpace: "pre-line" }}>
            {verse.text}
          </p>
          <p style={{ color: t.ref, fontSize: `${Math.round(effectiveFontSize * 0.38)}px`, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {verse.reference}
          </p>
        </div>
      ) : (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "2vh" }}>
          {churchLogo ? (
            <img src={churchLogo} alt="logo" style={{ width: "26vw", height: "26vw", objectFit: "contain", marginBottom: "1vh" }} />
          ) : (
            <img src={logoMark} alt="Bíblia Verbo" style={{ width: "18vw", height: "18vw", objectFit: "contain", marginBottom: "1vh", opacity: 0.8 }} />
          )}

          {churchName && (
            <p style={{ color: t.text, fontSize: "3.5vw", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, letterSpacing: "0.04em", opacity: 0.9, margin: 0 }}>
              {churchName}
            </p>
          )}

          <div style={{ width: "6vw", height: "2px", background: t.ref, opacity: 0.4, borderRadius: "2px" }} />

          <p style={{ color: t.text, fontSize: "1.8vw", fontFamily: "Georgia, serif", fontStyle: "italic", opacity: 0.5, margin: 0 }}>
            Bíblia Verbo
          </p>

          <p style={{ display: "flex", alignItems: "center", gap: "0.5vw", color: t.text, fontSize: "0.75vw", fontFamily: '"JetBrains Mono", ui-monospace, monospace', textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.3, margin: "0.4vh 0 0" }}>
            <span style={{ display: "inline-block", width: "0.8vw", height: "0.8vw", borderRadius: "50%", background: "#c8102e" }} />
            feito pela 123devs
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
