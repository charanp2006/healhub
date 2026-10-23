"use client";

import React, { useState, useEffect } from "react";
import { BRAND_LOGO, LOGO_ALT } from "@healhub/ui/images";
import axios from "axios";
import { useContext } from "react";
import { toast } from "react-toastify";
import { DoctorContext } from "@/src/context/DoctorContext";
import { HospitalContext } from "@/src/context/HospitalContext";
import { Eye, EyeOff, Building2, Stethoscope, Loader2 } from "lucide-react";

const Login = () => {
  const [state, setState] = useState("Hospital");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    document.title = "Healhub Clinic";
  }, []);

  const { setHToken, backendURL } = useContext(HospitalContext);
  const { setDToken, backendURL: doctorBackendURL } = useContext(DoctorContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedRole = localStorage.getItem("rememberedRole");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    if (rememberedRole) {
      setState(rememberedRole);
    }
  }, []);

  const handleRoleChange = (role) => {
    setState(role);
    setPassword("");
    setShowPassword(false);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedRole", state);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedRole");
      }

      if (state === "Hospital") {
        const { data } = await axios.post(`${backendURL}/api/hospital/login`, {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("hToken", data.token);
          setHToken(data.token);
          toast.success("Welcome back, Clinic!");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          `${doctorBackendURL}/api/doctor/login`,
          {
            email,
            password,
          }
        );
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success("Welcome back, Doctor!");
        } else {
          toast.error(data.message);
        }
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

  const roleConfig = {
    Hospital: {
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-500",
    },
    Doctor: {
      icon: Stethoscope,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-500",
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-100 dark:from-[#03151f] dark:to-[#0a3a3a] flex items-center justify-center p-4">
      <form onSubmit={onSubmitHandler} className="w-full max-w-md">
        <div className="bg-background-card rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
              <img
                src={BRAND_LOGO}
                alt={LOGO_ALT}
                className="w-72 h-30 mx-auto object-contain mb-2"
              />
            <p className="text-text-secondary text-sm">Clinic &amp; Doctor Portal</p>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-background-muted rounded-xl">
            {["Hospital", "Doctor"].map((role) => {
              const RoleIcon = roleConfig[role].icon;
              const isActive = state === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `bg-background-card shadow-sm ${roleConfig[role].color}`
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <RoleIcon size={16} />
                  <span className="hidden sm:inline">{role}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              {state === "Hospital" ? "Hospital Login" : "Doctor Login"}
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Enter your credentials to access the {state.toLowerCase()}{" "}
              dashboard
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
            className="w-full mt-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          <p className="text-center text-xs text-text-dim mt-6">
            Secure login powered by JWT authentication
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;