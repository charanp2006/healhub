// @ts-nocheck
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";
import { AppContext } from "@/src/context/AppContext";
import { SkeletonArticle } from "@healhub/ui";
import {
  Calendar,
  Eye,
  User,
  Tag,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { backendURL } = useContext(AppContext);

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendURL}/api/blog/post/${slug}`
      );
      if (data.success) {
        setBlog(data.blog);
        setRelated(data.related || []);
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
    fetchBlog();
    window.scrollTo(0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <SkeletonArticle />;
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center py-20 text-text-secondary">
        <BookOpen size={48} className="mb-3 opacity-40" />
        <p className="text-lg">Blog post not found</p>
        <button
          onClick={() => router.push("/blogs")}
          className="mt-4 text-primary hover:underline cursor-pointer text-sm"
        >
          Back to blog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/blogs")}
        className="flex items-center gap-1 text-sm text-text-secondary mb-6 cursor-pointer hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Back to blog
      </button>

      {/* Cover image */}
      {blog.image && (
        <div className="rounded-xl overflow-hidden mb-8 max-h-[400px]">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Category badge */}
      <span className="inline-block text-xs px-3 py-1 rounded-full bg-primary-soft text-primary font-medium mb-4">
        {blog.category}
      </span>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-4">
        {blog.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-8 pb-6 border-b border-border">
        <span className="flex items-center gap-1.5">
          <User size={14} /> {blog.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {formatDate(blog.publishedAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye size={14} /> {blog.views} views
        </span>
      </div>

      {/* Content */}
      <article className="prose prose-lg max-w-none text-text-primary leading-relaxed whitespace-pre-line mb-8">
        {blog.content}
      </article>

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6 border-t border-border mb-10">
          {blog.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border border-border text-text-secondary"
            >
              <Tag size={12} /> {t}
            </span>
          ))}
        </div>
      )}

      {/* ─── Related articles ────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-medium text-text-primary mb-5">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <div
                key={r._id}
                onClick={() => router.push(`/blog/${r.slug}`)}
                className="border border-border rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-36 bg-primary-soft overflow-hidden">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/30">
                      <BookOpen size={32} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
                    {r.category}
                  </span>
                  <h3 className="text-text-primary font-medium text-sm mt-2 line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatDate(r.publishedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
