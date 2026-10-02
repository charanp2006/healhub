"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { AppContext } from "@/src/context/AppContext";
import {
  ArrowRight,
  SlidersHorizontal,
  Star,
  Stethoscope,
  X,
} from "lucide-react";

const Doctors = () => {
  const { speciality } = useParams();
  const pathname = usePathname();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const router = useRouter();

  const { doctors } = useContext(AppContext);

  const normalizedSpeciality = speciality
    ? decodeURIComponent(speciality)
    : null;
  const isActiveRoute = (route) =>
    normalizedSpeciality === route.split("/").pop();

  const specialities = [
    { key: "General physician", route: "/doctors/General physician" },
    { key: "Gynecologist", route: "/doctors/Gynecologist" },
    { key: "Dermatologist", route: "/doctors/Dermatologist" },
    { key: "pediatrician", route: "/doctors/Pediatrician" },
    { key: "Neurologist", route: "/doctors/Neurologist" },
    { key: "Gastroenterologist", route: "/doctors/Gastroenterologist" },
  ];

  const applyFilter = () => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const hospitalId = params.get("hospitalId");
    let filtered = doctors;

    if (hospitalId) {
      filtered = filtered.filter((doc) => doc.hospitalId === hospitalId);
    }

    if (normalizedSpeciality) {
      filtered = filtered.filter(
        (doc) =>
          doc.speciality.toLowerCase() === normalizedSpeciality.toLowerCase()
      );
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, speciality, pathname]);

  const pickSpeciality = (specialityKey, route) => {
    setShowFilter(false);
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const hospitalId = params.get("hospitalId");
    router.push(
      isActiveRoute(route)
        ? hospitalId
          ? `/doctors?hospitalId=${hospitalId}`
          : "/doctors"
        : hospitalId
          ? `${route}?hospitalId=${hospitalId}`
          : route
    );
  };

  const displayTitle = normalizedSpeciality
    ? normalizedSpeciality.replace(/\b\w/g, (c) => c.toUpperCase())
    : "Doctor";

  return (
    <div>
      {/* ---------- Header ---------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Book a Specialist
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            {speciality ? (
              <>
                {displayTitle}{" "}
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Doctors
                </span>
              </>
            ) : (
              <>
                Find Your{" "}
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Doctor
                </span>
              </>
            )}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary md:text-base">
            {filterDoc.length} verified doctor{filterDoc.length === 1 ? "" : "s"}
            {speciality ? ` in ${displayTitle}` : " across all specialities"}.
          </p>
        </div>
        <button
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all lg:hidden ${
            showFilter
              ? "bg-primary text-white"
              : "border border-border bg-background-card text-text-primary shadow-sm"
          }`}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      <div className="mt-8 flex flex-col items-start gap-6 lg:flex-row">
        {/* ---------- Desktop filter sidebar ---------- */}
        <aside className="hidden w-64 flex-shrink-0 flex-col rounded-3xl border border-border bg-background-card p-5 lg:flex">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-dim">
            Specialities
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => pickSpeciality(null, "/doctors")}
              className={`rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                !normalizedSpeciality
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-text-secondary hover:bg-background-muted hover:text-text-primary"
              }`}
            >
              All Doctors
            </button>
            {specialities.map((s) => (
              <button
                key={s.key}
                onClick={() => pickSpeciality(s.key, s.route)}
                className={`rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                  isActiveRoute(s.route)
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-text-secondary hover:bg-background-muted hover:text-text-primary"
                }`}
              >
                {s.key}
              </button>
            ))}
          </div>
        </aside>

        {/* ---------- Doctor cards ---------- */}
        <div className="w-full flex-1">
          {filterDoc.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background-card p-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Stethoscope size={26} />
              </span>
              <p className="mt-4 text-lg font-semibold text-text-primary">
                No doctors found
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Try a different speciality or clear the filter.
              </p>
              <button
                onClick={() => router.push("/doctors")}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover active:scale-95"
              >
                View all doctors
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filterDoc.map((item, index) => (
                <div
                  onClick={() => router.push(`/appointment/${item._id}`)}
                  key={index}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-background-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary-soft">
                    <img
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={item.image}
                      alt={item.name}
                    />
                    <span
                      className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
                        item.available
                          ? "bg-green-500/90 text-white"
                          : "bg-background-card/90 text-text-secondary"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.available ? "bg-white" : "bg-text-dim"
                        }`}
                      />
                      {item.available ? "Available" : "Not Available"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="text-lg font-semibold text-text-primary">
                      {item.name}
                    </p>
                    <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                      {item.speciality}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-sm font-semibold text-text-primary">
                        {item.ratingAverage
                          ? item.ratingAverage.toFixed(1)
                          : "New"}
                      </span>
                      <span className="text-xs text-text-secondary">
                        ({item.ratingCount || 0} reviews)
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-text-secondary">
                        {item.available ? "Slots available" : "Check later"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Book
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Mobile filter bottom sheet ---------- */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${showFilter ? "" : "hidden"}`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowFilter(false)}
        />
        <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-background-card p-5 pb-[calc(84px+env(safe-area-inset-bottom,0px))]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-text-primary">
              Filter by Speciality
            </p>
            <button
              onClick={() => setShowFilter(false)}
              className="rounded-full bg-background-base p-2 text-text-secondary touch-none-outline"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <p
              onClick={() => pickSpeciality(null, "/doctors")}
              className={`rounded-full border px-3 py-2.5 text-center text-xs transition-all ${
                !normalizedSpeciality
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background-card text-text-secondary"
              }`}
            >
              All Doctors
            </p>
            {specialities.map((s) => (
              <p
                key={s.key}
                onClick={() => pickSpeciality(s.key, s.route)}
                className={`rounded-full border px-3 py-2.5 text-center text-xs transition-all ${
                  isActiveRoute(s.route)
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background-card text-text-secondary"
                }`}
              >
                {s.key}
              </p>
            ))}
          </div>
          <button
            onClick={() => setShowFilter(false)}
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 touch-none-outline"
          >
            Show {filterDoc.length} doctor
            {filterDoc.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Doctors;