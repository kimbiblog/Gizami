"use client";

import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Star,
  Award,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    totalCourses: 0,
    completionRate: 73, // Static for now until complex query implemented
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // 1. Total Students
        const { count: studentCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student");
        
        // 2. Total Courses
        const { count: courseCount } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true });
        
        // 3. Total Enrollments & Revenue
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select(`
            course_id,
            courses (price)
          `);
        
        const enrollmentCount = enrollments?.length || 0;
        const totalRev = enrollments?.reduce((acc: number, curr: any) => acc + (curr.courses?.price || 0), 0) || 0;

        setStats({
          totalStudents: studentCount || 0,
          totalCourses: courseCount || 0,
          totalRevenue: totalRev,
          completionRate: 75
        });

        // 4. Recent Activity (Latest Enrollments)
        const { data: latestEnrols } = await supabase
          .from("enrollments")
          .select(`
            id,
            created_at,
            profiles (full_name),
            courses (title)
          `)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (latestEnrols) {
          const mapped = latestEnrols.map((e: any) => ({
            id: e.id,
            type: "enrollment",
            text: `${(e.profiles as any)?.full_name || "A student"} enrolled in ${ (e.courses as any)?.title || "a course"}`,
            time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setActivities(mapped);
        }

        // 5. Top Courses
        const { data: topCrs } = await supabase
          .from("courses")
          .select("*, enrollments(count)")
          .eq("status", "published")
          .limit(4);
        
        if (topCrs) {
          const sorted = topCrs.sort((a: any, b: any) => (b.enrollments?.[0]?.count || 0) - (a.enrollments?.[0]?.count || 0));
          setTopCourses(sorted);
        }

      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const kpiCards = [
    {
      label: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      change: "+12% this month",
      positive: true,
      icon: Users,
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary)]/10",
      gradient: "from-[var(--primary)] to-[var(--primary-light)]",
    },
    {
      label: "Total Revenue",
      value: `${(stats.totalRevenue / 1000).toFixed(1)}K XAF`,
      change: "+12.5% this month",
      positive: true,
      icon: DollarSign,
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent)]/10",
      gradient: "from-[var(--accent)] to-orange-400",
    },
    {
      label: "Total Courses",
      value: stats.totalCourses.toString(),
      change: "Active & Published",
      positive: true,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-100",
      gradient: "from-purple-600 to-purple-400",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      change: "+2% vs last month",
      positive: true,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
      gradient: "from-blue-600 to-blue-400",
    },
  ];

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    course: { icon: BookOpen, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
    certificate: { icon: Award, color: "text-amber-600", bg: "bg-amber-100" },
    review: { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-100" },
    enrollment: { icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    support: { icon: FileText, color: "text-red-600", bg: "bg-red-100" },
    milestone: { icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
  };
  const item = map[type] || map.course;
  return (
    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
      <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
    </div>
  );
}


  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" subtitle="Welcome back, Admin 👋" />

      <main className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
          </div>
        ) : (
        <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <ArrowUpRight className={`w-4 h-4 ${kpi.positive ? "text-green-500" : "text-red-500"}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-800">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
              <p className={`text-xs font-medium mt-2 ${kpi.positive ? "text-green-600" : "text-red-500"}`}>
                {kpi.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Enrollment Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-800">Enrollment Trend</h2>
                <p className="text-xs text-gray-500">New students per month</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 font-semibold px-2.5 py-1 rounded-full">
                +46% growth
              </span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {[
                { label: "Jan", value: 1200 },
                { label: "Feb", value: 2100 },
                { label: "Mar", value: 1800 },
                { label: "Apr", value: 2400 },
                { label: "May", value: 3100 },
                { label: "Jun", value: stats.totalStudents },
              ].map((point) => {
                const maxVal = 4000;
                const heightPct = Math.round((point.value / maxVal) * 100);
                return (
                  <div key={point.label} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.value.toLocaleString()}
                    </span>
                    <div className="w-full rounded-t-xl overflow-hidden flex flex-col justify-end" style={{ height: "120px" }}>
                      <div
                        className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--primary-light)] rounded-t-lg transition-all group-hover:opacity-80"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <h2 className="font-bold text-gray-800 mb-5">Platform Health</h2>
            <div className="space-y-4">
              {[
                { label: "Avg. Rating", value: "4.82 / 5", pct: 96, color: "from-amber-400 to-yellow-300" },
                { label: "Completion Rate", value: "73%", pct: 73, color: "from-[var(--primary)] to-[var(--primary-light)]" },
                { label: "Student Satisfaction", value: "91%", pct: 91, color: "from-blue-500 to-blue-400" },
                { label: "Course Quality Score", value: "88%", pct: 88, color: "from-purple-500 to-purple-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                Recent Activity
              </h2>
            </div>
            <div className="space-y-3">
              {activities.length > 0 ? activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-10 italic">No recent activity found.</p>
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Top Courses</h2>
              <Link href="/admin/courses" className="text-xs text-[var(--primary)] font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3 group">
                  <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {course.title}
                    </p>
                    <p className="text-[10px] text-gray-400">{(course.enrollments?.[0]?.count || 0).toLocaleString()} students</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-gray-600">{course.rating || "5.0"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border)]">
              <Link href="/admin/courses/create" className="btn-primary w-full justify-center text-xs py-2.5">
                <Zap className="w-3.5 h-3.5" />
                Create New Course
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "New Course", icon: BookOpen, href: "/admin/courses/create", color: "bg-[var(--primary)]/20 hover:bg-[var(--primary)]/30" },
              { label: "View Students", icon: Users, href: "/admin/students", color: "bg-blue-500/20 hover:bg-blue-500/30" },
              { label: "Analytics", icon: TrendingUp, href: "/admin/analytics", color: "bg-purple-500/20 hover:bg-purple-500/30" },
              { label: "Messages", icon: Eye, href: "/admin/messages", color: "bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`${action.color} flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 group`}
              >
                <action.icon className="w-5 h-5 text-white" />
                <span className="text-xs text-gray-200 font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
