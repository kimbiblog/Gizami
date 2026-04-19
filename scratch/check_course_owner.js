
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  const courseId = '12acff6c-8f25-4f8d-82e6-322f296ef1b6';
  
  // 1. Get Course Info
  const { data: course, error: cErr } = await supabase.from('courses').select('id, title, instructor_id').eq('id', courseId).single();
  if (cErr) {
    console.log('Course not found or error:', cErr.message);
  } else {
    console.log('Course Info:', course);
  }

  // 2. Get User Info (We can't get current session from server-side service role easily without token, but we can look for the user email mentioned)
  const { data: { users }, error: uErr } = await supabase.auth.admin.listUsers();
  if (uErr) {
    console.log('Users error:', uErr.message);
  } else {
    const targetUser = users.find(u => u.email === 'stabilized_final@gizami.com');
    if (targetUser) {
      console.log('Target User ID (stabilized_final):', targetUser.id);
    }
    const teacherUser = users.find(u => u.email === 'teacher_test@gizami.com');
    if (teacherUser) {
        console.log('Teacher User ID (teacher_test):', teacherUser.id);
    }
  }
}

check();
