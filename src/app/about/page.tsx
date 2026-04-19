import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Users, BookOpen, Award, Target, Heart, Zap, Globe, ArrowRight } from "lucide-react";



const values = [
  { icon: Target, title: "Mission-Driven", desc: "Every decision is guided by our mission to make quality education accessible to everyone worldwide.", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  { icon: Heart, title: "Student First", desc: "We design every feature with students in mind, ensuring an engaging and effective learning experience.", color: "text-rose-500", bg: "bg-rose-100" },
  { icon: Zap, title: "Innovation", desc: "Constantly evolving our platform with the latest technology to deliver cutting-edge learning tools.", color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
  { icon: Globe, title: "Global Impact", desc: "Building bridges across borders, connecting learners and instructors from 150+ countries.", color: "text-blue-600", bg: "bg-blue-100" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
            <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
            Transforming Lives Through
            <span className="block text-[var(--accent)]">Quality Education</span>
          </h1>
          <p className="text-green-100 text-xl max-w-2xl mx-auto">
            Gizami was founded in 2020 with a simple belief: everyone deserves access to world-class education, regardless of where they live or their financial situation.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="py-12 bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: "500K+", label: "Active Learners", color: "text-[var(--primary)]" },
              { icon: BookOpen, value: "1,000+", label: "Expert Courses", color: "text-[var(--accent)]" },
              { icon: Award, value: "200+", label: "Expert Instructors", color: "text-purple-600" },
              { icon: Globe, value: "150+", label: "Countries Reached", color: "text-blue-600" },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-3xl font-extrabold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-badge">
              <Target className="w-3.5 h-3.5" />
              Our Mission
            </div>
            <h2 className="section-title mb-4">Making Quality Learning Accessible to All</h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              We believe education is the most powerful tool for changing the world. Gizami was built to break down barriers — financial, geographical, and technical — that prevent people from accessing the skills they need to thrive.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              From our humble beginnings in a small office in San Francisco, we&apos;ve grown into a global community of 500,000+ learners, 200+ instructors, and partners across 150 countries.
            </p>
            <Link href="/courses" className="btn-primary">
              Explore Our Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative h-80 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <GraduationCap className="w-24 h-24 text-[var(--primary)]/30 mx-auto" />
                <p className="text-[var(--primary)] font-bold text-xl mt-4">Education for Everyone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-badge mx-auto w-fit">
              <Heart className="w-3.5 h-3.5" />
              What We Believe
            </div>
            <h2 id="values-heading" className="section-title">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card p-6 text-center group">
                <div className={`w-14 h-14 ${v.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <v.icon className={`w-7 h-7 ${v.color}`} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-3xl p-10 text-white text-center">
            <h2 className="text-3xl font-extrabold mb-3">Ready to Join Our Community?</h2>
            <p className="text-green-100 mb-6">Start learning today and become part of the Gizami family.</p>
            <Link href="/signup" className="btn-accent text-base px-8 py-3.5">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
