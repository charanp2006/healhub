"use client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AnimatedCompass } from "./compass";
import { BRAND_LOGO, LOGO_ALT } from "./images";

const TYPES = ["dot", "heart", "plus"] as const;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  type: TYPES[i % TYPES.length],
  left: (i * 53) % 100,
  top: 58 + ((i * 31) % 38),
  delay: (i % 9) * 0.4,
  duration: 7 + (i % 5) * 1.4,
  size: 3 + (i % 3) * 3,
}));

export function NotFoundPage({
  title = "Page not found",
  subtitle = "The page you're looking for doesn't exist or may have been moved. Let's get you back on track.",
  homeLabel = "Back to home",
  homeHref = "/",
}: {
  title?: string;
  subtitle?: string;
  homeLabel?: string;
  homeHref?: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-base px-6">
      {/* ambient orbs */}
      <motion.div
        aria-hidden
        className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-accent-cta/10 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* dotted grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
        style={{
          backgroundImage: "radial-gradient(var(--s-border) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* floating particles: filled dots + outlined hearts/plus */}
      {PARTICLES.map((p, i) => {
        const shared = {
          initial: { opacity: 0 },
          animate: { y: [-10, -110], opacity: [0, 0.9, 0] },
          transition: {
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          },
        };

        if (p.type !== "dot") {
          const glyph = p.type === "heart" ? "♥" : "+";
          return (
            <motion.span
              key={i}
              aria-hidden
              className={`absolute select-none font-black leading-none ${
                p.type === "heart" ? "heart-stroke" : "plus-stroke"
              }`}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                fontSize: p.size * 1.6,
              }}
              {...shared}
            >
              {glyph}
            </motion.span>
          );
        }

        return (
          <motion.span
            key={i}
            aria-hidden
            className="absolute rounded-full bg-primary/50"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%` }}
            {...shared}
          />
        );
      })}

      <div className="relative z-10 w-full max-w-xl text-center">
        <motion.img
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src={BRAND_LOGO}
          alt={LOGO_ALT}
          className="mx-auto mb-8 h-16 w-auto object-contain md:h-20"
        />

        <motion.p
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-[6rem] md:text-[9rem] font-black leading-none tracking-tight"
        >
          <span className="bg-gradient-to-br from-primary via-primary-hover to-accent-cta bg-clip-text text-transparent">
            404
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="mt-6 flex items-center justify-center"
        >
          <AnimatedCompass />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-2xl font-semibold text-text-primary"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8"
        >
          <a
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-primary/40 active:scale-95"
          >
            <ArrowLeft size={15} />
            {homeLabel}
          </a>
        </motion.div>
      </div>
    </div>
  );
}