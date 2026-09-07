"use client";
import { useContext } from "react";
import { usePathname } from "next/navigation";
import { AdminContext } from "@/src/context/AdminContext";
import Login from "./Login";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
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
  "/billing",
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
    <>
      <SplashScreen
        title="Welcome to Healhub Admin"
        subtitle="Manage doctors, hospitals, appointments and revenue from one place."
      />
      <div className="bg-background-base min-h-screen">
        <div className="hidden md:block">
          <Navbar />
        </div>
        <MobileAppBar />
        <div className="flex items-start">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 min-h-screen pb-[96px] md:pb-0">{children}</main>
        </div>
        <MobileTabBar />
      </div>
    </>
  );
};

export default PanelShell;