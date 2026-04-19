"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  Play,
  ChevronDown,
  Check,
  Globe,
  BarChart,
  Download,
  Infinity,
  Smartphone,
  Lock,
  PlayCircle,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentModal from "@/components/PaymentModal";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [curriculumData, setCurriculumData] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "reviews">("overview");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        // Fetch course details
        const { data: crs } = await supabase
          .from("courses")
          .select("*, categories(name)")
          .eq("id", id)
          .single();
        
        if (crs) setCourse(crs);

        // Fetch curriculum
        const { data: mods } = await supabase
          .from("modules")
          .select(`
            *,
            lessons (*)
          `)
          .eq("course_id", id)
          .order("order", { ascending: true });
        
        if (mods) {
          const sortedMods = mods.map((m: any) => ({
            ...m,
            lessons: m.lessons?.sort((a: any, b: any) => a.order - b.order) || []
          }));
          setCurriculumData(sortedMods);
        }

        // Check enrollment
        if (authUser) {
          const { data: enrol } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", authUser.id)
            .eq("course_id", id)
            .maybeSingle();
          
          if (enrol) setIsEnrolled(true);
        }

      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const isFree = !course?.price || course.price === 0 || course.price === "free";

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/courses/${id}`));
      return;
    }

    if (isEnrolled) {
      router.push(`/courses/${id}/learn`);
      return;
    }

    // Paid course — open payment modal
    if (!isFree) {
      setShowPaymentModal(true);
      return;
    }

    // Free course — enroll directly
    setIsEnrolling(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: id,
          progress: 0,
          status: "active"
        });
      
      if (error) throw error;
      
      setIsEnrolled(true);
      router.push(`/courses/${id}/learn`);
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("Failed to enroll. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const reviews = [
    {
      name: "Fatima Al-Hassan",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80",
      rating: 5,
      date: "2 weeks ago",
      text: "This course completely transformed my understanding. The instructor explains everything clearly and the projects are incredibly practical!",
    },
    {
      name: "Kwame Asante",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
      rating: 5,
      date: "1 month ago",
      text: "I've taken many online courses but this one stands out. Perfect balance of theory and practice. Highly recommended!",
    },
    {
      name: "Mei Lin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80",
      rating: 4,
      date: "3 weeks ago",
      text: "Great content, great instructor. Would love more advanced topics but overall excellent course for the price.",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400 font-medium">Loading course information...</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const includesData = [
    { icon: Clock, text: `${course.duration || "Self-paced"} of on-demand content` },
    { icon: BookOpen, text: `${course.lessons_count || 0} lessons` },
    { icon: Download, text: "Downloadable resources" },
    { icon: Infinity, text: "Full lifetime access" },
    { icon: Smartphone, text: "Access on mobile and TV" },
    { icon: Award, text: "Certificate of completion" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Payment Modal */}
      {showPaymentModal && course && user && (
        <PaymentModal
          courseId={id}
          courseTitle={course.title}
          price={course.price}
          userId={user.id}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[var(--primary)]/30 text-green-300 px-3 py-1 rounded-lg text-xs font-semibold">
                  {course.categories?.name || "Course"}
                </span>
                <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-lg text-xs">
                  {course.level}
                </span>
                {course.badge && (
                  <span className="bg-[var(--accent)] text-white px-3 py-1 rounded-lg text-xs font-bold">
                    {course.badge}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-5">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">{course.rating || "N/A"}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.floor(course.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-600 fill-gray-600"}`} />
                    ))}
                  </div>
                  <span className="text-gray-400">({(course.reviews_count || 0).toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Users className="w-4 h-4" />
                  {(course.students_count || 0).toLocaleString()} students
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-700">
                  {/* Instructor Avatar Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                    GI
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="text-white font-medium">Gizami Instructor</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> English</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration || "Self-paced"}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.lessons_count} lessons</span>
                <span className="flex items-center gap-1"><BarChart className="w-4 h-4" /> {course.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl border border-[var(--border)] p-1">
              {(["overview", "curriculum", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl capitalize transition-all ${
                    activeTab === tab
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  aria-selected={activeTab === tab}
                  role="tab"
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Video Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
              <Image 
                src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} 
                alt="Course preview" 
                fill 
                className="object-cover opacity-60" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                  aria-label="Play course preview"
                >
                  <Play className="w-7 h-7 text-[var(--primary)] ml-0.5" fill="currentColor" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-sm">
                🎓 Preview: Free for everyone
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">What you&apos;ll learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Build real-world projects from scratch",
                    "Industry best practices and patterns",
                    "Deploy to production environments",
                    "Problem-solving and debugging skills",
                    "Work with professional tools",
                    "Build an impressive portfolio",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[var(--primary)]" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Course Description</h2>
                  <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                    <p>{course.description}</p>
                    <p>
                      This comprehensive course takes you from absolute beginner to proficient practitioner.
                      Through hands-on projects and real-world examples, you&apos;ll develop skills that employers are actively looking for.
                    </p>
                    <p>
                      Each module is carefully structured to build upon previous knowledge, ensuring a smooth and effective learning experience.
                      You&apos;ll have access to all course materials, community support, and regular updates.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {course.tags?.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-800">Course Curriculum</h2>
                  <p className="text-sm text-gray-500">{course.lessons_count} lessons · {course.duration || "Self-paced"}</p>
                </div>
                <div className="space-y-3">
                  {curriculumData.map((section, i) => (
                    <div key={section.id} className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenSection(openSection === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        aria-expanded={openSection === i}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{section.title}</p>
                            <p className="text-xs text-gray-500">{section.lessons?.length || 0} lessons</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openSection === i ? "rotate-180" : ""}`} />
                      </button>
                      {openSection === i && (
                        <div className="divide-y divide-gray-50">
                          {section.lessons?.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${lesson.is_preview ? "bg-[var(--primary)]/10" : "bg-gray-100"}`}>
                                  {lesson.is_preview ? (
                                    <PlayCircle className="w-4 h-4 text-[var(--primary)]" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-700">{lesson.title}</p>
                                  {lesson.is_preview && <span className="text-xs text-[var(--primary)] font-medium">Preview</span>}
                                </div>
                              </div>
                              <span className="text-xs text-gray-400 font-medium">{lesson.duration || "5m"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <div className="flex items-center gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-6xl font-extrabold text-gray-800">{course.rating}</div>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Course Rating</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <div className="progress-bar flex-1">
                          <div className="progress-fill" style={{ width: `${star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : 2}%` }} />
                        </div>
                        <div className="flex items-center gap-1 w-8 justify-center">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-gray-500">{star}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {reviews.map((r) => (
                    <div key={r.name} className="flex gap-4 p-4 rounded-xl bg-gray-50">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {r.avatar ? (
                          <Image src={r.avatar} alt={r.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs bg-gray-200">
                            {r.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-800">{r.name}</p>
                          <span className="text-xs text-gray-400">{r.date}</span>
                        </div>
                        <div className="flex mb-2">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden">
              <div className="relative h-44 bg-gray-100">
                <Image 
                  src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} 
                  alt={course.title} 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <button className="flex items-center gap-2 bg-white text-[var(--primary)] font-semibold text-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform">
                    <Play className="w-4 h-4" fill="currentColor" />
                    Preview Course
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  {course.price === 0 ? (
                    <span className="text-3xl font-extrabold text-[var(--primary)]">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-gray-800">{course.price?.toLocaleString()} XAF</span>
                      <span className="text-lg text-gray-400 line-through">{(Math.round((course.price || 0) * 1.5)).toLocaleString()} XAF</span>
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">33% OFF</span>
                    </>
                  )}
                </div>

                <button 
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="btn-primary w-full mb-3 text-base py-4 justify-center disabled:opacity-70"
                >
                  {isEnrolling ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : isEnrolled ? (
                    "▶ Continue Learning"
                  ) : isFree ? (
                    "⚡ Enroll Free"
                  ) : (
                    `💳 Enroll for ${course.price?.toLocaleString("fr-CM")} XAF`
                  )}
                </button>
                <button className="btn-outline w-full mb-4 text-base py-3.5 justify-center">
                  Add to Wishlist
                </button>

                <p className="text-center text-xs text-gray-400 mb-4">30-Day Money-Back Guarantee</p>

                <div className="border-t border-[var(--border)] pt-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">This course includes:</h3>
                  <div className="space-y-2.5">
                    {includesData.map((item) => (
                      <div key={item.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <item.icon className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
