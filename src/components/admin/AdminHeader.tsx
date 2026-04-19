"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, X, GraduationCap, Shield } from "lucide-react";
import Image from "next/image";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--border)] px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm">
        {/* Left – Mobile toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>

        {/* Right – Search + Notifications + Avatar */}
        <div className="flex items-center gap-2">
          {/* Search (desktop) */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-52">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="search"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none text-gray-700 w-full placeholder:text-gray-400"
              aria-label="Global search"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="font-semibold text-sm text-gray-800">Notifications</p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {[
                    { text: "New course submitted for review", time: "5 min ago", unread: true },
                    { text: "2 new support tickets opened", time: "1 hour ago", unread: true },
                    { text: "Revenue milestone: $15M reached", time: "Yesterday", unread: false },
                  ].map((n, i) => (
                    <div key={i} className={`px-4 py-3 flex gap-3 hover:bg-gray-50 cursor-pointer ${n.unread ? "bg-[var(--primary)]/5" : ""}`}>
                      {n.unread && <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-1.5 flex-shrink-0" />}
                      {!n.unread && <div className="w-2 flex-shrink-0" />}
                      <div>
                        <p className="text-sm text-gray-700">{n.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AD
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-gray-900 p-0 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/logo-gizami.png" 
                  alt="Gizami" 
                  width={100} 
                  height={32} 
                  className="h-8 w-auto object-contain bg-white/90 p-1 rounded-md" 
                />
                <span className="text-[10px] text-gray-400 font-semibold border-l border-white/20 pl-3">Admin</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {[
                { href: "/admin", label: "Dashboard" },
                { href: "/admin/courses", label: "Courses" },
                { href: "/admin/courses/create", label: "Create Course" },
                { href: "/admin/students", label: "Students" },
                { href: "/admin/teachers", label: "Teachers" },
                { href: "/admin/analytics", label: "Analytics" },
                { href: "/admin/messages", label: "Messages" },
                { href: "/admin/settings", label: "Settings" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
