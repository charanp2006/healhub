"use client";

import { useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HospitalContext } from "@/src/context/HospitalContext";
import { DoctorContext } from "@/src/context/DoctorContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Login from "./Login";
import MobileAppBar from "./MobileAppBar";
import MobileTabBar from "./MobileTabBar";
import { SplashScreen } from "@healhub/ui/splash";

const AUTH_ROUTES = [
  "/doctor-add-blog",
  "/doctor-analytics",
  "/doctor-appointments",
  "/doctor-availability",
  "/doctor-blogs",
  "/doctor-dashboard",
  "/doctor-profile",
  "/hospital-add-blog",
  "/hospital-add-doctor",
  "/hospital-billings",
  "/hospital-blogs",
  "/hospital-dashboard",
  "/hospital-doctors",
  "/hospital-manage-rooms",
  "/hospital-panel-analytics",
  "/hospital-profile",
];

const PanelShell = ({ children }) => {
  const { hToken } = useContext(HospitalContext);
  const {
    dToken,
    profileData: doctorProfile,
    getProfileData: fetchDoctorProfile,
  } = useContext(DoctorContext);
  const pathname = usePathname();

  useEffect(() => {
    if (dToken && !doctorProfile) {
      fetchDoctorProfile();
    }
  }, [dToken, doctorProfile, fetchDoctorProfile]);

  useEffect(() => {
    let title = "Healhub Clinic";
    if (hToken) {
      title = "Clinic Panel";
    } else if (dToken) {
      title =
        doctorProfile && doctorProfile.name
          ? `${doctorProfile.name} - Doctor`
          : "Doctor Panel";
    }
    document.title = title;
  }, [dToken, hToken, doctorProfile]);

  if (!hToken && !dToken) {
    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    return (
      <>
        <SplashScreen
          title="Welcome to Healhub Clinic"
          subtitle="Manage your clinic, doctors, appointments and billing effortlessly."
        />
        {isAuthRoute ? <Login /> : <div className="bg-background-base min-h-screen">{children}</div>}
      </>
    );
  }

  return (
    <>
      <SplashScreen
        title="Welcome to Healhub Clinic"
        subtitle="Manage your clinic, doctors, appointments and billing effortlessly."
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