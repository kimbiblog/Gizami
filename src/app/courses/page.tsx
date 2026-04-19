"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  ChevronDown,
  X,
  SlidersHorizontal,
  BookOpen,
  Grid3x3,
  LayoutList,
} from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { CourseCardSkeleton } from "@/components/CourseCard";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

const priceFilters = ["All", "Free", "Paid"];
const levelFilters = ["All", "Beginner", "Intermediate", "Advanced"];
const ratingFilters = [
  { label: "4.5 & above", value: 4.5 },
  { label: "4.0 & above", value: 4.0 },
  { label: "3.5 & above", value: 3.5 },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [fetchedCourses, setFetchedCourses] = useState<any[]>([]);
  const [fetchedCategories, setFetchedCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const { data: cats, error: catsErr } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true);
        
        if (cats) setFetchedCategories(cats);

        // Fetch courses with category and instructor info
        const { data: crs, error: crsErr } = await supabase
          .from("courses")
          .select(`
            *,
            categories (name),
            instructor:profiles!courses_instructor_id_fkey (full_name)
          `)
          .eq("status", "published");

        if (crs) {
          // Map to our local Course interface
          const mapped = crs.map((c: any) => ({
            id: c.id,
            title: c.title,
            instructor: (c as any).instructor?.full_name || "Gizami Instructor",
            category: c.categories?.name || "Uncategorized",
            price: c.price === 0 ? "free" : c.price,
            rating: c.rating,
            reviews: c.reviews_count || 0,
            students: c.students_count || 0,
            image: c.image_url,
            badge: c.badge,
            duration: c.duration,
            lessons: c.lessons_count || 0,
            level: c.level,
            description: c.description
          }));
          setFetchedCourses(mapped);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = fetchedCourses.filter((c: any) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchPrice =
      priceFilter === "All" ||
      (priceFilter === "Free" && c.price === "free") ||
      (priceFilter === "Paid" && c.price !== "free");
    const matchLevel = levelFilter === "All" || c.level === levelFilter;
    const matchRating = ratingFilter === null || c.rating >= ratingFilter;
    return matchSearch && matchCategory && matchPrice && matchLevel && matchRating;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "popular") return b.students - a.students;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "newest") return parseInt(b.id) - parseInt(a.id);
    if (sortBy === "price-asc") return (a.price === "free" ? 0 : a.price) - (b.price === "free" ? 0 : (b.price as number));
    return 0;
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setPriceFilter("All");
    setLevelFilter("All");
    setRatingFilter(null);
  };

  const activeFiltersCount = [
    selectedCategory !== "All",
    priceFilter !== "All",
    levelFilter !== "All",
    ratingFilter !== null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white pt-28 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Explore All Courses</h1>
            <p className="text-green-100 text-lg">Discover {fetchedCourses.length}+ expert-led courses to grow your skills</p>
          </div>
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses, instructors..."
                  aria-label="Search courses"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 text-base outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2" aria-label="Clear search">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden px-5 py-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/30 flex items-center gap-2 text-white font-medium"
                aria-label="Toggle filters"
              >
                <Filter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="bg-[var(--accent)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside
            className={`${
              isSidebarOpen ? "block" : "hidden"
            } md:block w-full md:w-64 flex-shrink-0`}
            aria-label="Course filters"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-5 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-[var(--primary)] font-medium hover:underline">
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {["All", ...fetchedCategories.map((c: any) => c.name)].map((cat: string) => (
                    <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 accent-[var(--primary)]"
                        aria-label={`Filter by ${cat}`}
                      />
                      <span className={`text-sm ${selectedCategory === cat ? "text-[var(--primary)] font-medium" : "text-gray-600 group-hover:text-gray-800"}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Price</h3>
                <div className="flex flex-wrap gap-2">
                  {priceFilters.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriceFilter(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        priceFilter === p
                          ? "bg-[var(--primary)] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      aria-pressed={priceFilter === p}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Level</h3>
                <div className="space-y-2">
                  {levelFilters.map((l) => (
                    <label key={l} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="level"
                        checked={levelFilter === l}
                        onChange={() => setLevelFilter(l)}
                        className="w-4 h-4 accent-[var(--primary)]"
                        aria-label={`Filter by level: ${l}`}
                      />
                      <span className={`text-sm ${levelFilter === l ? "text-[var(--primary)] font-medium" : "text-gray-600 group-hover:text-gray-800"}`}>
                        {l}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {ratingFilters.map((r) => (
                    <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={ratingFilter === r.value}
                        onChange={() => setRatingFilter(r.value)}
                        className="w-4 h-4 accent-[var(--primary)]"
                        aria-label={`Filter by rating: ${r.label}`}
                      />
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {r.label}
                      </span>
                    </label>
                  ))}
                  {ratingFilter !== null && (
                    <button onClick={() => setRatingFilter(null)} className="text-xs text-[var(--primary)] hover:underline">
                      Clear rating filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-[var(--border)] p-3 px-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{sorted.length}</span> courses found
              </p>
              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="hidden sm:flex gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-white shadow-sm text-[var(--primary)]" : "text-gray-400"}`}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg ${viewMode === "list" ? "bg-white shadow-sm text-[var(--primary)]" : "text-gray-400"}`}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-[var(--border)] bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)]"
                    aria-label="Sort courses"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Courses grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[var(--border)]">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {sorted.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
