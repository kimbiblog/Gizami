"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
  Tag,
  Award,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LiveCounts {
  courses: number;
  students: number;
  teachers: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<LiveCounts>({ courses: 0, students: 0, teachers: 0 });
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUser(user);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (prof) setAdminProfile(prof);
      }

      const [
        { count: coursesCount },
        { count: studentsCount },
        { count: teachersCount },
      ] = await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
      ]);

      setCounts({
        courses: coursesCount ?? 0,
        students: studentsCount ?? 0,
        teachers: teachersCount ?? 0,
      });
    }

    fetchData();

    // Re-fetch when the route changes so counts stay fresh
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navSections = [
    {
      title: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/courses", label: "Courses", icon: BookOpen, badge: formatCount(counts.courses) },
        { href: "/admin/courses/create", label: "Create Course", icon: Zap },
        { href: "/admin/categories", label: "Categories", icon: Tag },
        { href: "/admin/certificates", label: "Certificates", icon: Award },
      ],
    },
    {
      title: "Users",
      items: [
        { href: "/admin/students", label: "Students", icon: Users, badge: formatCount(counts.students) },
        { href: "/admin/teachers", label: "Teachers", icon: GraduationCap, badge: formatCount(counts.teachers) },
      ],
    },
    {
      title: "Support",
      items: [
        { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: "2", badgeColor: "bg-red-500" },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-gray-900 text-white h-screen sticky top-0"
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo-gizami.png"
            alt="Gizami"
            width={120}
            height={40}
            className="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg"
          />
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider border-l border-white/20 pl-3">
            Admin
          </p>
        </Link>
      </div>

      {/* Admin user */}
      <div className="px-4 py-3.5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {adminProfile?.full_name?.charAt(0) || adminUser?.email?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">
              {adminProfile?.full_name || "Admin User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {adminUser?.email || "admin@gizami.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive(item.href)
                      ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge !== "0" && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all ${
                        (item as any).badgeColor
                          ? `${(item as any).badgeColor} text-white`
                          : isActive(item.href)
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive(item.href) && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          View Site
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
