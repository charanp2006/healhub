// @ts-nocheck
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "@/src/components/ui/Toast";
import {
  ArrowRight,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  Compass,
  LocateFixed,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Stethoscope,
  X,
} from "lucide-react";
import { AppContext } from "@/src/context/AppContext";
import { assets, specialityData } from "@/src/assets/assets";
import { Skeleton } from "@healhub/ui";
import { RetroGrid } from "@healhub/ui/retro-grid";

const Dropdown = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background-base px-3.5 py-2.5 text-sm transition-colors ${
          open
            ? "border-primary ring-2 ring-primary/20"
            : "hover:border-primary/50"
        }`}
      >
        <span
          className={`truncate ${current ? "text-text-primary" : "text-text-dim"}`}
        >
          {current ? current.label : "Select..."}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-secondary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-52 w-full overflow-y-auto rounded-xl border border-border bg-background-card p-1 shadow-xl shadow-black/10">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-background-muted ${
                o.value === value
                  ? "bg-primary-soft font-medium text-primary"
                  : "text-text-primary"
              }`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={15} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const specialityOptions = [
  { value: "", label: "All Specialities" },
  ...specialityData.map((item) => ({
    value: item.speciality,
    label: item.speciality,
  })),
];

const sortOptions = [
  { value: "rating", label: "Rating" },
  { value: "distance", label: "Distance" },
  { value: "availability", label: "Availability" },
];

const inputCls =
  "w-full rounded-xl border border-border bg-background-base px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

const RatingBadge = ({ average, count }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft/40 px-3 py-1 text-xs font-semibold text-primary">
    <Star size={12} className="fill-primary text-primary" />
    {count > 0 ? `${Number(average).toFixed(1)} (${count})` : "New"}
  </span>
);

const Hospitals = () => {
  const router = useRouter();
  const { backendURL } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Use my location");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationMode, setLocationMode] = useState("none"); // "none" | "city" | "geo"
  const [activeLocation, setActiveLocation] = useState(null);

  const [filters, setFilters] = useState({
    name: "",
    city: "",
    speciality: "",
    lat: "",
    lng: "",
    radius: "",
    sort: "rating",
  });

  const fetchHospitals = async (pageNumber = 1, overrideFilters = null) => {
    setLoading(true);
    try {
      const activeFilters = overrideFilters || filters;
      const params = new URLSearchParams();
      params.set("page", pageNumber.toString());
      params.set("limit", pagination.limit.toString());
      if (activeFilters.name) params.set("name", activeFilters.name);
      if (activeFilters.city) params.set("city", activeFilters.city);
      if (activeFilters.speciality)
        params.set("speciality", activeFilters.speciality);
      if (activeFilters.lat) params.set("lat", activeFilters.lat);
      if (activeFilters.lng) params.set("lng", activeFilters.lng);
      if (activeFilters.radius) params.set("radius", activeFilters.radius);
      if (activeFilters.sort) params.set("sort", activeFilters.sort);

      const { data } = await axios.get(
        `${backendURL}/api/hospital/list?${params.toString()}`
      );

      if (data.success) {
        setHospitals(data.hospitals);
        setPagination(data.pagination);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchHospitals(1);
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    const location = locationQuery.trim();
    if (!location) {
      toast.info("Please enter a location first");
      return;
    }
    const nextFilters = {
      ...filters,
      name: "",
      city: location,
      lat: "",
      lng: "",
      radius: "",
    };
    setFilters(nextFilters);
    setActiveLocation(location);
    setLocationMode("city");
    fetchHospitals(1, nextFilters);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }

    setLocationStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const nextFilters = { ...filters, lat, lng };
        setFilters(nextFilters);
        setActiveLocation(null);
        setLocationMode("geo");
        setLocationStatus("Using my location");
        fetchHospitals(1, nextFilters);
      },
      () => {
        setLocationStatus("Location access denied");
        toast.error("Please allow location access to use this feature");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    const nextFilters = { ...filters, city: "", lat: "", lng: "", radius: "" };
    setFilters(nextFilters);
    setLocationQuery("");
    setActiveLocation(null);
    setLocationMode("none");
    fetchHospitals(1, nextFilters);
  };

  const hasNextPage = pagination.page * pagination.limit < pagination.total;
  const hasPrevPage = pagination.page > 1;

  const emptyMessage =
    locationMode === "city" && activeLocation
      ? `No hospitals/clinics are registered in this ${activeLocation} location.`
      : locationMode === "geo"
        ? "No hospitals/clinics are registered in your location."
        : "No hospitals/clinics found. Try adjusting your filters or entering a location above.";

  return (
    <div>
      {/* ---------- Hero / location entry ---------- */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background-card md:rounded-[2.5rem]">
        <div className="absolute inset-0" aria-hidden>
          <RetroGrid
            angle={65}
            cellSize={68}
            opacity={0.35}
            lineColor="rgba(32,195,174,0.18)"
            fadeColor="var(--s-bg-card)"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background-card/50 via-transparent to-background-card"
          aria-hidden
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-4 h-80 w-80 rounded-full bg-accent-cta/10 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col items-center px-6 py-14 text-center md:py-20 lg:px-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            <Building2 size={13} />
            Hospitals & Clinics
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
          >
            Find the best hospitals <br /> near you
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base"
          >
            Enter your location to discover nearby hospitals with available
            doctors, live bed status and verified ratings.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={handleLocationSubmit}
            className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-primary"
              />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter city / area (e.g. Bengaluru)"
                className="w-full rounded-full border border-border bg-background-base py-3.5 pl-11 pr-24 text-sm text-text-primary placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-hover active:scale-95"
              >
                <Search size={14} />
                Search
              </button>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-soft bg-primary-soft/20 px-5 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft/40"
            >
              <LocateFixed size={15} />
              {locationStatus}
            </button>
          </motion.form>

          {locationMode === "geo" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background-base px-4 py-1.5 text-xs font-medium text-text-secondary"
            >
              <Compass size={13} className="text-primary" />
              Showing hospitals near your current location
              <button
                onClick={clearLocation}
                className="ml-1 inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                <X size={12} /> Clear
              </button>
            </motion.p>
          )}
        </div>
      </section>

      {/* ---------- Results header ---------- */}
      <div className="mt-10 flex flex-col gap-4 md:mt-14 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {locationMode === "city" && activeLocation
              ? `Hospitals in ${activeLocation}`
              : "Hospitals & Clinics"}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Found {pagination.total} hospital/clinic
            {pagination.total === 1 ? "" : "s"}
            {locationMode === "city" && activeLocation
              ? ` registered in this location`
              : ""}
          </p>
        </div>
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-2 self-start rounded-full border border-border bg-background-card px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:border-primary/50 sm:self-auto lg:hidden touch-none-outline"
        >
          <SlidersHorizontal size={16} className="text-primary" />
          Filters
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* ---------- Filters ---------- */}
        <div className="lg:w-1/4">
          <div
            className={`${showFilter ? "fixed inset-0 z-50" : "hidden"} lg:static lg:block`}
          >
            <div
              onClick={() => setShowFilter(false)}
              className={`absolute inset-0 bg-black/40 lg:hidden ${showFilter ? "" : "hidden"}`}
            />
            <div className="relative rounded-t-3xl bg-background-card p-5 pb-[calc(84px+env(safe-area-inset-bottom,0px))] lg:rounded-3xl lg:border lg:border-border lg:pb-5 lg:bg-background-card">
              <div className="mb-5 flex items-center justify-between lg:mb-6">
                <h3 className="text-lg font-bold text-text-primary">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilter(false)}
                  className="rounded-full bg-background-base p-2 text-text-secondary lg:hidden touch-none-outline"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    Hospital/Clinic name
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background-base px-3 py-2.5">
                    <Search className="h-4 w-4 text-text-secondary" />
                    <input
                      className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-dim"
                      type="text"
                      placeholder="Search by name"
                      value={filters.name}
                      onChange={(e) =>
                        handleFilterChange("name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    City
                  </label>
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) =>
                      handleFilterChange("city", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    Specialty
                  </label>
                  <Dropdown
                    options={specialityOptions}
                    value={filters.speciality}
                    onChange={(v) => handleFilterChange("speciality", v)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    Radius (km)
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="10"
                    value={filters.radius}
                    onChange={(e) =>
                      handleFilterChange("radius", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    Sort by
                  </label>
                  <Dropdown
                    options={sortOptions}
                    value={filters.sort}
                    onChange={(v) => handleFilterChange("sort", v)}
                  />
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-primary/50 active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Hospital cards ---------- */}
        <div className="flex-1">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-border bg-background-card p-4 md:flex md:gap-5 lg:p-5"
                >
                  <Skeleton className="h-48 w-full rounded-2xl md:h-44 md:w-52" />
                  <div className="flex-1 space-y-3 pt-4 md:pt-1">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : hospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-background-card px-8 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
                <Building2 size={28} />
              </span>
              <p className="mt-5 text-lg font-bold text-text-primary">
                No hospitals/clinics found
              </p>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-secondary">
                {emptyMessage}
              </p>
              {locationMode !== "none" && (
                <button
                  onClick={clearLocation}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover active:scale-95"
                >
                  Browse all hospitals
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {hospitals.map((item) => (
                <div
                  onClick={() => router.push(`/hospital/${item._id}`)}
                  key={item._id}
                  className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-border bg-background-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/10"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative flex-shrink-0 md:w-52">
                      <img
                        className="h-48 w-full object-cover md:h-44"
                        src={item.image || assets.header_img.src}
                        alt={item.name}
                      />
                      {item.availableDoctors > 0 && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                          </span>
                          {item.availableDoctors} available
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 lg:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold text-text-primary lg:text-xl">
                            {item.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-sm text-text-secondary">
                            <MapPin size={13} className="shrink-0 text-primary" />
                            {item.city}
                            {item.distanceKm !== undefined && (
                              <span className="ml-1 font-medium text-accent-cta">
                                · {item.distanceKm} km away
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <RatingBadge
                            average={item.ratingAverage}
                            count={item.ratingCount}
                          />
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              item.isRegistered
                                ? "text-green-600"
                                : "text-text-dim"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.isRegistered
                                  ? "bg-green-500"
                                  : "bg-background-muted-hover"
                              }`}
                            />
                            {item.isRegistered ? "Registered" : "Not registered"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-base px-3 py-1.5 text-xs font-medium text-text-secondary">
                          <Stethoscope size={13} className="text-primary" />
                          {item.availableDoctors} available
                          <span className="text-text-dim">
                            / {item.doctorsCount} doctors
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-base px-3 py-1.5 text-xs font-medium text-text-secondary">
                          <BedDouble size={13} className="text-primary" />
                          {item.availableBeds} beds
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.specialties?.length
                          ? item.specialties.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-primary-soft/30 px-3 py-1 text-xs font-medium text-primary"
                              >
                                {s}
                              </span>
                            ))
                          : null}
                      </div>

                      <div className="mt-auto pt-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft/40 px-5 py-2.5 text-sm font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25">
                          View Doctors
                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              className="rounded-full border border-border bg-background-card px-5 py-2.5 text-sm text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
              onClick={() => fetchHospitals(pagination.page - 1)}
              disabled={!hasPrevPage}
            >
              Previous
            </button>
            <p className="text-sm text-text-secondary">
              Page {pagination.page} of{" "}
              {Math.max(Math.ceil(pagination.total / pagination.limit), 1)}
            </p>
            <button
              className="rounded-full border border-border bg-background-card px-5 py-2.5 text-sm text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
              onClick={() => fetchHospitals(pagination.page + 1)}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;