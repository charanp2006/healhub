"use client";

import { ToastProvider } from "@/src/components/ui/Toast";

export default function ToastWrapper({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}