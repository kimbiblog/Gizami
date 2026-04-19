
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function initDb() {
  console.log('Initializing Database...');
  
  // 1. Read the schema file
  const schemaPath = path.join(process.cwd(), 'database_schema.sql');
  // Note: For this execution, I'll rely on the execute_sql MCP tool for large DDL 
  // if available, but since it failed earlier, I'll try to run some core checks first.
  
  // Check if categories exists
  const { data: cats, error: catErr } = await supabase.from('categories').select('id').limit(1);
  
  if (catErr && catErr.code === 'PGRST116' || catErr?.message?.includes('does not exist')) {
    console.log('Tables appear missing. Please run the migration in the Supabase Dashboard SQL Editor using the database_schema.sql file provided.');
    process.exit(1);
  }

  console.log('Tables verified.');

  // Check if we have categories, if not, seed them
  const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  if (count === 0) {
    console.log('Seeding categories...');
    const seedData = [
      { name: 'Content Creation', slug: 'content-creation', icon: '🎬', color: '#16a34a', bg_color: '#f0fdf4' },
      { name: 'Technology', slug: 'technology', icon: '💻', color: '#0284c7', bg_color: '#f0f9ff' },
      { name: 'Design', slug: 'design', icon: '🎨', color: '#7c3aed', bg_color: '#f5f3ff' },
      { name: 'Multimedia', slug: 'multimedia', icon: '🎞️', color: '#db2777', bg_color: '#fdf2f8' },
      { name: 'Marketing', slug: 'marketing', icon: '📢', color: '#ea580c', bg_color: '#fff7ed' }
    ];
    await supabase.from('categories').insert(seedData);
    console.log('Categories seeded.');
  } else {
    console.log('Categories already present.');
  }
}

initDb();
