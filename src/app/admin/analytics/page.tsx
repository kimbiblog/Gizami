"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Star,
  Award,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { enrollmentTrend, revenueTrend } from "@/lib/adminMockData";
import { supabase } from "@/lib/supabase";

const maxEnrollment = Math.max(...enrollmentTrend.map((p) => p.value));
const maxRevenue = Math.max(...revenueTrend.map((p) => p.value));

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [kpis, setKpis] = useState({
    totalStudents: 0,
    newStudentsThisMonth: 0, // Placeholder mapping
    totalRevenue: 0,
    revenueThisMonth: 0, // Placeholder
    activeCourses: 0,
    avgRating: 0,
  });

  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // 1. Total Students
      const { count: studentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      // 2. Fetch Courses to calculate revenue and top courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title, price, status, rating, enrollments(count)");

      let totalRevenue = 0;
      let activeCourses = 0;
      let totalRating = 0;
      let ratedCoursesCount = 0;

      const coursesWithStats = (coursesData || []).map((c: any) => {
        const enrollCount = c.enrollments?.[0]?.count || 0;
        const rev = enrollCount * (Number(c.price) || 0);
        totalRevenue += rev;
        
        if (c.status === "published") activeCourses++;
        if (c.rating > 0) {
          totalRating += c.rating;
          ratedCoursesCount++;
        }
        
        return {
          id: c.id,
          title: c.title,
          enrollments: enrollCount,
          rating: c.rating,
          revenue: rev,
          status: c.status
        };
      });

      const avgRating = ratedCoursesCount > 0 ? totalRating / ratedCoursesCount : 0;
      const sortedCourses = coursesWithStats
        .filter((c: any) => c.status === "published")
        .sort((a: any, b: any) => b.enrollments - a.enrollments)
        .slice(0, 5);

      // 3. Category Breakdown
      const { data: catsData } = await supabase
        .from("categories")
        .select("id, name, courses(id, enrollments(count))");
        
      const catsWithEnrollments = (catsData || []).map((cat: any) => {
         const enrolls = cat.courses?.reduce((acc: number, cc: any) => acc + (cc.enrollments?.[0]?.count || 0), 0) || 0;
         return {
           category: cat.name,
           count: enrolls
         };
      }).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

      setKpis({
        totalStudents: studentCount || 0,
        newStudentsThisMonth: Math.floor((studentCount || 0) * 0.15), // Mock calculation for "this month"
        totalRevenue,
        revenueThisMonth: Math.floor(totalRevenue * 0.12),
        activeCourses,
        avgRating,
      });
      setTopCourses(sortedCourses);
      setCategoryBreakdown(catsWithEnrollments);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Analytics" subtitle="Platform performance and growth metrics" />
        <div className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <AdminHeader title="Analytics" subtitle="Platform performance and growth metrics" />

      <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Total Students", value: kpis.totalStudents.toLocaleString(), icon: Users, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", change: "+4.5%" },
            { label: "New This Month", value: kpis.newStudentsThisMonth.toLocaleString(), icon: TrendingUp, color: "text-green-600", bg: "bg-green-100", change: "+15.2%" },
            { label: "Total Revenue", value: kpis.totalRevenue > 1000000 ? `${(kpis.totalRevenue / 1000000).toFixed(1)}M XAF` : `${(kpis.totalRevenue / 1000).toFixed(0)}K XAF`, icon: DollarSign, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10", change: "+8.3%" },
            { label: "Monthly Revenue", value: `${(kpis.revenueThisMonth / 1000).toFixed(0)}K XAF`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100", change: "+12.7%" },
            { label: "Active Courses", value: kpis.activeCourses, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100", change: "0%" },
            { label: "Avg. Rating", value: kpis.avgRating.toFixed(2), icon: Star, color: "text-amber-500", bg: "bg-amber-100", change: "+0.04" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <div className={`w-8 h-8 ${kpi.bg} rounded-xl flex items-center justify-center mb-2`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-xl font-extrabold text-gray-800">{kpi.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</p>
              <p className="text-[10px] font-semibold text-green-600 mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {kpi.change}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Enrollment Chart */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-800">Student Enrollments</h2>
                <p className="text-xs text-gray-500">Monthly new enrollments over time</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +46% YoY
              </span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {enrollmentTrend.map((point) => {
                const h = Math.round((point.value / maxEnrollment) * 100);
                return (
                  <div key={point.label} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.value.toLocaleString()}
                    </span>
                    <div className="w-full" style={{ height: "110px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div
                        className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--primary-light)] rounded-t-lg transition-all group-hover:opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-800">Monthly Revenue</h2>
                <p className="text-xs text-gray-500">Platform revenue breakdown</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +68% YoY
              </span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {revenueTrend.map((point) => {
                const h = Math.round((point.value / maxRevenue) * 100);
                return (
                  <div key={point.label} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {(point.value / 1000).toFixed(0)}K XAF
                    </span>
                    <div className="w-full" style={{ height: "110px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div
                        className="w-full bg-gradient-to-t from-[var(--accent)] to-orange-300 rounded-t-lg transition-all group-hover:opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Course Performance */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">Course Performance</h2>
          </div>
          <div className="space-y-4">
            {topCourses.map((course, i) => {
              const maxEnroll = Math.max(...topCourses.map(c => c.enrollments), 1);
              const pct = Math.round((course.enrollments / maxEnroll) * 100);
              return (
                <div key={course.id} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700 truncate pr-4">{course.title}</p>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-bold text-[var(--primary)]">{course.enrollments.toLocaleString()}</span>
                        {course.rating > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-gray-600">{course.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {topCourses.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No active courses found.</p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--primary)]" />
              Enrollments by Category
            </h2>
            {categoryBreakdown.map((item, idx) => {
              const colors = [
                "from-[var(--primary)] to-[var(--primary-light)]",
                "from-[var(--accent)] to-orange-400",
                "from-blue-500 to-blue-400",
                "from-teal-500 to-teal-400",
                "from-purple-500 to-purple-400"
              ];
              const color = colors[idx % colors.length];
              const maxCat = categoryBreakdown.length > 0 ? categoryBreakdown[0].count : 1;
              const pct = Math.round((item.count / (maxCat || 1)) * 100);
              return (
                <div key={item.category} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{item.category}</span>
                    <span className="text-xs font-bold text-gray-800">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {categoryBreakdown.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No categories with enrollments found.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Key Milestones
            </h2>
            <div className="space-y-3">
              {[
                { label: "10M XAF Total Revenue", date: "Apr 2024", achieved: true },
                { label: "200K Students Enrolled", date: "Mar 2024", achieved: true },
                { label: "100 Courses Published", date: "Upcoming", achieved: false },
                { label: "20M XAF Revenue Goal", date: "Q3 2024", achieved: false },
              ].map((m) => (
                <div key={m.label} className={`flex items-center gap-3 p-3 rounded-xl ${m.achieved ? "bg-green-50" : "bg-gray-50"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.achieved ? "bg-green-500" : "bg-gray-200"}`}>
                    {m.achieved
                      ? <Award className="w-3.5 h-3.5 text-white" />
                      : <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${m.achieved ? "text-green-700" : "text-gray-600"}`}>{m.label}</p>
                    <p className="text-xs text-gray-400">{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
