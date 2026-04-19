"use client";

import { useState } from "react";
import { X, Phone, Loader2, ShieldCheck } from "lucide-react";

interface PaymentModalProps {
  courseId: string;
  courseTitle: string;
  price: number;
  userId: string;
  onClose: () => void;
}

const GATEWAYS = [
  {
    id: "CM_ORANGE",
    name: "Orange Money",
    color: "#ff6600",
    bg: "#fff3eb",
    logo: "🟠",
    hint: "Ex: 690 000 000",
  },
  {
    id: "CM_MTN",
    name: "MTN MoMo",
    color: "#ffcc00",
    bg: "#fffbe6",
    logo: "🟡",
    hint: "Ex: 670 000 000",
  },
];

export default function PaymentModal({
  courseId,
  courseTitle,
  price,
  userId,
  onClose,
}: PaymentModalProps) {
  const [gateway, setGateway] = useState("CM_ORANGE");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedGw = GATEWAYS.find((g) => g.id === gateway)!;

  const handlePay = async () => {
    setError("");
    const cleanPhone = phone.replace(/\s+/g, "").replace(/^(\+237|237)/, "");
    if (cleanPhone.length < 8) {
      setError("Please enter a valid Cameroon phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          userId,
          phoneNumber: `237${cleanPhone}`,
          gateway,
          amount: price,
          courseTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Payment initiation failed. Please try again.");
        return;
      }

      // Redirect to PayUnit hosted page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        // PayUnit may handle via USSD push — go to callback to poll
        window.location.href = `/payment/callback?courseId=${courseId}&txId=${data.transactionId}`;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Payment checkout"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close payment modal"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-200 mb-1">
            Secure Checkout
          </p>
          <h2 className="text-xl font-bold leading-tight line-clamp-2">{courseTitle}</h2>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-extrabold">
              {price.toLocaleString("fr-CM")}
            </span>
            <span className="text-lg text-green-200 mb-1">XAF</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Gateway selector */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              {GATEWAYS.map((gw) => (
                <button
                  key={gw.id}
                  onClick={() => setGateway(gw.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    gateway === gw.id
                      ? "border-[var(--primary)] shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={
                    gateway === gw.id
                      ? { background: gw.bg, color: gw.color }
                      : {}
                  }
                >
                  <span className="text-2xl">{gw.logo}</span>
                  <span>{gw.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone number */}
          <div>
            <label
              htmlFor="phone-input"
              className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block"
            >
              {selectedGw.name} Number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-semibold border-r border-gray-300 pr-2">
                  +237
                </span>
              </div>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={selectedGw.hint}
                className="w-full pl-24 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--primary)] transition-colors text-sm font-medium"
                maxLength={9}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="btn-primary w-full justify-center text-base py-4 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Pay {price.toLocaleString("fr-CM")} XAF
              </>
            )}
          </button>

          {/* Trust badge */}
          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            Secured by PayUnit · Cameroon Mobile Money
          </p>
        </div>
      </div>
    </div>
  );
}
