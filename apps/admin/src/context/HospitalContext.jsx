"use client";

import { useState, createContext, useEffect } from "react";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { backendURL } from "@/src/lib/api";

export const HospitalContext = createContext();

const HospitalContextProvider = ({ children }) => {
  const [hToken, setHToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hToken");
    if (stored) setHToken(stored);
  }, []);
  const [doctors, setDoctors] = useState([]);
  const [dashboardData, setDashboardData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getHospitalDashboard = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/api/hospital/panel/dashboard`,
        { headers: { hToken } }
      );
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in getHospitalDashboard:", error);
      toast.error(error.message);
    }
  };

  const getHospitalDoctors = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/api/hospital/panel/doctors`,
        { headers: { hToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in getHospitalDoctors:", error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/api/hospital/panel/profile`,
        { headers: { hToken } }
      );
      if (data.success) {
        setProfileData(data.profileData);
      }
    } catch (error) {
      toast.error(error.message);
      console.log("Error while fetching hospital profile data", error);
    }
  };

  const value = {
    hToken,
    setHToken,
    backendURL,
    doctors,
    setDoctors,
    getHospitalDoctors,
    dashboardData,
    setDashboardData,
    getHospitalDashboard,
    profileData,
    setProfileData,
    getProfileData,
  };

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
};

export default HospitalContextProvider;
