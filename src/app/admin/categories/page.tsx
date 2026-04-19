"use client";

import { useState, useEffect } from "react";

import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  Users,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  AlertCircle,
  Shield,
  Loader2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";

interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  course_count: number;
  student_count: number;
  created_at: string;
}

const ICON_OPTIONS = ["💻", "📈", "🎨", "📣", "💰", "🌍", "📷", "🏋️", "🧠", "🎵", "🎬", "📚", "🍳", "⚡", "🔬", "🏆", "✈️", "🌿", "🤝", "🛡️"];
const COLOR_OPTIONS = [
  { label: "Blue", value: "from-blue-500 to-blue-400" },
  { label: "Green", value: "from-emerald-500 to-emerald-400" },
  { label: "Purple", value: "from-purple-500 to-purple-400" },
  { label: "Pink", value: "from-pink-500 to-pink-400" },
  { label: "Amber", value: "from-amber-500 to-amber-400" },
  { label: "Teal", value: "from-teal-500 to-teal-400" },
  { label: "Orange", value: "from-orange-500 to-orange-400" },
  { label: "Red", value: "from-red-500 to-red-400" },
  { label: "Indigo", value: "from-indigo-500 to-indigo-400" },
  { label: "Cyan", value: "from-cyan-500 to-cyan-400" },
  { label: "Gizami", value: "from-[var(--primary)] to-[var(--primary-light)]" },
];

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "💻",
  color: "from-blue-500 to-blue-400",
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<DBCategory[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Fetch categories with course counts and enrollment sums
      // Note: We'll do a simple select and then fetch counts if necessary, 
      // or use a more advanced join if the schema allows.
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          courses (
            id,
            enrollments (count)
          )
        `);

      if (error) throw error;

      if (data) {
        const mapped = data.map((c: any) => {
          const courses = c.courses || [];
          const course_count = courses.length;
          const student_count = courses.reduce((acc: number, course: any) => {
            return acc + (course.enrollments?.[0]?.count || 0);
          }, 0);

          return {
            ...c,
            course_count,
            student_count,
          };
        });
        setCategories(mapped);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat: DBCategory) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon, color: cat.color });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        icon: form.icon,
        color: form.color,
      };

      if (editingId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert([{ ...payload, is_active: true }]);
        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setShowModal(false);
        fetchCategories(); // Refresh list
      }, 800);
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Check if it has linked courses.");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("categories").update({ is_active: !currentStatus }).eq("id", id);
      if (error) throw error;
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
      );
    } catch (error) {
      console.error("Error toggling category status:", error);
    }
  };

  const totalCourses = categories.reduce((a, c) => a + c.course_count, 0);
  const totalStudents = categories.reduce((a, c) => a + c.student_count, 0);
  const activeCount = categories.filter((c) => c.is_active).length;

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Course Categories" subtitle="Manage and organise course categories" />
        <div className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Fetching categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      <AdminHeader
        title="Course Categories"
        subtitle="Manage and organise course categories (Admin only)"
      />

      <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-5">
        {/* Admin-only notice */}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            <span className="font-bold">Admin-only feature.</span> Only administrators can create, edit, or delete course categories.
            Teachers select from this list when building courses.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Categories", value: categories.length, icon: Tag, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
            { label: "Total Courses", value: totalCourses, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{activeCount} active</span>
            <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">
              <Plus className="w-4 h-4" /> New Category
            </button>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                cat.is_active ? "border-[var(--border)] hover:shadow-md" : "border-gray-200 opacity-60"
              }`}
            >
              {/* Card top strip */}
              <div className={`h-2 bg-gradient-to-r ${cat.color}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shadow-md`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{cat.name}</h3>
                      <p className="text-[10px] text-gray-400 font-mono">/{cat.slug}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {cat.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">{cat.description}</p>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{cat.course_count}</span>
                    <span className="text-xs text-gray-400">courses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{cat.student_count.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">students</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Toggle Active */}
                  <button
                    onClick={() => toggleActive(cat.id, cat.is_active)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                      cat.is_active
                        ? "border-green-200 text-green-700 hover:bg-green-50"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                    title={cat.is_active ? "Deactivate" : "Activate"}
                  >
                    {cat.is_active
                      ? <ToggleRight className="w-3.5 h-3.5" />
                      : <ToggleLeft className="w-3.5 h-3.5" />
                    }
                    {cat.is_active ? "Active" : "Inactive"}
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-xl text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-2xl border border-[var(--border)]">
              <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No categories found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search or create a new category</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Create/Edit Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  {editingId ? "Edit Category" : "Create Category"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Admin-only operation</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {/* Icon picker */}
              <div>
                <label className="form-label">Category Icon</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm({ ...form, icon })}
                      className={`w-9 h-9 rounded-xl text-lg hover:scale-110 transition-all ${
                        form.icon === icon
                          ? "ring-2 ring-[var(--primary)] ring-offset-1 bg-[var(--primary)]/10"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="form-label">Accent Color</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setForm({ ...form, color: color.value })}
                      title={color.label}
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color.value} transition-all hover:scale-110 ${
                        form.color === color.value ? "ring-2 ring-offset-1 ring-gray-800 scale-110" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br ${form.color} text-white`}>
                <span className="text-2xl">{form.icon}</span>
                <div>
                  <p className="font-bold text-sm">{form.name || "Category Name"}</p>
                  <p className="text-xs text-white/70">/{form.slug || "slug"}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="form-label">Category Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Artificial Intelligence"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                />
              </div>

              {/* Slug (auto-generated) */}
              <div>
                <label className="form-label">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-2.5 rounded-xl border border-[var(--border)]">/courses/</span>
                  <input
                    className="form-input flex-1 font-mono"
                    placeholder="auto-generated"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Brief description of what this category covers..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--border)] bg-gray-50">
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm py-2.5 px-5">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                className="btn-primary text-sm py-2.5 px-5 flex-1 justify-center disabled:opacity-60"
              >
                {saving ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {saving ? "Saving..." : saved ? "Saved!" : editingId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Dialog ─── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 text-center mb-1">Delete Category?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              This will permanently delete the category. <br/>
              <span className="text-red-600 font-semibold">Note:</span> This will only work if there are no courses assigned to this category.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1 text-sm py-2.5">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
