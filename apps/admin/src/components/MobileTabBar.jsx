"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  Building2,
  LayoutGrid,
  X,
  UserPlus,
  BedDouble,
  FileText,
  BarChart3,
  Plus,
} from "lucide-react";

const primaryTabs = [
  { label: "Dashboard", href: "/admin-dashboard", Icon: LayoutDashboard },
  { label: "Appointments", href: "/all-appointments", Icon: CalendarDays },
  { label: "Doctors", href: "/doctor-list", Icon: Stethoscope },
  { label: "Hospitals", href: "/hospitals-list", Icon: Building2 },
];

const moreLinks = [
  { label: "Add Doctor", href: "/add-doctor", Icon: UserPlus },
  { label: "Add Hospital", href: "/add-hospital", Icon: Plus },
  { label: "Hospital Mgmt", href: "/hospitals-mgmt", Icon: Building2 },
  { label: "Manage Rooms", href: "/manage-rooms", Icon: BedDouble },
  { label: "Add Blog", href: "/add-blog", Icon: Plus },
  { label: "Blog Posts", href: "/blogs-list", Icon: FileText },
  { label: "Analytics", href: "/analytics", Icon: BarChart3 },
  { label: "Hosp. Analytics", href: "/hospital-analytics", Icon: BarChart3 },
];

// Mobile-only fixed bottom navigation for the admin panel.
const MobileTabBar = () => {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isActive = (href) => pathname === href;

  const Item = ({ href, label, Icon, active }) => (
    <Link
      href={href}
      onClick={() => setShowMore(false)}
      className="flex-1 flex flex-col items-center gap-1 pt-2 pb-1.5 touch-none-outline"
    >
      <span
        className={`relative flex items-center justify-center transition-all duration-200 ${
          active ? "text-[#179E8D] -translate-y-0.5" : "text-text-dim"
        }`}
      >
        <Icon size={21} strokeWidth={active ? 2.4 : 1.9} />
        {active && (
          <span className="absolute -bottom-2.5 w-1 h-1 rounded-full bg-[#179E8D]" />
        )}
      </span>
      <span
        className={`text-[10px] font-medium ${
          active ? "text-[#179E8D]" : "text-text-dim"
        }`}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <>
      <nav className="mobile-tabbar md:hidden">
        <div className="flex items-end justify-around h-[64px]">
          {primaryTabs.map((t) => (
            <Item
              key={t.href}
              href={t.href}
              label={t.label}
              Icon={t.Icon}
              active={isActive(t.href)}
            />
          ))}
          <button
            onClick={() => setShowMore(true)}
            className={`flex-1 flex flex-col items-center gap-1 pt-2 pb-1.5 touch-none-outline ${
              showMore ? "text-[#179E8D]" : ""
            }`}
          >
            <span className="relative flex items-center justify-center text-text-dim">
              <LayoutGrid size={21} strokeWidth={1.9} />
            </span>
            <span className="text-[10px] font-medium text-text-dim">More</span>
          </button>
        </div>
      </nav>

      {/* More bottom sheet */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${showMore ? "" : "hidden"}`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowMore(false)}
        />
        <div className="absolute inset-x-0 bottom-0 bg-background-card rounded-t-3xl p-5 pb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-semibold text-text-primary">
              Quick Actions
            </p>
            <button
              onClick={() => setShowMore(false)}
              className="p-2 rounded-full bg-background-base touch-none-outline"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {moreLinks.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setShowMore(false)}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 touch-none-outline ${
                  isActive(href)
                    ? "bg-primary-soft border-[#179E8D]/30 text-[#179E8D]"
                    : "bg-background-card border-border text-text-secondary"
                }`}
              >
                <Icon size={20} className={isActive(href) ? "text-[#179E8D]" : ""} />
                <span className="text-[11px] font-medium text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileTabBar;