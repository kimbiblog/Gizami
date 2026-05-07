const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
        const parts = line.split('=');
        return [parts[0].trim(), parts.slice(1).join('=').trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createStudent() {
  const email = 'student@gizami.com';
  const password = 'Password123!';
  
  // 1. Create Auth User
  const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            await supabase.auth.admin.updateUserById(existingUser.id, { password });
            console.log(`Updated password for existing user ${email}`);
            
            // Still upsert profile to ensure it has student role
            const { error: profileError } = await supabase.from('profiles').upsert({
              id: existingUser.id,
              full_name: 'Demo Student',
              role: 'student'
            });
            if (!profileError) console.log('Profile synced.');
        }
    } else {
        console.error('Error creating user:', authError.message);
        return;
    }
  } else {
    console.log(`Created user ${email}`);
    
    // 2. Create Profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: 'Demo Student',
      role: 'student'
    });

    if (profileError) {
      console.error('Error creating profile:', profileError.message);
    } else {
      console.log('Profile created successfully.');
    }
  }

  console.log('\n--- Student Login Credentials ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

createStudent();
