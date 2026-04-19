// ─────────────────────────────────────────────
// Gizami Admin Mock Data
// ─────────────────────────────────────────────

export interface AdminCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  status: "published" | "draft" | "review";
  enrollments: number;
  revenue: number;
  rating: number;
  lessons: number;
  createdAt: string;
  image: string;
  price: number | "free";
}

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coursesEnrolled: number;
  completionRate: number;
  totalSpent: number;
  joinedAt: string;
  status: "active" | "inactive";
  lastSeen: string;
}

export interface AdminTeacher {
  id: string;
  name: string;
  email: string;
  avatar: string;
  courses: number;
  totalStudents: number;
  rating: number;
  revenue: number;
  status: "active" | "pending" | "suspended";
  joinedAt: string;
}

export interface AdminMessage {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  avatar: string;
  type: "support" | "inquiry" | "report";
}

export interface AnalyticPoint {
  label: string;
  value: number;
}

export const adminCourses: AdminCourse[] = [
  { id: "1", title: "Complete Web Development Bootcamp 2024", instructor: "Amara Nze", category: "Technology", status: "published", enrollments: 45200, revenue: 3570800, rating: 4.9, lessons: 350, createdAt: "Jan 10, 2024", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80", price: 79 },
  { id: "2", title: "UI/UX Design Masterclass", instructor: "Tunde Bakare", category: "Design", status: "published", enrollments: 32100, revenue: 1893900, rating: 4.8, lessons: 220, createdAt: "Feb 5, 2024", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=80", price: 59 },
  { id: "3", title: "Digital Marketing Fundamentals", instructor: "Nia Osei", category: "Marketing", status: "published", enrollments: 18900, revenue: 0, rating: 4.7, lessons: 95, createdAt: "Mar 1, 2024", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80", price: "free" },
  { id: "4", title: "Full-Stack YouTube Content Strategy", instructor: "Dr. Kemi Balogun", category: "Content Creation", status: "published", enrollments: 78000, revenue: 7722000, rating: 4.9, lessons: 410, createdAt: "Dec 20, 2023", image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&q=80", price: 99 },
  { id: "5", title: "Video Editing with Premiere Pro", instructor: "Zola Mkhize", category: "Multimedia", status: "published", enrollments: 12300, revenue: 553500, rating: 4.6, lessons: 130, createdAt: "Apr 1, 2024", image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80", price: 45 },
  { id: "6", title: "Advanced 3D Modeling for Games", instructor: "Tariq Mensah", category: "Design", status: "review", enrollments: 24500, revenue: 2180500, rating: 4.8, lessons: 180, createdAt: "Apr 5, 2024", image: "https://images.unsplash.com/photo-1615592389070-bcc97e05ad01?w=400&q=80", price: 89 },
  { id: "7", title: "Podcasting for Beginners", instructor: "Adanna Okoro", category: "Content Creation", status: "published", enrollments: 55000, revenue: 0, rating: 4.7, lessons: 160, createdAt: "Oct 1, 2023", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80", price: "free" },
  { id: "8", title: "Personal Branding in the AI Age", instructor: "Chukwudi Eze", category: "Marketing", status: "published", enrollments: 28900, revenue: 1993100, rating: 4.9, lessons: 145, createdAt: "Nov 15, 2023", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80", price: 69 },
];

export const adminStudents: AdminStudent[] = [
  { id: "1", name: "Chidi Okafor", email: "chidi@example.com", avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80", coursesEnrolled: 3, completionRate: 68, totalSpent: 247, joinedAt: "Jan 15, 2024", status: "active", lastSeen: "2 hours ago" },
  { id: "2", name: "Aisha Okonkwo", email: "aisha@example.com", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80", coursesEnrolled: 5, completionRate: 91, totalSpent: 415, joinedAt: "Nov 3, 2023", status: "active", lastSeen: "Online" },
  { id: "3", name: "Kwame Asante", email: "kwame@example.com", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80", coursesEnrolled: 2, completionRate: 45, totalSpent: 148, joinedAt: "Feb 20, 2024", status: "active", lastSeen: "Yesterday" },
  { id: "4", name: "Fatima Diop", email: "fatima@example.com", avatar: "https://images.unsplash.com/photo-1531123414708-f47c4ced6bca?w=100&q=80", coursesEnrolled: 7, completionRate: 84, totalSpent: 693, joinedAt: "Sep 12, 2023", status: "active", lastSeen: "3 hours ago" },
  { id: "5", name: "Zainab Bello", email: "zainab@example.com", avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&q=80", coursesEnrolled: 1, completionRate: 22, totalSpent: 0, joinedAt: "Mar 30, 2024", status: "active", lastSeen: "5 days ago" },
  { id: "6", name: "Yemi Ade", email: "yemi@example.com", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80", coursesEnrolled: 4, completionRate: 100, totalSpent: 316, joinedAt: "Aug 8, 2023", status: "inactive", lastSeen: "2 weeks ago" },
  { id: "7", name: "Obinna Eze", email: "obinna@example.com", avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80", coursesEnrolled: 6, completionRate: 73, totalSpent: 525, joinedAt: "Oct 22, 2023", status: "active", lastSeen: "1 hour ago" },
  { id: "8", name: "Adaobi Nwachukwu", email: "adaobi@example.com", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80", coursesEnrolled: 3, completionRate: 57, totalSpent: 228, joinedAt: "Jan 5, 2024", status: "active", lastSeen: "4 hours ago" },
];

export const adminTeachers: AdminTeacher[] = [
  { id: "1", name: "Amara Nze", email: "amara@gizami.com", avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&q=80", courses: 3, totalStudents: 78400, rating: 4.9, revenue: 5240000, status: "active", joinedAt: "Oct 1, 2022" },
  { id: "2", name: "Tunde Bakare", email: "tunde@gizami.com", avatar: "https://images.unsplash.com/photo-1462804993656-fac4ff489837?w=100&q=80", courses: 2, totalStudents: 45600, rating: 4.8, revenue: 2690000, status: "active", joinedAt: "Dec 15, 2022" },
  { id: "3", name: "Dr. Kemi Balogun", email: "kemi@gizami.com", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80", courses: 4, totalStudents: 112000, rating: 4.9, revenue: 9870000, status: "active", joinedAt: "Sep 20, 2022" },
  { id: "4", name: "Nia Osei", email: "nia@gizami.com", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80", courses: 2, totalStudents: 24500, rating: 4.7, revenue: 0, status: "active", joinedAt: "Jan 10, 2023" },
  { id: "5", name: "Tariq Mensah", email: "tariq@gizami.com", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", courses: 1, totalStudents: 0, rating: 0, revenue: 0, status: "pending", joinedAt: "Apr 2, 2024" },
  { id: "6", name: "Chukwudi Eze", email: "chukwudi@gizami.com", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=100&q=80", courses: 2, totalStudents: 38900, rating: 4.8, revenue: 2680000, status: "active", joinedAt: "Nov 5, 2022" },
];

export const adminMessages: AdminMessage[] = [
  { id: "1", from: "Chidi Okafor", email: "chidi@example.com", subject: "Unable to access Module 3 content", preview: "Hi, I'm trying to access the React Hooks module but it keeps showing a loading error...", time: "10 min ago", read: false, avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80", type: "support" },
  { id: "2", from: "Aisha Okonkwo", email: "aisha@example.com", subject: "Certificate not generated after completion", preview: "I completed the Web Dev Bootcamp 2 days ago but haven't received my certificate yet...", time: "1 hour ago", read: false, avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80", type: "support" },
  { id: "3", from: "Kwame Asante", email: "kwame@example.com", subject: "Question about course refund policy", preview: "I accidentally purchased the same course twice. Can I get a refund for one?", time: "3 hours ago", read: true, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80", type: "inquiry" },
  { id: "4", from: "Fatima Diop", email: "fatima@example.com", subject: "Instructor materials are outdated", preview: "The Python version used in the ML course is 3.8 but the latest is 3.12...", time: "Yesterday", read: true, avatar: "https://images.unsplash.com/photo-1531123414708-f47c4ced6bca?w=100&q=80", type: "report" },
  { id: "5", from: "Zainab Bello", email: "zainab@example.com", subject: "Partnership inquiry for corporate training", preview: "We are a company of 500 employees and are interested in bulk course access...", time: "2 days ago", read: true, avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&q=80", type: "inquiry" },
  { id: "6", from: "Obinna Eze", email: "obinna@example.com", subject: "Video playback issues on mobile", preview: "The course videos buffer excessively on my Android phone even on WiFi...", time: "3 days ago", read: true, avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80", type: "report" },
];

export const enrollmentTrend: AnalyticPoint[] = [
  { label: "Oct", value: 3200 },
  { label: "Nov", value: 4100 },
  { label: "Dec", value: 5800 },
  { label: "Jan", value: 4700 },
  { label: "Feb", value: 6200 },
  { label: "Mar", value: 7900 },
  { label: "Apr", value: 9100 },
];

export const revenueTrend: AnalyticPoint[] = [
  { label: "Oct", value: 185000 },
  { label: "Nov", value: 242000 },
  { label: "Dec", value: 380000 },
  { label: "Jan", value: 295000 },
  { label: "Feb", value: 412000 },
  { label: "Mar", value: 538000 },
  { label: "Apr", value: 621000 },
];

export const adminKpis = {
  totalStudents: 218400,
  totalRevenue: 15179800,
  totalCourses: 8,
  activeCourses: 6,
  completionRate: 73,
  avgRating: 4.82,
  newStudentsThisMonth: 9100,
  revenueThisMonth: 621000,
};

export const recentActivity = [
  { id: "1", text: "Amara Nze published a new module in Web Dev Bootcamp", time: "5 min ago", type: "course" },
  { id: "2", text: "Aisha Okonkwo completed ML A-Z and earned a certificate", time: "12 min ago", type: "certificate" },
  { id: "3", text: "New course submitted for review: Business Strategy & Leadership", time: "1 hour ago", type: "review" },
  { id: "4", text: "45 new students enrolled in Financial Planning course", time: "2 hours ago", type: "enrollment" },
  { id: "5", text: "Kwame Asante raised a support ticket", time: "3 hours ago", type: "support" },
  { id: "6", text: "Revenue milestone reached: 10M XAF total platform revenue", time: "Yesterday", type: "milestone" },
];

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;      // emoji icon
  color: string;     // tailwind gradient class
  courseCount: number;
  studentCount: number;
  isActive: boolean;
  createdAt: string;
}

export const adminCategories: AdminCategory[] = [
  { id: "1", name: "Content Creation", slug: "content-creation", description: "Learn to create high-quality content for YouTube, Social Media and Podcasts.", icon: "🎬", color: "from-green-600 to-green-400", courseCount: 15, studentCount: 133000, isActive: true, createdAt: "Jan 1, 2024" },
  { id: "2", name: "Technology", slug: "technology", description: "Software, web development, AI, data science and IT infrastructure.", icon: "💻", color: "from-blue-500 to-blue-400", courseCount: 32, studentCount: 123200, isActive: true, createdAt: "Jan 1, 2023" },
  { id: "3", name: "Design", slug: "design", description: "Graphic design, UI/UX, 3D modeling and creative tools.", icon: "🎨", color: "from-purple-500 to-purple-400", courseCount: 22, studentCount: 48600, isActive: true, createdAt: "Jan 1, 2023" },
  { id: "4", name: "Multimedia", slug: "multimedia", description: "Video editing, motion graphics, audio production and photography.", icon: "🎞️", color: "from-pink-500 to-pink-400", courseCount: 12, studentCount: 24700, isActive: true, createdAt: "Feb 12, 2023" },
  { id: "5", name: "Marketing", slug: "marketing", description: "Digital marketing, personal branding, SEO and growth strategy.", icon: "📢", color: "from-orange-500 to-orange-400", courseCount: 18, studentCount: 36100, isActive: true, createdAt: "Mar 5, 2023" },
];

// ─────────────────────────────────────────────
// Certificate Templates
// ─────────────────────────────────────────────

export interface CertificateTemplate {
  id: string;
  name: string;
  style: "classic" | "modern" | "minimal" | "elegant" | "bold";
  primaryColor: string;
  accentColor: string;
  font: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  issued: number;
  previewBg: string;
  border: string;
}

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: "1",
    name: "Classic Gold",
    style: "classic",
    primaryColor: "#1a4731",
    accentColor: "#d4a017",
    font: "Playfair Display",
    description: "Timeless design with gold accents and decorative borders. Perfect for professional certifications.",
    isDefault: true,
    isActive: true,
    issued: 12400,
    previewBg: "from-[#1a4731] to-[#2d6e4f]",
    border: "border-amber-400",
  },
  {
    id: "2",
    name: "Modern Gradient",
    style: "modern",
    primaryColor: "#1d4ed8",
    accentColor: "#06b6d4",
    font: "Inter",
    description: "Clean modern layout with gradient accents. Ideal for tech and digital courses.",
    isDefault: false,
    isActive: true,
    issued: 8200,
    previewBg: "from-blue-600 to-cyan-500",
    border: "border-blue-400",
  },
  {
    id: "3",
    name: "Minimal White",
    style: "minimal",
    primaryColor: "#111827",
    accentColor: "#6d28d9",
    font: "Outfit",
    description: "Clean and minimalist design that keeps the focus on the achievement.",
    isDefault: false,
    isActive: true,
    issued: 5600,
    previewBg: "from-gray-100 to-white",
    border: "border-purple-400",
  },
  {
    id: "4",
    name: "Elegant Dark",
    style: "elegant",
    primaryColor: "#0f172a",
    accentColor: "#f59e0b",
    font: "Cormorant Garamond",
    description: "Sophisticated dark theme with amber highlights for prestigious programs.",
    isDefault: false,
    isActive: true,
    issued: 3100,
    previewBg: "from-slate-900 to-slate-800",
    border: "border-amber-500",
  },
  {
    id: "5",
    name: "Bold Gizami",
    style: "bold",
    primaryColor: "#14532d",
    accentColor: "#f97316",
    font: "Poppins",
    description: "Branded Gizami certificate with signature green and orange accent colors.",
    isDefault: false,
    isActive: true,
    issued: 19800,
    previewBg: "from-green-900 to-green-800",
    border: "border-orange-400",
  },
];
