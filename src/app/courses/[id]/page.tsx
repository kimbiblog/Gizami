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

        // Check access: Enrollment OR Subscription
        if (authUser) {
          // 1. Check individual enrollment
          const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", authUser.id)
            .eq("course_id", id)
            .maybeSingle();

          if (enrollment) {
            setIsEnrolled(true);
          } else {
            // 2. Check global subscription
            const { data: profile } = await supabase
              .from("profiles")
              .select("subscription_end_date")
              .eq("id", authUser.id)
              .maybeSingle();
            
            if (profile?.subscription_end_date) {
              const endDate = new Date(profile.subscription_end_date);
              if (endDate > new Date()) {
                setIsEnrolled(true);
              }
            }
          }
        }

      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/courses/${id}`));
      return;
    }

    if (isEnrolled) {
      router.push(`/courses/${id}/learn`);
      return;
    }

    // Check subscription status again to be sure
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_end_date")
      .eq("id", user.id)
      .maybeSingle();

    const isSubscribed = profile?.subscription_end_date && new Date(profile.subscription_end_date) > new Date();

    if (isSubscribed) {
      setIsEnrolling(true);
      // Auto-enroll the student since they have a subscription
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: id,
        progress: 0,
        status: "active"
      });
      setIsEnrolling(false);
      
      if (!error || error.code === "23505") { // Success or already enrolled
        router.push(`/courses/${id}/learn`);
      } else {
        alert("Failed to enroll. Please try again.");
      }
    } else {
      // Show the "You haven't subscribed yet" prompt
      setShowSubscriptionPrompt(true);
    }
  };

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
      {/* Subscription Prompt Modal */}
      {showSubscriptionPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Locked</h2>
            <p className="text-gray-500 mb-8">You haven't subscribed yet. Get a monthly subscription to access all courses on Gizami.</p>
            <div className="space-y-3">
              <Link href="/subscription" className="btn-primary w-full justify-center py-4 text-base">
                Subscribe NOW
              </Link>
              <button 
                onClick={() => setShowSubscriptionPrompt(false)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
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
                🎓 Included with Subscription
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
                      Each module is carefully structured to build upon previous knowledge, ensuring a smooth and effective learning experience.
                    </p>
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
                                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-700">{lesson.title}</p>
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
              </div>

              <div className="p-5">
                <div className="mb-6">
                   <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-3 py-1 rounded-full">Monthly Subscription</span>
                   <p className="text-sm text-gray-400 mt-2">Get access to this and all other courses for one monthly fee.</p>
                </div>

                <button 
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="btn-primary w-full mb-4 text-base py-4 justify-center disabled:opacity-70 shadow-lg"
                >
                  {isEnrolling ? (
                    "Enrolling..."
                  ) : isEnrolled ? (
                    "▶ Continue Learning"
                  ) : (
                    "Enroll Now"
                  )}
                </button>
                
                <div className="border-t border-[var(--border)] pt-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Included with subscription:</h3>
                  <div className="space-y-2.5">
                    {includesData.slice(0, 4).map((item) => (
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
