"use client";

interface ReadingContentProps {
  content: string;
}

export default function ReadingContent({ content }: ReadingContentProps) {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div 
        className="prose-container bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-[var(--border)]"
      >
        <style jsx global>{`
          .prose-container h3 {
            font-size: 1.875rem;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 1.5rem;
            line-height: 1.2;
          }
          .prose-container h4 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #2d3748;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .prose-container p {
            color: #4a5568;
            line-height: 1.8;
            margin-bottom: 1.25rem;
            font-size: 1.125rem;
          }
          .prose-container ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1.25rem;
            color: #4a5568;
          }
          .prose-container li {
            margin-bottom: 0.5rem;
          }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
