"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { authBypass } from "@/app/actions/auth-bypass";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'student', // Default role
          },
        },
      });

      if (error) throw error;

      // If email confirmation is disabled in Supabase, data.session will exist
      // If it's enabled, we'd normally tell them to check their email.
      // But since the request is to "remove confirm email", we assume it's disabled in dashboard.
      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[#1d7a45] to-[var(--primary-light)]">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-56 h-56 bg-[var(--accent)]/15 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative flex flex-col justify-center px-12 text-white">
          <Link href="/" className="mb-14 block bg-white/90 p-2 w-fit rounded-xl">
            <Image 
              src="/logo-gizami.png" 
              alt="Gizami" 
              width={160} 
              height={56} 
              className="h-10 w-auto object-contain" 
            />
          </Link>

          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Start Your Learning Journey Today
          </h1>
          <p className="text-green-100 text-lg mb-10">
            Join 500,000+ learners and gain access to 1000+ expert-led courses.
          </p>

          <div className="space-y-4">
            {[
              "Unlimited access to all courses",
              "Industry-recognized certificates",
              "Learn at your own pace",
              "Expert instructor support",
              "30-day money-back guarantee",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[var(--accent)]" />
                </div>
                <span className="text-sm text-green-100">{feat}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block mb-8">
            <Image 
              src="/logo-gizami.png" 
              alt="Gizami" 
              width={100} 
              height={32} 
              className="h-8 w-auto object-contain" 
            />
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[var(--border)]">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-800">Create your account</h2>
              <p className="text-gray-500 text-sm mt-1">Start learning for free today</p>
            </div>


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
                <label htmlFor="signup-name" className="form-label">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="form-label">Email Address</label>
                <input
                  id="signup-email"
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
                <label htmlFor="signup-password" className="form-label">Password</label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input pr-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    autoComplete="new-password"
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

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 accent-[var(--primary)] cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                  I agree to Gizami&apos;s{" "}
                  <Link href="#" className="text-[var(--primary)] hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-base py-3.5 justify-center disabled:opacity-70"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
