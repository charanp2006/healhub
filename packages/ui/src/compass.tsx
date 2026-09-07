"use client";
import { useEffect, useRef } from "react";

const NEEDLE_REST_OFFSET = 90;

export function AnimatedCompass() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const trackingRef = useRef(false);
  const targetDegRef = useRef(0);
  const rafPendingRef = useRef(false);

  const pointNeedle = (px: number, py: number) => {
    const wrap = wrapRef.current;
    const needle = needleRef.current;
    if (!wrap || !needle || !trackingRef.current) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    targetDegRef.current =
      Math.atan2(py - cy, px - cx) * (180 / Math.PI) + NEEDLE_REST_OFFSET;
    if (!rafPendingRef.current) {
      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        needle.style.transform = `rotate(${targetDegRef.current}deg)`;
        rafPendingRef.current = false;
      });
    }
  };

  useEffect(() => {
    const needle = needleRef.current;
    if (!needle) return;

    const enableTracking = () => {
      trackingRef.current = true;
      needle.classList.add("tracking");
      if (pointerRef.current) pointNeedle(pointerRef.current.x, pointerRef.current.y);
    };
    const onMouseMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      if (trackingRef.current) pointNeedle(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches.length) return;
      const t = e.touches[0];
      pointerRef.current = { x: t.clientX, y: t.clientY };
      if (trackingRef.current) pointNeedle(t.clientX, t.clientY);
    };

    needle.addEventListener("animationend", enableTracking, { once: true });
    const timeout = setTimeout(enableTracking, 3200);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      needle.removeEventListener("animationend", enableTracking);
      clearTimeout(timeout);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className="compass-wrap" aria-hidden>
      <svg viewBox="0 0 104 104" fill="none">
        <circle cx="52" cy="52" r="48" fill="var(--s-bg-card)" stroke="var(--s-border)" strokeWidth="2" />
        <circle cx="52" cy="52" r="40" fill="none" stroke="var(--primary-soft)" strokeWidth="1.5" />
        <g ref={needleRef} className="needle">
          <path d="M52 20 L60 52 L52 84 L44 52 Z" fill="var(--primary)" />
          <path d="M52 20 L60 52 L52 52 Z" fill="var(--accent-cta)" />
        </g>
        <circle cx="52" cy="52" r="4.5" fill="var(--primary-soft-dark)" />
        <circle cx="52" cy="14" r="2" fill="var(--s-text-secondary)" />
        <circle cx="52" cy="90" r="2" fill="var(--s-text-secondary)" />
        <circle cx="14" cy="52" r="2" fill="var(--s-text-secondary)" />
        <circle cx="90" cy="52" r="2" fill="var(--s-text-secondary)" />
      </svg>
    </div>
  );
}