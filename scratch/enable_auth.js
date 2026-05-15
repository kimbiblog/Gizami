const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function toggleOn() {
  console.log("Enabling registration and login in Supabase...");
  
  const { data, error } = await supabase
    .from('settings')
    .update({ 
      registration_enabled: true, 
      login_enabled: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error("Error updating settings:", error);
  } else {
    console.log("Successfully enabled registration and login.");
  }
}

toggleOn();
