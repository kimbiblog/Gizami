"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile to check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // Give the session a moment to propagate to cookies/middleware
        setTimeout(() => {
          if (profile?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ backgroundColor: "var(--bg)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative space-y-5">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center" aria-label="Gizami Home">
            <Image 
              src="/logo-gizami.png" 
              alt="Gizami" 
              width={160} 
              height={56} 
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-800 mt-4">Welcome back!</h1>
          <p className="text-gray-500 mt-1">Log in to continue your learning journey</p>
        </div>

        {/* ─── Login Form ─── */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[var(--border)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 font-bold text-xs">!</span>
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="form-label mb-0">Password</label>
                <Link href="#" className="text-xs text-[var(--primary)] hover:underline font-medium">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[var(--primary)] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-base py-3.5 justify-center mt-2 disabled:opacity-70"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  Verify & Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" />
          Your data is protected with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}
