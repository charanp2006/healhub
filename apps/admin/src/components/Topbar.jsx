"use client";
import { useState, useEffect, useRef, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CalendarDays,
  Stethoscope,
  Building2,
  LayoutDashboard,
  Clock,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@healhub/ui/theme";
import { AdminContext } from "@/src/context/AdminContext";

const TITLES = {
  "/admin-dashboard": "Dashboard",
  "/all-appointments": "Appointments",
  "/doctor-list": "Doctors",
  "/hospitals-list": "Hospitals",
  "/hospitals-mgmt": "Hospital Management",
  "/manage-rooms": "Manage Rooms & Beds",
  "/add-doctor": "Add Doctor",
  "/add-hospital": "Add Hospital",
  "/add-blog": "Add Blog",
  "/blogs-list": "Blog Posts",
  "/analytics": "Analytics",
  "/hospital-analytics": "Hospital Analytics",
};

const QUICK_LINKS = [
  { label: "Dashboard", href: "/admin-dashboard", Icon: LayoutDashboard },
  { label: "Appointments", href: "/all-appointments", Icon: CalendarDays },
  { label: "Doctors", href: "/doctor-list", Icon: Stethoscope },
  { label: "Hospitals", href: "/hospitals-list", Icon: Building2 },
];

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    title: "New appointment booked",
    desc: "Priya Sharma booked a video consult with Dr. Mehta.",
    time: "2 min ago",
    Icon: CalendarDays,
    tone: "blue",
  },
  {
    id: 2,
    title: "Doctor registered",
    desc: "Dr. Rohan Verma joined City Hospital.",
    time: "1 hr ago",
    Icon: Stethoscope,
    tone: "primary",
  },
  {
    id: 3,
    title: "Revenue milestone",
    desc: "Weekly platform revenue crossed ₹2,00,000.",
    time: "Yesterday",
    Icon: Sparkles,
    tone: "emerald",
  },
];

const notifTone = {
  blue: "bg-[#3b82f6]/10 text-[#3b82f6]",
  primary: "bg-primary/10 text-primary",
  emerald: "bg-[#10b981]/10 text-[#10b981]",
};

const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setAToken } = useContext(AdminContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState("");
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const logout = () => {
    setAToken("");
    localStorage.removeItem("aToken");
    router.push("/");
  };

  const title = TITLES[pathname] || "Admin Panel";

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-border bg-background-card/75 px-5 backdrop-blur-xl sm:px-8 md:flex">
      {/* Title + date */}
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold leading-tight text-text-primary">{title}</h1>
        <p className="hidden text-xs text-text-dim sm:block">{dateLabel}</p>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center rounded-xl border border-border bg-background-muted px-3 md:flex">
          <Search size={15} className="mr-2 text-text-dim" />
          <input
            className="w-44 bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-dim lg:w-56"
            placeholder="Search patients, doctors…"
            aria-label="Search"
          />
          <kbd className="ml-2 hidden rounded-md border border-border bg-background-card px-1.5 py-0.5 text-[10px] font-medium text-text-dim lg:block">
            ⌘K
          </kbd>
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-background-muted hover:text-text-primary cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background-card" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-background-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">Notifications</p>
                <span className="flex items-center gap-1 rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3b82f6]">
                  <Clock size={11} /> Live
                </span>
              </div>

              <div className="max-h-80 divide-y divide-border overflow-y-auto">
                {DUMMY_NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-background-muted"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notifTone[n.tone]}`}>
                      <n.Icon size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">{n.title}</p>
                      <p className="mt-0.5 text-xs text-text-secondary leading-snug">{n.desc}</p>
                      <p className="mt-1 text-[11px] text-text-dim">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-3">
                <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background-muted/50 px-3 py-2.5">
                  <Sparkles size={14} className="text-primary" />
                  <p className="text-xs font-medium text-text-secondary">
                    Full notifications coming soon
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-background-card py-1.5 pl-1.5 pr-2 transition-colors hover:bg-background-muted cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
              A
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-text-primary">Admin</span>
              <span className="flex items-center gap-1 text-[11px] text-text-dim">
                <ShieldCheck size={11} className="text-primary" /> Superuser
              </span>
            </span>
            <ChevronDown size={15} className={`text-text-dim transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-background-card shadow-xl">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">Admin</p>
                <p className="text-xs text-text-dim">Healhub Admin CMS</p>
              </div>
              <div className="p-1.5">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-text-dim">
                  Quick links
                </p>
                {QUICK_LINKS.map(({ label, href, Icon }) => (
                  <button
                    key={href}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(href);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background-muted hover:text-text-primary cursor-pointer"
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-1.5">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#ef4444] transition-colors hover:bg-[#ef4444]/10 cursor-pointer"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;