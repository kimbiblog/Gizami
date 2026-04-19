"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, UserCheck, Lightbulb, Rocket, Check, GraduationCap, Shield, Play } from "lucide-react";

import HeroSlider from "@/components/HeroSlider";
import CourseCard from "@/components/CourseCard";
import TestimonialCard from "@/components/TestimonialCard";
import { supabase } from "@/lib/supabase";

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Sign Up",
    desc: "Create your free account in seconds. No credit card required.",
    color: "from-[var(--primary)] to-[var(--primary-light)]",
    bg: "bg-[var(--primary)]/10",
    iconColor: "text-[var(--primary)]",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Choose a Course",
    desc: "Browse 1000+ courses across tech, business, design and more.",
    color: "from-[var(--accent)] to-orange-400",
    bg: "bg-[var(--accent)]/10",
    iconColor: "text-[var(--accent)]",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Start Learning",
    desc: "Learn at your own pace and earn certificates to advance your career.",
    color: "from-purple-600 to-purple-400",
    bg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

const stats = [
  { icon: BookOpen, value: "1,000+", label: "Expert Courses", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  { icon: Users, value: "500K+", label: "Active Students", color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
  { icon: Award, value: "150+", label: "Certifications", color: "text-purple-600", bg: "bg-purple-100" },
  { icon: TrendingUp, value: "98%", label: "Success Rate", color: "text-blue-600", bg: "bg-blue-100" },
];

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [fetchedCategories, setFetchedCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // Fetch featured courses (pinned or most popular)
        const { data: crs } = await supabase
          .from("courses")
          .select(`
            *,
            categories (name),
            instructor:profiles!courses_instructor_id_fkey (full_name)
          `)
          .eq("status", "published")
          .limit(8);
        
        if (crs) {
          const mapped = crs.map((c: any) => ({
            id: c.id,
            title: c.title,
            instructor: (c as any).instructor?.full_name || "Gizami Instructor",
            category: c.categories?.name || "Uncategorized",
            price: c.price === 0 ? "free" : c.price,
            rating: c.rating,
            reviews: c.reviews_count || 0,
            students: c.students_count || 0,
            image: c.image_url,
            badge: c.badge,
            duration: c.duration,
            lessons: c.lessons_count || 0,
            level: c.level,
            description: c.description
          }));
          setFeaturedCourses(mapped);
        }

        // Fetch categories
        const { data: cats } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .limit(12);
        
        if (cats) setFetchedCategories(cats);

      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <main>
      {/* Hero */}
      <HeroSlider />

      {/* Stats Bar */}
      <section className="py-10 bg-white border-b border-[var(--border)]" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20" aria-labelledby="featured-courses-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="section-badge">
                <Lightbulb className="w-3.5 h-3.5" />
                Featured Courses
              </div>
              <h2 id="featured-courses-heading" className="section-title">
                Learn from the Best
              </h2>
              <p className="section-subtitle mt-2">
                Discover our curated courses crafted by industry experts
              </p>
            </div>
            <Link href="/courses" className="btn-outline whitespace-nowrap">
              View All Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-badge mx-auto w-fit">
              <BookOpen className="w-3.5 h-3.5" />
              Explore Topics
            </div>
            <h2 id="categories-heading" className="section-title">Browse by Category</h2>
            <p className="section-subtitle mt-2 mx-auto text-center">
              Find the perfect course in your area of interest
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {fetchedCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.name}`}
                className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-transparent hover:border-current transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ backgroundColor: "white", color: "var(--primary)" }}
                aria-label={`Browse ${cat.name} courses`}
              >
                <span className="text-3xl">📚</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-400">View courses</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-badge mx-auto w-fit">
              <Rocket className="w-3.5 h-3.5" />
              Simple Process
            </div>
            <h2 id="how-it-works-heading" className="section-title">How It Works</h2>
            <p className="section-subtitle mt-2 mx-auto text-center">
              Start your learning journey in three simple steps
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[calc(16.7%+48px)] right-[calc(16.7%+48px)] h-0.5 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-purple-600 opacity-30" />

            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center group">
                {/* Number */}
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 ${step.bg} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-9 h-9 ${step.iconColor}`} />
                  </div>
                  <div className={`absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/signup" className="btn-primary text-base px-10 py-4">
              <GraduationCap className="w-5 h-5" />
              Start Learning for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-badge">
                <Award className="w-3.5 h-3.5" />
                Success Stories
              </div>
              <h2 id="testimonials-heading" className="section-title">
                What Our Students Say
              </h2>
              <p className="section-subtitle mt-3 mb-8">
                Join thousands of learners who transformed their careers with Gizami.
              </p>
              <div className="space-y-3">
                {[
                  "Expert-led video lessons",
                  "Lifetime course access",
                  "Industry-recognized certificates",
                  "30-day money-back guarantee",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[var(--primary)]" />
                    </div>
                    <span className="text-sm text-gray-600">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <TestimonialCard />
            </div>
          </div>
        </div>
      </section>



      {/* CTA Banner */}
      <section className="py-20" aria-labelledby="cta-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] via-[#1d7a45] to-[var(--primary-light)] p-10 md:p-16 text-white text-center">
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[var(--accent)]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
                <Rocket className="w-4 h-4 text-[var(--accent)]" />
                Limited Time Offer – 50% Off!
              </div>
              <h2 id="cta-heading" className="text-4xl md:text-5xl font-extrabold mb-4">
                Ready to Transform Your Career?
              </h2>
              <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
                Join over 500,000 learners. Get unlimited access to all courses, certificates, and expert support.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/signup" className="btn-accent text-base px-10 py-4">
                  <GraduationCap className="w-5 h-5" />
                  Get Started Free
                </Link>
                <Link href="/courses" className="btn-outline-white text-base px-10 py-4">
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
