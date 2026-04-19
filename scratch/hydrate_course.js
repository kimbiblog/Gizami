
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function hydrateCourse() {
  const courseId = "871a7cd6-8438-475a-a8f1-574428587657";
  const duplicateId = "9931db73-3065-44f7-8d7a-6bb3bb3c4c35";

  console.log('--- HYDRATING TEST COURSE ---');

  // 1. Delete duplicate
  await supabase.from('courses').delete().eq('id', duplicateId);
  console.log('Cleaned up duplicate course.');

  // 2. Add Module
  const { data: mod, error: mErr } = await supabase
    .from('modules')
    .insert({ course_id: courseId, title: "Introduction", order: 0 })
    .select()
    .single();
  
  if (mErr) {
    console.log('Module Error:', mErr.message);
    return;
  }
  console.log('Module created.');

  // 3. Add Lesson
  const { error: lErr } = await supabase
    .from('lessons')
    .insert({
      module_id: mod.id,
      title: "Welcome to Gizami",
      type: "reading",
      content: "# Welcome to Gizami\n\nThis is the first lesson of your journey. In this LMS, you can learn at your own pace and earn recognized certificates.",
      order: 0,
      is_free: true
    });

  if (lErr) {
    console.log('Lesson Error:', lErr.message);
    return;
  }
  console.log('Lesson created.');

  // 4. Publish Course
  const { error: pErr } = await supabase
    .from('courses')
    .update({ status: 'published', lessons_count: 1 })
    .eq('id', courseId);
  
  if (pErr) {
    console.log('Publish Error:', pErr.message);
  } else {
    console.log('Course published successfully!');
  }
}

hydrateCourse();
