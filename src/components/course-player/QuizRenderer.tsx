"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award } from "lucide-react";

interface QuizRendererProps {
  questions: any[];
  isLastLesson?: boolean;
  onComplete: (score: number) => void;
}

export default function QuizRenderer({ questions, isLastLesson, onComplete }: QuizRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Safeguard: if questions is empty or invalid, return nothing
  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = (val: any) => {
    if (isSubmitted) return;
    setSelectedOption(val);
  };

  const checkIsCorrect = () => {
    if (currentQuestion.type === "short_answer") {
      return String(selectedOption || "").trim().toLowerCase() === String(currentQuestion.correctAnswer || "").trim().toLowerCase();
    }
    return String(selectedOption) === String(currentQuestion.correctAnswer);
  };

  const handleSubmit = () => {
    if (selectedOption === null || selectedOption === "") return;
    
    if (checkIsCorrect()) {
      setScore(prev => prev + 1);
    }
    
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
      onComplete(score); // Score is already updated from handleSubmit
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[var(--border)]">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
            passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}>
            {passed ? <Award className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
            {passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-gray-500 mb-8">
            You scored <span className="font-bold text-gray-800">{score} out of {questions.length}</span> ({percentage}%)
          </p>

          <div className="space-y-4">
            {passed ? (
              <p className="text-sm text-green-600 font-medium">You've successfully completed this assessment!</p>
            ) : (
              <p className="text-sm text-red-600 font-medium">You need at least 70% to pass this quiz.</p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              {!passed && (
                <button 
                  onClick={handleReset}
                  className="btn-outline py-3 px-8 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              )}
              <button 
                onClick={() => onComplete(score)} 
                className="btn-primary py-3 px-8 text-center"
              >
                {!passed ? "Review Material" : (isLastLesson ? "Get Certificate" : "Continue to Next Lesson")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            Score: {score}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--border)]">
        <h3 className="text-xl font-bold text-gray-800 mb-8 leading-tight">
          {currentQuestion.question}
        </h3>

        {currentQuestion.type === "short_answer" ? (
          <div className="space-y-3">
             <input
                type="text"
                value={selectedOption || ""}
                onChange={(e) => !isSubmitted && handleOptionClick(e.target.value)}
                disabled={isSubmitted}
                placeholder="Type your answer here..."
                className={`w-full p-4 rounded-2xl border-2 font-medium transition-all outline-none ${
                   isSubmitted 
                     ? checkIsCorrect() 
                        ? "border-green-500 bg-green-50/50 text-green-700" 
                        : "border-red-500 bg-red-50 text-red-700"
                     : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                }`}
             />
             {isSubmitted && (
                 <div className="mt-2 text-sm font-medium">
                     {checkIsCorrect() ? (
                         <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Correct!</span>
                     ) : (
                         <span className="text-red-500 flex items-center gap-1"><XCircle className="w-4 h-4"/> Incorrect. Expected: {currentQuestion.correctAnswer}</span>
                     )}
                 </div>
             )}
          </div>
        ) : (
          <div className="space-y-3">
            {(currentQuestion.options || []).map((option: any, index: number) => {
              const isObject = typeof option === 'object' && option !== null;
              const optionId = isObject ? option.id : index;
              const optionText = isObject ? option.text : option;

              let stateClass = "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5";
              let icon = null;

              if (isSubmitted) {
                if (String(optionId) === String(currentQuestion.correctAnswer)) {
                  stateClass = "border-green-500 bg-green-50/50 text-green-700";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                } else if (String(optionId) === String(selectedOption)) {
                  stateClass = "border-red-500 bg-red-50 text-red-700";
                  icon = <XCircle className="w-5 h-5 text-red-500" />;
                } else {
                  stateClass = "border-gray-200 text-gray-500";
                }
              } else if (String(selectedOption) === String(optionId)) {
                stateClass = "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]";
              }

              return (
                <button
                  key={optionId}
                  onClick={() => handleOptionClick(optionId)}
                  disabled={isSubmitted}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 font-medium transition-all text-left ${stateClass}`}
                >
                  <span>{optionText}</span>
                  {icon}
                </button>
              );
            })}
          </div>
        )}

        {isSubmitted && currentQuestion.explanation && (
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Explanation</p>
            <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="mt-10 flex justify-end">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || selectedOption === ""}
              className="btn-primary py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary py-3 px-8 flex items-center gap-2"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "View Results"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

