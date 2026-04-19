"use client";

import { useState } from "react";
import { 
  Play, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Lock,
  Clock
} from "lucide-react";
import { Module, Lesson } from "@/lib/mockData";

interface LessonSidebarProps {
  curriculum: Module[];
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  completedLessons: string[];
}

export default function LessonSidebar({ 
  curriculum, 
  currentLessonId, 
  onSelectLesson,
  completedLessons 
}: LessonSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(curriculum.map(m => m.id));

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const getLessonIcon = (type: Lesson["type"], isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    
    switch (type) {
      case "video": return <Play className="w-4 h-4" />;
      case "reading": return <FileText className="w-4 h-4" />;
      case "quiz": return <HelpCircle className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col border-l border-[var(--border)] overflow-hidden">
      <div className="p-5 border-b border-[var(--border)] bg-gray-50/50">
        <h3 className="font-bold text-gray-800">Course Content</h3>
        <p className="text-xs text-gray-500 mt-1">
          {completedLessons.length} / {curriculum.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons Completed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-10">
        {curriculum.map((module, index) => {
          const isExpanded = expandedModules.includes(module.id);
          return (
            <div key={module.id} className="border-b border-gray-50 last:border-0">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                    Module {index + 1}
                  </span>
                  <p className="font-bold text-sm text-gray-800 line-clamp-1">{module.title}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="bg-white">
                  {module.lessons.map((lesson) => {
                    const isActive = currentLessonId === lesson.id;
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-l-4 transition-all ${
                          isActive 
                            ? "bg-[var(--primary)]/5 border-[var(--primary)]" 
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 ${isActive ? "text-[var(--primary)]" : "text-gray-400"}`}>
                          {getLessonIcon(lesson.type, isCompleted)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-tight ${
                            isActive ? "text-[var(--primary)]" : "text-gray-700"
                          } ${isCompleted && !isActive ? "text-gray-400 line-through decoration-gray-300" : ""}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Clock className="w-2.5 h-2.5" />
                              {lesson.duration}
                            </span>
                            {lesson.free && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
