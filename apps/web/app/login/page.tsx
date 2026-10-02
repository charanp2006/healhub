// @ts-nocheck
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AppContext } from "@/src/context/AppContext";

const Login = () => {
  const [state, setState] = useState("Sign up");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const adminPageLink = process.env.NEXT_PUBLIC_ADMIN_PAGE_LINK;
  const demoAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const demoAdminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const demoUserEmail = process.env.NEXT_PUBLIC_USER_EMAIL;
  const demoUserPassword = process.env.NEXT_PUBLIC_USER_PASSWORD;

  const { backendURL, token, setToken } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "Sign up") {
        const { data } = await axios.post(`${backendURL}/api/user/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Account created successfully!");
        } else {
          toast.error(data.message);
        }
      } else if (state === "Login") {
        const { data } = await axios.post(`${backendURL}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Welcome back!");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log("Error in authentication", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (newState) => {
    setState(newState);
    setPassword("");
    setShowPassword(false);
  };

  const handleDemoToggle = () => {
    setShowDemo((prev) => !prev);
  };

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center "
    >
      <div className="flex flex-col gap-3 m-auto items-start p-6 md:p-8 w-full sm:w-auto sm:min-w-96 max-w-md border rounded-2xl md:rounded-xl text-text-primary text-sm shadow-lg bg-background-card">
        <p className="text-2xl font-semibold">
          {state === "Sign up" ? "Create Account" : "Welcome Back"}
        </p>
        <p className="text-text-secondary">
          Please {state === "Sign up" ? "sign up" : "log in"} to book your
          appointment
        </p>
        {state === "Sign up" && (
          <div className="w-full">
            <p className="font-medium">Full Name</p>
            <input
              className="border border-border rounded-lg md:rounded w-full p-3 md:p-2.5 mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              type="text"
              placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              disabled={loading}
            />
          </div>
        )}
        <div className="w-full">
          <p className="font-medium">Email</p>
          <input
            className="border border-border rounded-lg md:rounded w-full p-3 md:p-2.5 mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            disabled={loading}
          />
        </div>
        <div className="w-full">
          <p className="font-medium">Password</p>
          <div className="relative">
            <input
              className="border border-border rounded-lg md:rounded w-full p-3 md:p-2.5 pr-12 md:pr-11 mt-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
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
        <button
          className="bg-primary text-white w-full py-2.5 my-2 rounded-md text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {state === "Sign up" ? "Creating Account..." : "Signing in..."}
            </>
          ) : state === "Sign up" ? (
            "Create Account"
          ) : (
            "Login"
          )}
        </button>

        <button
          type="button"
          onClick={handleDemoToggle}
          className="w-full rounded-md border border-border bg-background-muted py-2 text-sm font-semibold text-text-primary hover:bg-background-muted transition-colors"
        >
          Demo credentials
        </button>

        {state === "Sign up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => handleStateChange("Login")}
              className="text-primary underline cursor-pointer hover:text-primary/80"
            >
              login here
            </span>
          </p>
        ) : (
          <p>
            Don&apos;t have an account?{" "}
            <span
              onClick={() => handleStateChange("Sign up")}
              className="text-primary underline cursor-pointer hover:text-primary/80"
            >
              create account here
            </span>
          </p>
        )}
      </div>

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
                <p className="font-medium text-text-primary">User Login</p>
                <p>
                  <span className="text-text-secondary">Email:</span>{" "}
                  <span className="font-mono text-text-primary">
                    {demoUserEmail}
                  </span>
                </p>
                <p>
                  <span className="text-text-secondary">Password:</span>{" "}
                  <span className="font-mono text-text-primary">
                    {demoUserPassword}
                  </span>
                </p>
              </div>
              <div>
                <p className="font-medium text-text-primary">Admin Login</p>
                <p>
                  <span className="text-text-secondary">Email:</span>{" "}
                  <span className="font-mono text-text-primary">
                    {demoAdminEmail}
                  </span>
                </p>
                <p>
                  <span className="text-text-secondary">Password:</span>{" "}
                  <span className="font-mono text-text-primary">
                    {demoAdminPassword}
                  </span>
                </p>
                {adminPageLink ? (
                  <a
                    href={adminPageLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-primary hover:text-primary/80"
                  >
                    Open Admin Console
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-text-secondary">
                    Admin console link not configured.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default Login;
