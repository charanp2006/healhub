"use client";
import { ToastProvider } from "@/src/components/ui/Toast";
const ToastWrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
export default ToastWrapper;