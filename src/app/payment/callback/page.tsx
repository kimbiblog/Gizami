"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");
  const txId = searchParams.get("txId");

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Confirming your payment…");

  useEffect(() => {
    const confirm = async () => {
      if (!txId || !courseId) {
        setStatus("failed");
        setMessage("Invalid payment reference.");
        return;
      }

      // Poll the DB for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 10;

      const poll = async () => {
        attempts++;
        const { data } = await supabase
          .from("payments")
          .select("status, user_id")
          .eq("transaction_id", txId)
          .maybeSingle();

        if (data?.status === "paid") {
          // Ensure enrollment exists (handle race: webhook may not have fired yet)
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: existing } = await supabase
              .from("enrollments")
              .select("user_id")
              .eq("user_id", user.id)
              .eq("course_id", courseId)
              .maybeSingle();

            if (!existing) {
              await supabase.from("enrollments").insert({
                user_id: user.id,
                course_id: courseId,
                progress: 0,
                status: "active",
              });
            }
          }

          setStatus("success");
          setMessage("Payment confirmed! You are now enrolled.");
          setTimeout(() => router.push(`/courses/${courseId}/learn`), 2500);
          return;
        }

        if (data?.status === "failed") {
          setStatus("failed");
          setMessage("Payment was not successful. Please try again.");
          return;
        }

        // Still pending — try again
        if (attempts < maxAttempts) {
          setMessage(`Confirming payment… (${attempts}/${maxAttempts})`);
          setTimeout(poll, 3000);
        } else {
          // Timed out — manual check fallback
          setStatus("failed");
          setMessage(
            "We couldn't confirm your payment automatically. If your account was charged, please contact support."
          );
        }
      };

      poll();
    };

    confirm();
  }, [txId, courseId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="bg-white rounded-3xl shadow-xl border border-[var(--border)] p-10 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h1>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful! 🎉</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <p className="text-xs text-gray-400 animate-pulse">Redirecting to your course…</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {courseId && (
                <Link href={`/courses/${courseId}`} className="btn-primary">
                  Try Again
                </Link>
              )}
              <Link href="/dashboard" className="btn-outline">
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
