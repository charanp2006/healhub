"use client";

// NOTE: Component for the MOBILE layer only. Currently UNWIRED (not rendered
// anywhere) — see the mobile/desktop layer-separation plan. Adding it to a
// page/layout is the next step, AFTER desktop verification.
//
// Desktop is NOT affected by this component.

import { useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, UserRound } from "lucide-react";
import { LOGO as HealhubLogo, LOGO_ALT } from "@healhub/ui/images";
import { ThemeToggle } from "@healhub/ui/theme";
import { assets } from "@/src/assets/assets";
import { AppContext } from "@/src/context/AppContext";

const MobileAppHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { token, userData } = useContext(AppContext);

  const isHome = pathname === "/";

  return (
    <div className="mobile-app-bar md:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        {isHome ? (
          <div className="flex items-center gap-2">
            <img className="w-10 h-8.5" src={HealhubLogo} alt={LOGO_ALT} />
            <span className="text-3xl font-bold text-[#179E8D]">
              Heal<span className="text-[#179E8D]">hub</span>
            </span>
          </div>
        ) : (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-text-primary touch-none-outline"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
            <span className="text-[15px] font-medium">Back</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle size={20} />
          {token && userData ? (
            <button
              onClick={() => router.push("/my-profile")}
              className="p-1.5 touch-none-outline"
              aria-label="Profile"
            >
              <img
                className="w-8 h-8 rounded-full object-cover border border-border"
                src={userData.image ? userData.image : assets.upload_icon.src}
                alt=""
              />
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="p-1.5 text-[#179E8D] touch-none-outline"
              aria-label="Login"
            >
              <UserRound size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileAppHeader;