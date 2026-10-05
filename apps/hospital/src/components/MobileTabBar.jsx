"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  BedDouble,
  CalendarClock,
  LayoutGrid,
  X,
  FileText,
  BarChart3,
  Plus,
  UserRound,

} from "lucide-react";
import { HospitalContext } from "@/src/context/HospitalContext";
import { DoctorContext } from "@/src/context/DoctorContext";

// Mobile-only fixed bottom navigation for the clinic portal (role-aware).
const MobileTabBar = () => {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const { hToken } = useContext(HospitalContext);
  const { dToken } = useContext(DoctorContext);

  const home = dToken ? "/doctor-dashboard" : "/hospital-dashboard";

  const primaryTabs = [
    { label: "Home", href: home, Icon: LayoutDashboard },
    ...(dToken
      ? [
          {
            label: "Appointments",
            href: "/doctor-appointments",
            Icon: CalendarDays,
          },
          { label: "Availability", href: "/doctor-availability", Icon: CalendarClock },
        ]
      : []),
    ...(hToken
      ? [
          { label: "Doctors", href: "/hospital-doctors", Icon: Stethoscope },
          { label: "Rooms", href: "/hospital-manage-rooms", Icon: BedDouble },
        ]
      : []),
  ];

  const moreLinks = dToken
    ? [
        { label: "Analytics", href: "/doctor-analytics", Icon: BarChart3 },
        { label: "Blog Posts", href: "/doctor-blogs", Icon: FileText },
        { label: "Add Blog", href: "/doctor-add-blog", Icon: Plus },
        { label: "Profile", href: "/doctor-profile", Icon: UserRound },
      ]
    : [
        { label: "Add Doctor", href: "/hospital-add-doctor", Icon: Plus },
        { label: "Blog Posts", href: "/hospital-blogs", Icon: FileText },

        {
          label: "Analytics",
          href: "/hospital-panel-analytics",
          Icon: BarChart3,
        },
        { label: "Profile", href: "/hospital-profile", Icon: UserRound },
      ];

  const isActive = (href) => pathname === href;
  const visible = primaryTabs.slice(0, 3);

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
          {visible.map((t) => (
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
            className="flex-1 flex flex-col items-center gap-1 pt-2 pb-1.5 touch-none-outline"
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