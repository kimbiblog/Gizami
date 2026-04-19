
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setup() {
  console.log('--- STARTING GIZAMI E2E SETUP ---');

  // 1. Check/Seed Categories
  console.log('1. Checking Categories...');
  const { data: cats, error: catErr } = await supabase.from('categories').select('id').limit(1);
  if (catErr) {
    console.log('NOTICE: Categories table error (may not exist yet):', catErr.message);
  }

  const seedData = [
    { name: 'Content Creation', slug: 'content-creation', icon: '🎬', color: '#16a34a', bg_color: '#f0fdf4' },
    { name: 'Technology', slug: 'technology', icon: '💻', color: '#0284c7', bg_color: '#f0f9ff' },
    { name: 'Design', slug: 'design', icon: '🎨', color: '#7c3aed', bg_color: '#f5f3ff' },
    { name: 'Multimedia', slug: 'multimedia', icon: '🎞️', color: '#db2777', bg_color: '#fdf2f8' },
    { name: 'Marketing', slug: 'marketing', icon: '📢', color: '#ea580c', bg_color: '#fff7ed' }
  ];

  for (const cat of seedData) {
    try {
        await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
    } catch (e) {
        console.log('Upsert failed for', cat.slug);
    }
  }
  console.log('Categories synced.');

  // 2. Create/Confirm Teacher Account
  console.log('2. Setting up Teacher account...');
  const teacherEmail = 'teacher_test@gizami.com';
  const { data: teacher, error: tErr } = await supabase.auth.admin.createUser({
    email: teacherEmail,
    email_confirm: true,
    user_metadata: { full_name: 'Test Teacher', role: 'teacher' }
  });

  if (tErr && tErr.message !== 'User already registered') {
    console.log('Teacher Error:', tErr.message);
  } else {
    console.log('Teacher account ready.');
  }

  // 3. Create/Confirm Student Account
  console.log('3. Setting up Student account...');
  const studentEmail = 'student_test@gizami.com';
  const { data: student, error: sErr } = await supabase.auth.admin.createUser({
    email: studentEmail,
    email_confirm: true,
    user_metadata: { full_name: 'Test Student', role: 'student' }
  });

  if (sErr && sErr.message !== 'User already registered') {
    console.log('Student Error:', sErr.message);
  } else {
    console.log('Student account ready.');
  }

  console.log('--- SETUP COMPLETE ---');
}

setup();
