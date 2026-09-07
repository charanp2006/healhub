"use client";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { BRAND_LOGO, LOGO_ALT } from "./images";
import { RetroGrid } from "./retro-grid";

export const SPLASH_KEY = "healhub_splash_shown";
const MOBILE_BREAKPOINT = 768;

export function SplashScreen({
  title = "Welcome to Healhub",
  subtitle = "Your health, one tap away. Book appointments with trusted doctors and hospitals.",
  cta = "Get Started",
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const seen = window.localStorage.getItem(SPLASH_KEY);
    if (isMobile && !seen) {
      window.localStorage.setItem(SPLASH_KEY, "1");
      setVisible(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    document.body.style.overflow = "";
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white via-[#f0fdfa] to-[#ccfbf1] px-8">
      <div className="absolute inset-0">
        <RetroGrid
          angle={65}
          cellSize={60}
          opacity={0.35}
          lineColor="rgba(32,195,174,0.25)"
          fadeColor="transparent"
          backgroundColor="transparent"
          animationSpeed={2.5}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={BRAND_LOGO}
          alt={LOGO_ALT}
          className="w-72 h-30 object-contain animate-[splash-pop_0.8s_ease-out_both]"
        />
        <h1 className="mt-8 text-2xl font-semibold text-[#134e4a] text-center animate-[splash-fade-up_0.7s_ease-out_0.3s_both]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-center text-[#134e4a]/80 animate-[splash-fade-up_0.7s_ease-out_0.45s_both]">
          {subtitle}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-8 flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-transform active:scale-95 animate-[splash-fade-up_0.7s_ease-out_0.6s_both]"
        >
          {cta}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}