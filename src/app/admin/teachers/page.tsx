"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  GraduationCap,
  Star,
  DollarSign,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Eye,
  Plus,
  Loader2,
  UserCog,
  ChevronDown,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";

interface TeacherData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "pending" | "suspended";
  courses: number;
  totalStudents: number;
  revenue: number;
  rating: number;
}

const statusConfig = {
  active: { label: "Active", color: "text-green-700", bg: "bg-green-100" },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100" },
  suspended: { label: "Suspended", color: "text-red-700", bg: "bg-red-100" },
};

const StatusIcon = { active: CheckCircle, pending: Clock, suspended: AlertCircle };

export default function AdminTeachersPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          updated_at,
          role,
          courses!courses_instructor_id_fkey (
            id,
            price,
            rating,
            enrollments (count)
          )
        `)
        .eq("role", "teacher");

      if (error) throw error;

      if (data) {
        const mapped: TeacherData[] = data.map((profile: any) => {
          const courses = profile.courses || [];
          const coursesCount = courses.length;

          let totalStudents = 0;
          let revenue = 0;
          let totalRating = 0;
          let ratedCoursesCount = 0;

          courses.forEach((c: any) => {
            const studentCount = c.enrollments?.[0]?.count || 0;
            totalStudents += studentCount;
            revenue += studentCount * (Number(c.price) || 0);
            if (c.rating > 0) {
              totalRating += c.rating;
              ratedCoursesCount++;
            }
          });

          const rating = ratedCoursesCount > 0 ? totalRating / ratedCoursesCount : 0;
          
          // Basic status placeholder logic
          const lastSeenDate = new Date(profile.updated_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const status = lastSeenDate >= thirtyDaysAgo ? "active" : "pending";

          return {
            id: profile.id,
            name: profile.full_name || "Unknown Instructor",
            email: "teacher@example.com", // Placeholder due to lack of auth.users RPC
            avatar: profile.avatar_url || "/avatars/placeholder.jpg",
            status,
            courses: coursesCount,
            totalStudents,
            revenue,
            rating,
          };
        });

        setTeachers(mapped);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    setIsUpdating(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      
      // Refresh list
      fetchTeachers();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role.");
    } finally {
      setIsUpdating(null);
    }
  };

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Teacher Management" subtitle="Manage instructors and their courses" />
        <div className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Fetching teachers data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Teacher Management" subtitle="Manage instructors and their courses" />

      <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Instructors", value: teachers.length, icon: GraduationCap, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
            { label: "Active", value: teachers.filter(t => t.status === "active").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
            { label: "Avg. Rating", value: teachers.filter(t => t.rating > 0).length > 0 ? (teachers.filter(t => t.rating > 0).reduce((a, t) => a + t.rating, 0) / teachers.filter(t => t.rating > 0).length).toFixed(1) : "—", icon: Star, color: "text-amber-500", bg: "bg-amber-100" },
            { label: "Total Students", value: teachers.reduce((a, t) => a + t.totalStudents, 0).toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
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
          <div className="relative flex-1 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--primary)] transition-all"
              aria-label="Search instructors"
            />
          </div>
          <button className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Invite Instructor
          </button>
        </div>

        {/* Teacher Cards Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher) => {
            const status = statusConfig[teacher.status];
            const SIcon = StatusIcon[teacher.status];
            return (
              <div key={teacher.id} className="bg-white rounded-2xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={teacher.avatar} alt={teacher.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{teacher.name}</p>
                      <p className="text-xs text-gray-400">{teacher.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${status.bg} ${status.color}`}>
                    <SIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Courses", value: teacher.courses, icon: BookOpen },
                    { label: "Students", value: teacher.totalStudents.toLocaleString(), icon: Users },
                    { label: "Revenue", value: teacher.revenue > 0 ? `$${(teacher.revenue / 1000).toFixed(1)}K` : "$0", icon: DollarSign },
                    { label: "Rating", value: teacher.rating > 0 ? teacher.rating.toFixed(1) : "—", icon: Star },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <stat.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">{stat.value}</p>
                        <p className="text-[10px] text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                  <div className="relative group/role flex-1">
                    <button 
                      disabled={isUpdating === teacher.id}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 border border-[var(--border)] transition-all"
                    >
                      {isUpdating === teacher.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserCog className="w-3.5 h-3.5" />
                      )}
                      Role
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    <div className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-xl shadow-xl border border-[var(--border)] py-2 opacity-0 invisible group-hover/role:opacity-100 group-hover/role:visible transition-all z-50">
                      <button 
                        onClick={() => handleRoleChange(teacher.id, "student")}
                        className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)]"
                      >
                        Demote to Student
                      </button>
                      <button 
                        onClick={() => handleRoleChange(teacher.id, "admin")}
                        className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)]"
                      >
                        Promote to Admin
                      </button>
                    </div>
                  </div>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 border border-[var(--primary)]/30 transition-all">
                    <Mail className="w-3.5 h-3.5" /> Contact
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
