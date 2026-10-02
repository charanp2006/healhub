// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "@/src/components/ui/Toast";
import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { assets } from "@/src/assets/assets";
import { BrandWordmark } from "@healhub/ui/brand";
import { RetroGrid } from "@healhub/ui/retro-grid";

const infoCards = [
  {
    Icon: MapPin,
    title: "Our Office",
    lines: ["Healhub Healthcare Solutions", "Bangalore, India"],
  },
  {
    Icon: Phone,
    title: "Call Us",
    lines: ["+91 98765 43210", "Mon – Sat, 9 AM – 6 PM"],
  },
  {
    Icon: Mail,
    title: "Email Us",
    lines: ["support@healhub.com", "We reply within 24 hours"],
  },
];

const inputCls =
  "w-full rounded-xl border border-border bg-background-base px-4 py-3 text-sm text-text-primary placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you! Your message has been sent. We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

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
            Get In Touch
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
          >
            Let&apos;s talk — <BrandWordmark />
            <br />
            is here to help
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base"
          >
            Questions, partnerships, or feedback — our team is here to help.
            Drop us a message and we&apos;ll get back to you within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* ---------- Body ---------- */}
      <section className="my-16 grid grid-cols-1 gap-8 md:my-24 lg:grid-cols-2 lg:gap-12">
        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-5"
        >
          {infoCards.map(({ Icon, title, lines }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-3xl border border-border bg-background-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-base font-bold text-text-primary">{title}</p>
                {lines.map((line) => (
                  <p key={line} className="mt-1 text-sm text-text-secondary">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-end gap-5 overflow-hidden rounded-3xl border border-primary-soft bg-primary-soft/10 p-6">
            <img
              className="hidden w-32 flex-shrink-0 rounded-2xl object-cover sm:block"
              src={assets.contact_image.src}
              alt="Contact Healhub"
            />
            <div className="flex-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                <Briefcase size={18} />
              </span>
              <p className="mt-3 text-base font-bold text-text-primary">
                Careers at Healhub
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                Learn more about our teams and job openings.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/50 active:scale-95">
                Explore Jobs
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[2rem] border border-border bg-background-card p-8 md:p-10"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Send A Message
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              We&apos;d love to hear from you
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="Your name"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="Your email"
            />
          </div>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className={inputCls}
            placeholder="Subject"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className={`${inputCls} resize-none`}
            placeholder="Tell us how we can help..."
          />
          <button
            type="submit"
            className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/50 active:scale-95"
          >
            Send Message
            <Send
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </motion.form>
      </section>
    </div>
  );
};

export default Contact;