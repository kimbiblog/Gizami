
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  const courseId = '12acff6c-8f25-4f8d-82e6-322f296ef1b6';
  
  // 1. Get Course Info including status
  const { data: course, error: cErr } = await supabase.from('courses').select('id, title, instructor_id, status').eq('id', courseId).single();
  if (cErr) {
    console.log('Course not found or error:', cErr.message);
  } else {
    console.log('Course Info:', course);
  }
}

check();
