
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCourse() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, status')
    .ilike('title', '%Mastering Gizami%');

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('COURSE_DATA:', JSON.stringify(data, null, 2));
  }
}

checkCourse();
