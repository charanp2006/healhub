// @ts-nocheck
"use client";
import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "@/src/context/DoctorContext";
import { AppContext } from "@/src/context/AppContext";
import { toast } from "react-toastify";
import { CalendarCheck, CircleCheck, ChevronLeft, ChevronRight, X } from "lucide-react";

const DoctorAppointments = () => {
  const { dToken, appointments, getDoctorAppointments, completeDoctorAppointment, cancelDoctorAppointment } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currencySymbol } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;
  const [loadingAction, setLoadingAction] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (dToken) getDoctorAppointments(); }, [dToken]);

  const handleAction = async (action, appointmentId) => {
    setLoadingAction(`${action}-${appointmentId}`);
    try {
      if (action === "complete") { await completeDoctorAppointment(appointmentId); }
      else if (action === "cancel") { await cancelDoctorAppointment(appointmentId); }
    } catch (error) { toast.error(error.message); }
    finally { setLoadingAction(null); }
  };

  const totalPages = Math.ceil(appointments?.length / appointmentsPerPage) || 1;
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = appointments?.slice(startIndex, startIndex + appointmentsPerPage) || [];
  return (
    <div className="w-full max-w-4xl m-5">
      <p className="mb-3 text-lg font-medium text-text-primary">All Appointments</p>
      <div className="bg-background-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1.5fr] gap-1 py-3 px-6 bg-background-muted border-b border-border">
          <p className="text-xs font-semibold text-text-dim uppercase tracking-wide">#</p>
          <p className="text-xs font-semibold text-text-dim uppercase tracking-wide">Patient</p>
          <p className="text-xs font-semibold text-text-dim uppercase tracking-wide">Age</p>
          <p className="text-xs font-semibold text-text-dim uppercase tracking-wide">Date & Time</p>
          <p className="text-xs font-semibold text-text-dim uppercase tracking-wide">Doctor Fee</p>
          <p className="text-xs font-semibold text-text-dim uppercase tracking-wide">Action</p>
        </div>
        {paginatedAppointments.map((item, index) => (
          <div className="flex flex-wrap justify-between gap-2 sm:grid sm:grid-cols-[1fr_2fr_1fr_1fr_2fr_1.5fr] text-text-secondary py-3 px-6 border-b border-border hover:bg-background-muted/50 transition-colors items-center" key={index}>
            <p className="hidden sm:block text-text-dim font-medium">{startIndex + index + 1}</p>
            <div className="flex items-center gap-3">
              <img className="w-8 h-8 rounded-full bg-background-muted object-cover" src={item.userData?.image} alt="" />
              <div><p className="text-text-primary font-medium">{item.userData?.name}</p></div>
            </div>
            <p className="text-sm">{calculateAge(item.userData?.dob) || "N/A"}</p>
            <p className="text-sm">{slotDateFormat(item.slotDate) + ", " + item.slotTime}</p>
            <p className="font-semibold text-text-primary">{currencySymbol}{item.amount}</p>
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-emerald-500 text-xs font-medium">Completed</p>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => handleAction("cancel", item._id)} disabled={loadingAction === `cancel-${item._id}`} className="flex items-center gap-1 text-sm text-text-secondary border border-border px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer disabled:opacity-50">
                  <X size={14} />{loadingAction === `cancel-${item._id}` ? "..." : "Cancel"}
                </button>
                <button onClick={() => handleAction("complete", item._id)} disabled={loadingAction === `complete-${item._id}`} className="flex items-center gap-1 text-sm text-white bg-emerald-500 px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50">
                  <CircleCheck size={14} />{loadingAction === `complete-${item._id}` ? "..." : "Complete"}
                </button>
              </div>
            )}
          </div>
        ))}
        {paginatedAppointments.length === 0 && (<div className="py-12 text-center text-text-dim"><CalendarCheck size={32} className="mx-auto mb-3 opacity-40" /><p>No appointments found</p></div>)}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-full disabled:opacity-40 cursor-pointer hover:bg-background-muted transition-colors"><ChevronLeft size={14} />Prev</button>
          <span className="text-sm text-text-secondary">Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-full disabled:opacity-40 cursor-pointer hover:bg-background-muted transition-colors">Next<ChevronRight size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
