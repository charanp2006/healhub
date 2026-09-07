// @ts-nocheck
"use client";
import { useContext, useEffect, useState } from "react";
import { toast } from "@/src/components/ui/Toast";
import axios from "axios";
import { AdminContext } from "@/src/context/AdminContext";
import { BedDouble, PlusCircle, Pencil, UserPlus, UserMinus, History, ChevronDown } from "lucide-react";
import { PageContainer, PageHeader } from "@/src/components/ui";

const ManageRooms = () => {
  const { backendURL, aToken } = useContext(AdminContext);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formTotal, setFormTotal] = useState("");
  const [formAvailable, setFormAvailable] = useState("");
  const [showAdmit, setShowAdmit] = useState(false);
  const [admitCategoryId, setAdmitCategoryId] = useState("");
  const [admitPatientId, setAdmitPatientId] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const fetchHospitals = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/admin/all-hospitals`, { headers: { aToken } });
      if (data.success) setHospitals(data.hospitals || []);
    } catch (error) { toast.error(error.message); }
  };

  const fetchCategories = async () => {
    if (!selectedHospitalId) return;
    try {
      const { data } = await axios.get(`${backendURL}/api/bed/categories/${selectedHospitalId}`, { headers: { aToken } });
      if (data.success) setCategories(data.categories);
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const fetchHistory = async (page = 1) => {
    if (!selectedHospitalId) return;
    try {
      const { data } = await axios.get(`${backendURL}/api/bed/history/${selectedHospitalId}?page=${page}&limit=10`, { headers: { aToken } });
      if (data.success) {
        setAllocations(data.allocations);
        setHistoryPage(data.pagination.page);
        setHistoryTotal(data.pagination.total);
      }
    } catch (error) { toast.error(error.message); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (aToken) fetchHospitals(); }, [aToken]);
  useEffect(() => {
    if (selectedHospitalId) {
      fetchCategories();
      setShowHistory(false); setShowAdmit(false); setShowForm(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHospitalId]);

  const resetForm = () => { setEditingId(null); setFormName(""); setFormTotal(""); setFormAvailable(""); setShowForm(false); };

  const openEditForm = (cat) => {
    setEditingId(cat._id); setFormName(cat.name); setFormTotal(String(cat.totalBeds)); setFormAvailable(String(cat.availableBeds));
    setShowForm(true); setShowAdmit(false); setShowHistory(false);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { data } = await axios.post(`${backendURL}/api/bed/update-category`, { categoryId: editingId, name: formName, totalBeds: Number(formTotal), availableBeds: Number(formAvailable) }, { headers: { aToken } });
        if (data.success) { toast.success(data.message); resetForm(); fetchCategories(); } else toast.error(data.message);
      } else {
        const { data } = await axios.post(`${backendURL}/api/bed/add-category`, { hospitalId: selectedHospitalId, name: formName, totalBeds: Number(formTotal), availableBeds: Number(formAvailable || formTotal) }, { headers: { aToken } });
        if (data.success) { toast.success(data.message); resetForm(); fetchCategories(); } else toast.error(data.message);
      }
    } catch (error) { toast.error(error.message); }
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    if (!admitCategoryId || !admitPatientId) return toast.error("Select a room category and enter a patient ID");
    try {
      const { data } = await axios.post(`${backendURL}/api/bed/admit`, { hospitalId: selectedHospitalId, roomCategoryId: admitCategoryId, patientId: admitPatientId }, { headers: { aToken } });
      if (data.success) { toast.success(data.message); setAdmitPatientId(""); setAdmitCategoryId(""); setShowAdmit(false); fetchCategories(); } else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const handleDischarge = async (allocationId) => {
    try {
      const { data } = await axios.post(`${backendURL}/api/bed/discharge`, { allocationId }, { headers: { aToken } });
      if (data.success) { toast.success(data.message); fetchCategories(); if (showHistory) fetchHistory(historyPage); } else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const totalPages = Math.ceil(historyTotal / 10);

  return (
    <PageContainer>
      <PageHeader title="Manage Rooms & Beds" subtitle="Assign, admit and manage hospital bed allocations" />
      <div className="mb-6 max-w-sm">
        <label className="block text-sm text-text-secondary mb-1">Select Hospital</label>
        <div className="relative">
          <select value={selectedHospitalId} onChange={(e) => setSelectedHospitalId(e.target.value)} className="w-full border border-border rounded px-3 py-2 pr-8 appearance-none bg-background-card text-text-primary">
            <option value="">— Choose hospital —</option>
            {hospitals.map((h) => (<option key={h._id} value={h._id}>{h.name} ({h.city})</option>))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>
      {selectedHospitalId && (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => { resetForm(); setShowForm(true); setShowAdmit(false); setShowHistory(false); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-full cursor-pointer hover:bg-primary-hover transition-colors">
              <PlusCircle size={16} /> Add Category
            </button>
            <button onClick={() => { setShowAdmit(true); setShowForm(false); setShowHistory(false); }} className="flex items-center gap-2 px-4 py-2 border border-primary text-primary text-sm rounded-full cursor-pointer hover:bg-primary-soft transition-colors">
              <UserPlus size={16} /> Admit Patient
            </button>
            <button onClick={() => { setShowHistory(true); setShowForm(false); setShowAdmit(false); fetchHistory(1); }} className="flex items-center gap-2 px-4 py-2 border border-border text-text-secondary text-sm rounded-full cursor-pointer hover:bg-primary-soft transition-colors">
              <History size={16} /> Allocation History
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleCategorySubmit} className="bg-background-card border border-border rounded-lg p-6 mb-6 max-w-lg">
              <p className="font-medium text-text-primary mb-4">{editingId ? "Edit Room Category" : "New Room Category"}</p>
              <div className="flex flex-col gap-3">
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Category name (e.g. ICU, General Ward)" className="border border-border rounded px-3 py-2" required />
                <input value={formTotal} onChange={(e) => setFormTotal(e.target.value)} placeholder="Total beds" type="number" min="0" className="border border-border rounded px-3 py-2" required />
                <input value={formAvailable} onChange={(e) => setFormAvailable(e.target.value)} placeholder="Available beds" type="number" min="0" className="border border-border rounded px-3 py-2" />
                <div className="flex gap-3">
                  <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full text-sm cursor-pointer hover:bg-primary-hover transition-colors">{editingId ? "Update" : "Add"}</button>
                  <button type="button" onClick={resetForm} className="px-6 py-2 text-sm border border-border rounded-full cursor-pointer hover:bg-primary-soft transition-colors">Cancel</button>
                </div>
              </div>
            </form>
          )}
          {showAdmit && (
            <form onSubmit={handleAdmit} className="bg-background-card border border-border rounded-lg p-6 mb-6 max-w-lg">
              <p className="font-medium text-text-primary mb-4">Admit Patient</p>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <select value={admitCategoryId} onChange={(e) => setAdmitCategoryId(e.target.value)} className="w-full border border-border rounded px-3 py-2 pr-8 appearance-none" required>
                    <option value="">— Select room category —</option>
                    {categories.filter((c) => c.availableBeds > 0).map((c) => (<option key={c._id} value={c._id}>{c.name} ({c.availableBeds} beds free)</option>))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
                <input value={admitPatientId} onChange={(e) => setAdmitPatientId(e.target.value)} placeholder="Patient / User ID" className="border border-border rounded px-3 py-2" required />
                <div className="flex gap-3">
                  <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full text-sm cursor-pointer hover:bg-primary-hover transition-colors">Admit</button>
                  <button type="button" onClick={() => setShowAdmit(false)} className="px-6 py-2 text-sm border border-border rounded-full cursor-pointer hover:bg-primary-soft transition-colors">Cancel</button>
                </div>
              </div>
            </form>
          )}
          <div className="bg-background-card border border-border rounded-lg overflow-hidden mb-6">
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 py-3 px-6 border-b border-border text-sm font-medium text-text-secondary">
              <p>Category</p><p>Total</p><p>Available</p><p>Occupied</p><p>Actions</p>
            </div>
            {categories.length === 0 ? (
              <p className="p-12 text-text-secondary text-center">No room categories yet. Add one above.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat._id} className="flex flex-wrap justify-between items-center gap-2 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] py-3 px-6 border-b border-border hover:bg-primary-soft/30 text-sm">
                  <p className="flex items-center gap-2 font-medium text-text-primary"><BedDouble size={16} className="text-primary" />{cat.name}</p>
                  <p>{cat.totalBeds}</p>
                  <p className={cat.availableBeds === 0 ? "text-accent-cta font-medium" : "text-accent-cta"}>{cat.availableBeds}</p>
                  <p>{cat.totalBeds - cat.availableBeds}</p>
                  <button onClick={() => openEditForm(cat)} className="flex items-center gap-1 text-primary cursor-pointer hover:underline"><Pencil size={14} /> Edit</button>
                </div>
              ))
            )}
          </div>
          {showHistory && (
            <div className="bg-background-card border border-border rounded-lg overflow-hidden">
              <p className="px-6 py-3 border-b border-border font-medium text-text-primary">Allocation History</p>
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 py-3 px-6 border-b border-border text-sm text-text-secondary font-medium">
                <p>Patient</p><p>Category</p><p>Admitted</p><p>Discharged</p><p>Status</p><p>Actions</p>
              </div>
              {allocations.length === 0 ? (
                <p className="p-12 text-text-secondary text-center">No allocation records found.</p>
              ) : (
                allocations.map((a) => (
                  <div key={a._id} className="flex flex-wrap justify-between items-center gap-2 sm:grid sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] py-3 px-6 border-b border-border text-sm hover:bg-primary-soft/30">
                    <p className="truncate">{a.patientId}</p>
                    <p className="truncate">{a.roomCategoryId}</p>
                    <p>{new Date(a.admissionDate).toLocaleDateString()}</p>
                    <p>{a.dischargeDate ? new Date(a.dischargeDate).toLocaleDateString() : "—"}</p>
                    <p className={`capitalize ${a.status === "admitted" ? "text-primary font-medium" : a.status === "discharged" ? "text-text-secondary" : "text-accent-cta"}`}>{a.status}</p>
                    <div>
                      {a.status === "admitted" && (
                        <button onClick={() => handleDischarge(a._id)} className="flex items-center gap-1 text-accent-cta cursor-pointer hover:underline text-sm">
                          <UserMinus size={14} /> Discharge
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                  <button disabled={historyPage <= 1} onClick={() => fetchHistory(historyPage - 1)} className="px-3 py-1 text-sm border border-border rounded disabled:opacity-40 cursor-pointer">Prev</button>
                  <span className="text-sm text-text-secondary">Page {historyPage} of {totalPages}</span>
                  <button disabled={historyPage >= totalPages} onClick={() => fetchHistory(historyPage + 1)} className="px-3 py-1 text-sm border border-border rounded disabled:opacity-40 cursor-pointer">Next</button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default ManageRooms;
