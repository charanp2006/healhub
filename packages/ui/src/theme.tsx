"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerInsertedHTML } from "next/navigation";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

// Runs before React hydrates to avoid flash of the wrong theme.
// Injected via useServerInsertedHTML so it lives outside the React
// component tree — sidesteps React 19's inline <script> warning.
const THEME_SCRIPT = `(function(){try{var t=("light"===localStorage.getItem("${STORAGE_KEY}")||"dark"===localStorage.getItem("${STORAGE_KEY}")||"system"===localStorage.getItem("${STORAGE_KEY}"))?localStorage.getItem("${STORAGE_KEY}"):"system";var r=t==="system"?(window.matchMedia("${DARK_MODE_QUERY}").matches?"dark":"light"):t;var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r}catch(e){}})();`;

const ThemeContext = createContext<{
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
  ));

  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const apply = useCallback((next: Theme) => {
    const resolve = (value: Theme): ResolvedTheme =>
      value === "system"
        ? window.matchMedia(DARK_MODE_QUERY).matches
          ? "dark"
          : "light"
        : value;

    const resolved = resolve(next);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    setThemeState(next);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    let stored: Theme = "system";
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === "light" || value === "dark" || value === "system") {
        stored = value;
      }
    } catch {
      // ignore storage access errors
    }
    apply(stored);

    const media = window.matchMedia(DARK_MODE_QUERY);
    const onMediaChange = () => {
      let current: Theme = "system";
      try {
        const value = localStorage.getItem(STORAGE_KEY);
        if (value === "light" || value === "dark" || value === "system") {
          current = value;
        }
      } catch {
        // ignore storage access errors
      }
      if (current === "system") apply("system");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const value = event.newValue;
        const next: Theme =
          value === "light" || value === "dark" ? value : "system";
        apply(next);
      }
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [apply]);

  const setTheme = useCallback(
    (next: Theme) => {
      const style = document.createElement("style");
      style.textContent =
        "*,*::before,*::after{transition:none!important}";
      document.head.appendChild(style);
      apply(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore storage access errors
      }
      window.getComputedStyle(document.body);
      requestAnimationFrame(() => {
        setTimeout(() => document.head.removeChild(style), 1);
      });
    },
    [apply]
  );

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle({ size = 18 }: { size?: number }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`theme-toggle ${isDark ? "is-dark" : ""}`}
    >
      <Sun size={size} className="icon icon-sun" />
      <Moon size={size} className="icon icon-moon" />
    </button>
  );
}