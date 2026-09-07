"use client";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

let pushToast = null;

const ICONS = {
  success: { Icon: CheckCircle2, cls: "text-[#10b981]", bar: "bg-[#10b981]" },
  error: { Icon: XCircle, cls: "text-[#ef4444]", bar: "bg-[#ef4444]" },
  info: { Icon: Info, cls: "text-[#3b82f6]", bar: "bg-[#3b82f6]" },
  warning: { Icon: AlertTriangle, cls: "text-[#f59e0b]", bar: "bg-[#f59e0b]" },
};

export const toast = {
  success: (message) => pushToast?.({ type: "success", message }),
  error: (message) => pushToast?.({ type: "error", message }),
  info: (message) => pushToast?.({ type: "info", message }),
  warning: (message) => pushToast?.({ type: "warning", message }),
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toastData) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, ...toastData }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  useEffect(() => {
    pushToast = push;
    return () => {
      if (pushToast === push) pushToast = null;
    };
  }, [push]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
        role="region"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { Icon, cls, bar } = ICONS[t.type] || ICONS.info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border bg-background-card p-4 pr-10 shadow-lg shadow-black/5 backdrop-blur-xl"
              style={{ animation: "toast-in 0.25s ease-out" }}
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
              <span className={`mt-0.5 shrink-0 ${cls}`}>
                <Icon size={20} />
              </span>
              <p className="flex-1 pt-0.5 text-sm font-medium text-text-primary">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="absolute right-3 top-3 text-text-dim transition-colors hover:text-text-primary cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);