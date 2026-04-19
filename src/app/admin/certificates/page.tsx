"use client";

import { useState, useEffect } from "react";

import {
  Award,
  Shield,
  Check,
  Star,
  Eye,
  Settings2,
  Palette,
  Type,
  Download,
  Users,
  CheckCircle,
  X,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { certificateTemplates, CertificateTemplate } from "@/lib/adminMockData";

// ─── Live Certificate Preview component ──────────────────────────────────────

function CertificatePreview({
  template,
  recipientName = "John Doe",
  courseName = "Complete Web Development Bootcamp",
  instructorName = "Sarah Johnson",
  date = "April 13, 2024",
  compact = false,
}: {
  template: CertificateTemplate;
  recipientName?: string;
  courseName?: string;
  instructorName?: string;
  date?: string;
  compact?: boolean;
}) {
  const isLight = template.style === "minimal";
  const [certId, setCertId] = useState("");

  useEffect(() => {
    // Generate cert ID only on client to avoid hydration mismatch
    setCertId(`GZM-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);
  }, []);

  return (

    <div
      className={`relative overflow-hidden rounded-2xl ${compact ? "p-5" : "p-10"} text-center select-none`}
      style={{
        background:
          template.style === "minimal"
            ? "#ffffff"
            : template.style === "modern"
            ? "linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)"
            : template.style === "elegant"
            ? "#0f172a"
            : template.style === "bold"
            ? "linear-gradient(135deg, #14532d 0%, #166534 100%)"
            : "linear-gradient(135deg, #1a4731 0%, #2d6e4f 100%)", // classic
        fontFamily: template.font,
      }}
    >
      {/* Decorative corner ornaments */}
      {template.style === "classic" && !compact && (
        <>
          <div
            className="absolute top-3 left-3 w-16 h-16 rounded-tl-xl opacity-60"
            style={{ border: `2px solid ${template.accentColor}`, borderRight: "none", borderBottom: "none" }}
          />
          <div
            className="absolute top-3 right-3 w-16 h-16 rounded-tr-xl opacity-60"
            style={{ border: `2px solid ${template.accentColor}`, borderLeft: "none", borderBottom: "none" }}
          />
          <div
            className="absolute bottom-3 left-3 w-16 h-16 rounded-bl-xl opacity-60"
            style={{ border: `2px solid ${template.accentColor}`, borderRight: "none", borderTop: "none" }}
          />
          <div
            className="absolute bottom-3 right-3 w-16 h-16 rounded-br-xl opacity-60"
            style={{ border: `2px solid ${template.accentColor}`, borderLeft: "none", borderTop: "none" }}
          />
        </>
      )}

      {/* Subtle pattern overlay */}
      {template.style !== "minimal" && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      {/* Modern glow blob */}
      {template.style === "modern" && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-300/20 rounded-full blur-2xl" />
      )}

      {/* Dark overlay for elegant */}
      {template.style === "elegant" && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Top badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-${compact ? "2" : "4"} font-semibold ${compact ? "text-[10px]" : "text-xs"}`}
          style={{ background: template.accentColor + "30", color: template.accentColor, border: `1px solid ${template.accentColor}50` }}>
          <Award className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
          CERTIFICATE OF COMPLETION
        </div>

        {/* Presented to */}
        <p className={`font-medium ${compact ? "text-[9px]" : "text-xs"} mb-1`}
          style={{ color: isLight ? "#6b7280" : "rgba(255,255,255,0.6)" }}>
          This certifies that
        </p>

        {/* Recipient name */}
        <h1
          className={`font-bold leading-tight ${compact ? "text-lg" : "text-3xl"} mb-2`}
          style={{
            color: template.accentColor,
            fontFamily: template.font,
            textShadow: isLight ? "none" : `0 1px 8px ${template.accentColor}40`,
          }}
        >
          {recipientName}
        </h1>

        {/* Completed text */}
        <p className={`${compact ? "text-[9px]" : "text-xs"} mb-${compact ? "1" : "2"}`}
          style={{ color: isLight ? "#6b7280" : "rgba(255,255,255,0.7)" }}>
          has successfully completed
        </p>

        {/* Course name */}
        <h2
          className={`font-bold ${compact ? "text-xs" : "text-xl"} mb-${compact ? "2" : "6"}`}
          style={{ color: isLight ? "#111827" : "white" }}
        >
          {courseName}
        </h2>

        {/* Divider */}
        {!compact && (
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="h-px flex-1 max-w-20" style={{ background: template.accentColor + "50" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: template.accentColor }} />
            <div className="h-px flex-1 max-w-20" style={{ background: template.accentColor + "50" }} />
          </div>
        )}

        {/* Footer: instructor + date */}
        {!compact ? (
          <div className="flex items-end justify-between mt-4 px-4">
            <div className="text-left">
              <div className="w-20 h-px mb-1" style={{ background: template.accentColor + "80" }} />
              <p className="text-xs font-semibold" style={{ color: isLight ? "#111827" : "white" }}>{instructorName}</p>
              <p className="text-[10px]" style={{ color: isLight ? "#9ca3af" : "rgba(255,255,255,0.5)" }}>Instructor</p>
            </div>
            <div className="text-center -mb-1">
              <div
                className="flex items-center justify-center mx-auto mb-1.5 px-3 py-1.5 rounded-xl shadow-md"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(4px)",
                  border: `1px solid ${template.accentColor}30`,
                  boxShadow: `0 2px 12px ${template.accentColor}30`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-gizami.png"
                  alt="Gizami Logo"
                  className="w-auto h-6 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-[9px] font-bold" style={{ color: isLight ? "#6b7280" : "rgba(255,255,255,0.6)" }}>Certified by Gizami</p>
            </div>
            <div className="text-right">
              <div className="w-20 h-px mb-1 ml-auto" style={{ background: template.accentColor + "80" }} />
              <p className="text-xs font-semibold" style={{ color: isLight ? "#111827" : "white" }}>{date}</p>
              <p className="text-[10px]" style={{ color: isLight ? "#9ca3af" : "rgba(255,255,255,0.5)" }}>Date Issued</p>
            </div>
          </div>
        ) : (
          <p className="text-[9px]" style={{ color: isLight ? "#9ca3af" : "rgba(255,255,255,0.4)" }}>{date}</p>
        )}

        {/* Cert ID */}
        {!compact && (
          <p
            className="text-[9px] mt-4 font-mono opacity-40"
            style={{ color: isLight ? "#111827" : "white" }}
          >
            CERT-ID: {certId || "GZM-XXXXXXXX"}
          </p>
        )}

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>(certificateTemplates);
  const [selected, setSelected] = useState<string>(templates.find((t) => t.isDefault)?.id || "1");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingAccent, setEditingAccent] = useState<string | null>(null);

  const [customization, setCustomization] = useState({
    recipientName: "John Doe",
    courseName: "Complete Web Development Bootcamp",
    instructorName: "Sarah Johnson",
    date: "April 13, 2024",
    platformName: "Gizami",
    showCertId: true,
    showInstructorSig: true,
  });

  const selectedTemplate = templates.find((t) => t.id === selected)!;

  const setDefault = (id: string) => {
    setTemplates((prev) => prev.map((t) => ({ ...t, isDefault: t.id === id })));
    setSelected(id);
  };

  const toggleTemplateActive = (id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  };

  const totalIssued = templates.reduce((a, t) => a + t.issued, 0);

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Certificate Templates"
        subtitle="Design and manage pre-built completion certificates"
      />

      <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-5">
        {/* Admin-only notice */}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium">
            <span className="font-bold">Admin-only feature.</span> Administrators control which certificate templates are available and which is used as the platform default. Teachers cannot modify these templates.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Templates", value: templates.length, icon: Award, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
            { label: "Active Templates", value: templates.filter((t) => t.isActive).length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
            { label: "Certs Issued", value: totalIssued.toLocaleString(), icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid xl:grid-cols-3 gap-5">
          {/* Left: Template chooser */}
          <div className="xl:col-span-1 space-y-3">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--primary)]" />
              Choose Template
            </h2>

            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelected(tmpl.id)}
                className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-md ${
                  selected === tmpl.id ? "border-[var(--primary)] shadow-md" : "border-[var(--border)]"
                } ${!tmpl.isActive ? "opacity-50" : ""}`}
              >
                {/* Mini certificate preview */}
                <CertificatePreview template={tmpl} compact />

                {/* Overlay info */}
                <div className="bg-white px-3 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{tmpl.name}</p>
                    <p className="text-[10px] text-gray-400">{tmpl.issued.toLocaleString()} issued · {tmpl.font}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {tmpl.isDefault && (
                      <span className="text-[9px] font-bold bg-[var(--primary)] text-white px-1.5 py-0.5 rounded-full">
                        DEFAULT
                      </span>
                    )}
                    {selected === tmpl.id && (
                      <div className="w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Full preview + controls */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--primary)]" />
                Live Preview — {selectedTemplate.name}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Screen
                </button>
                <button className="btn-outline text-xs py-2 px-4">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  onClick={() => setDefault(selectedTemplate.id)}
                  disabled={selectedTemplate.isDefault}
                  className="btn-primary text-xs py-2 px-4 disabled:opacity-60"
                >
                  {selectedTemplate.isDefault ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> Default</>
                  ) : (
                    <><Star className="w-3.5 h-3.5" /> Set Default</>
                  )}
                </button>
              </div>
            </div>

            {/* Certificate preview */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-xl">
              <CertificatePreview
                template={selectedTemplate}
                recipientName={customization.recipientName}
                courseName={customization.courseName}
                instructorName={customization.instructorName}
                date={customization.date}
              />
            </div>

            {/* Customization panel */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-gray-500" />
                Customize Preview
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Recipient Name</label>
                  <input
                    className="form-input"
                    value={customization.recipientName}
                    onChange={(e) => setCustomization({ ...customization, recipientName: e.target.value })}
                    placeholder="Student name"
                  />
                </div>
                <div>
                  <label className="form-label">Course Name</label>
                  <input
                    className="form-input"
                    value={customization.courseName}
                    onChange={(e) => setCustomization({ ...customization, courseName: e.target.value })}
                    placeholder="Course name"
                  />
                </div>
                <div>
                  <label className="form-label">Instructor Name</label>
                  <input
                    className="form-input"
                    value={customization.instructorName}
                    onChange={(e) => setCustomization({ ...customization, instructorName: e.target.value })}
                    placeholder="Instructor"
                  />
                </div>
                <div>
                  <label className="form-label">Issue Date</label>
                  <input
                    className="form-input"
                    value={customization.date}
                    onChange={(e) => setCustomization({ ...customization, date: e.target.value })}
                    placeholder="e.g. April 13, 2024"
                  />
                </div>
              </div>

              {/* Template info */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-[var(--border)] flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: selectedTemplate.accentColor }}
                >
                  <Type className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{selectedTemplate.font}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedTemplate.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200" style={{ background: selectedTemplate.primaryColor }} title="Primary color" />
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200" style={{ background: selectedTemplate.accentColor }} title="Accent color" />
                </div>
              </div>

              {/* Toggle / status bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTemplateActive(selectedTemplate.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      selectedTemplate.isActive ? "bg-[var(--primary)]" : "bg-gray-200"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      selectedTemplate.isActive ? "left-5" : "left-0.5"
                    }`} />
                  </button>
                  <span className="text-xs text-gray-600 font-medium">
                    Template {selectedTemplate.isActive ? "enabled" : "disabled"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {selectedTemplate.issued.toLocaleString()} certificates issued with this template
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Full-screen preview modal ─── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <CertificatePreview
                template={selectedTemplate}
                recipientName={customization.recipientName}
                courseName={customization.courseName}
                instructorName={customization.instructorName}
                date={customization.date}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              {selectedTemplate.name} template · Click outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
