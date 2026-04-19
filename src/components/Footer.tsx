"use client";

import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
} from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
  ],
  Courses: [
    { label: "Technology", href: "/courses" },
    { label: "Business", href: "/courses" },
    { label: "Design", href: "/courses" },
    { label: "Marketing", href: "/courses" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  {
    href: "#",
    label: "Facebook",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    href: "#",
    label: "Twitter / X",
    path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  },
  {
    href: "#",
    label: "Instagram",
    path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M7.5 4.5h9A3 3 0 0 1 19.5 7.5v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z",
  },
  {
    href: "#",
    label: "YouTube",
    path: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  },
  {
    href: "#",
    label: "LinkedIn",
    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-5 block w-fit bg-white/90 p-1.5 rounded-xl border border-white/10" aria-label="Gizami">
              <Image 
                src="/logo-gizami.png" 
                alt="Gizami" 
                width={120} 
                height={40} 
                className="h-10 w-auto object-contain" 
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Empowering learners worldwide with expert-led courses. Transform your career and unlock your full potential with Gizami.
            </p>
            <div className="space-y-3 text-sm">
              <a href="mailto:gizamiapp@gmail.com" className="flex items-center gap-3 text-gray-400 hover:text-[var(--accent)] transition-colors">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                gizamiapp@gmail.com
              </a>
              <a href="tel:+237671283217" className="flex items-center gap-3 text-gray-400 hover:text-[var(--accent)] transition-colors">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                +237671283217
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                Bonaberi, Douala.
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-600 text-white uppercase tracking-wider mb-5 font-semibold">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[var(--accent)] transition-colors flex items-center gap-1 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        {/* Social + Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 mt-10 border-t border-white/10 gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Gizami. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-[var(--primary)] hover:text-white transition-all hover:scale-110"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
