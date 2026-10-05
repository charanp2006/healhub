"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  Building2,
  Hospital,
  BedDouble,
  UserPlus,
  PlusCircle,
  FilePlus,
  FileText,
  BarChart3,
  Activity,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { LOGO, LOGO_ALT } from "@healhub/ui/images";
import { AdminContext } from "@/src/context/AdminContext";

const NAV = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", href: "/admin-dashboard", Icon: LayoutDashboard },
      { label: "Appointments", href: "/all-appointments", Icon: CalendarDays },
      { label: "Doctors", href: "/doctor-list", Icon: Stethoscope },
      { label: "Hospitals", href: "/hospitals-list", Icon: Building2 },
    ],
  },
  {
    section: "Manage",
    items: [
      { label: "Hospital Mgmt", href: "/hospitals-mgmt", Icon: Hospital },
      { label: "Manage Rooms", href: "/manage-rooms", Icon: BedDouble },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "Add Doctor", href: "/add-doctor", Icon: UserPlus },
      { label: "Add Hospital", href: "/add-hospital", Icon: PlusCircle },
      { label: "Add Blog", href: "/add-blog", Icon: FilePlus },
      { label: "Blog Posts", href: "/blogs-list", Icon: FileText },
    ],
  },
  {
    section: "Insights",
    items: [
      { label: "Analytics", href: "/analytics", Icon: BarChart3 },
      { label: "Hospital Analytics", href: "/hospital-analytics", Icon: Activity },
    ],
  },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setAToken } = useContext(AdminContext);

  const logout = () => {
    setAToken("");
    localStorage.removeItem("aToken");
    router.push("/");
  };

  const isActive = (href) => pathname === href;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-background-card/80 backdrop-blur-xl transition-all duration-300 lg:flex ${
        collapsed ? "w-[76px]" : "w-[264px]"
      }`}
    >
      {/* Brand */}
      <div
        className={`flex items-center gap-3 border-b border-border px-4 h-16 shrink-0 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link href="/admin-dashboard" className={`flex items-center gap-2.5 min-w-0 ${collapsed ? "justify-center flex-1" : ""}`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <img className="h-8 w-8 object-contain" src={LOGO} alt={LOGO_ALT} />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold leading-tight text-text-primary">
                Healhub
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">
                Admin CMS
              </span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-background-muted hover:text-text-primary cursor-pointer"
          >
            <ChevronsLeft size={18} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background-card text-text-dim shadow-sm transition-colors hover:text-primary cursor-pointer"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim">
                {group.section}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map(({ label, href, Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={label}
                      className={`group relative flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-colors ${
                        collapsed ? "justify-center" : ""
                      } ${
                        active
                          ? "bg-primary-soft/60 text-primary"
                          : "text-text-secondary hover:bg-background-muted hover:text-text-primary"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-primary/15 text-primary"
                            : "bg-background-muted text-text-dim group-hover:text-text-secondary"
                        }`}
                      >
                        <Icon size={18} strokeWidth={active ? 2.2 : 1.9} />
                      </span>
                      {!collapsed && <span className="truncate">{label}</span>}
                      {!collapsed && active && (
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 shrink-0">
        <div
          className={`flex items-center gap-3 rounded-xl px-2 py-2.5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-muted text-sm font-bold text-primary">
            A
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-text-primary">Admin</span>
              <span className="block truncate text-xs text-text-dim">Superuser</span>
            </span>
          )}
          <button
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-[#ef4444]/10 hover:text-[#ef4444] cursor-pointer"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;