// @ts-nocheck
"use client";
import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '@/src/context/AdminContext';
import { AppContext } from '@/src/context/AppContext';
import axios from 'axios';
import { toast } from "@/src/components/ui/Toast";
import { Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { PageContainer, PageHeader, Card, Badge } from "@/src/components/ui";

const BillingList = () => {
  const { aToken, backendURL } = useContext(AdminContext);
  const { currencySymbol } = useContext(AppContext);
  const [bills, setBills] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const LIMIT = 12;
  const totalPages = Math.ceil(totalCount / LIMIT);

  const fetchBills = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageNum); params.set("limit", LIMIT);
      if (filterStatus) params.set("status", filterStatus === "overdue" ? "Pending" : filterStatus === "paid" ? "Paid" : "Pending");
      if (filterSearch.trim()) params.set("search", filterSearch.trim());
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);
      const { data } = await axios.get(`${backendURL}/api/billing/admin/list?${params.toString()}`, { headers: { aToken } });
      if (data.success) { setBills(data.billings || []); setTotalCount(data.pagination?.total || 0); setPage(data.pagination?.page || 1); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (aToken) fetchBills(1); }, [aToken]);

  const handleSearch = (e) => { e?.preventDefault(); fetchBills(1); };

  const clearFilters = () => { setFilterSearch(""); setFilterStatus(""); setFilterPaymentMethod(""); setFilterDateFrom(""); setFilterDateTo(""); setTimeout(() => fetchBills(1), 0); };

  const formatDate = (dateStr) => { if (!dateStr) return "—"; return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge tone="emerald" dot>Paid</Badge>;
      case 'pending': return <Badge tone="amber" dot>Pending</Badge>;
      case 'overdue': return <Badge tone="rose" dot>Overdue</Badge>;
      default: return <span className="text-xs text-text-dim">{status}</span>;
    }
  };

  const markAsPaid = async (billId, e) => {
    e?.stopPropagation();
    try {
      const { data } = await axios.post(`${backendURL}/api/billing/admin/mark-paid`, { billingId: billId }, { headers: { aToken } });
      if (data.success) { toast.success(data.message); fetchBills(page); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const hasActiveFilters = filterSearch || filterStatus || filterPaymentMethod || filterDateFrom || filterDateTo;

  return (
    <PageContainer>
      <PageHeader
        title="Billing & Invoices"
        subtitle="Hospital commission bills and payment status"
        actions={
          <div className="flex items-center gap-2.5">
            <button onClick={() => setShowFilters((v) => !v)} className={`flex items-center gap-2 text-sm border px-3.5 py-2 rounded-xl cursor-pointer transition-colors ${hasActiveFilters ? "bg-primary text-white border-primary" : "text-text-secondary border-border hover:bg-background-muted"}`}>
              <SlidersHorizontal size={14} />{showFilters ? "Hide Filters" : "Filters"}{hasActiveFilters && <span className="w-4 h-4 rounded-full bg-background-card text-primary text-[10px] flex items-center justify-center font-bold">!</span>}
            </button>
            <button onClick={() => fetchBills(page)} className="flex items-center gap-2 text-sm border border-border px-3.5 py-2 rounded-xl cursor-pointer hover:bg-background-muted transition-colors">Refresh</button>
          </div>
        }
      />
      {showFilters && (
        <form onSubmit={handleSearch} className="bg-background-card border border-border rounded-lg p-5 mb-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Search</label>
              <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Patient, doctor, or bill ID" className="w-full border border-border rounded px-3 py-2 pl-8 text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Status</label>
              <div className="relative">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-border rounded px-3 py-2 pr-8 appearance-none text-sm bg-background-card">
                  <option value="">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Payment Method</label>
              <div className="relative">
                <select value={filterPaymentMethod} onChange={(e) => setFilterPaymentMethod(e.target.value)} className="w-full border border-border rounded px-3 py-2 pr-8 appearance-none text-sm bg-background-card">
                  <option value="">All methods</option><option value="online">Online</option><option value="cash">Cash</option><option value="insurance">Insurance</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Date From</label>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Date To</label>
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-white text-sm px-6 py-2 rounded-full cursor-pointer hover:bg-primary-hover transition-colors">Apply</button>
            <button type="button" onClick={clearFilters} className="text-sm px-6 py-2 border border-border rounded-full cursor-pointer hover:bg-primary-soft transition-colors">Clear</button>
          </div>
        </form>
      )}
      <p className="text-sm text-text-secondary mb-4">{loading ? "Loading bills..." : `${totalCount} bill${totalCount !== 1 ? "s" : ""} total`}</p>
      <Card padded={false} className="overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_1fr_auto] gap-2 py-3 px-6 border-b border-border text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          <p>Bill ID</p><p>Hospital</p><p>Amount</p><p>Status</p><p>Appointments</p><p>Date</p><p>Actions</p>
        </div>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary"><Receipt size={40} className="mb-3 opacity-40" /><p>No bills found</p></div>
        ) : (
          bills.map((bill) => (
            <div key={bill._id} className="flex flex-wrap justify-between items-center gap-2 sm:grid sm:grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_1fr_auto] py-3 px-6 border-b border-border text-sm hover:bg-primary-soft/30">
              <p className="font-mono text-xs text-text-secondary truncate">{bill._id?.slice(-8) || '—'}</p>
              <div><p className="font-medium text-text-primary truncate">{bill.hospitalId?.name || '—'}</p><p className="text-xs text-text-secondary">Commission: {currencySymbol}{(bill.commissionAmount || 0).toLocaleString()}</p></div>
              <p className="font-semibold text-text-primary">{currencySymbol}{bill.grandTotal?.toLocaleString() || 0}</p>
              {getStatusBadge((bill.status || '').toLowerCase())}
              <p className="text-text-secondary">{bill.totalAppointments || 0}{bill.bedAllocations ? ` + ${bill.bedAllocations} beds` : ''}</p>
              <p className="text-text-secondary">{formatDate(bill.billingPeriodEnd || bill.createdAt)}</p>
              <div className="flex items-center gap-3">
                {(bill.status || '') === 'Pending' && (
                  <button onClick={(e) => markAsPaid(bill._id, e)} className="text-xs bg-primary text-white px-3 py-1.5 rounded-full cursor-pointer hover:bg-primary-hover transition-colors" title="Mark as paid">Mark Paid</button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={page <= 1} onClick={() => fetchBills(page - 1)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-full disabled:opacity-40 cursor-pointer hover:bg-primary-soft transition-colors"><ChevronLeft size={14} /> Prev</button>
          <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => fetchBills(page + 1)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-full disabled:opacity-40 cursor-pointer hover:bg-primary-soft transition-colors">Next <ChevronRight size={14} /></button>
        </div>
      )}
    </PageContainer>
  );
};

export default BillingList;
