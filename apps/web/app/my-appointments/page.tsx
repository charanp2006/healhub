// @ts-nocheck
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { AppContext } from "@/src/context/AppContext";
import {
  MapPin,
  FileText,
  CalendarClock,
  X,
  RefreshCw,
  Star,
} from "lucide-react";

const MyAppointments = () => {
  const { backendURL, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [prescriptionView, setPrescriptionView] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingView, setRatingView] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 5, review: "" });
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Reschedule slot state
  const [resDocSlots, setResDocSlots] = useState([]);
  const [resSlotIndex, setResSlotIndex] = useState(null);
  const [resSlotTime, setResSlotTime] = useState("");
  const [resLoading, setResLoading] = useState(false);
  const [resError, setResError] = useState("");

  // How many days ahead the API should compute availability for when rescheduling.
  const RESCHEDULE_WINDOW_DAYS = 7;
  // Maps the API's lowercase weekday keys onto JS Date#getDay() ordering.
  const WEEKDAY_INDEX = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const formatSlotTime = (time) => {
    const [h, m] = time.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
  };

  const router = useRouter();

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("-");
    const year = dateArray[0];
    const month = monthNames[parseInt(dateArray[1], 10) - 1];
    const day = dateArray[2];
    return `${day} ${month} ${year}`;
  };

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/api/user/appointments`,
        { headers: { token } }
      );

      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log("Error fetching appointments:", error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error cancelling appointment:", error);
      toast.error(error.message);
    }
  };

  // Open reschedule modal and load the doctor's real availability.
  // Uses the same API as the booking page, so the dates and times offered here
  // are identical to the ones the doctor actually keeps free.
  const openReschedule = async (appointment) => {
    setRescheduleId(appointment._id);
    setResSlotIndex(null);
    setResSlotTime("");
    setResLoading(true);
    setResError("");

    try {
      const { data } = await axios.get(
        `${backendURL}/api/doctor/${appointment.docId}/availability`,
        {
          params: {
            days: RESCHEDULE_WINDOW_DAYS,
            // Keep this appointment's own slot selectable.
            ignoreDate: appointment.slotDate,
            ignoreTime: appointment.slotTime,
          },
        }
      );

      if (!data.success) {
        setResError(data.message || "Could not load availability");
        setResDocSlots([]);
        return;
      }

      // Only offer days that actually have a free slot.
      const days = (data.availability || []).filter((d) => d.slots.length > 0);
      setResDocSlots(days);
      setResSlotIndex(days.length > 0 ? 0 : null);
    } catch (error) {
      console.log("Error loading availability for reschedule:", error);
      setResError("Could not load availability");
      setResDocSlots([]);
    } finally {
      setResLoading(false);
    }
  };

  const confirmReschedule = async () => {
    if (!resSlotTime) {
      toast.warn("Please select a new time slot");
      return;
    }

    try {
      // Canonical YYYY-MM-DD straight from the availability API.
      const newSlotDate = resDocSlots[resSlotIndex]?.date;
      if (!newSlotDate) {
        toast.warn("Please select a new date and time slot");
        return;
      }

      const { data } = await axios.post(
        `${backendURL}/api/user/reschedule-appointment`,
        {
          appointmentId: rescheduleId,
          newSlotDate,
          newSlotTime: resSlotTime,
        },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setRescheduleId(null);
        getAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error rescheduling:", error);
      toast.error(error.message);
    }
  };

  const getStatusBadge = (item) => {
    if (item.cancelled)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium">
          Cancelled
        </span>
      );
    if (item.isCompleted)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 font-medium">
          Completed
        </span>
      );
    if (item.rescheduled)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium">
          Rescheduled
        </span>
      );
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
        Upcoming
      </span>
    );
  };

  const submitRating = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/user/rate-appointment`,
        {
          appointmentId,
          rating: ratingData.rating,
          review: ratingData.review,
        },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Rating submitted successfully");
        setRatingView(null);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error submitting rating:", error);
      toast.error(error.message);
    }
  };

  const filteredAppointments = appointments.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return !item.cancelled && !item.isCompleted;
    if (statusFilter === "completed") return item.isCompleted;
    if (statusFilter === "cancelled") return item.cancelled;
    return true;
  });

  useEffect(() => {
    if (token) {
      getAppointments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  return (
    <div>
      <p className="pb-3 mt-12 text-lg font-medium text-text-secondary border-b">
        My Appointments
      </p>

      {/* ---------- Status Filter ---------- */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {["all", "active", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize border transition-all cursor-pointer ${statusFilter === s ? "bg-primary text-white border-primary" : "border-border text-text-secondary hover:border-primary"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div>
        {filteredAppointments.length === 0 && (
          <p className="text-center text-text-secondary py-16 text-lg">
            No appointments found
          </p>
        )}
        {filteredAppointments.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b"
          >
            <div>
              <img
                className="w-28 sm:w-36 bg-primary-soft rounded-lg"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-text-secondary">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-text-primary text-base font-semibold">
                  {item.docData.name}
                </p>
                {getStatusBadge(item)}
              </div>
              <p>{item.docData.speciality}</p>

              {/* Appointment type badge */}
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-primary" />{" "}
                <span className="text-xs text-primary font-medium">
                  In-Person
                </span>
              </div>

              <p className="text-text-primary font-medium mt-1">
                Address:
              </p>
              <p>{item.docData.address.line1}</p>
              <p>{item.docData.address.line2}</p>
              <p className="mt-1">
                {" "}
                <span className="text-sm text-text-primary font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}{" "}
              </p>

              {/* Symptoms */}
              {item.symptoms && (
                <p className="mt-1">
                  <span className="text-text-primary font-medium">
                    Symptoms:
                  </span>{" "}
                  {item.symptoms}
                </p>
              )}

              {/* Follow-up */}
              {item.followUpDate && (
                <p className="mt-1 flex items-center gap-1">
                  <CalendarClock size={14} className="text-primary" />
                  <span className="text-text-primary font-medium">
                    Follow-up:
                  </span>{" "}
                  {slotDateFormat(item.followUpDate)}
                </p>
              )}

              {/* Prescription button */}
              {item.prescription && (
                <button
                  onClick={() => setPrescriptionView(item)}
                  className="mt-2 flex items-center gap-1.5 text-primary text-xs font-medium hover:underline cursor-pointer"
                >
                  <FileText size={14} /> View Prescription
                </button>
              )}
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end text-sm text-center">
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => openReschedule(item)}
                  className="text-text-secondary sm:min-w-48 py-2 border rounded hover:bg-amber-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={14} /> Reschedule
                </button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-text-secondary sm:min-w-48 py-2 border rounded hover:bg-accent-cta hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <p className="text-accent-cta font-medium">
                  Appointment Cancelled
                </p>
              )}
              {item.isCompleted && !item.rating && (
                <button
                  onClick={() => {
                    setRatingView(item);
                    setRatingData({ rating: 5, review: "" });
                  }}
                  className="sm:min-w-48 py-2 border border-primary rounded text-primary font-medium hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1"
                >
                  <Star size={14} /> Rate
                </button>
              )}
              {item.isCompleted && item.rating && (
                <button
                  className="sm:min-w-48 py-2 border border-green-500 rounded text-green-600 font-medium"
                  title="Rated"
                >
                  <Star size={14} className="inline" /> {item.rating}/5
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Reschedule Modal ---------- */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:justify-center p-0 sm:p-4">
          <div className="bg-background-card rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleId(null)}
                className="p-1 hover:bg-background-muted rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Day selector */}
            <p className="text-sm text-text-secondary mb-2">
              Select a new date
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {resDocSlots.map((item, index) => (
                <div
                  key={item.date}
                  onClick={() => {
                    setResSlotIndex(index);
                    setResSlotTime("");
                  }}
                  className={`text-center py-4 min-w-14 rounded-full cursor-pointer text-sm ${resSlotIndex === index ? "bg-primary text-white" : "border border-border"}`}
                >
                  <p>{daysOfWeek[WEEKDAY_INDEX[item.weekday]]}</p>
                  <p>{Number(item.date.slice(-2))}</p>
                </div>
              ))}
              {!resLoading && resDocSlots.length === 0 && (
                <p className="text-sm text-text-secondary self-center">
                  {resError || "No available dates to reschedule to"}
                </p>
              )}
            </div>

            {/* Time slots */}
            <p className="text-sm text-text-secondary mt-4 mb-2">
              Select a new time
            </p>
            <div className="flex flex-wrap gap-2">
              {resDocSlots[resSlotIndex]?.slots.map((time) => (
                <p
                  key={time}
                  onClick={() => setResSlotTime(time)}
                  className={`text-xs px-4 py-2 rounded-full cursor-pointer ${time === resSlotTime ? "bg-primary text-white" : "border border-border text-text-secondary"}`}
                >
                  {formatSlotTime(time)}
                </p>
              ))}
            </div>

            <button
              onClick={confirmReschedule}
              disabled={resLoading || !resSlotTime}
              className="w-full mt-6 bg-primary text-white py-2.5 rounded-full text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resLoading ? "Loading..." : "Confirm Reschedule"}
            </button>
          </div>
        </div>
      )}

      {/* ---------- Rating Modal ---------- */}
      {ratingView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-background-card rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Rate Your Experience
              </h3>
              <button
                onClick={() => setRatingView(null)}
                className="p-1 hover:bg-background-muted rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-text-primary font-medium mb-2">
                Doctor: {ratingView.docData.name}
              </p>
              {ratingView.hospitalId && (
                <p className="text-xs text-text-secondary">
                  Hospital:{" "}
                  {ratingView.docData.hospitalId?.name || "N/A"}
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-text-primary mb-2">
                Rating
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setRatingData({ ...ratingData, rating: star })
                    }
                    className="transition-all"
                  >
                    <Star
                      size={28}
                      className={`${star <= ratingData.rating ? "fill-yellow-400 text-yellow-400" : "text-text-dim"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-text-primary mb-2">
                Review (optional)
              </p>
              <textarea
                value={ratingData.review}
                onChange={(e) =>
                  setRatingData({ ...ratingData, review: e.target.value })
                }
                className="w-full border border-border rounded-lg p-2 text-sm resize-none"
                rows={3}
                placeholder="Share your experience..."
              />
            </div>

            <button
              onClick={() => submitRating(ratingView._id)}
              className="w-full bg-primary text-white py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {/* ---------- Prescription Modal ---------- */}
      {prescriptionView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-background-card rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FileText size={20} className="text-primary" /> Prescription
              </h3>
              <button
                onClick={() => setPrescriptionView(null)}
                className="p-1 hover:bg-background-muted rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-3">
              <p className="text-xs text-text-secondary">Doctor</p>
              <p className="font-medium text-text-primary">
                {prescriptionView.docData.name}
              </p>
            </div>
            <div className="mb-3">
              <p className="text-xs text-text-secondary">Date</p>
              <p className="font-medium text-text-primary">
                {slotDateFormat(prescriptionView.slotDate)}
              </p>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-text-secondary mb-1">
                Prescription
              </p>
              <p className="text-sm text-text-primary whitespace-pre-wrap">
                {prescriptionView.prescription}
              </p>
            </div>
            {prescriptionView.followUpDate && (
              <div className="mt-3 p-3 bg-primary-soft rounded-lg">
                <p className="text-xs text-text-secondary">
                  Follow-up Date
                </p>
                <p className="font-medium text-primary">
                  {slotDateFormat(prescriptionView.followUpDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
