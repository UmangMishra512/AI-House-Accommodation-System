const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'client/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('properties').select('id, title, images').order('created_at', { ascending: false }).limit(2);
  console.log(JSON.stringify(data, null, 2));
}
test();
