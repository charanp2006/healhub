// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  HeartPulse,
  Target,
  Users,
} from "lucide-react";
import { assets } from "@/src/assets/assets";
import { BrandWordmark } from "@healhub/ui/brand";
import { RetroGrid } from "@healhub/ui/retro-grid";

const stats = [
  { value: "100+", label: "Verified Doctors" },
  { value: "50+", label: "Hospitals & Clinics" },
  { value: "24/7", label: "Care Access" },
];

const features = [
  {
    Icon: Building2,
    title: "Hospitals & Clinics Network",
    body: "Access a network of registered hospitals and clinics with verified doctors, real-time bed availability, and specialized departments.",
  },
  {
    Icon: CalendarClock,
    title: "Smart Scheduling",
    body: "Book appointments based on doctor availability, weekly schedules, and real-time slot management — no more waiting.",
  },
  {
    Icon: HeartPulse,
    title: "Health Insights",
    body: "Stay informed with curated health blogs from verified doctors and hospitals, plus analytics-driven care recommendations.",
  },
];

const About = () => {
  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background-card md:rounded-[2.5rem]">
        <div className="absolute inset-0" aria-hidden>
          <RetroGrid
            angle={65}
            cellSize={68}
            opacity={0.35}
            lineColor="rgba(32,195,174,0.18)"
            fadeColor="var(--s-bg-card)"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background-card/50 via-transparent to-background-card"
          aria-hidden
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-4 h-80 w-80 rounded-full bg-accent-cta/10 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col items-center px-6 py-16 text-center md:py-24 lg:px-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Who We Are
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
          >
            Building a healthier world,
            <br />
            one <BrandWordmark /> away
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base"
          >
            Healhub connects patients with registered hospitals and verified
            doctors — seamless appointment scheduling, real-time availability,
            and health insights, all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              href="/doctors"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/50 active:scale-95"
            >
              Browse Doctors
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background-card px-8 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-primary/40 hover:bg-background-muted active:scale-95"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---------- Story ---------- */}
      <section className="my-16 grid grid-cols-1 items-center gap-10 md:my-24 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <img
            className="w-full rounded-[2rem] object-cover shadow-xl"
            src={assets.about_image.src}
            alt="About Healhub"
          />
          <div className="absolute -right-3 -top-3 flex items-center gap-2.5 rounded-2xl border border-border/70 bg-background-card/90 p-3 shadow-lg backdrop-blur sm:-right-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Users size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-text-primary">Trusted</p>
              <p className="text-[11px] text-text-secondary">by patients daily</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-5 text-sm leading-relaxed text-text-secondary md:text-base"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Our Story
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Healthcare, simplified
          </h2>
          <p>
            Welcome to Healhub, your comprehensive hospital and clinic
            management and healthcare booking platform. At Healhub, we simplify
            how patients connect with hospitals, clinics, doctors, and
            healthcare services — all in one place.
          </p>
          <p>
            Healhub brings together a network of registered hospitals and
            clinics with verified doctors, enabling seamless appointment
            scheduling, real-time availability tracking, analytics, and health
            blog resources. Whether you&apos;re a patient seeking care, a
            doctor managing your practice, or a hospital/clinic optimizing
            operations — Healhub is built for you.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-background-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <p className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-text-secondary md:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------- Vision ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-[2rem] border border-primary-soft bg-primary-soft/10 p-8 md:rounded-[2.5rem] md:p-12"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:gap-8">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
            <Target size={24} />
          </span>
          <div className="max-w-3xl">
            <p className="text-lg font-bold text-text-primary md:text-2xl">
              Our Vision
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary md:text-base">
              Our vision at Healhub is to create a unified healthcare ecosystem
              where patients, doctors, and hospitals collaborate effortlessly.
              We aim to bridge the gap between healthcare providers and the
              communities they serve, making quality care accessible and
              transparent for everyone.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ---------- Why Choose Us ---------- */}
      <section className="my-16 md:my-24">
        <div className="mb-8 text-center md:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Three promises we make
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary md:text-base">
            Every patient, doctor, and hospital on Healhub can count on these
            commitments.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map(({ Icon, title, body }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group flex flex-col gap-4 rounded-3xl border border-border bg-background-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon size={22} />
              </span>
              <p className="text-sm font-bold uppercase tracking-wider text-text-primary">
                {title}
              </p>
              <p className="text-[15px] leading-relaxed text-text-secondary">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;