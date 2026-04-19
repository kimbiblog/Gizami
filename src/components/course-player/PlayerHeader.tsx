"use client";

import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Share2, MoreVertical } from "lucide-react";
import Image from "next/image";

interface PlayerHeaderProps {
  courseTitle: string;
  progress: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function PlayerHeader({ courseTitle, progress, onPrev, onNext }: PlayerHeaderProps) {
  return (
    <header className="h-16 bg-gray-900 text-white border-b border-white/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4 min-w-0">
        <Link 
          href="/dashboard" 
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Exit Player"
        >
          <X className="w-5 h-5" />
        </Link>
        <div className="h-8 w-px bg-white/10 hidden sm:block" />
        <div className="min-w-0 hidden md:block">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider truncate">
            {courseTitle}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[var(--primary)]">{progress}% Complete</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl mr-2">
          <button 
            onClick={onPrev}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
            aria-label="Previous Lesson"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={onNext}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
            aria-label="Next Lesson"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button className="hidden sm:flex p-2 hover:bg-white/10 rounded-xl transition-colors" aria-label="Share">
          <Share2 className="w-5 h-5 text-gray-400" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors" aria-label="More options">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
