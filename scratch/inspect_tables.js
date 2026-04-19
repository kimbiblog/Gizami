
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for inspection
const supabase = createClient(supabaseUrl, supabaseKey);

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
