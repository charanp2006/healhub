"use client";
import AdminContextProvider from "@/src/context/AdminContext";
import DoctorContextProvider from "@/src/context/DoctorContext";
import HospitalContextProvider from "@/src/context/HospitalContext";
import AppContextProvider from "@/src/context/AppContext";
import { ThemeProvider } from "@healhub/ui/theme";
import ToastWrapper from "./ToastWrapper";

const Providers = ({ children }) => {
  return (
    <ThemeProvider>
      <AdminContextProvider>
        <DoctorContextProvider>
          <HospitalContextProvider>
            <AppContextProvider>
              <ToastWrapper>{children}</ToastWrapper>
            </AppContextProvider>
          </HospitalContextProvider>
        </DoctorContextProvider>
      </AdminContextProvider>
    </ThemeProvider>
  );
};

export default Providers;
