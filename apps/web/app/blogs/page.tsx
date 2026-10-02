// @ts-nocheck
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "@/src/components/ui/Toast";
import { AppContext } from "@/src/context/AppContext";
import { SkeletonCards } from "@healhub/ui";
import { RetroGrid } from "@healhub/ui/retro-grid";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";

const categories = [
  "Health Tips",
  "Nutrition",
  "Mental Health",
  "Fitness",
  "Disease Awareness",
  "Medical News",
  "Hospital & Clinic Updates",
  "Other",
];

const inputCls =
  "w-full rounded-full border border-border bg-background-base py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-dim outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

const Blogs = () => {
  const { backendURL } = useContext(AppContext);
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const LIMIT = 9;
  const totalPages = Math.ceil(totalCount / LIMIT);

  const fetchBlogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageNum);
      params.set("limit", LIMIT);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (activeCategory) params.set("category", activeCategory);

      const { data } = await axios.get(
        `${backendURL}/api/blog/list?${params.toString()}`
      );

      if (data.success) {
        setBlogs(data.blogs || []);
        setTotalCount(data.pagination?.total || 0);
        setPage(data.pagination?.page || 1);
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
    fetchBlogs(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* ---------- Hero ---------- */}
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

        <div className="relative z-10 flex flex-col items-center px-6 py-16 text-center md:py-24 lg:px-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            <Sparkles size={13} />
            Healhub Blog
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
          >
            Health &{" "}
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Wellness
            </span>{" "}
            Blog
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base"
          >
            Expert articles, tips, and insights from our doctors to help you
            live a healthier, happier life.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={handleSearch}
            className="relative mt-8 w-full max-w-xl"
          >
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, tips..."
              className={inputCls}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-hover active:scale-95"
            >
              <Search size={14} />
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="mt-10 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center"
      >
        <button
          onClick={() => setActiveCategory("")}
          className={`flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            !activeCategory
              ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
              : "border-border bg-background-card text-text-secondary hover:border-primary/50 hover:text-text-primary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setActiveCategory((prev) => (prev === cat ? "" : cat))
            }
            className={`flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                : "border-border bg-background-card text-text-secondary hover:border-primary/50 hover:text-text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* ---------- Results ---------- */}
      {loading ? (
        <div className="mt-8">
          <SkeletonCards
            count={6}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          />
        </div>
      ) : blogs.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-background-card px-8 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <BookOpen size={28} />
          </span>
          <p className="mt-5 text-lg font-bold text-text-primary">
            No articles found
          </p>
          <p className="mt-1 max-w-md text-sm text-text-secondary">
            {activeCategory
              ? `No articles are published under “${activeCategory}” yet.`
              : "Try a different keyword or category."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => router.push(`/blog/${blog.slug}`)}
              key={blog._id}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-border bg-background-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/10"
            >
              <div className="relative h-52 overflow-hidden bg-primary-soft">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary/30">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
                  {blog.category}
                </span>
              </div>

              <div className="flex flex-col p-5 lg:p-6">
                <h3 className="line-clamp-2 text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-primary">
                  {blog.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                  {blog.excerpt}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    {formatDate(blog.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye size={13} className="text-primary" />
                    {blog.views || 0} views
                  </span>
                </div>

                {blog.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {blog.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background-base px-2.5 py-0.5 text-[11px] text-text-secondary"
                      >
                        <Tag size={10} />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Read article
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ---------- Pagination ---------- */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => fetchBlogs(page - 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-card px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="rounded-full border border-border bg-background-card px-4 py-2.5 text-sm font-medium text-text-primary">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchBlogs(page + 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-card px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Blogs;