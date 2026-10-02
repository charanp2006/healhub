"use client";

import { useState, createContext, useEffect } from "react";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { backendURL } from "@/src/lib/api";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const [dToken, setDToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("dToken");
    if (stored) setDToken(stored);
  }, []);
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getDoctorAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/doctor/appointments`, {
        headers: { dToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        console.log("Failed to fetch appointments:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in getDoctorAppointments:", error);
      toast.error(error.message);
    }
  };

  const completeDoctorAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/doctor/complete-appointment`,
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error completing appointment:", error);
      toast.error(error.message);
    }
  };

  const cancelDoctorAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/doctor/cancel-appointment`,
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error cancelling appointment:", error);
      toast.error(error.message);
    }
  };

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/doctor/dashboard`, {
        headers: { dToken },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/doctor/profile`, {
        headers: { dToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
      }
    } catch (error) {
      toast.error(error.message);
      console.log("Error while fetching Users profile data", error);
    }
  };

  const value = {
    dToken,
    setDToken,
    backendURL,
    appointments,
    setAppointments,
    getDoctorAppointments,
    cancelDoctorAppointment,
    completeDoctorAppointment,
    dashboardData,
    setDashboardData,
    getDashboardData,
    profileData,
    setProfileData,
    getProfileData,
  };
  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;
