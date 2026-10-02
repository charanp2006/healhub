"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { LogOut } from "lucide-react";
import { LOGO, LOGO_ALT } from "@healhub/ui/images";
import { ThemeToggle } from "@healhub/ui/theme";
import { AdminContext } from "@/src/context/AdminContext";

// Mobile-only sticky app bar. Desktop layout uses Topbar.
const MobileAppBar = () => {
  const router = useRouter();
  const { setAToken } = useContext(AdminContext);

  const logout = () => {
    setAToken("");
    localStorage.removeItem("aToken");
    router.push("/");
  };

  return (
    <div className="mobile-app-bar md:hidden">
      <div className="flex items-center justify-between border-b border-border bg-background-card/80 px-4 h-14 backdrop-blur-xl">
        <button
          onClick={() => router.push("/admin-dashboard")}
          className="flex items-center gap-2 touch-none-outline"
          aria-label="Home"
        >
          <img className="w-10 h-8.5" src={LOGO} alt={LOGO_ALT} />
          <span className="text-xl font-bold text-[#179E8D]">
            Heal<span className="text-[#179E8D]">hub</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle size={20} />
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-[#ef4444]/10 text-[#ef4444] touch-none-outline"
            aria-label="Logout"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAppBar;