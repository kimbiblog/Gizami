"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";

interface CertificateGeneratorProps {
  studentName: string;
  courseTitle: string;
  date: string;
  instructorName: string;
}

// A4 landscape at 96dpi
const CERT_WIDTH = 1122;
const CERT_HEIGHT = 794;

export default function CertificateGenerator({
  studentName,
  courseTitle,
  date,
  instructorName,
}: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);

    try {
      const imgData = await toPng(certificateRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        width: CERT_WIDTH,
        height: CERT_HEIGHT,
      });

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();   // 297mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Gizami_Certificate_${courseTitle.replace(/\s+/g, "_")}.pdf`);
    } catch (error: any) {
      console.error("Certificate error:", error);
      alert("Download failed: " + (error.message || String(error)));
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Inline styles only — avoids Tailwind CSS parse errors in html-to-image ── */
  const PRIMARY = "#1a6b3c";
  const PRIMARY_LIGHT = "#2d9660";
  const AMBER = "#f59e0b";

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: PRIMARY,
          background: "none",
          border: "none",
          cursor: isGenerating ? "not-allowed" : "pointer",
          opacity: isGenerating ? 0.5 : 1,
        }}
      >
        <Download style={{ width: 14, height: 14 }} />
        {isGenerating ? "Generating…" : "Download"}
      </button>

      {/* ── Hidden certificate template — rendered off-screen ── */}
      <div
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          ref={certificateRef}
          style={{
            width: CERT_WIDTH,
            height: CERT_HEIGHT,
            background: "#ffffff",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            fontFamily: "'Poppins', Arial, sans-serif",
          }}
        >
          {/* Outer decorative border */}
          <div
            style={{
              position: "absolute",
              inset: 16,
              border: `12px solid ${PRIMARY}`,
              opacity: 0.08,
              borderRadius: 4,
            }}
          />
          {/* Inner thin border */}
          <div
            style={{
              position: "absolute",
              inset: 32,
              border: `2px solid ${PRIMARY}`,
              borderRadius: 4,
            }}
          />

          {/* Background corner blobs */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 320,
              height: 320,
              background: `${PRIMARY}0d`,
              borderBottomLeftRadius: "100%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 320,
              height: 320,
              background: `${PRIMARY}0d`,
              borderTopRightRadius: "100%",
            }}
          />

          {/* Content wrapper */}
          <div style={{ padding: "56px 80px 0", textAlign: "center" }}>
            {/* Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-gizami.png"
              alt="Gizami"
              style={{ height: 52, marginBottom: 24, objectFit: "contain" }}
            />

            {/* Title */}
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#1f2937",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Certificate of Completion
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 28,
              }}
            >
              This is to certify that
            </div>

            {/* Student name */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: PRIMARY,
                fontFamily: "Georgia, serif",
                marginBottom: 8,
              }}
            >
              {studentName}
            </div>
            <div
              style={{
                width: 480,
                height: 2,
                background: "#e5e7eb",
                margin: "0 auto 28px",
              }}
            />

            {/* Course */}
            <div
              style={{ fontSize: 17, color: "#4b5563", lineHeight: 1.5, marginBottom: 12 }}
            >
              has successfully completed the course requirements and is hereby awarded this
              certificate for
            </div>
            <div
              style={{ fontSize: 28, fontWeight: 700, color: "#1f2937", lineHeight: 1.3 }}
            >
              {courseTitle}
            </div>
          </div>

          {/* Bottom row: date | seal | instructor */}
          <div
            style={{
              position: "absolute",
              bottom: 60,
              left: 90,
              right: 90,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            {/* Date */}
            <div
              style={{
                width: 220,
                textAlign: "center",
                borderTop: "2px solid #d1d5db",
                paddingTop: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: "#1f2937", fontSize: 15 }}>{date}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>
                Date Achieved
              </div>
            </div>

            {/* Seal */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: `4px solid ${AMBER}`,
                background: "#fffbeb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                position: "relative",
                bottom: 16,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: "50%",
                  border: `1px dashed ${AMBER}`,
                }}
              />
              <div style={{ fontWeight: 700, fontSize: 13, color: "#d97706", letterSpacing: "0.1em" }}>
                GIZAMI
              </div>
              <div style={{ fontSize: 10, color: "#f59e0b", fontStyle: "italic" }}>Certified</div>
            </div>

            {/* Instructor */}
            <div
              style={{
                width: 220,
                textAlign: "center",
                borderTop: "2px solid #d1d5db",
                paddingTop: 12,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 48,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: "'Brush Script MT', cursive",
                  fontSize: 34,
                  color: PRIMARY_LIGHT,
                  opacity: 0.5,
                }}
              >
                Gizami Team
              </div>
              <div style={{ fontWeight: 700, color: "#1f2937", fontSize: 15 }}>{instructorName}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>
                Course Instructor
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
