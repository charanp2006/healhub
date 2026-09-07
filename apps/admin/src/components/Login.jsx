"use client";
import { useState, useEffect, useContext } from "react";
import { BRAND_LOGO, LOGO_ALT } from "@healhub/ui/images";
import { AdminContext } from "@/src/context/AdminContext";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    document.title = "Healhub Admin Panel";
  }, []);

  const { setAToken, backendURL } = useContext(AdminContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const demoAdminEmail = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL;
  const demoAdminPassword = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD;

  const formatDemoValue = (value, label) =>
    value ? value : `Set ${label} in .env`;

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleDemoToggle = () => {
    setShowDemo((prev) => !prev);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const { data } = await axios.post(`${backendURL}/api/admin/login`, {
        email,
        password,
      });
      if (data.success) {
        localStorage.setItem("aToken", data.token);
        setAToken(data.token);
        toast.success("Welcome back, Admin!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Login error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-[#082032] dark:to-[#103a52] flex items-center justify-center p-4">
      <form onSubmit={onSubmitHandler} className="w-full max-w-md">
        <div className="bg-background-card rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
              <img
                src={BRAND_LOGO}
                alt={LOGO_ALT}
                className="w-72 h-30 mx-auto object-contain mb-2"
              />
            <p className="text-text-secondary text-sm">Admin Control Panel</p>
          </div>

          <div className="mb-6">
            <div className="w-fit flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-sm font-medium">
              <Shield size={16} />
              Admin
            </div>
            <h2 className="text-xl font-semibold text-text-primary mt-3">Admin Login</h2>
            <p className="text-text-secondary text-sm mt-1">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email Address
              </label>
              <input
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="text-sm text-text-secondary">
                Remember me
              </label>
            </div>
          </div>

          <button
            className="w-full mt-6 py-2.5 bg-primary text-white font-medium rounded-xl shadow-sm shadow-primary/25 hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <button
            type="button"
            onClick={handleDemoToggle}
            className="mt-4 w-full rounded-lg border border-border bg-background-muted py-2 text-sm font-semibold text-text-primary hover:bg-background-muted transition-colors"
          >
            Demo credentials
          </button>

          <p className="text-center text-xs text-text-dim mt-6">
            Secure login powered by JWT authentication
          </p>
        </div>
      </form>

      {showDemo && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-background-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">
                Demo Credentials
              </p>
              <button
                type="button"
                onClick={handleDemoToggle}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-4 text-xs text-text-primary">
              <div>
                <p className="font-medium text-text-primary">Admin</p>
                <p>
                  <span className="text-text-secondary">Email:</span>{" "}
                  <span className="font-mono text-text-primary">
                    {formatDemoValue(
                      demoAdminEmail,
                      "NEXT_PUBLIC_DEMO_ADMIN_EMAIL"
                    )}
                  </span>
                </p>
                <p>
                  <span className="text-text-secondary">Password:</span>{" "}
                  <span className="font-mono text-text-primary">
                    {formatDemoValue(
                      demoAdminPassword,
                      "NEXT_PUBLIC_DEMO_ADMIN_PASSWORD"
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;