
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxiraovzqbcuoevcxigt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aXJhb3Z6cWJjdW9ldmN4aWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNzc3MCwiZXhwIjoyMDkxNTkzNzcwfQ.ryHEu6NfDVwUbHRd3j8GjA5_XPBmHB8Lke9y-ausRr4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getLink() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'teacher_test@gizami.com',
    options: { redirectTo: 'http://localhost:3000/dashboard' }
  });

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('MAGIC_LINK:', data.properties.action_link);
  }
}

getLink();
