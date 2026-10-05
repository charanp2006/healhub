// @ts-nocheck
"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminContext } from "@/src/context/AdminContext";
import { AppContext } from "@/src/context/AppContext";
import axios from "axios";
import {
  Users,
  CalendarCheck,
  DollarSign,
  Stethoscope,
  Activity,
  Video,
  MapPin,
  ArrowRight,
  UserPlus,
  PlusCircle,
  FilePlus,
  RefreshCw,
  CalendarRange,

  XCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SkeletonDashboard } from "@healhub/ui";
import { Card, StatCard, Badge, CardHeader } from "@/src/components/ui";

const QUICK_ACTIONS = [
  { label: "Add Doctor", href: "/add-doctor", Icon: UserPlus, tone: "primary" },
  { label: "Add Hospital", href: "/add-hospital", Icon: PlusCircle, tone: "blue" },
  { label: "Add Blog", href: "/add-blog", Icon: FilePlus, tone: "violet" },
  { label: "All Appointments", href: "/all-appointments", Icon: CalendarRange, tone: "amber" },
];

const Dashboard = () => {
  const ctx = useContext(AdminContext);
  const { aToken, cancelAppointment, dashboardData, getDashboardData, backendURL } = ctx;
  const { slotDateFormat, currencySymbol } = useContext(AppContext);
  const router = useRouter();

  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, trendsRes, activityRes] = await Promise.all([
        axios.get(`${backendURL}/api/analytics/overview`, { headers: { aToken } }),
        axios.get(`${backendURL}/api/analytics/trends`, { headers: { aToken } }),
        axios.get(`${backendURL}/api/analytics/recent-activity`, { headers: { aToken } }),
      ]);
      if (overviewRes.data.success) setOverview(overviewRes.data.stats);
      if (trendsRes.data.success) setTrends(trendsRes.data.trends);
      if (activityRes.data.success) setRecentActivity(activityRes.data.activities);
    } catch (error) {
      console.log("Error fetching analytics:", error);
    } finally {
      setDashboardReady(true);
    }
  };

  useEffect(() => {
    if (aToken) {
      getDashboardData();
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const statusConfig = {
    completed: { label: "Completed", tone: "emerald" },
    cancelled: { label: "Cancelled", tone: "rose" },
    rescheduled: { label: "Rescheduled", tone: "amber" },
  };

  const actionIcon = (action) => {
    if (action === "completed") return <CheckCircle2 size={13} />;
    if (action === "cancelled") return <XCircle size={13} />;
    return <Clock size={13} />;
  };

  const getAppointmentStatus = (appointment) => {
    if (appointment.cancelled) return { label: "Cancelled", tone: "rose" };
    if (appointment.isCompleted) return { label: "Completed", tone: "emerald" };
    if (appointment.rescheduled) return { label: "Rescheduled", tone: "amber" };
    return { label: "Active", tone: "primary" };
  };

  if (!dashboardReady) {
    return (
      <div className="px-5 sm:px-6 lg:px-8 py-6 lg:py-8">
        <SkeletonDashboard />
      </div>
    );
  }

  const statTotal = overview?.totalAppointments || 0;
  const completedPct = statTotal ? Math.round((overview.completedAppointments / statTotal) * 100) : 0;
  const activePct = statTotal ? Math.round((overview.activeAppointments / statTotal) * 100) : 0;
  const cancelledPct = statTotal ? Math.round((overview.cancelledAppointments / statTotal) * 100) : 0;

  return (
    <div className="px-5 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            {greeting}, Admin 👋
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Here&apos;s what&apos;s happening across your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              getDashboardData();
              fetchAnalytics();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background-card px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background-muted cursor-pointer"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover cursor-pointer"
          >
            View Analytics <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Patients"
          value={overview?.totalPatients?.toLocaleString() ?? "—"}
          Icon={Users}
          tone="blue"
          trend={overview?.appointmentGrowth}
          caption="Across all hospitals"
        />
        <StatCard
          label="Appointments"
          value={overview?.totalAppointments?.toLocaleString() ?? "—"}
          Icon={CalendarCheck}
          tone="emerald"
          caption={`${overview?.activeAppointments ?? 0} active right now`}
        />
        <StatCard
          label="Total Revenue"
          value={`${currencySymbol}${overview?.totalRevenue?.toLocaleString() ?? "0"}`}
          Icon={DollarSign}
          tone="violet"
          trend={overview?.revenueGrowth}
          caption={`Avg ₹${overview && overview.totalAppointments > 0 ? Math.round(overview.totalRevenue / overview.totalAppointments).toLocaleString() : "0"} per visit`}
        />
        <StatCard
          label="Doctors"
          value={overview?.totalDoctors?.toLocaleString() ?? "—"}
          Icon={Stethoscope}
          tone="primary"
          caption={`${overview?.totalHospitals ?? 0} registered hospitals`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false}>
          <CardHeader
            title="Revenue Trend"
            subtitle="Last 12 months"
            action={
              <button
                onClick={() => router.push("/analytics")}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Full details <ArrowRight size={12} />
              </button>
            }
          />
          <div className="h-64 px-2 py-4">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20C3AE" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#20C3AE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--s-border)",
                      background: "var(--s-bg-card)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      fontSize: "12px",
                      color: "var(--s-text-primary)",
                    }}
                    formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, "Revenue"]}
                    cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#20C3AE"
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-dim">
                No data available yet
              </div>
            )}
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader title="Appointment Summary" subtitle="Current distribution" />
          <div className="p-5">
            <div className="flex items-center justify-center">
              <div className="relative h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: overview?.completedAppointments ?? 0, fill: "#10b981" },
                        { name: "Active", value: overview?.activeAppointments ?? 0, fill: "#3b82f6" },
                        { name: "Cancelled", value: overview?.cancelledAppointments ?? 0, fill: "#ef4444" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {[{ fill: "#10b981" }, { fill: "#3b82f6" }, { fill: "#ef4444" }].map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-text-primary">{statTotal}</span>
                  <span className="text-[11px] text-text-dim">total</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {[
                { label: "Completed", value: overview?.completedAppointments ?? 0, pct: completedPct, color: "bg-[#10b981]" },
                { label: "Active", value: overview?.activeAppointments ?? 0, pct: activePct, color: "bg-[#3b82f6]" },
                { label: "Cancelled", value: overview?.cancelledAppointments ?? 0, pct: cancelledPct, color: "bg-[#ef4444]" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className={`h-2 w-2 rounded-full ${row.color}`} /> {row.label}
                    </span>
                    <span className="font-medium text-text-primary">
                      {row.value} <span className="text-xs text-text-dim">({row.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-muted">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background-muted p-3">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <MapPin size={13} className="text-primary" /> In-person
                </div>
                <p className="mt-1 text-lg font-bold text-text-primary">{overview?.inPersonCount ?? 0}</p>
              </div>
              <div className="rounded-xl bg-background-muted p-3">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Video size={13} className="text-primary" /> Video call
                </div>
                <p className="mt-1 text-lg font-bold text-text-primary">{overview?.videoCount ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent activity */}
        <Card padded={false}>
          <CardHeader
            title="Recent Activity"
            subtitle="Latest platform events"
            action={
              <span className="inline-flex items-center gap-1 text-xs text-text-dim">
                <Activity size={13} className="text-primary" /> live
              </span>
            }
          />
          <div className="max-h-96 divide-y divide-border overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-text-dim">No recent activity</p>
            ) : (
              recentActivity.slice(0, 8).map((item, index) => {
                const st = statusConfig[item.action] || { label: item.action, tone: "primary" };
                return (
                  <div key={index} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-background-muted">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-muted">
                      <img className="h-9 w-9 rounded-full object-cover" src={item.patientImage} alt="" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">{item.patientName}</span>{" "}
                        <Badge tone={st.tone} className="mx-1 px-2 py-0">
                          {actionIcon(item.action)} {st.label}
                        </Badge>{" "}
                        with <span className="font-semibold">{item.doctorName}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-text-dim">
                        {item.slotDate} · {item.slotTime}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-text-primary">
                      {currencySymbol}{item.amount}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Latest bookings */}
        <Card padded={false}>
          <CardHeader
            title="Latest Bookings"
            subtitle="Most recent appointments"
            action={
              <Link href="/all-appointments" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer">
                View all <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="max-h-96 divide-y divide-border overflow-y-auto">
            {!dashboardData || dashboardData.latestAppointments?.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-text-dim">No appointments found</p>
            ) : (
              dashboardData.latestAppointments.map((appointment, index) => {
                const st = getAppointmentStatus(appointment);
                return (
                  <div key={index} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-background-muted">
                    <img className="h-10 w-10 shrink-0 rounded-full bg-background-muted object-cover" src={appointment.docData.image} alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{appointment.docData.name}</p>
                      <p className="truncate text-xs text-text-dim">
                        {appointment.docData.speciality} · {slotDateFormat(appointment.slotDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={st.tone} dot>{st.label}</Badge>
                      {!appointment.cancelled && !appointment.isCompleted && (
                        <button
                          onClick={() => cancelAppointment(appointment._id)}
                          title="Cancel appointment"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-[#ef4444]/10 hover:text-[#ef4444] cursor-pointer"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <Card padded={false}>
          <CardHeader title="Quick Actions" subtitle="Common admin tasks" />
          <div className="grid grid-cols-2 gap-3 p-5">
            {QUICK_ACTIONS.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-background-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon size={19} />
                </span>
                <span className="text-sm font-medium text-text-primary">{label}</span>
                <span className="flex items-center gap-1 text-xs text-text-dim">
                  Open <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;