// @ts-nocheck
"use client";
import { useContext, useState, useEffect } from "react";
import { DoctorContext } from "@/src/context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Clock, Copy, Check, RotateCcw, Save, AlertCircle } from "lucide-react";

const DoctorAvailability = () => {
  const { backendURL, dToken, profileData, getProfileData } = useContext(DoctorContext);
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayKeyMap = { Mon: "monday", Tue: "tuesday", Wed: "wednesday", Thu: "thursday", Fri: "friday", Sat: "saturday", Sun: "sunday" };

  const [schedule, setSchedule] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedDay, setCopiedDay] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  // Grid granularity follows the doctor's own slotDuration so the times shown
  // here are exactly the times the booking engine will hand out.
  const slotDuration = Number(profileData?.slotDuration) > 0 ? Number(profileData.slotDuration) : 30;

  const toMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toTime = (mins) => { const h = Math.floor(mins / 60); const m = mins % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; };

  const slotsBetween = (start, end) => {
    if (!start || !end) return [];
    const slots = [];
    for (let t = toMinutes(start); t < toMinutes(end); t += slotDuration) slots.push(toTime(t));
    return slots;
  };

  const collapseSlots = (slots) => {
    if (!slots || slots.length === 0) return { enabled: false, startTime: "09:00", endTime: "09:00" };
    const sorted = [...slots].sort();
    return { enabled: true, startTime: sorted[0], endTime: toTime(toMinutes(sorted[sorted.length - 1]) + slotDuration) };
  };

  const timeSlots = {
    morning: ["09:00","09:30","10:00","10:30","11:00","11:30"],
    afternoon: ["12:00","12:30","13:00","13:30","14:00","14:30"],
    evening: ["15:00","15:30","16:00","16:30","17:00","17:30"],
    full: ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"]
  };

  const allTimeSlots = [...new Set(Object.values(timeSlots).flat())].sort();

  useEffect(() => {
    if (dToken) getProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  useEffect(() => {
    if (profileData?.schedule) {
      const normalizedSchedule = {};
      daysOfWeek.forEach(day => {
        const entry = profileData.schedule[dayKeyMap[day]] || profileData.schedule[day.toLowerCase()];
        normalizedSchedule[day] = entry && entry.enabled ? slotsBetween(entry.startTime, entry.endTime) : [];
      });
      setSchedule(normalizedSchedule);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  const toggleSlot = (day, time) => {
    setSchedule(prev => {
      const currentSlots = prev[day] || [];
      const updated = currentSlots.includes(time) ? currentSlots.filter(t => t !== time) : [...currentSlots, time].sort();
      return { ...prev, [day]: updated };
    });
  };

  const clearDay = (day) => setSchedule(prev => ({ ...prev, [day]: [] }));

  const applyPreset = (presetKey) => {
    const slots = timeSlots[presetKey];
    const isFullDayOff = presetKey === "fulldayoff";
    setActivePreset(presetKey);
    const newSchedule = {};
    daysOfWeek.forEach(day => { newSchedule[day] = isFullDayOff ? [] : [...slots]; });
    setSchedule(newSchedule);
    setTimeout(() => setActivePreset(null), 600);
  };

  const applyToAll = (sourceDay) => {
    const sourceSlots = schedule[sourceDay] || [];
    if (sourceSlots.length === 0) { toast.warn(`No slots set for ${sourceDay} to copy`); return; }
    const newSchedule = {};
    daysOfWeek.forEach(day => { newSchedule[day] = [...sourceSlots]; });
    setSchedule(newSchedule);
    setCopiedDay(sourceDay);
    setTimeout(() => setCopiedDay(null), 1500);
    toast.success(`Applied ${sourceDay} slots to all days`);
  };

  const formatTime = (time) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const schedulePayload = {};
      daysOfWeek.forEach(day => { schedulePayload[dayKeyMap[day]] = collapseSlots(schedule[day] || []); });
      const { data } = await axios.post(`${backendURL}/api/doctor/update-schedule`, { schedule: schedulePayload }, { headers: { dToken } });
      if (data.success) {
        toast.success(data.message || "Schedule saved successfully!");
        getProfileData();
      } else { toast.error(data.message || "Failed to update schedule"); }
    } catch (error) { toast.error(error.response?.data?.message || error.message || "Failed to update schedule"); }
    finally { setIsSubmitting(false); }
  };

  const totalSlots = Object.values(schedule).reduce((sum, slots) => sum + slots.length, 0);
  const activeDays = Object.values(schedule).filter(slots => slots.length > 0).length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Weekly Availability Schedule</h1>
        <p className="text-text-secondary text-sm sm:text-base">Configure your available time slots for each day of the week. Patients will only be able to book during these times.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <button onClick={() => applyPreset("morning")} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer ${activePreset === "morning" ? "bg-blue-500 text-white border-blue-500 shadow-md" : "bg-background-card border-border text-text-primary hover:border-blue-300 hover:bg-blue-50"}`}><Clock size={16} /><span>Morning Only</span></button>
        <button onClick={() => applyPreset("afternoon")} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer ${activePreset === "afternoon" ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-background-card border-border text-text-primary hover:border-amber-300 hover:bg-amber-50"}`}><Clock size={16} /><span>Afternoon Only</span></button>
        <button onClick={() => applyPreset("evening")} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer ${activePreset === "evening" ? "bg-purple-500 text-white border-purple-500 shadow-md" : "bg-background-card border-border text-text-primary hover:border-purple-300 hover:bg-purple-50"}`}><Clock size={16} /><span>Evening Only</span></button>
        <button onClick={() => applyPreset("full")} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer ${activePreset === "full" ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-background-card border-border text-text-primary hover:border-emerald-300 hover:bg-emerald-50"}`}><Clock size={16} /><span>Full Day</span></button>
        <button onClick={() => applyPreset("fulldayoff")} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer col-span-2 sm:col-span-1 ${activePreset === "fulldayoff" ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-background-card border-border text-text-primary hover:border-red-300 hover:bg-red-50"}`}><RotateCcw size={16} /><span>Clear All</span></button>
      </div>
      <div className="grid gap-4 mb-8">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-background-card rounded-xl border border-border p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${schedule[day]?.length > 0 ? "bg-primary text-white" : "bg-background-muted text-text-dim"}`}>{day}</div>
                  <div>
                    <p className="font-semibold text-text-primary">{day === "Mon" ? "Monday" : day === "Tue" ? "Tuesday" : day === "Wed" ? "Wednesday" : day === "Thu" ? "Thursday" : day === "Fri" ? "Friday" : day === "Sat" ? "Saturday" : "Sunday"}</p>
                    <p className="text-xs text-text-dim">{schedule[day]?.length > 0 ? `${schedule[day].length} slots` : "Day off"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:hidden">
                  <button onClick={() => applyToAll(day)} className="text-xs px-3 py-1.5 rounded-lg bg-background-muted text-text-secondary hover:bg-background-muted-hover transition-colors cursor-pointer" title="Apply to all days"><Copy size={12} /></button>
                  <button onClick={() => clearDay(day)} className="text-xs px-3 py-1.5 rounded-lg bg-background-muted text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Clear day"><RotateCcw size={12} /></button>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-auto">
                <button onClick={() => applyToAll(day)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${copiedDay === day ? "bg-emerald-100 text-emerald-600" : "bg-background-muted text-text-secondary hover:bg-background-muted-hover"}`} title="Apply to all days">{copiedDay === day ? <><Check size={12} /> Applied!</> : <><Copy size={12} /> Apply to All</>}</button>
                <button onClick={() => clearDay(day)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-background-muted text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Clear all slots"><RotateCcw size={12} /> Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {allTimeSlots.map(time => (
                <button key={`${day}-${time}`} onClick={() => toggleSlot(day, time)} className={`px-2 py-2 text-xs rounded-lg border font-medium transition-all cursor-pointer ${(schedule[day] || []).includes(time) ? "bg-primary text-white border-primary shadow-sm" : "bg-background-muted text-text-secondary border-border hover:border-primary hover:bg-primary/5 hover:text-primary"}`}>{formatTime(time)}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-background-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-start gap-3"><AlertCircle size={18} className="text-blue-500 mt-0.5 shrink-0" /><div><p className="font-medium text-text-primary">How availability works</p><p className="text-sm text-text-secondary mt-1">Selected slots are shown to patients when booking. Patients can only book in 30-minute blocks during your available times. Off-days or empty slots mean no bookings for those times.</p></div></div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background-muted rounded-xl p-5 border border-border">
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <div><span className="font-semibold text-text-primary">{totalSlots}</span> total slots</div>
          <div><span className="font-semibold text-text-primary">{activeDays}</span> active days</div>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          <Save size={18} />{isSubmitting ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
};

export default DoctorAvailability;
