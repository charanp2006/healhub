// @ts-nocheck
"use client";
import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '@/src/context/AdminContext';
import { AppContext } from '@/src/context/AppContext';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Building2, Users, CalendarCheck, DollarSign, Star, Award } from 'lucide-react';
import { SkeletonDashboard } from "@healhub/ui";
import { PageContainer, PageHeader } from "@/src/components/ui";

const HospitalAnalytics = () => {
  const { aToken, backendURL, hospitals, getAllHospitals } = useContext(AdminContext);
  const { currencySymbol } = useContext(AppContext);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [stats, setStats] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (aToken) getAllHospitals(); }, [aToken]);

  const fetchHospitalStats = async (hospitalId) => {
    if (!hospitalId) { setStats(null); setTopDoctors([]); return; }
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendURL}/api/analytics/hospital`, {
        params: { hospitalId },
        headers: { aToken },
      });
      const h = data.success ? data.hospitals?.[0] : null;
      if (data.success && h) {
        const s = h.stats || {};
        setStats({
          ...s,
          revenueGrowth: s.revenueGrowth ?? 0,
          totalPatients: s.totalPatients ?? 0,
          inPersonCount: s.inPersonCount ?? 0,
          videoCount: s.videoCount ?? 0,
          onlinePayments: s.onlinePayments ?? 0,
          cashPayments: s.cashPayments ?? 0,
        });
        setTopDoctors((h.topDoctors || []).map((d) => ({
          ...d,
          appointmentCount: d.appointments ?? 0,
          ratingAverage: d.ratingAverage ?? 0,
        })));
      } else {
        setStats(null);
        setTopDoctors([]);
      }
    } catch (error) { console.log('Error:', error); setStats(null); setTopDoctors([]); }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (selectedHospital && aToken) fetchHospitalStats(selectedHospital); }, [selectedHospital, aToken]);

  const GrowthBadge = ({ value }) => {
    if (!value || value === 0) return <span className="text-xs text-text-dim">0%</span>;
    return value > 0
      ? <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium"><TrendingUp size={12} /> +{value}%</span>
      : <span className="flex items-center gap-0.5 text-xs text-red-500 font-medium"><TrendingDown size={12} /> {value}%</span>;
  };

  const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'revenue', label: 'Revenue' }, { key: 'doctors', label: 'Top Doctors' }];

  return (
    <PageContainer>
      <PageHeader
        title="Hospital Analytics"
        subtitle="Performance insights for individual hospitals"
        actions={
          <select value={selectedHospital} onChange={(e) => { setSelectedHospital(e.target.value); setActiveTab('overview'); }} className="w-full sm:w-64 border border-border rounded-xl px-3.5 py-2.5 text-sm bg-background-card text-text-primary outline-none transition-colors focus:border-primary cursor-pointer">
            <option value="">Select a hospital</option>
            {hospitals.map((h) => (<option key={h._id} value={h._id}>{h.name}</option>))}
          </select>
        }
      />
      {!selectedHospital ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-dim">
          <Building2 size={48} className="mb-4 opacity-30" /><p className="text-lg">Select a hospital to view analytics</p><p className="text-sm mt-1">Choose a hospital from the dropdown above</p>
        </div>
      ) : loading ? (
        <SkeletonDashboard />
      ) : stats ? (
        <div className="space-y-6">
          <div className="flex gap-1 bg-background-muted p-1 rounded-lg w-fit">{tabs.map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 text-sm rounded-md cursor-pointer transition-all ${activeTab === tab.key ? 'bg-background-card shadow-sm font-medium text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>{tab.label}</button>))}</div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><Building2 size={18} className="text-primary" /><span className="text-sm text-text-secondary">Total Doctors</span></div><p className="text-2xl font-bold text-text-primary">{stats.totalDoctors}</p></div>
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><CalendarCheck size={18} className="text-emerald-600" /><span className="text-sm text-text-secondary">Appointments</span></div><p className="text-2xl font-bold text-text-primary">{stats.totalAppointments}</p><GrowthBadge value={stats.appointmentGrowth} /></div>
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><DollarSign size={18} className="text-violet-600" /><span className="text-sm text-text-secondary">Revenue</span></div><p className="text-2xl font-bold text-text-primary">{currencySymbol}{stats.totalRevenue?.toLocaleString()}</p><GrowthBadge value={stats.revenueGrowth} /></div>
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><Users size={18} className="text-blue-600" /><span className="text-sm text-text-secondary">Patients</span></div><p className="text-2xl font-bold text-text-primary">{stats.totalPatients}</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
                  <p className="font-semibold text-text-primary mb-4">Appointment Types</p>
                  <div className="flex items-center justify-center h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={[{ name: 'In-Person', value: stats.inPersonCount || 0 }, { name: 'Video', value: stats.videoCount || 0 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"><Cell fill="#20C3AE" /><Cell fill="#6366F1" /></Pie><Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} /><Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
                  <p className="font-semibold text-text-primary mb-4">Payment Methods</p>
                  <div className="flex items-center justify-center h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={[{ name: 'Online', value: stats.onlinePayments || 0 }, { name: 'Cash', value: stats.cashPayments || 0 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"><Cell fill="#3B82F6" /><Cell fill="#F59E0B" /></Pie><Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} /><Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><DollarSign size={18} className="text-violet-600" /><span className="text-sm text-text-secondary">Total Revenue</span></div><p className="text-2xl font-bold text-text-primary">{currencySymbol}{stats.totalRevenue?.toLocaleString()}</p></div>
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><DollarSign size={18} className="text-blue-600" /><span className="text-sm text-text-secondary">This Month</span></div><p className="text-2xl font-bold text-text-primary">{currencySymbol}{stats.thisMonthRevenue?.toLocaleString()}</p><GrowthBadge value={stats.revenueGrowth} /></div>
                <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><DollarSign size={18} className="text-emerald-600" /><span className="text-sm text-text-secondary">Avg per Appointment</span></div><p className="text-2xl font-bold text-text-primary">{currencySymbol}{stats.totalAppointments > 0 ? Math.round(stats.totalRevenue / stats.totalAppointments).toLocaleString() : 0}</p></div>
              </div>
            </div>
          )}
          {activeTab === 'doctors' && (
            <div className="bg-background-card rounded-xl border border-border shadow-sm">
              <div className="p-5 pb-3"><p className="font-semibold text-text-primary">Top Performing Doctors</p><p className="text-xs text-text-dim mt-0.5">Ranked by appointments completed</p></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-t border-b border-border bg-background-muted">
                    <th className="text-left px-5 py-3 font-medium text-text-secondary">#</th><th className="text-left px-5 py-3 font-medium text-text-secondary">Doctor</th><th className="text-left px-5 py-3 font-medium text-text-secondary">Speciality</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Appointments</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Revenue</th><th className="text-right px-5 py-3 font-medium text-text-secondary">Rating</th>
                  </tr></thead>
                  <tbody>
                    {topDoctors.map((doc, idx) => (
                      <tr key={doc._id || idx} className="border-b border-border hover:bg-background-muted">
                        <td className="px-5 py-3 text-text-dim">{idx + 1}{idx === 0 && <Award size={14} className="inline ml-1 text-amber-400" />}</td>
                        <td className="px-5 py-3"><div className="flex items-center gap-2"><img src={doc.image} className="w-7 h-7 rounded-full bg-background-muted object-cover" alt="" /><span className="font-medium text-text-primary">{doc.name}</span></div></td>
                        <td className="px-5 py-3 text-text-secondary">{doc.speciality}</td>
                        <td className="px-5 py-3 text-right">{doc.appointmentCount || doc.total || 0}</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-primary">{currencySymbol}{(doc.revenue || 0).toLocaleString()}</td>
                        <td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium text-text-primary">{doc.ratingAverage ? doc.ratingAverage.toFixed(1) : '0.0'}</span></div></td>
                      </tr>
                    ))}
                    {topDoctors.length === 0 && (<tr><td colSpan={6} className="py-12 text-center text-text-dim">No doctor data available for this hospital</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-dim"><p>No data available for this hospital</p></div>
      )}
    </PageContainer>
  );
};

export default HospitalAnalytics;
