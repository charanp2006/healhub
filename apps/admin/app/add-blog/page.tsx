// @ts-nocheck
"use client";
import { Suspense, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "@/src/components/ui/Toast";
import axios from "axios";
import { AdminContext } from "@/src/context/AdminContext";
import { ImagePlus, X } from "lucide-react";
import { PageContainer, PageHeader, Card } from "@/src/components/ui";

const fieldCls = "w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15";

const categories = ["Health Tips","Nutrition","Mental Health","Fitness","Disease Awareness","Medical News","Hospital Updates","Other"];

function AddBlogContent() {
  const { backendURL, aToken, hospitals, getAllHospitals, doctors, getAllDoctors } = useContext(AdminContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Other");
  const [tagsInput, setTagsInput] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [isPublished, setIsPublished] = useState(false);
  const [blogImg, setBlogImg] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");

  useEffect(() => {
    if (aToken) { getAllHospitals(); getAllDoctors(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken]);

  useEffect(() => {
    if (editId && aToken) {
      (async () => {
        try {
          const { data } = await axios.get(`${backendURL}/api/blog/admin/${editId}`, { headers: { aToken } });
          if (data.success) {
            const b = data.blog;
            setTitle(b.title); setContent(b.content); setExcerpt(b.excerpt || ""); setCategory(b.category || "Other");
            setTagsInput(b.tags?.join(", ") || ""); setAuthor(b.author || "Admin"); setIsPublished(b.isPublished);
            setExistingImage(b.image || ""); setHospitalId(b.hospitalId?._id || b.hospitalId || ""); setDoctorId(b.doctorId?._id || b.doctorId || "");
          } else { toast.error(data.message); }
        } catch (error) { toast.error(error.message); }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, aToken]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error("Title and content are required");
    setLoading(true);
    try {
      const formData = new FormData();
      if (editId) formData.append("blogId", editId);
      formData.append("title", title); formData.append("content", content); formData.append("excerpt", excerpt);
      formData.append("category", category);
      formData.append("tags", JSON.stringify(tagsInput.split(",").map((t) => t.trim()).filter(Boolean)));
      formData.append("author", author); formData.append("isPublished", isPublished);
      formData.append("hospitalId", hospitalId || ""); formData.append("doctorId", doctorId || "");
      if (blogImg) formData.append("image", blogImg);
      const url = editId ? `${backendURL}/api/blog/update` : `${backendURL}/api/blog/add`;
      const { data } = await axios.post(url, formData, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        if (!editId) {
          setTitle(""); setContent(""); setExcerpt(""); setCategory("Other"); setTagsInput(""); setAuthor("Admin");
          setIsPublished(false); setBlogImg(null); setExistingImage(""); setHospitalId(""); setDoctorId("");
        }
      } else { toast.error(data.message); }
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  return (
    <PageContainer>
      <form onSubmit={onSubmitHandler} className="w-full">
        <PageHeader
          title={editId ? "Edit Blog Post" : "Create Blog Post"}
          subtitle={editId ? "Update this blog post" : "Write and publish a new blog post"}
          actions={
            <div className="flex items-center gap-2.5">
              {editId && (
                <button type="button" onClick={() => router.push("/blogs-list")} className="inline-flex items-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-background-muted cursor-pointer">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-50 cursor-pointer">
                {loading ? "Saving..." : editId ? "Update Post" : "Publish Post"}
              </button>
            </div>
          }
        />
        <Card padded={false} className="w-full max-w-4xl p-8 overflow-y-auto">
        <div className="mb-6">
          <p className="text-text-secondary mb-2">Cover Image</p>
          <label htmlFor="blog-img" className="cursor-pointer inline-block">
            {blogImg ? (
              <div className="relative">
                <img className="w-full max-w-md h-48 object-cover rounded-lg border border-border" src={URL.createObjectURL(blogImg)} alt="Preview" />
                <button type="button" onClick={(e) => { e.preventDefault(); setBlogImg(null); }} className="absolute top-2 right-2 bg-background-card rounded-full p-1 shadow cursor-pointer"><X size={14} /></button>
              </div>
            ) : existingImage ? (
              <img className="w-full max-w-md h-48 object-cover rounded-lg border border-border" src={existingImage} alt="Current" />
            ) : (
              <div className="w-full max-w-md h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-text-secondary hover:border-primary transition-colors">
                <ImagePlus size={32} className="mb-2" /><p className="text-sm">Click to upload cover image</p>
              </div>
            )}
          </label>
          <input onChange={(e) => setBlogImg(e.target.files[0])} type="file" id="blog-img" hidden accept="image/*" />
        </div>
        <div className="flex flex-col lg:flex-row items-start text-text-secondary gap-10">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1"><p>Title</p><input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldCls} type="text" placeholder="Blog post title" required /></div>
            <div className="flex-1 flex flex-col gap-1"><p>Category</p><select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldCls}>{categories.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>
            <div className="flex-1 flex flex-col gap-1"><p>Hospital Affiliation (optional)</p><select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} className={fieldCls}><option value="">None</option>{hospitals.map((h) => (<option key={h._id} value={h._id}>{h.name}</option>))}</select></div>
            <div className="flex-1 flex flex-col gap-1"><p>Doctor Author (optional)</p><select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={fieldCls}><option value="">None</option>{doctors.map((d) => (<option key={d._id} value={d._id}>{d.name} - {d.speciality}</option>))}</select></div>
            <div className="flex-1 flex flex-col gap-1"><p>Author</p><input value={author} onChange={(e) => setAuthor(e.target.value)} className={fieldCls} type="text" placeholder="Author name" /></div>
          </div>
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1"><p>Tags (comma separated)</p><input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={fieldCls} type="text" placeholder="health, wellness, tips" /></div>
            <div className="flex-1 flex flex-col gap-1"><p>Excerpt (optional)</p><textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={fieldCls} placeholder="Brief summary (auto-generated if empty)" rows={3} /></div>
            <div className="flex items-center gap-6 text-sm mt-2"><label className="flex items-center gap-2"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />Publish immediately</label></div>
          </div>
        </div>
        <div className="mt-6 text-text-secondary"><p className="mb-2 text-sm font-medium">Content</p><textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full rounded-xl border border-border bg-background-card px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Write your blog post content here..." rows={12} required /></div>
        </Card>
      </form>
    </PageContainer>
  );
}

export default function AddBlog() {
  return (
    <Suspense fallback={null}>
      <AddBlogContent />
    </Suspense>
  );
}
