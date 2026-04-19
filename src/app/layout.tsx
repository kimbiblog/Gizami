import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gizami – Learn Smarter, Grow Faster",
    template: "%s | Gizami",
  },
  description:
    "Access 1000+ expert-led courses in technology, business, design, and more. Transform your career with Gizami – the #1 rated learning platform.",
  keywords: ["online learning", "LMS", "courses", "education", "e-learning", "certificates"],
  authors: [{ name: "Gizami" }],
  icons: {
    icon: [
      { url: "/favicon-icon.png", type: "image/png" },
    ],
    apple: "/favicon-icon.png",
    shortcut: "/favicon-icon.png",
  },
  openGraph: {
    title: "Gizami – Learn Smarter, Grow Faster",
    description: "Access 1000+ expert-led courses and transform your career.",
    type: "website",
    images: [{ url: "/logo-gizami.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className={poppins.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
