import { createClient } from '@supabase/supabase-js';

// Helper to get supabase client safely
export const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    if (typeof window === 'undefined') {
      console.warn("Supabase credentials missing during build/server-side. Standard client will return null.");
    }
    return null as any;
  }
  return createClient(url, key);
};

export const supabase = getSupabase();

// Types for our database tables (can be expanded later)
export type Tables = {
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
    role: 'admin' | 'teacher' | 'student';
    bio: string;
    created_at: string;
  };
  courses: {
    id: string;
    title: string;
    description: string;
    instructor_id: string;
    category_id: string;
    price: number;
    image_url: string;
    level: string;
    status: string;
  };
  // Add other types as needed...
};
