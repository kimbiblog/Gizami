"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Check, Shield, Star, Infinity, Smartphone } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

export default function SubscriptionPage() {
  const router = useRouter();
  const [price, setPrice] = useState<number>(1000); // Default to 1000
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        // Fetch subscription price
        const { data: settings } = await supabase
          .from("settings")
          .select("subscription_price")
          .eq("id", "00000000-0000-0000-0000-000000000000")
          .single();

        if (settings?.subscription_price) {
          setPrice(settings.subscription_price);
        }
      } catch (err) {
        console.error("Error loading subscription data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubscribeClick = () => {
    if (!user) {
      router.push("/login?redirect=/subscription");
      return;
    }
    setShowPaymentModal(true);
  };

  const features = [
    { text: "Unlimited access to all courses", icon: Infinity },
    { text: "High quality video tutorials", icon: Star },
    { text: "Learn on any device", icon: Smartphone },
    { text: "Earn certificates of completion", icon: Shield },
    { text: "Access to community support", icon: Check },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-spin w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-4">
      {showPaymentModal && user && (
        <PaymentModal
          courseId="subscription"
          courseTitle="Gizami Monthly Subscription"
          price={price}
          userId={user.id}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Unlock Unlimited Learning
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get unrestricted access to our entire catalog of premium courses for one low monthly price.
        </p>
      </div>

      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-[var(--border)]">
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Pro Subscription</h2>
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="text-5xl font-extrabold">{price.toLocaleString("fr-CM")}</span>
            <span className="text-xl opacity-80 mb-1">XAF</span>
          </div>
          <p className="opacity-90">Billed monthly. Cancel anytime.</p>
        </div>

        <div className="p-8">
          <ul className="space-y-4 mb-8">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribeClick}
            className="w-full btn-primary text-lg py-4 justify-center shadow-lg hover:shadow-xl transition-all"
          >
            {user ? "Subscribe Now" : "Log in to Subscribe"}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Secure Mobile Money Payment
          </p>
        </div>
      </div>
    </div>
  );
}
