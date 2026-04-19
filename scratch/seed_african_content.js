
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('🚀 Starting African Identity Seeding...');

  // 1. Sync Categories (Colors & Icons)
  const categories = [
    { name: 'Content Creation', slug: 'content-creation', icon: '🎬', color: '#1a6b3c', bg_color: '#e8f5ee' },
    { name: 'Technology', slug: 'technology', icon: '💻', color: '#0ea5e9', bg_color: '#e0f2fe' },
    { name: 'Design', slug: 'design', icon: '🎨', color: '#8b5cf6', bg_color: '#f3f0ff' },
    { name: 'Multimedia', slug: 'multimedia', icon: '🎞️', color: '#ec4899', bg_color: '#fce7f3' },
    { name: 'Marketing', slug: 'marketing', icon: '📢', color: '#f97316', bg_color: '#fff4ed' }
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
    if (error) console.error(`Error seeding category ${cat.name}:`, error.message);
  }
  console.log('✅ Categories synced.');

  // 2. Create Realistic Instructors (Profiles)
  const instructors = [
    { full_name: 'Amara Nze', role: 'teacher', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80' },
    { full_name: 'Tunde Bakare', role: 'teacher', avatar_url: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&q=80' },
    { full_name: 'Dr. Kemi Balogun', role: 'teacher', avatar_url: 'https://images.unsplash.com/photo-1531123414708-f47c4ced6bca?w=200&q=80' },
    { full_name: 'Zola Mkhize', role: 'teacher', avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80' }
  ];

  const instructorIds = {};
  for (const inst of instructors) {
    // Check if exists by name (simplified for seed)
    const { data: existing } = await supabase.from('profiles').select('id').eq('full_name', inst.full_name).maybeSingle();
    
    if (existing) {
      instructorIds[inst.full_name] = existing.id;
    } else {
      // For this seed, we assume auth users might not exist, so we skip profile creation if no auth link.
      // BUT for purely local E2E demo data, we might need to link them to dummy IDs if RLS allows.
      // Since this is a dev DB, I'll use specific UUIDs for them if they aren't there.
      const fallbackId = require('crypto').randomUUID();
      const { data, error } = await supabase.from('profiles').insert({ ...inst, id: fallbackId }).select().single();
      if (!error) instructorIds[inst.full_name] = data.id;
    }
  }
  console.log('✅ Instructors ready.');

  // 3. Seed African-themed Courses
  const { data: catData } = await supabase.from('categories').select('id, name');
  const getCatId = (name) => catData.find(c => c.name === name)?.id;

  const courses = [
    {
      title: 'Modern Web Development with React',
      instructor_id: instructorIds['Amara Nze'],
      category_id: getCatId('Technology'),
      price: 49,
      level: 'Beginner',
      rating: 4.8,
      students_count: 1240,
      image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      description: 'Master React.js and build modern web applications from Lagos to the world.',
      status: 'published',
      duration: '45h',
      lessons_count: 120
    },
    {
      title: 'African Diaspora Content Strategy',
      instructor_id: instructorIds['Dr. Kemi Balogun'],
      category_id: getCatId('Content Creation'),
      price: 0,
      level: 'Intermediate',
      rating: 4.9,
      students_count: 3500,
      image_url: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&q=80',
      description: 'Learn how to build a global YouTube brand while staying true to your roots.',
      status: 'published',
      duration: '30h',
      lessons_count: 85
    },
    {
      title: 'UI/UX Design for Emerging Markets',
      instructor_id: instructorIds['Tunde Bakare'],
      category_id: getCatId('Design'),
      price: 75,
      level: 'Advanced',
      rating: 4.7,
      students_count: 890,
      image_url: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&q=80',
      description: 'Design products that solve real problems in infrastructure-constrained environments.',
      status: 'published',
      duration: '50h',
      lessons_count: 140
    }
  ];

  for (const c of courses) {
    if (!c.instructor_id) continue;
    const { error } = await supabase.from('courses').upsert(c, { onConflict: 'title' });
    if (error) console.error(`Error seeding course ${c.title}:`, error.message);
  }
  console.log('✅ African-centric courses seeded.');

  console.log('🎉 Seeding Complete!');
}

seed();
