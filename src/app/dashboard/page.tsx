"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  TrendingUp,
  User,
  Bell,
  Settings,
  LogOut,
  Play,
  Award,
  Clock,
  Star,
  ChevronRight,
  Flame,
  Target,
  LayoutDashboard,
  GraduationCap,
  Download,
  Camera,
  Lock,
  CheckCircle2,
  Circle,
  Calendar,
  Zap,
  BarChart3,
  BookMarked,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { enrolledCourses } from "@/lib/mockData";
import CertificateGenerator from "@/components/dashboard/CertificateGenerator";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const achievements = [
  { icon: Flame, label: "7-Day Streak", color: "text-orange-500", bg: "bg-orange-100" },
  { icon: Star, label: "Top Student", color: "text-amber-500", bg: "bg-amber-100" },
  { icon: Award, label: "3 Certificates", color: "text-purple-500", bg: "bg-purple-100" },
  { icon: Target, label: "Goal Crusher", color: "text-green-600", bg: "bg-green-100" },
];

function ProgressRing({ percent, size = 80 }: { percent: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="8" stroke="#f0f0f0" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth="8"
        stroke="var(--primary)" fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        className="transition-all duration-500"
      />
    </svg>
  );
}


function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    bio: "",
    location: "Lagos, Nigeria",
    website: "",
    twitter: "",
  });

  const [settingsState, setSettingsState] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    publicProfile: true,
    twoFactor: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          router.push("/login");
          return;
        }

        setUser(authUser);

        // Fetch profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        
        if (prof) {
          // Auto-redirect admins to the admin panel if they land here
          if (prof.role === "admin") {
            router.push("/admin");
            return;
          }

          setProfile(prof);
          setProfileForm(prev => ({
            ...prev,
            name: prof.full_name || "",
            email: authUser.email || "",
            bio: prof.bio || "",
          }));
        }

        // Fetch enrollments with course details and instructor name
        const { data: enrols } = await supabase
          .from("enrollments")
          .select(`
            *,
            courses (
              *,
              instructor:instructor_id(full_name)
            )
          `)
          .eq("user_id", authUser.id);
        
        if (enrols) {
          // Map to match the expected UI structure
          const mapped = enrols.map((e: any) => ({
            id: e.courses.id,
            title: e.courses.title,
            instructor: e.courses.instructor?.full_name || "Gizami Instructor", // Default
            category: "Technology", // Placeholder or fetch actual
            progress: e.progress,
            completedLessons: 0, // Need to implement lesson completions count
            totalLessons: e.courses.lessons_count,
            image: e.courses.image_url,
            lastAccessed: "Recently",
            nextLesson: "Lesson 1"
          }));
          setEnrollments(mapped);

          // Populate certificates for completed courses
          const completedEnrols = enrols.filter((e: any) => e.progress >= 100);
          const mappedCerts = completedEnrols.map((e: any) => ({
            id: e.courses.id,
            title: e.courses.title,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            instructor: e.courses.instructor?.full_name || "Gizami Instructor",
            image: e.courses.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
            studentName: prof?.full_name || authUser.email?.split("@")[0] || "Student"
          }));
          setCertificates(mappedCerts);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, c) => acc + (c.progress || 0), 0) / enrollments.length)
    : 0;

  const tabLabel = navItems.find((n) => n.id === activeTab)?.label || "Dashboard";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 flex-shrink-0
          bg-white border-r border-[var(--border)] shadow-xl lg:shadow-none
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Dashboard navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <Link href="/" className="block">
              <Image 
                src="/logo-gizami.png" 
                alt="Gizami" 
                width={120} 
                height={40} 
                className="h-10 w-auto object-contain" 
              />
            </Link>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-800"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-5 border-b border-[var(--border)] bg-[var(--bg)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{profile?.full_name || "New Learner"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 font-medium capitalize">{profile?.role || "Student"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${
                  activeTab === item.id
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
                aria-current={activeTab === item.id ? "page" : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {item.id === "courses" && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === item.id ? "bg-white/20 text-white" : "bg-[var(--primary)]/10 text-[var(--primary)]"}`}>
                    {enrollments.length}
                  </span>
                )}
                {item.id === "certificates" && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === item.id ? "bg-white/20 text-white" : "bg-purple-100 text-purple-600"}`}>
                    {certificates.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[var(--border)] space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Admin Panel
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full transition-all text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[var(--border)] px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-800 capitalize">{tabLabel}</h1>
              <p className="text-xs text-gray-400">Welcome back, {profile?.full_name?.split(' ')[0] || "Learner"}! 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-all" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-xs font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
          ) : (
          <>
            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === "overview" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Courses Enrolled", value: enrollments.length, icon: BookOpen, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
                    { label: "Avg. Progress", value: `${totalProgress}%`, icon: TrendingUp, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
                    { label: "Hours Learned", value: "0h", icon: Clock, color: "text-purple-600", bg: "bg-purple-100" },
                    { label: "Certificates", value: certificates.length, icon: Award, color: "text-blue-600", bg: "bg-blue-100" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-[var(--border)] p-4 hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

              {/* Achievements */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Your Achievements
                </h2>
                <div className="flex flex-wrap gap-3">
                  {achievements.map((a) => (
                    <div key={a.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${a.bg}`}>
                      <a.icon className={`w-4 h-4 ${a.color}`} />
                      <span className={`text-xs font-semibold ${a.color}`}>{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrolled courses */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--primary)]" />
                    My Enrolled Courses
                  </h2>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="text-sm text-[var(--primary)] font-medium hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {enrollments.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="text-sm text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
                      <Link href="/courses" className="text-[var(--primary)] text-sm font-semibold mt-2 inline-block hover:underline">Browse Courses</Link>
                    </div>
                  ) : (
                    enrollments.slice(0, 2).map((course) => (
                      <div key={course.id} className="bg-white rounded-2xl border border-[var(--border)] p-3 sm:p-4 hover:shadow-md transition-all group">
                        <div className="flex gap-3">
                          <div className="relative w-14 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {course.image && <Image src={course.image} alt={course.title} fill className="object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-500 truncate">by {course.instructor}</p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400">{course.completedLessons}/{course.totalLessons || 10} lessons</span>
                                <span className="text-xs font-bold text-[var(--primary)]">{course.progress}%</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <Link href={`/courses/${course.id}/learn`} className="btn-primary w-full justify-center text-xs py-2 mt-3" aria-label={`Continue ${course.title}`}>
                          <Play className="w-3 h-3" /> Continue
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recently Accessed */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--primary)]" />
                  Recently Accessed Lessons
                </h2>
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 italic">No recently accessed lessons.</p>
                </div>
              </div>
            </>
          )}

          {/* ─── COURSES TAB ─── */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              {/* Header row — stacks on very small screens */}
              <div className="flex flex-col xs:flex-row xs:items-center gap-3 justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                  All Enrolled Courses
                  <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] font-bold px-2 py-0.5 rounded-full">{enrollments.length}</span>
                </h2>
                <Link href="/courses" className="btn-outline text-xs py-2 px-4 self-start xs:self-auto">
                  Browse More
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border)]">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-700">No enrollments yet</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-5">Start your learning journey today!</p>
                  <Link href="/courses" className="btn-primary text-sm py-2.5 px-5">Explore Courses</Link>
                </div>
              ) : (
                enrollments.map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl border border-[var(--border)] p-4 hover:shadow-md transition-all group">
                    {/* Top: image + info row */}
                    <div className="flex gap-3 mb-3">
                      <div className="relative w-16 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {course.image && <Image src={course.image} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wide">{course.category}</span>
                        <h3 className="font-bold text-sm text-gray-800 leading-snug line-clamp-2 mt-0.5">{course.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">by {course.instructor}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">{course.completedLessons}/{course.totalLessons || 10} lessons</span>
                        <span className="text-xs font-bold text-[var(--primary)]">{course.progress}%</span>
                      </div>
                      <div className="progress-bar h-2">
                        <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>

                    {/* Footer: meta + CTA */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.lastAccessed}</span>
                        {course.progress === 100 && (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/courses/${course.id}/learn`}
                        className="btn-primary text-xs py-2 px-4 flex-shrink-0"
                        aria-label={`Continue ${course.title}`}
                      >
                        <Play className="w-3 h-3" /> Continue
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── PROGRESS TAB ─── */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              {/* Weekly Goal */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--primary)]" /> Weekly Goal
                  </h2>
                  <span className="text-xs text-gray-400">Apr 7 – Apr 13</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <ProgressRing percent={71} size={90} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-extrabold text-gray-800">71%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[
                      { day: "Mon", done: true, time: "45 min" },
                      { day: "Tue", done: true, time: "62 min" },
                      { day: "Wed", done: true, time: "30 min" },
                      { day: "Thu", done: true, time: "90 min" },
                      { day: "Fri", done: true, time: "25 min" },
                      { day: "Sat", done: false, time: "—" },
                      { day: "Sun", done: false, time: "—" },
                    ].map((d) => (
                      <div key={d.day} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-7">{d.day}</span>
                        {d.done
                          ? <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                          : <Circle className="w-4 h-4 text-gray-200" />
                        }
                        <span className={`text-xs ${d.done ? "text-gray-700 font-medium" : "text-gray-300"}`}>{d.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course progress cards */}
              <div>
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
                  Course Progress
                </h2>
                <div className="space-y-4">
                  {enrollments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[var(--border)] p-10 text-center">
                      <p className="text-sm text-gray-500">No course progress to display.</p>
                    </div>
                  ) : (
                    enrollments.map((course) => (
                      <div key={course.id} className="bg-white rounded-2xl border border-[var(--border)] p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                            {course.image && <Image src={course.image} alt={course.title} fill className="object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-500">by {course.instructor}</p>
                          </div>
                          <div className="relative flex-shrink-0">
                            <ProgressRing percent={course.progress} size={52} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-gray-800">{course.progress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Completed", value: course.completedLessons },
                            { label: "Remaining", value: (course.totalLessons || 10) - course.completedLessons },
                            { label: "Total", value: course.totalLessons || 10 },
                          ].map((s) => (
                            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                              <p className="text-sm font-bold text-gray-800">{s.value}</p>
                              <p className="text-[10px] text-gray-400">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Learning Streak */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Learning Streak
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-extrabold text-orange-500">7</p>
                    <p className="text-xs text-gray-500">day streak</p>
                  </div>
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-7 rounded-lg ${
                          i >= 14 ? "bg-orange-400" : i >= 10 ? "bg-orange-200" : "bg-gray-100"
                        }`}
                        title={`Day ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">Keep it up! You&apos;re on fire 🔥</p>
              </div>
            </div>
          )}

          {/* ─── CERTIFICATES TAB ─── */}
          {activeTab === "certificates" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  My Certificates ({certificates.length})
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative h-36 overflow-hidden">
                      <Image src={cert.image} alt={cert.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <p className="text-white font-bold text-sm line-clamp-2">{cert.title}</p>
                      </div>
                      <div className="absolute top-3 right-3 w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm text-gray-800 mb-2 line-clamp-1">{cert.title}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Issued by {cert.instructor}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> {cert.date}
                          </p>
                        </div>
                        <CertificateGenerator
                           studentName={cert.studentName}
                           courseTitle={cert.title}
                           date={cert.date}
                           instructorName={cert.instructor}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Courses in Progress (earn certificate on completion)
                </h3>
                {enrollments.filter((c) => c.progress < 100).map((course) => (
                  <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-purple-600 font-bold">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PROFILE TAB ─── */}
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-5">
              {/* Avatar */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="font-bold text-gray-800 mb-5">Profile Picture</h2>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white font-extrabold text-2xl">
                      JD
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">John Doe</p>
                    <p className="text-sm text-gray-500">Student since Jan 2024</p>
                    <button className="text-xs text-[var(--primary)] font-medium hover:underline mt-1">
                      Upload new photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="font-bold text-gray-800 mb-5">Personal Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Bio</label>
                    <textarea rows={3} className="form-input resize-none" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input className="form-input" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Website</label>
                    <input className="form-input" placeholder="https://" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} />
                  </div>
                </div>
                <button className="btn-primary mt-5 text-sm py-2.5 px-5">Save Changes</button>
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-5">
              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notification Settings
                </h2>
                <p className="text-xs text-gray-500 mb-5">Control how and when Gizami contacts you</p>
                <div className="space-y-3">
                  {Object.entries(settingsState).filter(([k]) => ["emailNotifications", "pushNotifications", "weeklyReport"].includes(k)).map(([key, val]) => {
                    const labels: Record<string, { label: string; desc: string }> = {
                      emailNotifications: { label: "Email Notifications", desc: "Receive updates about your courses via email" },
                      pushNotifications: { label: "Push Notifications", desc: "In-browser alerts for new activities" },
                      weeklyReport: { label: "Weekly Progress Report", desc: "Get a weekly summary of your learning progress" },
                    };
                    return (
                      <label key={key} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="font-medium text-sm text-gray-800">{labels[key].label}</p>
                          <p className="text-xs text-gray-400">{labels[key].desc}</p>
                        </div>
                        <div
                          onClick={() => setSettingsState({ ...settingsState, [key]: !val })}
                          className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${val ? "bg-[var(--primary)]" : "bg-gray-200"}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${val ? "left-5" : "left-0.5"}`} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Privacy & Security
                </h2>
                <p className="text-xs text-gray-500 mb-5">Manage your account security and privacy preferences</p>
                <div className="space-y-3">
                  {[
                    { key: "publicProfile", label: "Public Profile", desc: "Allow others to see your profile and progress" },
                    { key: "twoFactor", label: "Two-Factor Authentication", desc: "Add an extra layer of security to your account" },
                  ].map(({ key, label, desc }) => {
                    const val = settingsState[key as keyof typeof settingsState] as boolean;
                    return (
                      <label key={key} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="font-medium text-sm text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <div
                          onClick={() => setSettingsState({ ...settingsState, [key]: !val })}
                          className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${val ? "bg-[var(--primary)]" : "bg-gray-200"}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${val ? "left-5" : "left-0.5"}`} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl border border-red-100 p-6">
                <h2 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Danger Zone
                </h2>
                <p className="text-xs text-gray-500 mb-4">These actions are permanent and cannot be undone</p>
                <div className="flex gap-3">
                  <button className="text-sm border-2 border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors font-medium">
                    Delete Account
                  </button>
                  <button className="text-sm border-2 border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
