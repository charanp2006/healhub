"use client";

import { useEffect, useMemo, useState } from "react";
import { apiEndpoints, type ApiEndpoint } from "@/lib/apiEndpoints";

const TOKEN_KEY = "healhub.api.directory.session";

const METHOD_COLORS: Record<string, string> = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

function groupLabel(path: string): string {
  const segment = path.split("/")[2];
  if (!segment) return "Root";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function MethodBadge({ method }: { method: string }) {
  return <span className={`m-badge m-${METHOD_COLORS[method] ?? "PATCH"}`}>{method}</span>;
}

function LoginCard({
  onSuccess,
  defaultError,
}: {
  onSuccess: () => void;
  defaultError?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(defaultError ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.token) {
        try {
          localStorage.setItem(TOKEN_KEY, data.token);
        } catch {}
        onSuccess();
        return;
      }
      setError(data.message || "Login failed. Please try again.");
    } catch {
      setError("Network error while contacting the API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">H</div>
        <h1 className="login-title">Healhub API Directory</h1>
        <p className="login-sub">
          Restricted access — sign in with admin credentials to browse all live
          endpoints.
        </p>
        {error && <div className="banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="dir-email">Email</label>
            <input
              id="dir-email"
              type="email"
              autoComplete="username"
              placeholder="admin@healhub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="dir-password">Password</label>
            <input
              id="dir-password"
              type="password"
              autoComplete="current-password"
              placeholder="• • • • • • • • •"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="hint">Uses the same admin credentials as the admin dashboard.</p>
      </div>
    </div>
  );
}

function Directory({ onLogout }: { onLogout: () => void }) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<string>("ALL");
  const [copied, setCopied] = useState<string | null>(null);
  const [health, setHealth] = useState<"checking" | "ok" | "degraded">("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json().catch(() => ({})))
      .then((data) => setHealth(data?.success === true ? "ok" : "degraded"))
      .catch(() => setHealth("degraded"));
  }, []);

  async function copyPath(path: string) {
    const url = new URL(path, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(path);
      window.setTimeout(() => setCopied((c) => (c === path ? null : c)), 1400);
    } catch {}
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apiEndpoints.filter((e) => {
      if (method !== "ALL" && !e.methods.includes(method as ApiEndpoint["methods"][number])) {
        return false;
      }
      if (q && !e.path.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [query, method]);

  const groups = useMemo(() => {
    const map = new Map<string, { path: string; methods: string[] }[]>();
    for (const e of filtered) {
      const label = groupLabel(e.path);
      const list = map.get(label) ?? [];
      list.push(e);
      map.set(label, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const methodsUsed = useMemo(() => {
    const set = new Set<string>();
    for (const e of apiEndpoints) for (const m of e.methods) set.add(m);
    return [...set].sort();
  }, []);

  const env = process.env.NODE_ENV === "production" ? "production" : "development";

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">H</div>
        <div className="titles">
          <h1>Healhub API · Endpoint Directory</h1>
          <p className="mono">
            {typeof window !== "undefined" ? window.location.origin : ""}
          </p>
        </div>
        <span className={`chip env`}>{env}</span>
        <span className={`chip ${health === "ok" ? "ok" : "degraded"}`}>
          {health === "checking"
            ? "health…"
            : health === "ok"
              ? "healthy"
              : "degraded"}
        </span>
        <button className="btn btn-ghost" type="button" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <div className="controls">
        <input
          className="search mono"
          type="search"
          placeholder="Search endpoints… e.g. appointment, hospital"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="method-filters">
          <button
            className={`m-filter ${method === "ALL" ? "active" : ""}`}
            type="button"
            onClick={() => setMethod("ALL")}
          >
            ALL
          </button>
          {methodsUsed.map((m) => (
            <button
              key={m}
              className={`m-filter ${method === m ? "active" : ""}`}
              type="button"
              onClick={() => setMethod(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <p className="count">
        Showing {filtered.length} of {apiEndpoints.length} endpoints
      </p>

      {groups.length === 0 ? (
        <div className="empty">No endpoints match your filters.</div>
      ) : (
        groups.map(([label, items]) => (
          <section className="group" key={label}>
            <h2 className="group-head">{label}</h2>
            <ul className="group-list">
              {items.map((e) => (
                <li className="e-row" key={e.path + e.methods.join("")}>
                  {e.methods.length === 0 ? (
                    <span className="m-badge m-PATCH">ALL</span>
                  ) : (
                    e.methods.map((m) => <MethodBadge key={m} method={m} />)
                  )}
                  <span className="e-path mono">{e.path}</span>
                  <button
                    className={`e-copy ${copied === e.path ? "copied" : ""}`}
                    type="button"
                    onClick={() => copyPath(e.path)}
                  >
                    {copied === e.path ? "Copied" : "Copy URL"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <div className="foot">
        <span className="mono">
          {filtered.length} endpoint{filtered.length === 1 ? "" : "s"} ·{" "}
          {methodsUsed.length} HTTP methods
        </span>
        <span>Healhub API · secure directory · session ends on sign out</span>
      </div>
    </div>
  );
}

export default function ApiDirectoryPage() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return Boolean(localStorage.getItem(TOKEN_KEY));
    } catch {
      return false;
    }
  });

  if (!authed) {
    return <LoginCard onSuccess={() => setAuthed(true)} />;
  }

  return (
    <Directory
      onLogout={() => {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {}
        setAuthed(false);
      }}
    />
  );
}