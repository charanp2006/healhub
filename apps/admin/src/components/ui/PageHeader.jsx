"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  as = "h1",
}) => {
  const Tag = as;
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-text-dim mb-1.5" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-text-secondary font-medium">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          <Tag className="text-2xl font-bold tracking-tight text-text-primary">{title}</Tag>
        </div>
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
    </div>
  );
};

export default PageHeader;