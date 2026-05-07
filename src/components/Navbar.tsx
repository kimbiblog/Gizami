"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoSVG from "@/components/LogoSVG";
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  BookOpen,
  GraduationCap,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setMounted(true);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    router.push("/");
  };

  const isLoggedIn = !!user;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg shadow-black/5"
          : isMobileOpen 
            ? "bg-white border-b border-[var(--border)]"
            : !isHome
              ? "bg-white border-b border-[var(--border)]"
              : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="Gizami Home">
            <Image 
              src="/logo-gizami.png" 
              alt="Gizami" 
              width={160} 
              height={56} 
              className="h-10 w-auto object-contain bg-white p-1 rounded-lg"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-500 transition-colors relative group ${
                  isScrolled || isMobileOpen ? "text-gray-700" : "text-white/90 hover:text-white"
                } hover:text-[var(--primary)]`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] rounded-full group-hover:w-full transition-all duration-300 ${
                  !isScrolled && !isMobileOpen ? "bg-white" : ""
                }`} />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              aria-label="Search"
              className={`p-2 rounded-xl transition-all ${
                isScrolled || isMobileOpen 
                  ? "text-gray-600 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10" 
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {mounted && (isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`py-2.5 px-5 text-sm font-semibold transition-all ${
                    isScrolled || isMobileOpen 
                      ? "btn-outline" 
                      : "text-white hover:text-white/80"
                  }`}
                >
                  Login
                </Link>
                <Link href="/signup" className="btn-primary py-2.5 px-5 text-sm">
                  Get Started
                </Link>
              </>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`md:hidden p-2 rounded-xl transition-all ${
              isScrolled || isMobileOpen ? "text-gray-700" : "text-white"
            } hover:text-[var(--primary)]`}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--border)] shadow-xl animate-fade-in">
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center px-4 py-3 text-gray-700 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-all font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3 border-t border-[var(--border)]">
              <Link href="/login" onClick={() => setIsMobileOpen(false)} className="btn-outline w-full justify-center">
                Login
              </Link>
              <Link href="/signup" onClick={() => setIsMobileOpen(false)} className="btn-primary w-full justify-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
