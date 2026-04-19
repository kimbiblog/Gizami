"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Users,
  TrendingUp,
  Filter,
  MoreVertical,
  Mail,
  Eye,
  CheckCircle,
  Clock,
  Loader2,
  ChevronDown,
  Shield,
  UserCog,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";

interface StudentData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "inactive";
  coursesEnrolled: number;
  completionRate: number;
  totalSpent: number;
  lastSeen: string;
}

const statusConfig = {
  active: { label: "Active", color: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
  inactive: { label: "Inactive", color: "text-gray-600", bg: "bg-gray-100", dot: "bg-gray-400" },
};

export default function AdminStudentsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Fetch users with the role 'student' alongside their enrollments and corresponding courses (for price)
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          updated_at,
          role,
          enrollments (
            progress,
            courses ( price )
          )
        `)
        .eq("role", "student");

      if (error) throw error;

      if (data) {
        const mapped: StudentData[] = data.map((profile: any) => {
          const enrollments = profile.enrollments || [];
          const coursesEnrolled = enrollments.length;
          
          let totalSpent = 0;
          let totalProgress = 0;

          enrollments.forEach((enr: any) => {
            totalProgress += enr.progress || 0;
            const price = enr.courses?.price || 0;
            totalSpent += Number(price);
          });

          const completionRate = coursesEnrolled > 0 ? Math.round(totalProgress / coursesEnrolled) : 0;

          // Compute basic last seen date string
          const lastSeenDate = new Date(profile.updated_at);
          const lastSeenStr = lastSeenDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          
          // Basic active/inactive logic (e.g. if updated in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const status = lastSeenDate >= thirtyDaysAgo ? "active" : "inactive";

          return {
            id: profile.id,
            name: profile.full_name || "Unknown Student",
            email: "student@example.com", // Since we can't easily fetch auth.users email from unprivileged clients, use placeholder or implement RPC
            avatar: profile.avatar_url || "/avatars/placeholder.jpg",
            status,
            coursesEnrolled,
            completionRate,
            totalSpent,
            lastSeen: lastSeenStr,
          };
        });

        setStudents(mapped);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
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
      fetchStudents();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role. Check your permissions.");
    } finally {
      setIsUpdating(null);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalStudents = students.length;
  const activeStudents = students.filter((s: StudentData) => s.status === "active").length;
  const avgSpend = totalStudents > 0 ? Math.round(students.reduce((acc: number, s: StudentData) => acc + s.totalSpent, 0) / totalStudents) : 0;
  const avgCompletion = totalStudents > 0 ? Math.round(students.reduce((acc: number, s: StudentData) => acc + s.completionRate, 0) / totalStudents) : 0;

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Student Management" subtitle="View and manage all enrolled students" />
        <div className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Fetching students data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Student Management" subtitle="View and manage all enrolled students" />

      <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
            { label: "Active (30d)", value: activeStudents.toLocaleString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
            { label: "Avg. Completion", value: `${avgCompletion}%`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Avg. Spend", value: `${avgSpend.toLocaleString()} XAF`, icon: TrendingUp, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
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
        <div className="bg-white rounded-2xl border border-[var(--border)] p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--primary)] transition-all"
              aria-label="Search students"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            {["all", "active", "inactive"].map((s: string) => (
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Spent</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Seen</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((student: StudentData) => {
                  const status = (statusConfig as any)[student.status];
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={student.avatar} alt={student.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${status.bg} ${status.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-700">{student.coursesEnrolled}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full"
                              style={{ width: `${student.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{student.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-800">
                          {student.totalSpent > 0 ? `${student.totalSpent.toLocaleString()} XAF` : "Free"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {student.lastSeen}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="relative group/role">
                            <button 
                              disabled={isUpdating === student.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all flex items-center gap-1"
                              title="Change Role"
                            >
                              {isUpdating === student.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserCog className="w-4 h-4" />
                              )}
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 w-32 bg-white rounded-xl shadow-xl border border-[var(--border)] py-2 opacity-0 invisible group-hover/role:opacity-100 group-hover/role:visible transition-all z-50">
                              <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Change Role</p>
                              <button 
                                onClick={() => handleRoleChange(student.id, "student")}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)]"
                              >
                                Student
                              </button>
                              <button 
                                onClick={() => handleRoleChange(student.id, "teacher")}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)]"
                              >
                                Teacher
                              </button>
                              <button 
                                onClick={() => handleRoleChange(student.id, "admin")}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)]"
                              >
                                Admin
                              </button>
                            </div>
                          </div>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Send Email">
                            <Mail className="w-4 h-4" />
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
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No students match your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
