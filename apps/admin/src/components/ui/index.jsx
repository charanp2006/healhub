"use client";
export { default as Card } from "./Card";
export { default as PageContainer } from "./PageContainer";
export { default as PageHeader } from "./PageHeader";
import { TrendingUp, TrendingDown } from "lucide-react";

export const TONES = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-[#3b82f6]/10 text-[#3b82f6]",
  violet: "bg-[#8b5cf6]/10 text-[#8b5cf6]",
  emerald: "bg-[#10b981]/10 text-[#10b981]",
  amber: "bg-[#f59e0b]/10 text-[#f59e0b]",
  rose: "bg-[#ef4444]/10 text-[#ef4444]",
  slate: "bg-[#64748b]/10 text-[#64748b]",
};

export const TintIcon = ({ Icon, tone = "primary", size = 20, className = "" }) => (
  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]} ${className}`}>
    <Icon size={size} strokeWidth={2} />
  </span>
);

export const Badge = ({
  children,
  tone = "primary",
  dot = false,
  className = "",
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const TrendBadge = ({ value }) => {
  if (value === undefined || value === null || value === "") return null;
  if (value === 0)
    return <span className="text-xs font-medium text-text-dim">0%</span>;
  return value > 0 ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#10b981]/10 px-2 py-0.5 text-xs font-semibold text-[#10b981]">
      <TrendingUp size={12} /> +{value}%
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/10 px-2 py-0.5 text-xs font-semibold text-[#ef4444]">
      <TrendingDown size={12} /> {value}%
    </span>
  );
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20",
    secondary: "border border-border bg-background-card text-text-primary hover:bg-background-muted",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-background-muted",
    danger: "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-5 py-2.5 text-sm rounded-xl",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const StatCard = ({
  label,
  value,
  Icon,
  tone = "primary",
  trend,
  caption,
  footer,
  className = "",
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-border bg-background-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}
  >
    <div className="flex items-start justify-between gap-3">
      {Icon && <TintIcon Icon={Icon} tone={tone} />}
      {trend !== undefined && <TrendBadge value={trend} />}
    </div>
    <p className="mt-4 text-2xl font-bold tracking-tight text-text-primary md:text-[1.7rem]">
      {value ?? "—"}
    </p>
    <p className="mt-0.5 text-sm font-medium text-text-secondary">{label}</p>
    {caption && <p className="mt-1 text-xs text-text-dim">{caption}</p>}
    {footer && <div className="mt-3 border-t border-border pt-3 text-xs text-text-secondary">{footer}</div>}
  </div>
);

export const EmptyState = ({ icon, title = "Nothing here yet", description, className = "" }) => (
  <div className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
    {icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-background-muted text-text-dim">
        {icon}
      </div>
    )}
    <p className="text-sm font-semibold text-text-primary">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>}
  </div>
);

export const SectionHeader = ({ title, subtitle, action, className = "" }) => (
  <div className={`flex items-start justify-between gap-3 mb-4 ${className}`}>
    <div>
      <h3 className="font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-text-dim">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const CardHeader = ({ title, subtitle, action = null }) => (
  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
    <div>
      <h3 className="font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-text-dim">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const TableWrap = ({ children, className = "" }) => (
  <div className={`overflow-x-auto bg-background-card rounded-2xl border border-border shadow-sm ${className}`}>
    {children}
  </div>
);

export const TH = ({ children, className = "" }) => (
  <th className={`whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary ${className}`}>
    {children}
  </th>
);

export const TD = ({ children, className = "" }) => (
  <td className={`whitespace-nowrap px-5 py-3.5 text-sm text-text-primary ${className}`}>
    {children}
  </td>
);

export const fieldCls =
  "w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15";
export const labelCls = "text-xs font-semibold uppercase tracking-wide text-text-secondary";
export const fieldGroupCls = "flex flex-col gap-1.5";

export const Pagination = ({ page, totalPages, onPrev, onNext }) =>
  totalPages <= 1 ? null : (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background-muted hover:text-text-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        Prev
      </button>
      <span className="text-sm text-text-secondary">
        Page <span className="font-semibold text-text-primary">{page}</span> of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background-muted hover:text-text-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );