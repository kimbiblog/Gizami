
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCurriculum() {
  const courseId = "871a7cd6-8438-475a-a8f1-574428587657"; // Using one of the IDs
  
  const { data: modules, error: mErr } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', courseId);

  if (mErr) {
    console.log('Error:', mErr.message);
  } else {
    console.log('CURRICULUM:', JSON.stringify(modules, null, 2));
  }
}

checkCurriculum();
