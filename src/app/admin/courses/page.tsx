"use client";


import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter,
  Star,
  Users,
  DollarSign,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

const statusConfig: Record<string, any> = {
  published: { label: "Published", icon: CheckCircle, color: "text-green-700", bg: "bg-green-100" },
  draft: { label: "Draft", icon: Clock, color: "text-gray-600", bg: "bg-gray-100" },
  review: { label: "In Review", icon: AlertCircle, color: "text-amber-700", bg: "bg-amber-100" },
};

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedCourses, setFetchedCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories (name),
          enrollments (count)
        `);
      
      if (data) {
        const mapped = data.map((c: any) => ({
          ...c,
          category: c.categories?.name || "Uncategorized",
          enrollmentCount: c.enrollments?.[0]?.count || 0,
          revenue: (c.enrollments?.[0]?.count || 0) * (c.price || 0)
        }));
        setFetchedCourses(mapped);
      }
    } catch (err) {
      console.error("Error fetching admin courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
      
      if (error) throw error;
      setFetchedCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course.");
    }
  };

  const filtered = fetchedCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = fetchedCourses.reduce((acc, c) => acc + c.revenue, 0);
  const totalEnrollments = fetchedCourses.reduce((acc, c) => acc + c.enrollmentCount, 0);

  return (
    <div className="min-h-screen">
      <AdminHeader title="Course Management" subtitle="Create, edit and manage all platform courses" />

      <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-5">
        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Courses", value: fetchedCourses.length, icon: BookOpen, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
            { label: "Published", value: fetchedCourses.filter((c: any) => c.status === "published").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
            { label: "Total Enrollments", value: totalEnrollments.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Total Revenue", value: `${(totalRevenue / 1000).toFixed(0)}K XAF`, icon: DollarSign, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <p className="text-xl font-extrabold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                aria-label="Search courses"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              {["all", "published", "draft", "review"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                    statusFilter === s
                      ? "bg-[var(--primary)] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>
          <Link href="/admin/courses/create" className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Create Course
          </Link>
        </div>

        {/* Course Table */}
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollments</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto" />
                    </td>
                  </tr>
                ) : filtered.map((course) => {
                  const status = statusConfig[course.status] || statusConfig.draft;
                  return (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image src={course.image_url || "/course-placeholder.jpg"} alt={course.title} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-500">by Gizami Admin</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">{course.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${status.bg} ${status.color}`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-700">{course.enrollmentCount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-800">
                          {course.revenue > 0 ? `${course.revenue.toLocaleString()} XAF` : "Free"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {course.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/courses/${course.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/courses/create?id=${course.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete"
                            aria-label={`Delete ${course.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No courses match your search.</p>
                <Link href="/admin/courses/create" className="btn-primary mt-4 text-sm">
                  <Zap className="w-4 h-4" /> Create First Course
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
