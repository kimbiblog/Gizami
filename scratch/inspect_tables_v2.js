
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspect() {
  console.log('Inspecting Table Structures...');
  
  const { data: courses, error: cErr } = await supabase.from('courses').select('*').limit(1);
  if (cErr) console.error('Course columns error:', cErr.message);
  else console.log('Course columns:', Object.keys(courses[0] || {}));

  const { data: modules, error: mErr } = await supabase.from('modules').select('*').limit(1);
  if (mErr) console.error('Module columns error:', mErr.message);
  else console.log('Module columns:', Object.keys(modules[0] || {}));

  const { data: lessons, error: lErr } = await supabase.from('lessons').select('*').limit(1);
  if (lErr) console.error('Lesson columns error:', lErr.message);
  else console.log('Lesson columns:', Object.keys(lessons[0] || {}));
}

inspect();
