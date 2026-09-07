"use client";

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "@/src/context/AppContext";
import { Users, UserCheck, Building2 } from "lucide-react";
import { Skeleton, SkeletonBox } from "@healhub/ui";

const STAT_META = {
  userCount: { label: "Patients", icon: Users },
  doctorCount: { label: "Doctors", icon: UserCheck },
  hospitalCount: { label: "Hospitals", icon: Building2 },
};

const BadgeSkeleton = () => (
  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-5 rounded-xl md:rounded-lg border border-border bg-background-card">
    <Skeleton variant="circular" className="w-10 h-10 md:w-16 md:h-16" />
    <div className="flex w-full flex-col items-center gap-2 md:items-start">
      <Skeleton variant="text" className="h-3 w-16 md:h-3.5 md:w-20" />
      <Skeleton variant="text" className="h-6 w-14 md:h-8 md:w-24" />
    </div>
  </div>
);

const StatsButtons = () => {
  const { backendURL } = useContext(AppContext);
  const [stats, setStats] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${backendURL}/api/user/stats`);
        if (data.success) {
          setStats(data);
        }
      } catch (error) {
        console.log("Error fetching stats:", error);
      } finally {
        setLoaded(true);
      }
    };
    fetchStats();
  }, [backendURL]);

  const badges = Object.entries(stats)
    .filter(([key]) => STAT_META[key])
    .map(([key, value]) => ({ meta: STAT_META[key], count: Number(value) }));

  return (
    <div className="bg-background-card py-6 px-4 md:px-10">
      <SkeletonBox>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6 max-w-6xl mx-auto">
          {!loaded
            ? [0, 1, 2].map((i) => <BadgeSkeleton key={i} />)
            : badges.map(({ meta, count }, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 p-3 md:p-5 rounded-xl md:rounded-lg border border-primary-soft bg-gradient-to-r from-primary/5 to-transparent hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <meta.icon size={20} className="text-primary md:size-8" />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[11px] md:text-sm text-text-secondary font-medium">
                      {meta.label}
                    </p>
                    <p className="text-xl md:text-3xl font-bold text-primary">
                      {count.toLocaleString()}+
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </SkeletonBox>
    </div>
  );
};

export default StatsButtons;