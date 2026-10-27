"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { assets } from "@/src/assets/assets";
import { LOGO as HealhubLogo, LOGO_ALT } from "@healhub/ui/images";
import { ThemeToggle } from "@healhub/ui/theme";
import { AppContext } from "@/src/context/AppContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/doctors", label: "All Doctors" },
  { to: "/hospitals", label: "Hospitals & Clinics" },
  { to: "/blogs", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    localStorage.removeItem("profilePromptShown");
    router.push("/");
  };

  const [showMenu, setShowMenu] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="flex justify-between items-center text-sm py-4 mb-5 border-b border-b-border-light">
      <div
        onClick={() => router.push("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img className="w-10 h-8.5" src={HealhubLogo} alt={LOGO_ALT} />
        <div>
          <span className="text-3xl font-bold text-[#179E8D]">Heal</span>
          <span className="text-3xl font-bold text-[#179E8D]">hub</span>
        </div>
      </div>
      <ul className="md:flex items-start gap-5 font-medium hidden">
        {navLinks.map((link) => (
          <li key={link.to}>
            <Link href={link.to} className="py-1 block">
              {link.label}
              <hr
                className={`border-none outline-none h-0.5 bg-primary w-3/5 m-auto transition-all ${isActive(link.to) ? "block" : "hidden"}`}
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {token && userData ? (
          <div
            onClick={() => setDropdown((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer relative"
          >
            <img
              className="w-8 rounded-full"
              src={userData.image ? userData.image : assets.upload_icon.src}
              alt=""
            />
            <img className="w-2.5" src={assets.dropdown_icon.src} alt="" />
            <div
              className={`absolute top-0 right-0 pt-14 text-base font-medium text-text-secondary z-20 ${dropdown ? "block" : "hidden"}`}
            >
              <div className="min-w-48 bg-background-muted rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => router.push("/my-profile")}
                  className="hover:text-text-primary cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => router.push("/my-appointments")}
                  className="hover:text-text-primary cursor-pointer"
                >
                  My Appointments
                </p>
                <p onClick={logout} className="hover:text-text-primary cursor-pointer">
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create Account
          </button>
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon.src}
          alt=""
        />
        {/* ------- Mobile menu ------- */}
        <div
          className={`${showMenu ? "fixed w-full" : "h-0 w-0"} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-background-card transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <div className="flex items-center gap-2">
              <img
                className="w-10 h-8.5"
                src={HealhubLogo}
                alt={LOGO_ALT}
              />
              <div>
                <span className="text-3xl font-bold text-[#179E8D]">Heal</span>
                <span className="text-3xl font-bold text-[#179E8D]">hub</span>
              </div>
            </div>
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon.src}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  href={link.to}
                  onClick={() => setShowMenu(false)}
                  className="px-4 py-2 rounded inline-block"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
