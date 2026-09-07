"use client";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

export type SkeletonVariant = "text" | "circular" | "rectangular";
export type SkeletonAnimation = "shimmer" | "pulse" | "wave" | "fade";

export interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
  animationType?: SkeletonAnimation;
  animationSpeed?: number;
  backgroundColor?: string;
  highlightColor?: string;
  borderRadius?: number;
}

const OVERLAY: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

/**
 * Animated placeholder block (Framer-style). Supports text / circular /
 * rectangular variants and shimmer, pulse, wave or fade animations driven by
 * framer-motion. Fill colors default to theme-aware CSS variables and can be
 * overridden per-use. Every other skeleton in this module composes from it.
 */
export function Skeleton({
  className = "",
  variant = "rectangular",
  animationType = "shimmer",
  animationSpeed = 1.5,
  backgroundColor,
  highlightColor,
  borderRadius,
}: SkeletonProps) {
  const bg = backgroundColor ?? "var(--s-bg-muted)";
  const hl = highlightColor ?? "var(--s-skel-highlight)";

  const shape: CSSProperties | undefined =
    variant === "circular"
      ? { borderRadius: "50%", aspectRatio: 1 }
      : variant === "text"
        ? { borderRadius: borderRadius ?? 6 }
        : borderRadius != null
          ? { borderRadius }
          : undefined;

  let overlay: ReactNode;
  if (animationType === "shimmer") {
    overlay = (
      <motion.div
        style={{
          ...OVERLAY,
          background: `linear-gradient(90deg, transparent, ${hl}, transparent)`,
          transform: "translateX(-100%)",
        }}
        animate={{ transform: ["translateX(-100%)", "translateX(100%)"] }}
        transition={{ duration: animationSpeed, repeat: Infinity, ease: "linear" }}
      />
    );
  } else if (animationType === "wave") {
    overlay = (
      <motion.div
        style={{
          ...OVERLAY,
          background: `linear-gradient(90deg, ${bg}, ${hl}, ${bg})`,
          transform: "translateX(-100%)",
        }}
        animate={{ transform: ["translateX(-100%)", "translateX(100%)"] }}
        transition={{
          duration: animationSpeed,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    );
  } else if (animationType === "pulse") {
    overlay = (
      <motion.div
        style={{ ...OVERLAY, backgroundColor: hl }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: animationSpeed, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  } else {
    overlay = (
      <motion.div
        style={{ ...OVERLAY, backgroundColor: hl }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: animationSpeed, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`skeleton rounded-lg ${className}`}
      style={{ backgroundColor: bg, ...shape }}
    >
      {overlay}
    </div>
  );
}

/** Stacked text lines, last one shorter (classic paragraph shape). */
export function SkeletonText({
  lines = 3,
  className = "",
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** Small inline block for replacing "Loading..." count labels. */
export function SkeletonCount({ className = "" }: SkeletonProps) {
  return (
    <div className={className}>
      <Skeleton className="inline-block h-4 w-16 rounded align-middle" />
    </div>
  );
}

/** Avatar + title + meta row lists (matches list rows at real UI spacing). */
export function SkeletonList({
  rows = 5,
  className = "",
}: SkeletonProps & { rows?: number }) {
  return (
    <div className={`space-y-4 divide-y divide-transparent ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton variant="circular" className="h-11 w-11" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Responsive grid of image cards (hospitals, doctors, blogs). */
export function SkeletonCards({
  count = 6,
  className = "grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4",
}: SkeletonProps & { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-background-card p-4 md:p-5"
        >
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
          <Skeleton className="mt-4 h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Stat cards row + wide panels, tuned for the analytics dashboards. */
export function SkeletonDashboard({ className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background-card p-5 shadow-sm"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-4 h-6 w-20" />
            <Skeleton className="mt-2 h-3.5 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-background-card p-5 shadow-sm lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-5 h-48 w-full" />
        </div>
        <div className="rounded-xl border border-border bg-background-card p-5 shadow-sm">
          <SkeletonText lines={6} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background-card p-5 shadow-sm">
          <Skeleton className="h-4 w-40" />
          <SkeletonText lines={4} className="mt-5" />
        </div>
        <div className="rounded-xl border border-border bg-background-card p-5 shadow-sm">
          <Skeleton className="h-4 w-40" />
          <SkeletonText lines={4} className="mt-5" />
        </div>
      </div>
    </div>
  );
}

/** Detail/profile page: circular header, banner + info blocks. */
export function SkeletonSingle({ className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <Skeleton variant="circular" className="h-28 w-28" />
        <div className="w-full flex-1 space-y-3 text-center sm:text-left">
          <Skeleton className="mx-auto h-5 w-44 sm:mx-0" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Article/blog: headline + hero image + paragraphs. */
export function SkeletonArticle({ className = "" }: SkeletonProps) {
  return (
    <div className={`mx-auto max-w-3xl ${className}`}>
      <Skeleton className="mx-auto h-8 w-3/4" />
      <Skeleton className="mt-4 h-4 w-32" />
      <Skeleton className="mt-10 h-56 w-full rounded-2xl" />
      <div className="mt-10 space-y-4">
        {["w-full", "w-11/12", "w-full", "w-5/6"].map((w, i) => (
          <Skeleton key={i} className={`h-4 ${w}`} />
        ))}
      </div>
    </div>
  );
}

/** Drop-in wrapper for arbitrary skeleton bodies. */
export function SkeletonBox({ children }: { children: ReactNode }) {
  return <div aria-busy="true">{children}</div>;
}