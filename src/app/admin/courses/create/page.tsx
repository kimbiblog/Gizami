"use client";

import { Suspense } from "react";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BookOpen, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  Play, FileText, Upload, DollarSign, Globe, Lock, Award, Check,
  Info, Save, Eye, ArrowLeft, Video, Bold, Italic, List, Link2,
  HelpCircle, AlignLeft, CheckSquare, Clock, BarChart3, X, Pencil,
  ChevronUp, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AdminHeader from "@/components/admin/AdminHeader";


// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options: QuizOption[];
  correctAnswer: string; // option id or "true"/"false" or free text
  points: number;
  explanation: string;
}

interface LessonContent {
  // video
  videoUrl?: string;
  videoNotes?: string;
  // reading
  readingContent?: string;
  // quiz
  quizTitle?: string;
  quizTimeLimit?: number; // minutes, 0 = no limit
  quizPassScore?: number; // %
  quizQuestions?: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  isFree: boolean;
  content: LessonContent;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  isOpen: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultModules: Module[] = [
  {
    id: "m1",
    title: "Introduction & Getting Started",
    isOpen: true,
    lessons: [
      { id: "l1", title: "Welcome to the Course", type: "video", duration: "5:30", isFree: true, content: { videoUrl: "", videoNotes: "" } },
      { id: "l2", title: "Course Overview and Goals", type: "video", duration: "8:45", isFree: true, content: { videoUrl: "", videoNotes: "" } },
      { id: "l3", title: "Setting Up Your Environment", type: "video", duration: "12:20", isFree: false, content: { videoUrl: "", videoNotes: "" } },
    ],
  },
  {
    id: "m2",
    title: "Core Foundations",
    isOpen: false,
    lessons: [
      { id: "l4", title: "Understanding the Basics", type: "video", duration: "18:00", isFree: false, content: { videoUrl: "", videoNotes: "" } },
      { id: "l5", title: "Core Concepts — Reading", type: "reading", duration: "10:00", isFree: false, content: { readingContent: "" } },
      {
        id: "l6", title: "Module Quiz", type: "quiz", duration: "10:00", isFree: false,
        content: {
          quizTitle: "Module 1 Quiz",
          quizTimeLimit: 10,
          quizPassScore: 70,
          quizQuestions: [
            {
              id: "q1",
              question: "What is the primary purpose of React hooks?",
              type: "multiple_choice",
              options: [
                { id: "a", text: "To replace class components with functional components" },
                { id: "b", text: "To make apps render faster" },
                { id: "c", text: "To enable server-side rendering" },
                { id: "d", text: "To manage database connections" },
              ],
              correctAnswer: "a",
              points: 10,
              explanation: "React hooks allow you to use state and other React features in functional components.",
            },
          ],
        },
      },
    ],
  },
];

const levels_list = ["Beginner", "Intermediate", "Advanced"];
const lessonTypes = ["video", "reading", "quiz"] as const;

interface DB_Category {
  id: string;
  name: string;
}


// ─── Rich Text Toolbar ────────────────────────────────────────────────────────

function TextToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const tools = [
    { icon: Bold, title: "Bold", wrap: ["**", "**"] },
    { icon: Italic, title: "Italic", wrap: ["*", "*"] },
    { icon: List, title: "Bullet List", prefix: "\n- " },
    { icon: Link2, title: "Link", wrap: ["[", "](url)"] },
    { icon: AlignLeft, title: "Heading", prefix: "\n## " },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
      {tools.map((tool) => (
        <button
          key={tool.title}
          type="button"
          title={tool.title}
          onClick={() => {
            if (tool.prefix) onInsert(tool.prefix + "Your text here");
            else if (tool.wrap) onInsert(`${tool.wrap[0]}Your text here${tool.wrap[1]}`);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all"
        >
          <tool.icon className="w-3.5 h-3.5" />
        </button>
      ))}
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <span className="text-[10px] text-gray-400">Markdown supported</span>
    </div>
  );
}

// ─── Quiz Question Editor ─────────────────────────────────────────────────────

function QuizQuestionEditor({
  question,
  index,
  onChange,
  onDelete,
}: {
  question: QuizQuestion;
  index: number;
  onChange: (q: QuizQuestion) => void;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const updateOption = (optId: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map((o) => o.id === optId ? { ...o, text } : o),
    });
  };

  const addOption = () => {
    const letters = ["a", "b", "c", "d", "e", "f"];
    const nextId = letters[question.options.length] || `opt${Date.now()}`;
    onChange({ ...question, options: [...question.options, { id: nextId, text: "" }] });
  };

  const removeOption = (optId: string) => {
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== optId),
      correctAnswer: question.correctAnswer === optId ? "" : question.correctAnswer,
    });
  };

  const typeIcon = {
    multiple_choice: CheckSquare,
    true_false: AlertCircle,
    short_answer: AlignLeft,
  }[question.type];
  const TypeIcon = typeIcon;

  return (
    <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-extrabold text-[var(--primary)]">Q{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {question.question || <span className="text-gray-400 italic">Question {index + 1}</span>}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <TypeIcon className="w-3 h-3" />
              {question.type.replace("_", " ")}
            </span>
            <span className="text-[10px] text-gray-400">· {question.points} pts</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all"
            title="Delete question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Question text */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Question *</label>
            <textarea
              rows={2}
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="Enter your question..."
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 resize-none transition-all"
            />
          </div>

          {/* Type + Points + Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
              <select
                value={question.type}
                onChange={(e) => {
                  const newType = e.target.value as QuizQuestion["type"];
                  let newOptions = question.options;
                  let newAnswer = question.correctAnswer;
                  if (newType === "true_false") {
                    newOptions = [{ id: "true", text: "True" }, { id: "false", text: "False" }];
                    newAnswer = "true";
                  } else if (newType === "multiple_choice" && question.type === "true_false") {
                    newOptions = [
                      { id: "a", text: "" }, { id: "b", text: "" },
                      { id: "c", text: "" }, { id: "d", text: "" },
                    ];
                    newAnswer = "";
                  } else if (newType === "short_answer") {
                    newOptions = [];
                    newAnswer = "";
                  }
                  onChange({ ...question, type: newType, options: newOptions, correctAnswer: newAnswer });
                }}
                className="w-full text-xs px-2.5 py-2 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Points</label>
              <input
                type="number"
                min="1"
                value={question.points}
                onChange={(e) => onChange({ ...question, points: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full text-xs px-2.5 py-2 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Hint (optional)</label>
              <input
                type="text"
                value={question.explanation}
                onChange={(e) => onChange({ ...question, explanation: e.target.value })}
                placeholder="Shown after answer..."
                className="w-full text-xs px-2.5 py-2 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>

          {/* ── Multiple Choice Options ── */}
          {question.type === "multiple_choice" && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Answer Options</label>
              <div className="space-y-2">
                {question.options.map((option, oIdx) => (
                  <div key={option.id} className="flex items-center gap-2.5">
                    {/* Radio = correct answer selector */}
                    <button
                      type="button"
                      onClick={() => onChange({ ...question, correctAnswer: option.id })}
                      title="Mark as correct"
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        question.correctAnswer === option.id
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {question.correctAnswer === option.id && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </button>
                    <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">
                      {option.id.toUpperCase()}.
                    </span>
                    <input
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder={`Option ${option.id.toUpperCase()}`}
                      className={`flex-1 text-sm px-3 py-2 rounded-xl border transition-all outline-none ${
                        question.correctAnswer === option.id
                          ? "border-green-400 bg-green-50 text-green-800"
                          : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                      }`}
                    />
                    {question.correctAnswer === option.id && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                        Correct
                      </span>
                    )}
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {question.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 flex items-center gap-1.5 text-xs text-[var(--primary)] font-medium hover:text-[var(--primary-light)] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </button>
              )}
              {!question.correctAnswer && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> Click the circle next to the correct answer
                </p>
              )}
            </div>
          )}

          {/* ── True / False Options ── */}
          {question.type === "true_false" && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Correct Answer</label>
              <div className="flex gap-3">
                {["true", "false"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onChange({ ...question, correctAnswer: val })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                      question.correctAnswer === val
                        ? val === "true"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-red-400 bg-red-50 text-red-700"
                        : "border-[var(--border)] text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {val === "true" ? "✓ True" : "✗ False"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Short Answer ── */}
          {question.type === "short_answer" && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Expected Answer (used for auto-grading)
              </label>
              <input
                value={question.correctAnswer}
                onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
                placeholder="Enter the expected correct answer..."
                className="w-full text-sm px-3 py-2.5 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Case-insensitive comparison will be used</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Lesson Content Editor (inline panel) ────────────────────────────────────

function LessonEditor({
  lesson,
  onChange,
  onClose,
}: {
  lesson: Lesson;
  onChange: (lesson: Lesson) => void;
  onClose: () => void;
}) {
  const updateContent = useCallback(
    (partial: Partial<LessonContent>) => {
      onChange({ ...lesson, content: { ...lesson.content, ...partial } });
    },
    [lesson, onChange]
  );

  const addQuestion = () => {
    const existing = lesson.content.quizQuestions || [];
    const newQ: QuizQuestion = {
      id: `q${Date.now()}`,
      question: "",
      type: "multiple_choice",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "",
      points: 10,
      explanation: "",
    };
    updateContent({ quizQuestions: [...existing, newQ] });
  };

  const updateQuestion = (id: string, updated: QuizQuestion) => {
    updateContent({
      quizQuestions: (lesson.content.quizQuestions || []).map((q) =>
        q.id === id ? updated : q
      ),
    });
  };

  const deleteQuestion = (id: string) => {
    updateContent({
      quizQuestions: (lesson.content.quizQuestions || []).filter((q) => q.id !== id),
    });
  };

  const totalPoints = (lesson.content.quizQuestions || []).reduce((acc, q) => acc + q.points, 0);

  const insertTextAtCursor = (text: string) => {
    updateContent({
      readingContent: (lesson.content.readingContent || "") + text,
    });
  };

  return (
    <div className="border-t border-[var(--border)] bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            lesson.type === "video" ? "bg-blue-100 text-blue-600" :
            lesson.type === "reading" ? "bg-purple-100 text-purple-600" :
            "bg-amber-100 text-amber-600"
          }`}>
            {lesson.type === "video" ? <Video className="w-3.5 h-3.5" /> :
             lesson.type === "reading" ? <FileText className="w-3.5 h-3.5" /> :
             <HelpCircle className="w-3.5 h-3.5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{lesson.title || "Untitled Lesson"}</p>
            <p className="text-[10px] text-gray-400 capitalize">{lesson.type} content editor</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
          title="Collapse editor"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {/* ──────────── VIDEO EDITOR ──────────── */}
        {lesson.type === "video" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-500" /> Video URL
              </label>
              <input
                type="url"
                value={lesson.content.videoUrl || ""}
                onChange={(e) => updateContent({ videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=... or Vimeo / MP4 URL"
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
              />
              <div className="flex items-center gap-3 mt-2">
                {["YouTube", "Vimeo", "Loom", "Direct MP4"].map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Lesson Notes / Transcript (optional)
              </label>
              <p className="text-[10px] text-gray-400 mb-2">
                Add notes or transcript that will be shown below the video
              </p>
              <TextToolbar onInsert={insertTextAtCursor} />
              <textarea
                rows={6}
                value={lesson.content.videoNotes || ""}
                onChange={(e) => updateContent({ videoNotes: e.target.value })}
                placeholder="Paste or type lesson notes, key takeaways, links to resources..."
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] border-t-0 rounded-b-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 resize-none transition-all font-mono"
              />
            </div>

            {/* Upload alternative */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-[var(--primary)]/40 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-gray-500">Or upload video file directly</p>
              <p className="text-[10px] text-gray-400 mt-0.5">MP4, MOV, AVI up to 2GB</p>
            </div>
          </div>
        )}

        {/* ──────────── READING EDITOR ──────────── */}
        {lesson.type === "reading" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" /> Lesson Content
              </label>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>{(lesson.content.readingContent || "").length} chars</span>
                <span>·</span>
                <span>~{Math.ceil((lesson.content.readingContent || "").split(" ").filter(Boolean).length / 200)} min read</span>
              </div>
            </div>

            <TextToolbar onInsert={insertTextAtCursor} />
            <textarea
              rows={16}
              value={lesson.content.readingContent || ""}
              onChange={(e) => updateContent({ readingContent: e.target.value })}
              placeholder={`Write or paste your lesson content here...\n\nTips:\n• Use **bold** for emphasis\n• Use ## for headings\n• Use - for bullet points\n• Paste from Google Docs, Word, or Notion directly!\n\nMarkdown is supported and will be rendered for students.`}
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] border-t-0 rounded-b-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 resize-y transition-all font-mono leading-relaxed"
              style={{ minHeight: "280px" }}
            />

            {/* Preview hint */}
            {lesson.content.readingContent && (
              <div className="text-[10px] text-gray-400 bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Markdown will be rendered for students. Use the Preview button to see how it looks.
              </div>
            )}
          </div>
        )}

        {/* ──────────── QUIZ EDITOR ──────────── */}
        {lesson.type === "quiz" && (
          <div className="space-y-5">
            {/* Quiz Settings */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quiz Settings</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Quiz Title
                  </label>
                  <input
                    value={lesson.content.quizTitle || ""}
                    onChange={(e) => updateContent({ quizTitle: e.target.value })}
                    placeholder="e.g. Module 1 Check"
                    className="w-full text-sm px-3 py-2 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time Limit (min)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={lesson.content.quizTimeLimit ?? 10}
                      onChange={(e) => updateContent({ quizTimeLimit: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm px-3 py-2 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all bg-white"
                    />
                    {(lesson.content.quizTimeLimit || 0) === 0 && (
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">No limit</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Pass Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={lesson.content.quizPassScore ?? 70}
                    onChange={(e) => updateContent({ quizPassScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="w-full text-sm px-3 py-2 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Summary bar */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-200 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <HelpCircle className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span className="font-semibold text-gray-700">{(lesson.content.quizQuestions || []).length}</span> questions
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="font-semibold text-gray-700">{totalPoints}</span> total points
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold text-gray-700">
                    {(lesson.content.quizTimeLimit || 0) > 0 ? `${lesson.content.quizTimeLimit} min` : "Unlimited"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  Pass at <span className="font-semibold text-gray-700 mx-1">{lesson.content.quizPassScore ?? 70}%</span>
                  ({Math.ceil(((lesson.content.quizPassScore ?? 70) / 100) * totalPoints)} pts needed)
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {(lesson.content.quizQuestions || []).map((q, qIdx) => (
                <QuizQuestionEditor
                  key={q.id}
                  question={q}
                  index={qIdx}
                  onChange={(updated) => updateQuestion(q.id, updated)}
                  onDelete={() => deleteQuestion(q.id)}
                />
              ))}
            </div>

            {/* Add Question button */}
            <button
              type="button"
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[var(--primary)]/30 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/5 hover:border-[var(--primary)] transition-all"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>

            {(lesson.content.quizQuestions || []).length === 0 && (
              <div className="text-center py-6 bg-amber-50 rounded-2xl border border-amber-100">
                <HelpCircle className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <p className="text-sm text-amber-700 font-medium">No questions yet</p>
                <p className="text-xs text-amber-500 mt-0.5">Click "Add Question" to build your quiz</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  onDelete,
  onChange,
}: {
  lesson: Lesson;
  onDelete: () => void;
  onChange: (lesson: Lesson) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  const typeIcon = { video: Video, reading: FileText, quiz: HelpCircle }[lesson.type];
  const TypeIcon = typeIcon;

  const typeColor = {
    video: "bg-blue-100 text-blue-600",
    reading: "bg-purple-100 text-purple-600",
    quiz: "bg-amber-100 text-amber-600",
  }[lesson.type];

  const hasContent = lesson.type === "video"
    ? !!(lesson.content.videoUrl || lesson.content.videoNotes)
    : lesson.type === "reading"
    ? !!(lesson.content.readingContent)
    : (lesson.content.quizQuestions || []).length > 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Row Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 group hover:bg-white transition-colors">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor}`}>
          <TypeIcon className="w-3.5 h-3.5" />
        </div>
        <input
          value={lesson.title}
          onChange={(e) => onChange({ ...lesson, title: e.target.value })}
          className="flex-1 bg-transparent text-sm font-medium text-gray-700 outline-none min-w-0"
          placeholder="Lesson title"
        />

        {/* Content indicator */}
        {hasContent && (
          <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-md flex-shrink-0 flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5" /> Content added
          </span>
        )}
        {lesson.type === "quiz" && (lesson.content.quizQuestions || []).length > 0 && (
          <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
            {(lesson.content.quizQuestions || []).length} Qs
          </span>
        )}

        {/* Type selector */}
        <select
          value={lesson.type}
          onChange={(e) => {
            const newType = e.target.value as Lesson["type"];
            const newContent: LessonContent =
              newType === "video" ? { videoUrl: "", videoNotes: "" } :
              newType === "reading" ? { readingContent: "" } :
              { quizTitle: "Quiz", quizTimeLimit: 10, quizPassScore: 70, quizQuestions: [] };
            onChange({ ...lesson, type: newType, content: newContent });
          }}
          className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-600 outline-none flex-shrink-0"
        >
          {lessonTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Duration */}
        <input
          value={lesson.duration}
          onChange={(e) => onChange({ ...lesson, duration: e.target.value })}
          placeholder="0:00"
          className="w-14 text-xs text-center bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-600 outline-none flex-shrink-0"
        />

        {/* Free toggle */}
        <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={lesson.isFree}
            onChange={(e) => onChange({ ...lesson, isFree: e.target.checked })}
            className="w-3.5 h-3.5 accent-[var(--primary)]"
          />
          Free
        </label>

        {/* Edit content button */}
        <button
          onClick={() => setEditorOpen(!editorOpen)}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 flex-shrink-0 ${
            editorOpen
              ? "bg-[var(--primary)] text-white"
              : "text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10"
          }`}
          title={editorOpen ? "Collapse editor" : "Edit content"}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{editorOpen ? "Close" : "Edit"}</span>
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
          aria-label="Delete lesson"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline Content Editor */}
      {editorOpen && (
        <LessonEditor
          lesson={lesson}
          onChange={onChange}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────



function CreateCoursePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "curriculum" | "pricing" | "settings">("info");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [categories, setCategories] = useState<DB_Category[]>([]);

  const [modules, setModules] = useState<Module[]>([]);
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    subtitle: "",
    description: "",
    category_id: "",
    level: "Beginner",
    language: "English",
    image_url: "",
    status: "draft" as "draft" | "published" | "review",
  });

  const [pricing, setPricing] = useState({
    type: "paid" as "free" | "paid",
    price: "79",
    comparePrice: "149",
  });

  const [settings, setSettings] = useState({
    visibility: "public" as "public" | "private" | "invite",
    certificate: true,
    discussions: true,
    downloadable: false,
    lifetime: true,
  });

  useEffect(() => {
    setMounted(true);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Categories
      const { data: cats } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");
      if (cats) setCategories(cats);

      // 2. If ID exists, fetch course data
      if (courseId) {
        const { data: course, error: cErr } = await supabase
          .from("courses")
          .select("*, modules(*, lessons(*))")
          .eq("id", courseId)
          .single();

        if (course) {
          setCourseInfo({
            title: course.title || "",
            subtitle: course.subtitle || "",
            description: course.description || "",
            category_id: course.category_id || "",
            level: course.level || "Beginner",
            language: course.language || "English",
            image_url: course.image_url || "",
            status: course.status || "draft",
          });
          setPricing({
            type: course.price > 0 ? "paid" : "free",
            price: course.price?.toString() || "0",
            comparePrice: course.compare_price?.toString() || "",
          });
          // Sort modules and lessons by 'order'
          const sortedModules = (course.modules || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((m: any) => ({
              id: m.id,
              title: m.title,
              isOpen: false,
              lessons: (m.lessons || [])
                .sort((a: any, b: any) => a.order - b.order)
                .map((l: any) => ({
                  id: l.id,
                  title: l.title,
                  type: l.type,
                  duration: l.duration || "0:00",
                  isFree: l.is_free,
                  content: {
                    videoUrl: l.video_url || "",
                    readingContent: l.content || "",
                    quizQuestions: l.questions || [],
                  },
                })),
            }));
          setModules(sortedModules);
        }
      } else {
        // New course, use defaults
        setModules([
          { id: "new-m1", title: "Introduction", isOpen: true, lessons: [] }
        ]);
        if (cats && cats.length > 0) {
          setCourseInfo(prev => ({ ...prev, category_id: cats[0].id }));
        }
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (id: string) =>
    setModules((prev) => prev.map((m) => m.id === id ? { ...m, isOpen: !m.isOpen } : m));

  const addModule = () => {
    const id = `m${Date.now()}`;
    setModules((prev) => [...prev, { id, title: "New Module", isOpen: true, lessons: [] }]);
  };

  const deleteModule = (id: string) =>
    setModules((prev) => prev.filter((m) => m.id !== id));

  const addLesson = (moduleId: string) => {
    const lessonId = `l${Date.now()}`;
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                { id: lessonId, title: "New Lesson", type: "video", duration: "0:00", isFree: false, content: { videoUrl: "", videoNotes: "" } },
              ],
            }
          : m
      )
    );
  };

  const deleteLesson = (moduleId: string, lessonId: string) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
      )
    );

  const updateLesson = (moduleId: string, updatedLesson: Lesson) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map((l) => l.id === updatedLesson.id ? updatedLesson : l) }
          : m
      )
    );

  const updateModuleTitle = (id: string, title: string) =>
    setModules((prev) => prev.map((m) => m.id === id ? { ...m, title } : m));

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Get current user for instructor_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 2. Upsert Course
      const totalSeconds = modules.reduce((acc, m) => {
        return acc + m.lessons.reduce((lAcc, l) => {
          const parts = (l.duration || "0:00").split(":").map(Number);
          if (parts.length === 2) return lAcc + parts[0] * 60 + parts[1];
          if (parts.length === 3) return lAcc + parts[0] * 3600 + parts[1] * 60 + parts[2];
          return lAcc;
        }, 0);
      }, 0);

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const formattedDuration = h > 0 ? `${h}h ${m}m` : `${m}m`;

      const coursePayload = {
        title: courseInfo.title,
        description: courseInfo.description,
        instructor_id: user.id,
        category_id: courseInfo.category_id,
        price: pricing.type === "free" ? 0 : parseFloat(pricing.price) || 0,
        image_url: courseInfo.image_url,
        level: courseInfo.level,
        status: courseInfo.status,
        duration: formattedDuration,
        lessons_count: totalLessons,
      };

      let finalCourseId = courseId;

      if (courseId) {
        const { error: cErr } = await supabase.from("courses").update(coursePayload).eq("id", courseId);
        if (cErr) throw cErr;
      } else {
        const { data: newCourse, error: cErr } = await supabase.from("courses").insert(coursePayload).select().single();
        if (cErr) throw cErr;
        finalCourseId = newCourse.id;
      }

      // 3. Sync Modules & Lessons
      // Get existing modules for this course to handle deletions
      const { data: existingModules } = await supabase.from("modules").select("id").eq("course_id", finalCourseId);
      const existingModuleIds = existingModules?.map((m: any) => m.id) || [];
      const currentModuleIds = modules.filter((m: any) => !m.id.startsWith("new-") && !m.id.startsWith("m")).map((m: any) => m.id);
      const modulesToDelete = existingModuleIds.filter((id: any) => !currentModuleIds.includes(id));

      if (modulesToDelete.length > 0) {
        await supabase.from("modules").delete().in("id", modulesToDelete);
      }

      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const module = modules[mIdx];
        const isNewModule = module.id.startsWith("new-") || module.id.startsWith("m");
        
        let moduleId = module.id;
        const modulePayload = {
          course_id: finalCourseId,
          title: module.title,
          order: mIdx,
        };

        if (isNewModule) {
          const { data: newMod, error: mErr } = await supabase.from("modules").insert(modulePayload).select().single();
          if (mErr) throw mErr;
          moduleId = newMod.id;
        } else {
          const { error: mErr } = await supabase.from("modules").update(modulePayload).eq("id", moduleId);
          if (mErr) throw mErr;
        }

        // Sync Lessons for this module
        const { data: existingLessons } = await supabase.from("lessons").select("id").eq("module_id", moduleId);
        const existingLessonIds = existingLessons?.map((l: any) => l.id) || [];
        const currentLessonIds = (module as any).lessons.filter((l: any) => !l.id.startsWith("new-") && !l.id.startsWith("l")).map((l: any) => l.id);
        const lessonsToDelete = existingLessonIds.filter((id: any) => !currentLessonIds.includes(id));

        if (lessonsToDelete.length > 0) {
          await supabase.from("lessons").delete().in("id", lessonsToDelete);
        }

        for (let lIdx = 0; lIdx < module.lessons.length; lIdx++) {
          const lesson = module.lessons[lIdx];
          const isNewLesson = lesson.id.startsWith("new-") || lesson.id.startsWith("l");
          
          const lessonPayload = {
            module_id: moduleId,
            title: lesson.title,
            type: lesson.type,
            duration: lesson.duration,
            order: lIdx,
            is_free: lesson.isFree,
            video_url: lesson.content.videoUrl || null,
            content: lesson.content.readingContent || null,
            questions: lesson.type === "quiz" ? lesson.content.quizQuestions : null,
          };

          if (isNewLesson) {
            const { error: lErr } = await supabase.from("lessons").insert(lessonPayload);
            if (lErr) throw lErr;
          } else {
            const { error: lErr } = await supabase.from("lessons").update(lessonPayload).eq("id", lesson.id);
            if (lErr) throw lErr;
          }
        }
      }

      setSavedSuccess(true);
      if (!courseId) {
        router.push(`/admin/courses/create?id=${finalCourseId}`);
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "info", label: "Basic Info", icon: Info },
    { id: "curriculum", label: "Curriculum", icon: BookOpen, badge: `${modules.length}M · ${totalLessons}L` },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Globe },
  ] as const;

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Course Builder" subtitle="Loading course environment..." />
        <div className="p-12 flex flex-col items-center justify-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500 animate-pulse font-medium">Preparing curriculum tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      <AdminHeader title="Course Builder" subtitle="Create a new course with modules and lessons" />

      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Back + Save */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved!
              </span>
            )}
            <div className="flex items-center gap-2 mr-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
              <select
                value={courseInfo.status}
                onChange={(e) => setCourseInfo({ ...courseInfo, status: e.target.value as any })}
                className="bg-white border border-[var(--border)] rounded-lg text-xs font-bold py-1.5 px-3 outline-none focus:border-[var(--primary)] transition-all cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="review">In Review</option>
              </select>
            </div>
            <button className="btn-outline text-sm py-2 px-4">
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-70"
            >
              {isSaving ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Course"}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden mb-5">
          <div className="flex border-b border-[var(--border)] overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {"badge" in tab && tab.badge && (
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ────── Basic Info Tab ────── */}
          {activeTab === "info" && (
            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="form-label">Course Title *</label>
                  <input type="text" className="form-input" placeholder="e.g. Complete Web Development Bootcamp 2024" value={courseInfo.title} onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Subtitle</label>
                  <input type="text" className="form-input" placeholder="A short tagline for your course" value={courseInfo.subtitle} onChange={(e) => setCourseInfo({ ...courseInfo, subtitle: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Description *</label>
                  <textarea rows={5} className="form-input resize-none" placeholder="Describe what students will learn in this course..." value={courseInfo.description} onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={courseInfo.category_id} onChange={(e) => setCourseInfo({ ...courseInfo, category_id: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Level</label>
                  <select className="form-input" value={courseInfo.level} onChange={(e) => setCourseInfo({ ...courseInfo, level: e.target.value })}>
                    {levels_list.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Language</label>
                  <select className="form-input" value={courseInfo.language} onChange={(e) => setCourseInfo({ ...courseInfo, language: e.target.value })}>
                    {["English", "Spanish", "French", "German", "Mandarin"].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Course Thumbnail URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={courseInfo.image_url}
                  onChange={(e) => setCourseInfo({ ...courseInfo, image_url: e.target.value })}
                />
                <div className="mt-3 border-2 border-dashed border-[var(--border)] rounded-2xl p-6 text-center group">
                  {courseInfo.image_url && (courseInfo.image_url.startsWith('http') || courseInfo.image_url.startsWith('/')) ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                      <Image 
                        src={courseInfo.image_url} 
                        alt="Thumbnail preview" 
                        fill 
                        className="object-cover"
                        unoptimized={courseInfo.image_url.startsWith('http') && !courseInfo.image_url.includes('cloudinary')}
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-[var(--primary)] transition-colors" />
                      <p className="text-sm font-medium text-gray-500">Provide an image URL above</p>
                      <p className="text-xs text-gray-400 mt-1">Or we'll use a placeholder</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ────── Curriculum Tab ────── */}
          {activeTab === "curriculum" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  {modules.length} modules · {totalLessons} lessons
                </p>
                <button onClick={addModule} className="btn-primary text-xs py-2 px-4">
                  <Plus className="w-3.5 h-3.5" /> Add Module
                </button>
              </div>

              {modules.map((module, mIdx) => (
                <div key={module.id} className="border border-[var(--border)] rounded-2xl overflow-hidden">
                  {/* Module Header */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-[var(--border)]">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    <button onClick={() => toggleModule(module.id)} className="flex-shrink-0">
                      {module.isOpen
                        ? <ChevronDown className="w-4 h-4 text-gray-500" />
                        : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    </button>
                    <span className="text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                      Module {mIdx + 1}
                    </span>
                    <input
                      value={module.title}
                      onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                      className="flex-1 bg-transparent font-semibold text-sm text-gray-800 outline-none min-w-0"
                    />
                    <span className="text-xs text-gray-400 flex-shrink-0">{module.lessons.length} lessons</span>
                    <button onClick={() => deleteModule(module.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lessons */}
                  {module.isOpen && (
                    <div className="p-4 space-y-2">
                      {module.lessons.map((lesson) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          onDelete={() => deleteLesson(module.id, lesson.id)}
                          onChange={(updated) => updateLesson(module.id, updated)}
                        />
                      ))}
                      <button
                        onClick={() => addLesson(module.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {modules.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No modules yet. Add your first module to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* ────── Pricing Tab ────── */}
          {activeTab === "pricing" && (
            <div className="p-6 space-y-5">
              <div>
                <label className="form-label">Course Type</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    { value: "free", label: "Free", icon: Globe, desc: "Free to all students" },
                    { value: "paid", label: "Paid", icon: DollarSign, desc: "One-time payment" },
                  ].map((option) => (
                    <button key={option.value} onClick={() => setPricing({ ...pricing, type: option.value as "free" | "paid" })}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${pricing.type === option.value ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-gray-300"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${pricing.type === option.value ? "bg-[var(--primary)] text-white" : "bg-gray-100 text-gray-500"}`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${pricing.type === option.value ? "text-[var(--primary)]" : "text-gray-700"}`}>{option.label}</p>
                        <p className="text-xs text-gray-400">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {pricing.type === "paid" && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Price (XAF) *</label>
                    <div className="relative">
                      <input type="number" className="form-input pr-12" placeholder="50000" value={pricing.price} onChange={(e) => setPricing({ ...pricing, price: e.target.value })} />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs">XAF</span>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Compare-at Price (optional)</label>
                    <div className="relative">
                      <input type="number" className="form-input pr-12" placeholder="75000" value={pricing.comparePrice} onChange={(e) => setPricing({ ...pricing, comparePrice: e.target.value })} />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs">XAF</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Shows a strikethrough original price to highlight discount.</p>
                  </div>
                </div>
              )}
              <div className="p-4 rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/20">
                <p className="text-sm font-semibold text-[var(--primary)]">Revenue Split</p>
                <p className="text-xs text-gray-600 mt-1">Instructor receives 70% · Platform takes 30%</p>
                {pricing.type === "paid" && pricing.price && (
                  <p className="text-xs font-bold text-[var(--primary)] mt-2">
                    Instructor earns: {(parseFloat(pricing.price) * 0.7).toLocaleString()} XAF per enrollment
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ────── Settings Tab ────── */}
          {activeTab === "settings" && (
            <div className="p-6 space-y-5">
              <div>
                <label className="form-label">Course Visibility</label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {[
                    { value: "public", label: "Public", icon: Globe, desc: "Visible to all" },
                    { value: "private", label: "Private", icon: Lock, desc: "Hidden from search" },
                    { value: "invite", label: "Invite Only", icon: Award, desc: "Invite link access" },
                  ].map((option) => (
                    <button key={option.value} onClick={() => setSettings({ ...settings, visibility: option.value as typeof settings.visibility })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${settings.visibility === option.value ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-gray-300"}`}>
                      <option.icon className={`w-5 h-5 ${settings.visibility === option.value ? "text-[var(--primary)]" : "text-gray-400"}`} />
                      <div>
                        <p className={`font-semibold text-xs ${settings.visibility === option.value ? "text-[var(--primary)]" : "text-gray-700"}`}>{option.label}</p>
                        <p className="text-[10px] text-gray-400">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: "certificate" as keyof typeof settings, label: "Issue Certificate on Completion", desc: "Students receive a completion certificate" },
                  { key: "discussions" as keyof typeof settings, label: "Enable Discussions", desc: "Allow Q&A and student discussions" },
                  { key: "downloadable" as keyof typeof settings, label: "Downloadable Resources", desc: "Students can download course materials" },
                  { key: "lifetime" as keyof typeof settings, label: "Lifetime Access", desc: "Students keep access after enrollment" },
                ].map((setting) => (
                  <label key={setting.key} className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-[var(--border)] hover:bg-gray-50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{setting.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{setting.desc}</p>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors cursor-pointer ${settings[setting.key] ? "bg-[var(--primary)]" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[setting.key] ? "left-5" : "left-0.5"}`} />
                      <input type="checkbox" className="sr-only" checked={settings[setting.key] as boolean} onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.checked })} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CreateCoursePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    }>
      <CreateCoursePageInner />
    </Suspense>
  );
}
