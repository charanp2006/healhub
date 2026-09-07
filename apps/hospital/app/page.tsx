// @ts-nocheck
"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminContext } from "@/src/context/AdminContext";
import { DoctorContext } from "@/src/context/DoctorContext";
import { HospitalContext } from "@/src/context/HospitalContext";
import { LandingPage } from "@healhub/ui/landing";

const ClinicLanding = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { hToken } = useContext(HospitalContext);
  const router = useRouter();

  useEffect(() => {
    if (dToken) router.replace("/doctor-dashboard");
    else if (hToken) router.replace("/hospital-dashboard");
  }, [dToken, hToken, router]);

  if (dToken || hToken || aToken) return null;

  return (
    <LandingPage
      badge="CLINIC & DOCTOR PORTAL"
      title="Manage your clinic"
      highlight="with Healhub."
      description="Bookings, patients, doctors and billing — everything your clinic needs, in one secure dashboard. Sign in to continue."
      primaryLabel="Open Clinic Dashboard"
      primaryHref="/hospital-dashboard"
      features={[
        "Multi-role access",
        "Appointment management",
        "Room & billing tools",
      ]}
    />
  );
};

export default ClinicLanding;