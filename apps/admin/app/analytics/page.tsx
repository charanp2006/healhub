// @ts-nocheck
"use client";
import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '@/src/context/AdminContext';
import { AppContext } from '@/src/context/AppContext';
import axios from 'axios';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, CalendarCheck, DollarSign, Building2, Award, CreditCard, Banknote } from 'lucide-react';
import { SkeletonDashboard } from "@healhub/ui";
import { PageContainer, PageHeader } from "@/src/components/ui";

const COLORS = ['#20C3AE', '#6366F1', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#06B6D4'];

const StatCard = ({ icon, bg, value, label, badge, extra }) => (
  <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
      {badge}
    </div>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
    <p className="text-sm text-text-secondary mt-0.5">{label}</p>
    {extra && <p className="text-xs text-text-dim mt-0.5">{extra}</p>}
  </div>
);

const Analytics = () => {
  const { aToken, backendURL } = useContext(AdminContext);
  const { currencySymbol } = useContext(AppContext);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [specialityStats, setSpecialityStats] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes, doctorRes, specRes] = await Promise.all([
        axios.get(`${backendURL}/api/analytics/overview`, { headers: { aToken } }),
        axios.get(`${backendURL}/api/analytics/trends`, { headers: { aToken } }),
        axios.get(`${backendURL}/api/analytics/doctor-performance`, { headers: { aToken } }),
        axios.get(`${backendURL}/api/analytics/speciality-stats`, { headers: { aToken } }),
      ]);
      if (overviewRes.data.success) setOverview(overviewRes.data.stats);
      if (trendsRes.data.success) setTrends(trendsRes.data.trends);
      if (doctorRes.data.success) setDoctorPerformance(doctorRes.data.performance);
      if (specRes.data.success) setSpecialityStats(specRes.data.specialities);
    } catch (error) { console.log('Error fetching analytics:', error); }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (aToken) fetchAll(); }, [aToken]);

  const GrowthBadge = ({ value }) => {
    if (value === 0) return <span className="text-xs text-text-dim">0%</span>;
    return value > 0
      ? <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium"><TrendingUp size={12} /> +{value}%</span>
      : <span className="flex items-center gap-0.5 text-xs text-red-500 font-medium"><TrendingDown size={12} /> {value}%</span>;
  };

  const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'revenue', label: 'Revenue' }, { key: 'doctors', label: 'Doctors' }, { key: 'specialities', label: 'Specialities' }];

  if (loading) {
    return (<div className="m-5 w-full max-w-6xl"><SkeletonDashboard /></div>);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive insights into your healthcare platform"
        actions={
          <button onClick={fetchAll} className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background-muted cursor-pointer">Refresh</button>
        }
      />
      <div className="flex gap-1 bg-background-muted p-1 rounded-lg mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 text-sm rounded-md cursor-pointer transition-all ${activeTab === tab.key ? 'bg-background-card shadow-sm font-medium text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users size={20} className="text-blue-600" />} bg="bg-blue-50" value={overview.totalPatients} label="Total Patients" badge={<GrowthBadge value={overview.appointmentGrowth} />} />
            <StatCard icon={<CalendarCheck size={20} className="text-emerald-600" />} bg="bg-emerald-50" value={overview.totalAppointments} label="Appointments" extra={`${overview.activeAppointments} active`} />
            <StatCard icon={<DollarSign size={20} className="text-violet-600" />} bg="bg-violet-50" value={`${currencySymbol}${overview.totalRevenue.toLocaleString()}`} label="Total Revenue" badge={<GrowthBadge value={overview.revenueGrowth} />} />
            <StatCard icon={<Building2 size={20} className="text-primary" />} bg="bg-primary-soft" value={overview.totalDoctors} label="Doctors" extra={`${overview.totalHospitals} hospitals`} />
          </div>
          <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
            <p className="font-semibold text-text-primary mb-1">Appointment Trends</p>
            <p className="text-xs text-text-dim mb-4">Bookings, completions, and cancellations over the last 12 months</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="booked" name="Booked" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2"><DollarSign size={18} className="text-violet-600" /><span className="text-sm text-text-secondary">Total Revenue</span></div>
              <p className="text-2xl font-bold text-text-primary">{currencySymbol}{overview?.totalRevenue?.toLocaleString() ?? 0}</p>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2"><CreditCard size={18} className="text-blue-600" /><span className="text-sm text-text-secondary">This Month</span></div>
              <p className="text-2xl font-bold text-text-primary">{currencySymbol}{overview?.thisMonthRevenue?.toLocaleString() ?? 0}</p>
              {overview && <GrowthBadge value={overview.revenueGrowth} />}
            </div>
            <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2"><Banknote size={18} className="text-emerald-600" /><span className="text-sm text-text-secondary">Avg per Appointment</span></div>
              <p className="text-2xl font-bold text-text-primary">{currencySymbol}{overview && overview.totalAppointments > 0 ? Math.round(overview.totalRevenue / overview.totalAppointments).toLocaleString() : 0}</p>
            </div>
          </div>
          <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
            <p className="font-semibold text-text-primary mb-1">Monthly Revenue</p>
            <p className="text-xs text-text-dim mb-4">Revenue trend over last 12 months</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
            <p className="font-semibold text-text-primary mb-4">Revenue by Speciality</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={specialityStats.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} width={120} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" name="Revenue" fill="#20C3AE" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="space-y-6">
          {doctorPerformance.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {doctorPerformance.slice(0, 3).map((doc, idx) => (
                <div key={doc._id} className="bg-background-card rounded-xl border border-border p-5 shadow-sm relative overflow-hidden">
                  {idx === 0 && <div className="absolute top-3 right-3"><Award size={20} className="text-amber-400" /></div>}
                  <div className="flex items-center gap-3 mb-3">
                    <img src={doc.image} className="w-12 h-12 rounded-full bg-background-muted object-cover" alt="" />
                    <div><p className="font-semibold text-text-primary">{doc.name}</p><p className="text-xs text-text-dim">{doc.speciality}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><p className="text-xs text-text-dim">Revenue</p><p className="font-bold text-text-primary">{currencySymbol}{doc.revenue.toLocaleString()}</p></div>
                    <div><p className="text-xs text-text-dim">Patients</p><p className="font-bold text-text-primary">{doc.patients}</p></div>
                    <div><p className="text-xs text-text-dim">Appointments</p><p className="font-bold text-text-primary">{doc.total}</p></div>
                    <div><p className="text-xs text-text-dim">Completion</p><p className="font-bold text-text-primary">{doc.completionRate}%</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-background-card rounded-xl border border-border shadow-sm">
            <div className="p-5 pb-3"><p className="font-semibold text-text-primary">Doctor Performance Leaderboard</p><p className="text-xs text-text-dim mt-0.5">Ranked by total revenue</p></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-t border-b border-border bg-background-muted">
                  <th className="text-left px-5 py-3 font-medium text-text-secondary">#</th><th className="text-left px-5 py-3 font-medium text-text-secondary">Doctor</th><th className="text-left px-5 py-3 font-medium text-text-secondary">Speciality</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Appointments</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Completed</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Rate</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Patients</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Revenue</th>
                </tr></thead>
                <tbody>
                  {doctorPerformance.map((doc, idx) => (
                    <tr key={doc._id} className="border-b border-border hover:bg-background-muted">
                      <td className="px-5 py-3 text-text-dim">{idx + 1}</td>
                      <td className="px-5 py-3"><div className="flex items-center gap-2"><img src={doc.image} className="w-7 h-7 rounded-full bg-background-muted object-cover" alt="" /><span className="font-medium text-text-primary">{doc.name}</span></div></td>
                      <td className="px-5 py-3 text-text-secondary">{doc.speciality}</td>
                      <td className="px-5 py-3 text-right">{doc.total}</td>
                      <td className="px-5 py-3 text-right text-green-600">{doc.completed}</td>
                      <td className="px-5 py-3 text-right"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${doc.completionRate >= 80 ? 'bg-green-50 text-green-600' : doc.completionRate >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>{doc.completionRate}%</span></td>
                      <td className="px-5 py-3 text-right">{doc.patients}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-primary">{currencySymbol}{doc.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  {doctorPerformance.length === 0 && (<tr><td colSpan={8} className="py-12 text-center text-text-dim">No doctor data available</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'specialities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
              <p className="font-semibold text-text-primary mb-4">Appointment Distribution</p>
              <div className="h-72">
                {specialityStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={specialityStats.slice(0, 8)} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="total" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {specialityStats.slice(0, 8).map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (<div className="h-full flex items-center justify-center text-text-dim">No data</div>)}
              </div>
            </div>
            <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
              <p className="font-semibold text-text-primary mb-4">Revenue by Speciality</p>
              <div className="h-72">
                {specialityStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={specialityStats.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                        {specialityStats.slice(0, 8).map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (<div className="h-full flex items-center justify-center text-text-dim">No data</div>)}
              </div>
            </div>
          </div>
          <div className="bg-background-card rounded-xl border border-border shadow-sm">
            <div className="p-5 pb-3"><p className="font-semibold text-text-primary">Speciality Breakdown</p></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-t border-b border-border bg-background-muted">
                  <th className="text-left px-5 py-3 font-medium text-text-secondary">#</th><th className="text-left px-5 py-3 font-medium text-text-secondary">Speciality</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Appointments</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Revenue</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Share</th>
                </tr></thead>
                <tbody>
                  {specialityStats.map((spec, idx) => {
                    const totalAll = specialityStats.reduce((s, v) => s + v.total, 0);
                    const share = totalAll > 0 ? ((spec.total / totalAll) * 100).toFixed(1) : 0;
                    return (
                      <tr key={idx} className="border-b border-border hover:bg-background-muted">
                        <td className="px-5 py-3 text-text-dim">{idx + 1}</td>
                        <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} /><span className="font-medium text-text-primary">{spec.name}</span></div></td>
                        <td className="px-5 py-3 text-right">{spec.total}</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-primary">{currencySymbol}{spec.revenue.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-text-secondary">{share}%</td>
                      </tr>
                    );
                  })}
                  {specialityStats.length === 0 && (<tr><td colSpan={5} className="py-12 text-center text-text-dim">No speciality data available</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Analytics;
