"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// Components
import PlayerHeader from "@/components/course-player/PlayerHeader";
import LessonSidebar from "@/components/course-player/LessonSidebar";
import VideoPlayer from "@/components/course-player/VideoPlayer";
import ReadingContent from "@/components/course-player/ReadingContent";
import QuizRenderer from "@/components/course-player/QuizRenderer";

// Utils
import { ChevronRight, Menu, CheckCircle2, Play, BookMarked, Award } from "lucide-react";
import { updateProgress } from "@/app/actions/progress";

export default function CourseLearnPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to false for mobile
  const [user, setUser] = useState<any>(null);

  // Open sidebar by default only on desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Combined lessons flat list for navigation
  const allLessons = useMemo(() => {
    return curriculum.flatMap(m => m.lessons || []);
  }, [curriculum]);

  useEffect(() => {
    const initPlayer = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/login");
          return;
        }
        setUser(authUser);

        // Fetch course
        const { data: crs, error: crsErr } = await supabase
          .from("courses")
          .select("*, categories(name)")
          .eq("id", id)
          .single();
          
        if (crsErr) {
          console.error("Course fetch error:", crsErr);
          setLoadError(crsErr.message);
        }
        if (crs) setCourse(crs);

        // Fetch curriculum (modules + lessons)
        const { data: mods, error: modsErr } = await supabase
          .from("modules")
          .select(`
            *,
            lessons (*)
          `)
          .eq("course_id", id)
          .order("order", { ascending: true });
          
        if (modsErr) {
          console.error("Modules fetch error:", modsErr);
          setLoadError(modsErr.message);
        }
        
        if (mods) {
          // Sort lessons within modules
          const sortedMods = mods.map((m: any) => ({
            ...m,
            lessons: m.lessons?.sort((a: any, b: any) => a.order - b.order) || []
          }));
          setCurriculum(sortedMods);
          
          // Set initial lesson
          const firstLesson = sortedMods[0]?.lessons[0];
          if (firstLesson) setCurrentLessonId(firstLesson.id);
        }

        // Fetch completions
        const { data: comps, error: compsErr } = await supabase
          .from("lesson_completions")
          .select("lesson_id")
          .eq("user_id", authUser.id);
          
        if (compsErr && compsErr.code !== 'PGRST116') {
           console.warn("Completions check issue:", compsErr);
        }
        
        if (comps) setCompletedLessons(comps.map((c: any) => c.lesson_id));

      } catch (err: any) {
        console.error("Error loading course:", err);
        setLoadError(err.message || "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    initPlayer();
  }, [id, router]);

  const currentLesson = useMemo(() => {
    return allLessons.find(l => l.id === currentLessonId) || allLessons[0];
  }, [currentLessonId, allLessons]);

  const progress = allLessons.length > 0 
    ? Math.round((completedLessons.length / allLessons.length) * 100) 
    : 0;

  const handleNext = () => {
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].id);
    }
  };

  const markAsComplete = async (lessonId: string, forceComplete: boolean = false) => {
    if (!user) return;
    
    // Prevent duplicated inserts if already completed, but allow progress updates if forcing
    const alreadyCompleted = completedLessons.includes(lessonId);

    try {
      // 1. Record completion
      if (!alreadyCompleted) {
        const { error: compErr } = await supabase
          .from("lesson_completions")
          .insert({ user_id: user.id, lesson_id: lessonId });
        
        if (compErr) throw compErr;
      }

      // 2. Update local state
      let nextCompleted = completedLessons;
      if (!alreadyCompleted) {
        nextCompleted = [...completedLessons, lessonId];
        setCompletedLessons(nextCompleted);
      }

      // 3. Update enrollment progress
      let nextProgress = Math.round((nextCompleted.length / allLessons.length) * 100);
      if (forceComplete) {
         nextProgress = 100;
      }
      
      const res = await updateProgress(user.id, id, nextProgress);
      if (!res.success) {
        console.error("Failed to update progress:", res.error);
      }

    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400 font-medium italic">Preparing your learning experience...</p>
        </div>
      </div>
    );
  }

  if (!course || allLessons.length === 0 || loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-4">
          <div className="bg-orange-100 p-4 rounded-full">
             <BookMarked className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Lessons Found</h2>
            <p className="text-sm text-gray-500 mb-4">This course hasn't been populated with lessons yet, or there was an error loading them.</p>
            {loadError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs text-left mb-4 break-words">
                <strong>Error:</strong> {loadError}
              </div>
            )}
          </div>
          <button onClick={() => router.back()} className="btn-outline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)] overflow-hidden">
      {/* Header */}
      <PlayerHeader 
        courseTitle={course.title}
        progress={progress}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
          isSidebarOpen ? "lg:mr-0" : ""
        }`}>
          <div className="container mx-auto max-w-5xl p-4 sm:p-8">
            {/* Lesson Title & Breadcrumbs */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">
                <span>{course.category?.name || "Course"}</span>
                <ChevronRight className="w-3 h-3" />
                <span>Module {curriculum.findIndex(m => m.lessons?.some((l: any) => l.id === currentLessonId)) + 1}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
                {currentLesson?.title}
                {currentLesson && completedLessons.includes(currentLesson.id) && (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
              </h1>
            </div>

            {/* Content Switcher */}
            <div className="animate-fade-in">
              {currentLesson?.type === "video" && (currentLesson?.video_url || currentLesson?.videoUrl || currentLesson?.content?.videoUrl) && (
                <VideoPlayer 
                  url={currentLesson.video_url || currentLesson.videoUrl || currentLesson.content?.videoUrl} 
                />
              )}

              {currentLesson?.type === "reading" && (typeof currentLesson?.content === 'string' ? currentLesson.content : currentLesson?.content?.readingContent) && (
                <ReadingContent content={typeof currentLesson.content === 'string' ? currentLesson.content : currentLesson.content?.readingContent} />
              )}

              {currentLesson?.type === "quiz" && (currentLesson?.questions || currentLesson?.content?.quizQuestions) && (
                <QuizRenderer 
                  questions={currentLesson.questions || currentLesson.content?.quizQuestions}
                  isLastLesson={allLessons.findIndex(l => l.id === currentLessonId) === allLessons.length - 1}
                  onComplete={async (score) => {
                    const isLast = allLessons.findIndex(l => l.id === currentLesson.id) === allLessons.length - 1;
                    await markAsComplete(currentLesson.id, isLast);
                    if (isLast) {
                        router.push("/dashboard?tab=certificates");
                    } else {
                        handleNext();
                    }
                  }}
                />
              )}
            </div>

            {/* Lesson Navigation Footer bar */}
            <div className="mt-12 pt-8 border-t border-[var(--border)] flex items-center justify-between gap-4 pb-20">
              <button 
                onClick={handlePrev}
                disabled={allLessons.findIndex(l => l.id === currentLessonId) === 0}
                className="flex flex-col gap-1 items-start group disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Previous</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[var(--primary)] transition-colors">
                  {allLessons[allLessons.findIndex(l => l.id === currentLessonId) - 1]?.title || "Start"}
                </span>
              </button>

              <div className="flex flex-col items-center gap-3">
                {currentLesson && !completedLessons.includes(currentLesson.id) && currentLesson.type !== "quiz" && (
                   <button 
                    onClick={() => markAsComplete(currentLesson.id)}
                    className="btn-primary py-3 px-8 text-sm sm:text-base text-center"
                  >
                    Mark as Completed
                  </button>
                )}
                {currentLesson && completedLessons.includes(currentLesson.id) && (
                   <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl text-center">
                    <CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">Lesson</span> Completed
                  </div>
                )}
              </div>

              <button 
                onClick={handleNext}
                disabled={allLessons.findIndex(l => l.id === currentLessonId) === allLessons.length - 1}
                className="flex flex-col gap-1 items-end group text-right disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[var(--primary)] transition-colors">
                  {allLessons[allLessons.findIndex(l => l.id === currentLessonId) + 1]?.title || "Finish"}
                </span>
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar Toggle (Floating on desktop when closed) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed right-4 bottom-4 lg:right-6 lg:bottom-6 w-12 h-12 lg:w-14 lg:h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-[60]"
            aria-label="Open Sidebar"
          >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        )}

        {/* Sidebar backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <aside className={`
          absolute lg:static inset-y-0 right-0 z-50 w-full max-w-[320px] sm:w-80 flex-shrink-0
          bg-white shadow-2xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-full lg:hidden"}
        `}>
          <div className="h-full relative">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute top-3 right-4 p-2 text-gray-500 rounded-lg hover:bg-gray-100 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <LessonSidebar 
              curriculum={curriculum}
              currentLessonId={currentLessonId || ""}
              onSelectLesson={(lid) => {
                setCurrentLessonId(lid);
                // On mobile, close sidebar on selection
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              completedLessons={completedLessons}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
