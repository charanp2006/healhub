// @ts-nocheck
"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { AdminContext } from "@/src/context/AdminContext";
import { Search, SlidersHorizontal, Pencil, Trash2, Eye, ChevronDown, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { PageContainer, PageHeader, Card, Badge } from "@/src/components/ui";

const categories = ["Health Tips","Nutrition","Mental Health","Fitness","Disease Awareness","Medical News","Hospital Updates","Other"];

const BlogsList = () => {
  const { backendURL, aToken } = useContext(AdminContext);
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const LIMIT = 12;
  const totalPages = Math.ceil(totalCount / LIMIT);

  const fetchBlogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageNum); params.set("limit", LIMIT);
      if (filterSearch.trim()) params.set("search", filterSearch.trim());
      if (filterCategory) params.set("category", filterCategory);
      const { data } = await axios.get(`${backendURL}/api/blog/admin-list?${params.toString()}`, { headers: { aToken } });
      if (data.success) { setBlogs(data.blogs || []); setTotalCount(data.pagination?.total || 0); setPage(data.pagination?.page || 1); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (aToken) fetchBlogs(1); }, [aToken]);

  const handleSearch = (e) => { e?.preventDefault(); fetchBlogs(1); };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Delete this blog post? This cannot be undone.")) return;
    try {
      const { data } = await axios.post(`${backendURL}/api/blog/delete`, { blogId }, { headers: { aToken } });
      if (data.success) { toast.success(data.message); fetchBlogs(page); } else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Blog Posts"
        subtitle={`${totalCount} posts published across the platform`}
        actions={
          <>
            <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 text-sm text-text-secondary border border-border px-3.5 py-2 rounded-xl cursor-pointer hover:bg-background-muted transition-colors">
              <SlidersHorizontal size={14} />{showFilters ? "Hide Filters" : "Filters"}
            </button>
            <button onClick={() => router.push("/add-blog")} className="flex items-center gap-2 text-sm bg-primary text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-primary-hover transition-colors">+ New Post</button>
          </>
        }
      />
      {showFilters && (
        <form onSubmit={handleSearch} className="bg-background-card border border-border rounded-lg p-5 mb-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Search</label>
              <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Search by title" className="w-full border border-border rounded px-3 py-2 pl-8 text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Category</label>
              <div className="relative">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border border-border rounded px-3 py-2 pr-8 appearance-none text-sm bg-background-card">
                  <option value="">All categories</option>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-white text-sm px-6 py-2 rounded-full cursor-pointer hover:bg-primary-hover transition-colors">Apply</button>
            <button type="button" onClick={() => { setFilterSearch(""); setFilterCategory(""); setTimeout(() => fetchBlogs(1), 0); }} className="text-sm px-6 py-2 border border-border rounded-full cursor-pointer hover:bg-primary-soft transition-colors">Clear</button>
          </div>
        </form>
      )}
      <p className="text-sm text-text-secondary mb-4">{loading ? "Loading posts..." : `${totalCount} post${totalCount !== 1 ? "s" : ""} total`}</p>
      <Card padded={false} className="overflow-hidden">
        <div className="hidden sm:grid grid-cols-[3fr_1.5fr_1fr_1fr_1fr_auto] gap-2 py-3 px-6 border-b border-border text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          <p>Title</p><p>Category</p><p>Status</p><p>Views</p><p>Date</p><p>Actions</p>
        </div>
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary"><FileText size={40} className="mb-3 opacity-40" /><p>No blog posts found</p></div>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="flex flex-wrap justify-between items-center gap-2 sm:grid sm:grid-cols-[3fr_1.5fr_1fr_1fr_1fr_auto] py-3 px-6 border-b border-border text-sm hover:bg-primary-soft/30">
              <div className="flex items-center gap-3">
                {blog.image ? <img src={blog.image} alt="" className="w-10 h-10 rounded object-cover shrink-0" /> : <div className="w-10 h-10 rounded bg-primary-soft flex items-center justify-center shrink-0"><FileText size={16} className="text-primary" /></div>}
                <p className="font-medium text-text-primary truncate">{blog.title}</p>
              </div>
              <p className="text-text-secondary">{blog.category}</p>
              <Badge tone={blog.isPublished ? "emerald" : "amber"} dot>{blog.isPublished ? "Published" : "Draft"}</Badge>
              <p className="flex items-center gap-1 text-text-secondary"><Eye size={12} /> {blog.views || 0}</p>
              <p className="text-text-secondary">{formatDate(blog.publishedAt || blog.createdAt)}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push(`/add-blog?edit=${blog._id}`)} className="text-primary cursor-pointer hover:underline" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(blog._id)} className="text-red-400 cursor-pointer hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))
        )}
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={page <= 1} onClick={() => fetchBlogs(page - 1)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-full disabled:opacity-40 cursor-pointer hover:bg-primary-soft transition-colors"><ChevronLeft size={14} /> Prev</button>
          <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => fetchBlogs(page + 1)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-full disabled:opacity-40 cursor-pointer hover:bg-primary-soft transition-colors">Next <ChevronRight size={14} /></button>
        </div>
      )}
    </PageContainer>
  );
};

export default BlogsList;
