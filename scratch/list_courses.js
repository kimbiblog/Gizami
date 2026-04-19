
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  const { data: courses, error } = await supabase.from('courses').select('id, title, status, created_at').order('created_at', { ascending: false });
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Recent Courses:', courses);
  }
}

check();
