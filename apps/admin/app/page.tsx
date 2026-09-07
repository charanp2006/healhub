// @ts-nocheck
"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminContext } from "@/src/context/AdminContext";
import { LandingPage } from "@healhub/ui/landing";

const AdminLanding = () => {
  const { aToken } = useContext(AdminContext);
  const router = useRouter();

  useEffect(() => {
    if (aToken) router.replace("/admin-dashboard");
  }, [aToken, router]);

  if (aToken) return null;

  return (
    <LandingPage
      badge="ADMIN PORTAL"
      title="Run your hospital"
      highlight="with Healhub."
      description="Manage doctors, hospitals, appointments, billings and analytics from a single command center. Sign in to continue."
      primaryLabel="Open Admin Dashboard"
      primaryHref="/admin-dashboard"
      features={[
        "Secure admin access",
        "Hospital & doctor mgmt",
        "Revenue analytics",
      ]}
    />
  );
};

export default AdminLanding;