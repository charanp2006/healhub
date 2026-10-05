// @ts-nocheck
"use client";
import { useContext, useEffect } from "react";
import { DoctorContext } from "@/src/context/DoctorContext";
import { AppContext } from "@/src/context/AppContext";
import { CalendarCheck, Users, CircleDollarSign, CalendarMinus, TrendingUp, CircleCheck, Clock } from "lucide-react";
import { SkeletonDashboard } from "@healhub/ui";

const DoctorDashboard = () => {
  const { dToken, dashboardData, setDashboardData, getDashboardData } = useContext(DoctorContext);
  const { currencySymbol, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (dToken) { getDashboardData(); }
    return () => setDashboardData(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  const dashData = dashboardData;

  const stats = dashData ? [
    { icon: <CalendarCheck size={24} className="text-emerald-500" />, value: dashData.latestAppointments?.length || 0, label: "Latest Bookings" },
    { icon: <Users size={24} className="text-blue-500" />, value: dashData.patients || 0, label: "Patients" },
    { icon: <CircleDollarSign size={24} className="text-purple-500" />, value: `${currencySymbol}${dashData.earnings || 0}`, label: "Earnings" },
    { icon: <CalendarMinus size={24} className="text-red-500" />, value: dashData.cancelledAppointments || 0, label: "Cancelled" },
  ] : [];
  if (!dashData) {
    return <div className="m-5 w-full max-w-4xl"><SkeletonDashboard /></div>;
  }

  return (
    <div className="m-5 w-full max-w-4xl">
      <div className="flex flex-wrap gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-4 bg-background-card p-4 pr-24 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-background-muted rounded-xl">{s.icon}</div>
            <div>
              <p className="text-xl font-semibold text-text-primary">{s.value}</p>
              <p className="text-sm text-text-dim">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-background-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3 py-4 px-6 border-b border-border">
          <TrendingUp size={20} className="text-primary" />
          <p className="font-semibold text-text-primary">Latest Bookings</p>
        </div>
        <div className="divide-y divide-border">
          {dashData.latestAppointments?.map((item, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-4 hover:bg-background-muted transition-colors">
              <img className="w-10 h-10 rounded-full bg-background-muted object-cover" src={item.userData?.image} alt="" />
              <div className="flex-1">
                <p className="text-text-primary font-medium">{item.userData?.name}</p>
                <p className="text-sm text-text-dim">{slotDateFormat(item.slotDate)} {item.slotTime}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                {item.isCompleted && <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full"><CircleCheck size={12} /> Completed</span>}
                {item.isCancelled && <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-full"><CalendarMinus size={12} /> Cancelled</span>}
                {!item.isCompleted && !item.isCancelled && <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full"><Clock size={12} /> Upcoming</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
