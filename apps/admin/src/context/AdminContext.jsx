"use client";

import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { backendURL } from "@/src/lib/api";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("aToken");
    if (stored) setAToken(stored);
  }, []);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState(false);

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/admin/all-doctors`,
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeAvailability = async (doctorId) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/admin/change-availability`,
        { doctorId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const { data } = await axios.get(
        `${backendURL}/api/admin/appointments${queryString ? "?" + queryString : ""}`,
        { headers: { aToken } }
      );
      if (data.success) {
        setAppointments(data.appointments);
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/admin/cancel-appointment`,
        { appointmentId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
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
      const { data } = await axios.get(`${backendURL}/api/admin/dashboard`, {
        headers: { aToken },
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

  const getAllHospitals = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/api/admin/all-hospitals?limit=100`,
        { headers: { aToken } }
      );
      if (data.success) {
        setHospitals(data.hospitals || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error fetching hospitals:", error);
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendURL,
    doctors,
    hospitals,
    getAllHospitals,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashboardData,
    getDashboardData,
  };
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContextProvider;
