"use client";

import { X, AlertCircle } from "lucide-react";
import Link from "next/link";

interface AuthStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "registration" | "login";
}

export default function AuthStatusModal({ isOpen, onClose, type }: AuthStatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Service Unavailable
          </h3>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Sorry, you can&apos;t {type} at this time. Our team is currently performing maintenance or updates. Please check back soon!
          </p>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full btn-primary py-3.5 justify-center text-base"
            >
              Got it, thanks
            </button>
            <Link
              href="/"
              className="block w-full py-3.5 text-sm font-semibold text-gray-500 hover:text-[var(--primary)] transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </div>

        {/* Decorative bottom bar */}
        <div className="h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary-light)]" />
      </div>
    </div>
  );
}
