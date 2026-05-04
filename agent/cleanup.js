const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env.local' });
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  // Get all properties
  const { data: properties, error } = await supabase.from('properties').select('id, title, owner_name, created_at').order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching properties:", error);
    return;
  }
  
  console.log(`Found ${properties.length} total properties.`);
  
  // The first 20 properties ordered by created_at descending are our new ones.
  // We should delete the rest.
  if (properties.length > 20) {
    const toDelete = properties.slice(20);
    console.log(`Deleting ${toDelete.length} old properties...`);
    
    for (const p of toDelete) {
      console.log(`Deleting: ${p.title} (by ${p.owner_name})`);
      const { error: delError } = await supabase.from('properties').delete().eq('id', p.id);
      if (delError) {
        console.error("Failed to delete property:", delError);
      }
    }
    console.log("Cleanup complete.");
  } else {
    console.log("No old properties found. Exactly 20 or fewer properties exist.");
  }
}

cleanup();
