"use client";
import { useState, useEffect } from "react";
import {
  Globe,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Palette,
  Save,
  Check,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${checked ? "bg-[var(--primary)]" : "bg-gray-200"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    siteName: "Gizami",
    tagline: "Learn Smarter. Grow Faster.",
    supportEmail: "support@gizami.com",
    currency: "XAF",
    language: "English",
    timezone: "UTC",
  });

  const [notifications, setNotifications] = useState({
    newEnrollment: true,
    courseCompleted: true,
    newReview: true,
    supportTicket: true,
    weeklyReport: false,
    marketingEmails: false,
  });

  const [payment, setPayment] = useState({
    provider: "stripe",
    instructorShare: "70",
    vatEnabled: false,
    refundDays: "30",
  });

  const [security, setSecurity] = useState({
    registrationEnabled: true,
    loginEnabled: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("id", "00000000-0000-0000-0000-000000000000")
          .single();

        if (data) {
          setSecurity({
            registrationEnabled: data.registration_enabled,
            loginEnabled: data.login_enabled,
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaved(false);
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          registration_enabled: security.registrationEnabled,
          login_enabled: security.loginEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. Please try again.");
    }
  };

  const sections = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
    { id: "email", label: "Email", icon: Mail },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader title="Settings" subtitle="Manage platform configuration and preferences" />

      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[var(--border)] p-2 sticky top-24">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-left transition-all ${
                    activeSection === s.id
                      ? "bg-[var(--primary)] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-5">
            {activeSection === "general" && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
                <div>
                  <h2 className="font-bold text-gray-800 mb-1">General Settings</h2>
                  <p className="text-sm text-gray-500">Basic platform configuration</p>
                </div>
                <hr className="border-[var(--border)]" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Platform Name</label>
                    <input className="form-input" value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Tagline</label>
                    <input className="form-input" value={general.tagline} onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Support Email</label>
                    <input type="email" className="form-input" value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Currency</label>
                    <select className="form-input" value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.target.value })}>
                      {["XAF", "USD", "EUR", "NGN", "ZAR"].map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Default Language</label>
                    <select className="form-input" value={general.language} onChange={(e) => setGeneral({ ...general, language: e.target.value })}>
                      {["English", "French", "Spanish"].map((l: string) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Timezone</label>
                    <select className="form-input" value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}>
                      {["UTC", "UTC-5 (EST)", "UTC+1 (WAT)", "UTC+3 (EAT)"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
                <div>
                  <h2 className="font-bold text-gray-800 mb-1">Notification Preferences</h2>
                  <p className="text-sm text-gray-500">Control when and how you receive notifications</p>
                </div>
                <hr className="border-[var(--border)]" />
                <div className="space-y-3">
                  {[
                    { key: "newEnrollment" as keyof typeof notifications, label: "New Enrollment", desc: "When a student enrolls in a course" },
                    { key: "courseCompleted" as keyof typeof notifications, label: "Course Completed", desc: "When a student completes a course" },
                    { key: "newReview" as keyof typeof notifications, label: "New Review", desc: "When a student leaves a review" },
                    { key: "supportTicket" as keyof typeof notifications, label: "Support Ticket", desc: "When a new support request is submitted" },
                    { key: "weeklyReport" as keyof typeof notifications, label: "Weekly Report", desc: "Weekly digest of platform performance" },
                    { key: "marketingEmails" as keyof typeof notifications, label: "Marketing Emails", desc: "Promotions and feature announcements" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle
                        checked={notifications[item.key] as boolean}
                        onChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "payment" && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
                <div>
                  <h2 className="font-bold text-gray-800 mb-1">Payment Settings</h2>
                  <p className="text-sm text-gray-500">Configure payment gateway and revenue splits</p>
                </div>
                <hr className="border-[var(--border)]" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Payment Provider</label>
                    <select className="form-input" value={payment.provider} onChange={(e) => setPayment({ ...payment, provider: e.target.value })}>
                      <option value="payunit">PayUnit (Cameroon)</option>
                      <option value="tranzak">Tranzak</option>
                      <option value="stripe">Stripe</option>
                      <option value="paystack">Paystack</option>
                      <option value="flutterwave">Flutterwave</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Instructor Revenue Share (%)</label>
                    <input type="number" max="100" min="0" className="form-input" value={payment.instructorShare} onChange={(e) => setPayment({ ...payment, instructorShare: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Refund Window (days)</label>
                    <input type="number" className="form-input" value={payment.refundDays} onChange={(e) => setPayment({ ...payment, refundDays: e.target.value })} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)]">
                    <div>
                      <p className="font-medium text-sm text-gray-800">VAT / Tax Collection</p>
                      <p className="text-xs text-gray-400">Automatically collect VAT on purchases</p>
                    </div>
                    <Toggle checked={payment.vatEnabled} onChange={(v) => setPayment({ ...payment, vatEnabled: v })} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/20">
                  <p className="text-sm font-semibold text-[var(--primary)]">Revenue Split Preview</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Platform: {100 - parseInt(payment.instructorShare)}% · Instructor: {payment.instructorShare}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    On a 50,000 XAF course: You keep {(50000 * (100 - parseInt(payment.instructorShare)) / 100).toLocaleString()} XAF · Instructor gets {(50000 * parseInt(payment.instructorShare) / 100).toLocaleString()} XAF
                  </p>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
                <div>
                  <h2 className="font-bold text-gray-800 mb-1">Security & Access</h2>
                  <p className="text-sm text-gray-500">Manage platform-wide access controls</p>
                </div>
                <hr className="border-[var(--border)]" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-800">User Registration</p>
                      <p className="text-xs text-gray-400 mt-0.5">Allow new users to create accounts</p>
                    </div>
                    <Toggle
                      checked={security.registrationEnabled}
                      onChange={(v) => setSecurity({ ...security, registrationEnabled: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-800">User Login</p>
                      <p className="text-xs text-gray-400 mt-0.5">Allow users to log into their accounts</p>
                    </div>
                    <Toggle
                      checked={security.loginEnabled}
                      onChange={(v) => setSecurity({ ...security, loginEnabled: v })}
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <strong>Note:</strong> Disabling login will prevent students and teachers from accessing their dashboards. Administrators will still be able to log in to restore access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(activeSection === "email" || activeSection === "appearance") && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {activeSection === "email" && <Mail className="w-7 h-7 text-gray-400" />}
                    {activeSection === "appearance" && <Palette className="w-7 h-7 text-gray-400" />}
                  </div>
                  <p className="font-semibold text-gray-600 capitalize">{activeSection} Settings</p>
                  <p className="text-sm text-gray-400 mt-1">Coming soon in the next update</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-6">
                {saved ? (
                  <><Check className="w-4 h-4" /> Saved!</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
