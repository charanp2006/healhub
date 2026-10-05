"use client";
import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { AdminContext } from "@/src/context/AdminContext";
import Login from "./Login";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileAppBar from "./MobileAppBar";
import MobileTabBar from "./MobileTabBar";
import { SplashScreen } from "@healhub/ui/splash";

const AUTH_ROUTES = [
  "/add-blog",
  "/add-doctor",
  "/add-hospital",
  "/admin-dashboard",
  "/all-appointments",
  "/analytics",
  "/blogs-list",
  "/doctor-list",
  "/hospital-analytics",
  "/hospitals-list",
  "/hospitals-mgmt",
  "/manage-rooms",
];

const PanelShell = ({ children }) => {
  const { aToken } = useContext(AdminContext);
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adminSidebarCollapsed");
    setCollapsed(stored === "1");
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("adminSidebarCollapsed", c ? "0" : "1");
      return !c;
    });
  };

  if (!aToken) {
    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    return (
      <>
        <SplashScreen
          title="Welcome to Healhub Admin"
          subtitle="Manage doctors, hospitals, appointments and revenue from one place."
        />
        {isAuthRoute ? <Login /> : <div className="bg-background-base min-h-screen">{children}</div>}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background-base">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]"
        }`}
      >
        <Topbar />
        <MobileAppBar />
        <main className="mx-auto w-full max-w-[1560px]">{children}</main>
        <MobileTabBar />
      </div>
    </div>
  );
};

export default PanelShell;