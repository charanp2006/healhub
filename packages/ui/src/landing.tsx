"use client";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, BarChart3, CalendarClock, Lock } from "lucide-react";
import { RetroGrid } from "./retro-grid";
import { BrandWordmark } from "./brand";
import { BRAND_LOGO, LOGO_ALT } from "./images";
import { ThemeToggle } from "./theme";

const FEATURE_ICONS = [ShieldCheck, HeartPulse, Sparkles];

export function LandingPage({
  badge = "HEALHUB PORTAL",
  title = "Run your healthcare",
  highlight = "with Healhub.",
  description = "Sign in to manage your day-to-day operations — appointments, staff, billing and insights — all in one secure place.",
  primaryLabel = "Open Dashboard",
  primaryHref = "/",
  features = [
    "Secure sign in",
    "Live appointments",
    "Smart analytics",
  ],
}: {
  badge?: string;
  title?: string;
  highlight?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  features?: string[];
}) {
  const [highlightBefore, highlightAfter] = highlight.split("Healhub");
  return (
    <div className="relative min-h-screen overflow-hidden bg-background-base">
      {/* full-page retro grid backdrop */}
      <div className="absolute inset-0">
        <RetroGrid
          angle={65}
          cellSize={68}
          opacity={0.4}
          lineColor="rgba(32,195,174,0.22)"
          fadeColor="var(--s-bg-base)"
          backgroundColor="transparent"
          animationSpeed={2.5}
        />
      </div>

      {/* soft ambience over the grid */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background-base/40 via-transparent to-background-base" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-accent-cta/10 blur-3xl"
        animate={{ x: [0, -60, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="absolute right-4 top-4 md:right-8 md:top-6 z-20 flex items-center justify-center rounded-full border border-border/80 bg-background-card/80 p-1 shadow-md backdrop-blur">
          <ThemeToggle size={20} />
        </div>

        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8"
        >
          <img
            src={BRAND_LOGO}
            alt={LOGO_ALT}
            className="h-16 w-auto object-contain md:h-20"
          />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-6xl"
        >
          {title}{" "}
          <span className="text-text-primary">{highlightBefore}</span>
          <BrandWordmark />
          <span className="text-text-primary">{highlightAfter}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-5 max-w-xl text-center text-sm leading-relaxed text-text-secondary md:text-base"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href={primaryHref}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/50 active:scale-95"
          >
            {primaryLabel}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-dim">
            <Lock size={13} />
            Protected with JWT
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
            return (
              <div
                key={i}
                className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-background-card/80 px-4 py-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-medium text-text-primary">{feature}</span>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 border-t border-border/60 pt-8 text-center sm:grid-cols-3"
        >
          {[
            { Icon: CalendarClock, label: "Appointments", value: "Manage" },
            { Icon: BarChart3, label: "Insights", value: "Real-time" },
            { Icon: Lock, label: "Access", value: "Secure" },
          ].map((row, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <row.Icon size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">{row.value}</span>
              <span className="text-xs text-text-dim">{row.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-8 text-xs text-text-dim"
        >
          &copy; {new Date().getFullYear()} Healhub · Built for healthcare teams
        </motion.p>
      </div>
    </div>
  );
}