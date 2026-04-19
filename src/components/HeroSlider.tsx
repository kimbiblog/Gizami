"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  Star,
  Play,
  CheckCircle,
} from "lucide-react";
import { heroSlides } from "@/lib/mockData";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const slide = heroSlides[current];

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a3d20] via-[#1a6b3c] to-[#2d9660]" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary-light)]/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT COLUMN ── */}
          <div key={current} className="animate-fade-in-up text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 text-sm font-medium mb-7">
              <span className="text-base leading-none">{slide.badge.split(" ")[0]}</span>
              <span className="text-green-100">{slide.badge.slice(2)}</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5">
              {slide.headline}{" "}
              <span
                className="block"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {slide.accent}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-green-100 text-lg leading-relaxed mb-9 max-w-lg">
              {slide.subtext}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/signup" className="btn-accent text-base px-8 py-3.5">
                {slide.ctaPrimary}
              </Link>
              <Link href="/courses" className="btn-outline-white text-base px-8 py-3.5">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                {slide.ctaSecondary}
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-white/15">
              {[slide.stat1, slide.stat2, slide.stat3].map((stat, i) => (
                <div key={stat.label}>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#f97316" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-200 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN – contained visual panel ── */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* Top card – Progress tracker */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Course Progress</p>
                    <p className="text-green-300 text-xs">Web Development Bootcamp</p>
                  </div>
                </div>
                <span className="text-[var(--accent)] font-bold text-sm">72%</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "HTML & CSS", pct: 100 },
                  { label: "JavaScript", pct: 85 },
                  { label: "React.js", pct: 68 },
                  { label: "Node.js", pct: 42 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-green-200 text-xs w-24 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.pct}%`,
                          background: "linear-gradient(90deg, #1a6b3c, #2d9660)",
                        }}
                      />
                    </div>
                    <span className="text-white/60 text-xs w-8 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row – two smaller cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Students card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <span className="text-white text-xs font-medium">Active Learners</span>
                </div>
                <div className="flex -space-x-2 mb-2">
                  {["🧑‍💻", "👩‍🎓", "🧑‍🏫", "👩‍💼"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] border-2 border-[#1a6b3c] flex items-center justify-center text-xs"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <p className="text-white font-bold text-lg">500K+</p>
                <p className="text-green-300 text-xs">Students enrolled</p>
              </div>

              {/* Rating card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-white text-xs font-medium">Top Rated</span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-white font-bold text-3xl leading-none">4.9</span>
                  <span className="text-green-300 text-xs mb-1">/5.0</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-green-300 text-xs">50K+ reviews</p>
              </div>
            </div>

            {/* Certificate earned – bottom full-width */}
            <div className="bg-gradient-to-r from-[var(--accent)]/20 to-amber-500/10 backdrop-blur-md border border-[var(--accent)]/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">🎉 Certificate Earned!</p>
                <p className="text-green-200 text-xs">Web Development Pro – just now</p>
              </div>
              <div className="ml-auto">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center gap-4 mt-10">
          <button
            onClick={() => goTo((current - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Previous slide"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/15"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 h-2.5 bg-[var(--accent)]"
                    : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo((current + 1) % heroSlides.length)}
            aria-label="Next slide"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/15"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 leading-none">
        <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full">
          <path
            d="M0 72L1440 72L1440 32C1280 8 1120 0 960 12C800 24 640 52 480 52C320 52 160 24 0 32L0 72Z"
            fill="#faf7f2"
          />
        </svg>
      </div>
    </section>
  );
}
