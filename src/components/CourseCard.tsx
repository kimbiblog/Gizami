"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Star, Users, Clock, BookOpen, Zap, Lock } from "lucide-react";
import type { Course } from "@/lib/mockData";

interface CourseCardProps {
  course: Course;
  loading?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

const badgeColors: Record<string, string> = {
  Bestseller: "bg-[var(--accent)] text-white",
  Hot: "bg-red-500 text-white",
  Free: "bg-[var(--primary)] text-white",
  New: "bg-purple-500 text-white",
  "Top Rated": "bg-amber-500 text-white",
  Trending: "bg-blue-500 text-white",
};

export default function CourseCard({ course, loading }: CourseCardProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Check if user is already enrolled in this course
    const checkEnrollment = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle();
      if (data) setIsEnrolled(true);
    };
    checkEnrollment();
  }, [course.id]);

  if (loading) return <CourseCardSkeleton />;

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isEnrolling) return;
    
    setIsEnrolling(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=" + encodeURIComponent(`/courses/${course.id}`));
        return;
      }

      // Handle direct enrollment for free courses; redirect for paid ones
      const isFree = !course.price || course.price === 0 || course.price === "free";
      
      if (!isFree) {
        // Redirect to detail page for payment
        router.push(`/courses/${course.id}`);
        return;
      }

      // Check if already enrolled
      const { data: enrol } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle();

      if (!enrol) {
        // Enroll in free course
        const { error } = await supabase
          .from("enrollments")
          .insert({
            user_id: user.id,
            course_id: course.id,
            progress: 0,
            status: "active"
          });
        if (error) throw error;
      }

      // Go to learn page
      router.push(`/courses/${course.id}/learn`);
    } catch (err) {
      console.error("Enrollment error:", err);
      // fallback to course details
      router.push(`/courses/${course.id}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  const levelColors = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-blue-100 text-blue-700",
    Advanced: "bg-purple-100 text-purple-700",
  };

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <article className="card h-full flex flex-col">
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <Image
            src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge */}
          {course.badge && (
            <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-600 font-semibold z-10 ${badgeColors[course.badge] || "bg-gray-800 text-white"}`}>
              {course.badge}
            </div>
          )}

          {/* Level */}
          <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-medium z-10 ${levelColors[course.level]}`}>
            {course.level}
          </div>

          {/* Quick stats overlay */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <span className="flex items-center gap-1 text-white text-xs bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
              <Clock className="w-3 h-3" /> {course.duration}
            </span>
            <span className="flex items-center gap-1 text-white text-xs bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
              <BookOpen className="w-3 h-3" /> {course.lessons} lessons
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Instructor and Category */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
              {course.category}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-xs text-gray-500">by {course.instructor}</span>
          </div>

          {/* Title */}
          <h3 className="font-600 text-gray-800 text-base leading-snug mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-2 font-semibold min-h-[2.5rem]">
            {course.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-amber-500">{course.rating}</span>
            <StarRating rating={course.rating} />
            <span className="text-xs text-gray-400">({course.reviews.toLocaleString()})</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.students.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <div>
              {course.price === "free" ? (
                <span className="text-lg font-bold text-[var(--primary)]">Free</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-800">{course.price.toLocaleString()} XAF</span>
                  <span className="text-sm text-gray-400 line-through">{(Math.round(course.price * 1.5)).toLocaleString()} XAF</span>
                </div>
              )}
            </div>
            <button
              className={`py-2 px-4 text-xs disabled:opacity-70 ${
                isEnrolled ? "btn-outline" : "btn-primary"
              }`}
              aria-label={isEnrolled ? `Continue ${course.title}` : `Enroll in ${course.title}`}
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              ) : isEnrolled ? (
                <span>▶</span>
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              {isEnrolling ? "Enrolling..." : isEnrolled ? "Continue" : "Enroll Now"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
