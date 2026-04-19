export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number | "free";
  rating: number;
  reviews: number;
  students: number;
  image: string;
  badge?: string;
  duration: string;
  lessons: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  tags: string[];
  curriculum?: Module[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  completed?: boolean;
  free?: boolean;
  videoUrl?: string;
  content?: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  course: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
  bgColor: string;
}

export interface Instructor {
  name: string;
  title: string;
  avatar: string;
  rating: number;
  students: number;
  courses: number;
  bio: string;
}

export const courses: Course[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp 2024",
    instructor: "Amara Nze",
    category: "Technology",
    price: 79,
    rating: 4.9,
    reviews: 12430,
    students: 45200,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    badge: "Bestseller",
    duration: "60h 30m",
    lessons: 350,
    level: "Beginner",
    description: "Master HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and become a full-stack developer.",
    tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
  },
  {
    id: "2",
    title: "UI/UX Design Masterclass",
    instructor: "Tunde Bakare",
    category: "Design",
    price: 59,
    rating: 4.8,
    reviews: 8921,
    students: 32100,
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&q=80",
    badge: "Hot",
    duration: "42h 15m",
    lessons: 220,
    level: "Intermediate",
    description: "Learn design principles, Figma, user research and create stunning interfaces that users love.",
    tags: ["Figma", "Design Systems", "Prototyping", "User Research"],
  },
  {
    id: "3",
    title: "Digital Marketing Fundamentals",
    instructor: "Nia Osei",
    category: "Marketing",
    price: "free",
    rating: 4.7,
    reviews: 5632,
    students: 18900,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    badge: "Free",
    duration: "18h 45m",
    lessons: 95,
    level: "Beginner",
    description: "Master SEO, content marketing, social media strategy and grow any business online.",
    tags: ["SEO", "Content Marketing", "Analytics", "Social Media"],
  },
  {
    id: "4",
    title: "Full-Stack YouTube Content Strategy",
    instructor: "Dr. Kemi Balogun",
    category: "Content Creation",
    price: 99,
    rating: 4.9,
    reviews: 21000,
    students: 78000,
    image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=600&q=80",
    badge: "Top Rated",
    duration: "80h 00m",
    lessons: 410,
    level: "Intermediate",
    description: "Learn how to build a successful YouTube channel from scratch. Gear, editing, SEO, and monetization.",
    tags: ["YouTube", "Video Editing", "Social Media", "Branding"],
  },
  {
    id: "5",
    title: "Video Editing with Premiere Pro",
    instructor: "Zola Mkhize",
    category: "Multimedia",
    price: 45,
    rating: 4.6,
    reviews: 3410,
    students: 12300,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80",
    duration: "25h 00m",
    lessons: 130,
    level: "Beginner",
    description: "Master video editing from basics to advanced. Learn color grading, transitions, and audio mixing.",
    tags: ["Premiere Pro", "Video Editing", "Motion Graphics", "Color Grading"],
  },
  {
    id: "6",
    title: "Advanced 3D Modeling for Games",
    instructor: "Tariq Mensah",
    category: "Design",
    price: 89,
    rating: 4.8,
    reviews: 6700,
    students: 24500,
    image: "https://images.unsplash.com/photo-1615592389070-bcc97e05ad01?w=600&q=80",
    badge: "New",
    duration: "35h 20m",
    lessons: 180,
    level: "Advanced",
    description: "Develop high-end 3D assets for games using Blender and Substance Painter.",
    tags: ["Blender", "3D Printing", "Game Dev", "Texturing"],
  },
  {
    id: "7",
    title: "Podcasting for Beginners",
    instructor: "Adanna Okoro",
    category: "Content Creation",
    price: "free",
    rating: 4.7,
    reviews: 9800,
    students: 55000,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80",
    badge: "Free",
    duration: "30h 00m",
    lessons: 160,
    level: "Beginner",
    description: "Everything you need to start, grow and monetize your podcast from your bedroom.",
    tags: ["Podcasting", "Audio Engineering", "Storytelling", "Monetization"],
  },
  {
    id: "8",
    title: "Personal Branding in the AI Age",
    instructor: "Chukwudi Eze",
    category: "Marketing",
    price: 69,
    rating: 4.9,
    reviews: 7200,
    students: 28900,
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80",
    badge: "Trending",
    duration: "28h 30m",
    lessons: 145,
    level: "Beginner",
    description: "Leverage AI tools to build a powerful personal brand and land your dream opportunities.",
    tags: ["Branding", "AI", "LinkedIn", "Networking"],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Aisha Okonkwo",
    role: "Frontend Developer at TechCorp",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
    rating: 5,
    text: "Gizami completely transformed my career. Within 6 months of completing the Web Development Bootcamp, I landed my dream job. The quality of instruction is absolutely world-class!",
    course: "Complete Web Development Bootcamp 2024",
  },
  {
    id: "2",
    name: "Kwame Mensah",
    role: "UX Designer at CreativeStudio",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    text: "The UI/UX design course was incredibly detailed and practical. I went from knowing nothing about design to building a full portfolio that got me multiple job offers. 10/10 recommend!",
    course: "UI/UX Design Masterclass",
  },
  {
    id: "3",
    name: "Fatima Diop",
    role: "Data Scientist at Analytics Co.",
    avatar: "https://images.unsplash.com/photo-1531123414708-f47c4ced6bca?w=100&q=80",
    rating: 5,
    text: "The Content Strategy course is the most comprehensive I've found anywhere. Dr. Balogun explains complex concepts so clearly. My salary increased by 40% after completing this!",
    course: "Full-Stack YouTube Content Strategy",
  },
  {
    id: "4",
    name: "Chidi Okafor",
    role: "Digital Marketing Manager",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80",
    rating: 4,
    text: "Started learning digital marketing with zero experience. Now I'm running campaigns for top companies. Gizami gave me the foundation and confidence I needed.",
    course: "Digital Marketing Fundamentals",
  },
  {
    id: "5",
    name: "Zainab Bello",
    role: "Creative Director at StartupXYZ",
    avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&q=80",
    rating: 5,
    text: "The Podcasting course opened my eyes to strategies I never knew existed. Our engagement has grown 65% since completing the course. Absolutely worth every penny!",
    course: "Podcasting for Beginners",
  },
];

export const categories: Category[] = [
  { id: "1", name: "Content Creation", icon: "🎬", count: 156, color: "#1a6b3c", bgColor: "#e8f5ee" },
  { id: "2", name: "Technology", icon: "💻", count: 245, color: "#0ea5e9", bgColor: "#e0f2fe" },
  { id: "3", name: "Design", icon: "🎨", count: 189, color: "#8b5cf6", bgColor: "#f3f0ff" },
  { id: "4", name: "Multimedia", icon: "🎞️", count: 112, color: "#ec4899", bgColor: "#fce7f3" },
  { id: "5", name: "Marketing", icon: "📢", count: 98, color: "#f97316", bgColor: "#fff4ed" },
];

export const heroSlides = [
  {
    id: "1",
    headline: "Learn Smarter.",
    accent: "Grow Faster.",
    subtext: "Access 1000+ expert-led courses in technology, business, design and more. Transform your career with Gizami.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "Browse Courses",
    badge: "🎓 Trusted by 500K+ learners worldwide",
    stat1: { value: "1000+", label: "Courses" },
    stat2: { value: "500K+", label: "Students" },
    stat3: { value: "98%", label: "Success Rate" },
  },
  {
    id: "2",
    headline: "Expert Instructors.",
    accent: "Real Results.",
    subtext: "Learn from industry professionals and build skills that matter. Get certified and advance your career today.",
    ctaPrimary: "Explore Courses",
    ctaSecondary: "Meet Instructors",
    badge: "🏆 #1 Rated LMS Platform 2024",
    stat1: { value: "200+", label: "Instructors" },
    stat2: { value: "50K+", label: "Reviews" },
    stat3: { value: "4.9★", label: "Avg. Rating" },
  },
  {
    id: "3",
    headline: "Certificates That",
    accent: "Open Doors.",
    subtext: "Earn industry-recognized certificates and showcase your expertise. Partner with top companies hiring our graduates.",
    ctaPrimary: "Start Learning",
    ctaSecondary: "View Certificates",
    badge: "✨ Recognized by 200+ top companies",
    stat1: { value: "150+", label: "Certifications" },
    stat2: { value: "200+", label: "Partners" },
    stat3: { value: "85%", label: "Hired Rate" },
  },
];

export const courseCurriculum: Module[] = [
  {
    id: "m1",
    title: "Introduction & Foundations",
    lessons: [
      { 
        id: "l1", 
        title: "Welcome to Gizami: Your Learning Journey", 
        duration: "05:20", 
        type: "video", 
        free: true,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Demo URL
      },
      { 
        id: "l2", 
        title: "Course Overview & Learning Objectives", 
        duration: "10:00", 
        type: "reading",
        free: true,
        content: `
          <h3>Welcome to the Course!</h3>
          <p>This course is designed to take you from a complete beginner to an intermediate professional...</p>
          <h4>What you will learn:</h4>
          <ul>
            <li>Core principles of the subject matter</li>
            <li>Advanced tools and industry workflows</li>
            <li>How to build real-world projects</li>
          </ul>
        `
      },
      { 
        id: "l3", 
        title: "Setting Up Your Workspace", 
        duration: "15:45", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
    ],
  },
  {
    id: "m2",
    title: "Core Concepts & Practical Application",
    lessons: [
      { 
        id: "l4", 
        title: "Module 2: Deep Dive into the Foundations", 
        duration: "24:10", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
      { 
        id: "l5", 
        title: "Handling Common Edge Cases", 
        duration: "12:30", 
        type: "reading",
        content: `
          <h3>Edge Case Management</h3>
          <p>In this lesson, we explore the tricky parts that often get skipped. Understanding these will separate you from the juniors...</p>
        `
      },
      { 
        id: "l6", 
        title: "Quick Quiz: Foundations Checkpad", 
        duration: "08:00", 
        type: "quiz",
        questions: [
          {
            id: "q1",
            question: "What is the primary benefit of using Gizami's learning path?",
            options: [
              "Access to expensive gear",
              "Structured, expert-led curriculum",
              "Infinite scrolling",
              "Nothing special"
            ],
            correctAnswer: 1,
            explanation: "Gizami focuses on curated, structured paths rather than random video lists."
          },
          {
            id: "q2",
            question: "Which of these is a core multimedia tool?",
            options: [
              "Notepad",
              "Adobe Premiere Pro",
              "Calculator",
              "Web Browser"
            ],
            correctAnswer: 1
          }
        ]
      },
    ],
  },
  {
    id: "m3",
    title: "Advanced Strategies & Capstone",
    lessons: [
      { 
        id: "l7", 
        title: "Industry Workflow Analysis", 
        duration: "18:20", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
      { 
        id: "l8", 
        title: "Final Capstone Project Brief", 
        duration: "10:00", 
        type: "reading",
        content: "<h3>The Capstone Project</h3><p>Now it's time to put everything you've learned into practice...</p>"
      },
      { 
        id: "l9", 
        title: "Submit Your Project", 
        duration: "05:00", 
        type: "reading",
        content: "<p>Upload your finished work to the portal for instructor review.</p>"
      },
    ],
  },
];

export const enrolledCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp 2024",
    instructor: "Amara Nze",
    progress: 72,
    image: "https://images.unsplash.com/photo-1587620962725-abab19836100?w=400&q=80",
    lastAccessed: "2 hours ago",
    nextLesson: "React Hooks Deep Dive",
    totalLessons: 350,
    completedLessons: 252,
    category: "Technology",
  },
  {
    id: "2",
    title: "UI/UX Design Masterclass",
    instructor: "Tunde Bakare",
    progress: 45,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80",
    lastAccessed: "Yesterday",
    nextLesson: "Creating Component Libraries",
    totalLessons: 220,
    completedLessons: 99,
    category: "Design",
  },
  {
    id: "3",
    title: "Full-Stack YouTube Content Strategy",
    instructor: "Dr. Kemi Balogun",
    progress: 18,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80",
    lastAccessed: "3 days ago",
    nextLesson: "Linear Regression",
    totalLessons: 410,
    completedLessons: 74,
    category: "Content Creation",
  },
];
