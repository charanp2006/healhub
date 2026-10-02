// @ts-nocheck
"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "@/src/components/ui/Toast";
import { AppContext } from "@/src/context/AppContext";
import { assets } from "@/src/assets/assets";
import { SkeletonSingle } from "@healhub/ui";
import {
  ArrowRight,
  BedDouble,
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";

const RatingBadge = ({ average, count }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft/40 px-3 py-1 text-xs font-semibold text-primary">
    <Star size={12} className="fill-primary text-primary" />
    {count > 0 ? `${Number(average).toFixed(1)} (${count})` : "New"}
  </span>
);

const HospitalProfile = () => {
  const { hospitalId } = useParams();
  const router = useRouter();
  const { backendURL, currencySymbol } = useContext(AppContext);

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [activeSpeciality, setActiveSpeciality] = useState("");

  const fetchHospital = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/api/hospital/${hospitalId}`
      );
      if (data.success) {
        setHospital(data.hospital);
        setDoctors(data.doctors || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchRoomAvailability = async () => {
    try {
      const { data } = await axios.get(
        `${backendURL}/api/bed/availability/${hospitalId}`
      );
      if (data.success) {
        setRoomCategories(data.categories);
      }
    } catch {
      // silently fail – room data is supplementary
    }
  };

  useEffect(() => {
    fetchHospital();
    fetchRoomAvailability();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitalId]);

  const specialities = useMemo(
    () => [...new Set(doctors.map((d) => d.speciality).filter(Boolean))],
    [doctors]
  );

  const filteredDoctors = useMemo(
    () =>
      activeSpeciality
        ? doctors.filter((d) => d.speciality === activeSpeciality)
        : doctors,
    [doctors, activeSpeciality]
  );

  if (!hospital) {
    return <SkeletonSingle />;
  }

  const totalDocs = hospital.doctorsCount ?? doctors.length;
  const availableDocs =
    hospital.availableDoctors ??
    doctors.filter((d) => d.available).length;

  return (
    <div>
      {/* ---------- Back link ---------- */}
      <nav className="mb-6">
        <button
          onClick={() => router.push("/hospitals")}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-card px-4 py-2 text-xs font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ArrowRight size={14} className="rotate-180" />
          Back to Hospitals
        </button>
      </nav>

      {/* ---------- Hospital hero ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-[2rem] border border-border/70 bg-background-card"
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-72 md:flex-shrink-0">
            <img
              className="h-52 w-full object-cover md:h-full"
              src={hospital.image || assets.header_img.src}
              alt={hospital.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
            <span
              className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md ${
                hospital.isRegistered ? "" : "opacity-70"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  hospital.isRegistered ? "bg-green-400" : "bg-text-dim"
                }`}
              />
              {hospital.isRegistered ? "Registered" : "Not registered"}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  {hospital.name}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="shrink-0 text-primary" />
                    {hospital.city}
                  </span>
                  {hospital.address && (
                    <span className="truncate">
                      {[hospital.address?.line1, hospital.address?.line2]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <RatingBadge
                  average={hospital.ratingAverage}
                  count={hospital.ratingCount}
                />
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-dim">
                  <ShieldCheck size={13} className="text-primary" />
                  Verified partner
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-base px-3.5 py-1.5 text-xs font-medium text-text-secondary">
                <Stethoscope size={13} className="text-primary" />
                {availableDocs} available
                <span className="text-text-dim">/ {totalDocs} doctors</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-base px-3.5 py-1.5 text-xs font-medium text-text-secondary">
                <BedDouble size={13} className="text-primary" />
                {hospital.availableBeds} / {hospital.totalBeds} beds
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {hospital.specialties?.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-primary-soft/30 px-3 py-1 text-xs font-medium text-primary"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-text-primary">About</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {hospital.about || "No description available."}
              </p>
            </div>

            {roomCategories.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {roomCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="rounded-xl border border-border bg-background-base px-3.5 py-2.5"
                  >
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                      <BedDouble size={13} className="text-primary" />
                      {cat.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {cat.availableBeds} / {cat.totalBeds} beds free
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ---------- Doctors at this hospital ---------- */}
      <section className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Doctors at this hospital
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {totalDocs} doctor{totalDocs === 1 ? "" : "s"} ·{" "}
              <span className="text-primary">{availableDocs} available</span>{" "}
              right now
            </p>
          </div>
        </div>

        {specialities.length > 0 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveSpeciality("")}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                activeSpeciality === ""
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                  : "border-border bg-background-card text-text-secondary hover:border-primary/50 hover:text-text-primary"
              }`}
            >
              All
            </button>
            {specialities.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSpeciality(s)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  activeSpeciality === s
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                    : "border-border bg-background-card text-text-secondary hover:border-primary/50 hover:text-text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {filteredDoctors.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-background-card px-8 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Stethoscope size={24} />
            </span>
            <p className="mt-4 text-lg font-bold text-text-primary">
              No doctors found
            </p>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              {doctors.length === 0
                ? "No doctors are listed for this hospital yet."
                : `No doctors are listed under “${activeSpeciality}” at this hospital.`}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {filteredDoctors.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => router.push(`/appointment/${item._id}`)}
                key={item._id}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-border bg-background-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/10"
              >
                <div className="relative">
                  <img
                    className="h-40 w-full object-cover sm:h-48"
                    src={item.image}
                    alt={item.name}
                  />
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md ${
                      item.available ? "" : "opacity-75"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        item.available ? "bg-green-400" : "bg-text-dim"
                      }`}
                    />
                    {item.available ? "Available" : "Busy"}
                  </span>
                  <RatingBadge
                    average={item.ratingAverage}
                    count={item.ratingCount}
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="truncate text-sm font-bold text-text-primary sm:text-base">
                    {item.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">
                    {item.degree} · {item.speciality}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">
                      {currencySymbol}
                      {item.fees}
                      <span className="ml-1 text-xs font-medium text-text-dim">
                        fee
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft/40 px-4 py-2 text-xs font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-white">
                      Book
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Bottom CTA ---------- */}
      <section className="mt-14 flex flex-col items-center rounded-[2rem] border border-primary-soft bg-primary-soft/10 px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
          <Building2 size={22} />
        </span>
        <h3 className="mt-4 text-xl font-bold text-text-primary">
          Need a different hospital?
        </h3>
        <p className="mt-1 max-w-md text-sm text-text-secondary">
          Browse all registered hospitals and clinics in your area.
        </p>
        <button
          onClick={() => router.push("/hospitals")}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/50 active:scale-95"
        >
          Explore hospitals
          <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
};

export default HospitalProfile;