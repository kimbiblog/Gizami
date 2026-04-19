"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/lib/mockData";

export default function TestimonialCard() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 400);
    },
    [isAnimating]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  return (
    <div className="relative">
      {/* Main testimonial */}
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Quote icon */}
        <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-6">
          <Quote className="w-6 h-6 text-[var(--primary)]" />
        </div>

        {/* Text */}
        <blockquote
          key={current}
          className="text-gray-700 text-lg leading-relaxed mb-8 relative animate-fade-in"
        >
          "{testimonials[current].text}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-[var(--primary)]/20">
            <Image
              src={testimonials[current].avatar}
              alt={testimonials[current].name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-gray-800">{testimonials[current].name}</p>
            <p className="text-sm text-gray-500">{testimonials[current].role}</p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(testimonials[current].rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-xs text-gray-400">Course:</p>
            <p className="text-xs font-medium text-[var(--primary)] max-w-32">{testimonials[current].course}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-2.5 bg-[var(--primary)]" : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
            aria-label="Previous"
            className="w-10 h-10 rounded-xl bg-white border border-[var(--border)] flex items-center justify-center text-gray-600 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goTo((current + 1) % testimonials.length)}
            aria-label="Next"
            className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white hover:bg-[var(--primary-dark)] transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {testimonials.slice(0, 3).map((t, i) => (
          <button
            key={t.id}
            onClick={() => goTo(i)}
            className={`flex items-center gap-2 p-3 rounded-xl transition-all text-left ${
              i === current ? "bg-[var(--primary)]/10 border-2 border-[var(--primary)]" : "bg-white border-2 border-transparent hover:border-gray-200"
            }`}
          >
            <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={t.avatar} alt={t.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{t.name.split(" ")[0]}</p>
              <div className="flex">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
