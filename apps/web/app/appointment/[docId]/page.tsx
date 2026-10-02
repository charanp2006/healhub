// @ts-nocheck
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "@/src/components/ui/Toast";
import { AppContext } from "@/src/context/AppContext";
import RelatedDoctors from "@/src/components/RelatedDoctors";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  Info,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendURL, getDoctorsData, token } =
    useContext(AppContext);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const router = useRouter();

  // Fetching doctor information based on docId
  const [docInfo, setDocInfo] = useState(null);

  const fetchDocInfo = () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  // Fetching available slots for the doctor
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(null);
  const [slotTime, setSlotTime] = useState("");
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [slotDuration, setSlotDuration] = useState(30);

  // Smart appointment fields
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");

  const getAvailableSlots = async () => {
    setDocSlots([]);

    // Fetch schedule if not already fetched
    let schedule = doctorSchedule;
    let slotDur = slotDuration;

    if (!doctorSchedule) {
      try {
        const { data } = await axios.get(
          `${backendURL}/api/doctor/${docId}/schedule`
        );
        if (data.success) {
          schedule = data.schedule;
          slotDur = data.slotDuration || 30;
          setDoctorSchedule(schedule);
          setSlotDuration(slotDur);
        }
      } catch (error) {
        console.log("Error fetching doctor schedule:", error);
        // Use default values if fetch fails
        schedule = docInfo?.schedule || {};
        slotDur = 30;
      }
    }

    // getting current date
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      // getting date with index
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);

      // Get day name for schedule lookup
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayName = dayNames[currentDate.getDay()];
      const daySchedule = schedule?.[dayName];

      // Check if day is working
      if (!daySchedule?.enabled) {
        setDocSlots((prev) => [...prev, []]);
        continue;
      }

      // Check if date is blocked
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
      const isDateBlocked = docInfo?.blockedDates?.includes(dateStr);

      if (isDateBlocked) {
        setDocSlots((prev) => [...prev, []]);
        continue;
      }

      // Get start and end times from schedule
      const [startHour, startMin] = daySchedule.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = daySchedule.endTime.split(":").map(Number);

      // Set start time
      let currentSlotTime = new Date(currentDate);
      currentSlotTime.setHours(startHour, startMin, 0, 0);

      // Set end time for comparison
      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMin, 0, 0);

      // For today, don't show past slots
      if (today.getDate() === currentDate.getDate()) {
        const now = new Date();
        if (currentSlotTime <= now) {
          // Move to next available slot
          const minsUntilNextSlot =
            slotDur - (now.getMinutes() % slotDur);
          currentSlotTime = new Date(
            now.getTime() + minsUntilNextSlot * 60 * 1000
          );
          currentSlotTime.setMinutes(
            Math.floor(currentSlotTime.getMinutes() / slotDur) * slotDur
          );
        }
      }

      const timeSlots = [];

      while (currentSlotTime < endTime) {
        const formattedTime = currentSlotTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const day = currentSlotTime.getDate();
        const month = currentSlotTime.getMonth() + 1;
        const year = currentSlotTime.getFullYear();

        const slotDate = `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;

        const isSlotAvailable =
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(formattedTime)
            ? false
            : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentSlotTime),
            time: formattedTime,
          });
        }

        // Increment by slot duration
        currentSlotTime.setMinutes(
          currentSlotTime.getMinutes() + slotDur
        );
      }

      // only add the day if there are available slots
      if (timeSlots.length > 0) {
        setDocSlots((prev) => [...prev, timeSlots]);
      }
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return router.push("/login");
    }

    if (slotIndex === null || !slotTime) {
      toast.info("Please select a date and time slot");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const slotDate = `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;

      const { data } = await axios.post(
        `${backendURL}/api/user/book-appointment`,
        {
          docId,
          slotDate,
          slotTime,
          appointmentType: "in-person",
          symptoms,
          notes,
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        router.push("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo && docId) {
      getAvailableSlots();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docInfo, doctorSchedule, docId]);

  // reset slot index when slots array changes
  useEffect(() => {
    if (docSlots.length > 0) {
      setSlotIndex(null);
      setSlotTime("");
    }
  }, [docSlots]);

  return (
    docInfo && (
      <div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr] lg:gap-8">
          {/* ---------- Doctor profile card ---------- */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[2rem] border border-border bg-background-card lg:sticky lg:top-24 lg:self-start"
          >
            <div className="relative">
              <img
                src={docInfo.image}
                alt={docInfo.name}
                className="h-56 w-full object-cover sm:h-64 lg:h-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-2xl font-bold text-white drop-shadow">
                  {docInfo.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-white/90 drop-shadow">
                  <BadgeCheck size={16} className="text-primary" />
                  {docInfo.degree} · {docInfo.speciality}
                </p>
              </div>
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <Calendar size={13} className="text-primary" />
                {docInfo.experience}
              </span>
            </div>

            <div className="p-6">
              {/* Hospital/Clinic info */}
              {docInfo.hospitalId && (
                <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background-base p-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Building2 size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {docInfo.hospitalId.name || "Hospital/Clinic"}
                    </p>
                    {docInfo.hospitalId.city && (
                      <p className="flex items-center gap-1 text-xs text-text-secondary">
                        <MapPin size={11} />
                        {docInfo.hospitalId.city}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Fee */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-soft/20 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Appointment fee
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {currencySymbol}
                  {docInfo.fees}
                </p>
              </div>

              {/* dr about */}
              <div className="mt-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <Info size={14} className="text-primary" />
                  About {docInfo.name.split(" ")[0]}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {docInfo.about}
                </p>
              </div>
            </div>
          </motion.aside>

          {/* ---------- Booking panel ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-[2rem] border border-border bg-background-card p-6 md:p-8"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                  Book Appointment
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  Choose a day & time
                </h1>
              </div>

              <span className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-background-base px-4 py-2 text-sm font-medium text-text-secondary sm:self-auto">
                <MapPin size={15} className="text-primary" />
                In-Person Visit
              </span>
            </div>

            {/* ---------- Slots ---------- */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Calendar size={16} className="text-primary" />
                Pick a date
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {docSlots.length &&
                    docSlots.map((item, index) => {
                      if (!item || item.length === 0) return null;
                      const active = slotIndex === index;
                      return (
                        <button
                          onClick={() => {
                            setSlotTime("");
                            setSlotIndex(active ? null : index);
                          }}
                          key={index}
                          className={`min-w-[72px] flex-shrink-0 rounded-2xl border px-4 py-3 text-center transition-all ${
                            active
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                              : "border-border bg-background-base text-text-secondary hover:border-primary/50 hover:text-text-primary"
                          }`}
                        >
                          <span
                            className={`block text-[10px] font-semibold uppercase tracking-widest ${
                              active ? "text-white/80" : "text-text-dim"
                            }`}
                          >
                            {daysOfWeek[item[0].datetime.getDay()]}
                          </span>
                          <span className="mt-0.5 block text-lg font-bold">
                            {item[0].datetime.getDate()}
                          </span>
                        </button>
                      );
                    })}
                {docSlots.length === 0 && (
                  <p className="flex items-center gap-2 text-sm text-text-dim">
                    <Clock size={14} /> Loading available slots...
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Clock size={16} className="text-primary" />
                Available time slots
              </p>
              {slotIndex === null ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-background-base px-6 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background-card text-primary">
                    <CalendarClock size={20} />
                  </span>
                  <p className="text-sm font-medium text-text-secondary">
                    Select a date to get the available time slots
                  </p>
                </div>
              ) : docSlots[slotIndex] ? (
                <div className="flex flex-wrap gap-2.5">
                  {docSlots[slotIndex].map((item, index) => {
                    const active = item.time === slotTime;
                    return (
                      <button
                        onClick={() =>
                          setSlotTime(active ? "" : item.time)
                        }
                        key={index}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                          active
                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                            : "border-border bg-background-base text-text-secondary hover:border-primary/50 hover:text-text-primary"
                        }`}
                      >
                        {active && <Check size={14} />}
                        {item.time.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-background-base px-6 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background-card text-text-dim">
                    <Clock size={20} />
                  </span>
                  <p className="text-sm font-medium text-text-secondary">
                    No available slots on this day
                  </p>
                  <p className="text-xs text-text-dim">
                    Try picking a different date above.
                  </p>
                </div>
              )}
            </div>

            {/* ---------- Symptoms & Notes ---------- */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  Symptoms <span className="text-xs text-text-dim">(optional)</span>
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  placeholder="Describe your symptoms..."
                  className="w-full resize-none rounded-xl border border-border bg-background-base px-4 py-3 text-sm text-text-primary placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  Notes <span className="text-xs text-text-dim">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any additional notes for the doctor..."
                  className="w-full resize-none rounded-xl border border-border bg-background-base px-4 py-3 text-sm text-text-primary placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* ---------- Summary & CTA ---------- */}
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-background-base p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Appointment fee
                </p>
                <p className="mt-0.5 text-2xl font-bold text-text-primary">
                  {currencySymbol}
                  {docInfo.fees}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-dim">
                  <ShieldCheck size={13} className="text-primary" />
                  Free cancellation up to 2 hours before
                </p>
              </div>
              <button
                onClick={bookAppointment}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/50 active:scale-95 sm:w-auto touch-none-outline"
              >
                Book an appointment
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </motion.section>
        </div>

        {/* ---------- Listing related doctors ---------- */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;