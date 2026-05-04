const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://pelhlgqvdrruyitrqdlb.supabase.co',
  'sb_publishable_augqU4fFiMmcFozKAf8-xQ_3xdtAm46'
);

async function verify() {
  // Count all properties
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, location, price, images, is_premium, owner_name')
    .order('created_at', { ascending: false });

  if (error) { console.error('Error:', error.message); return; }

  console.log(`\n📊 Total properties in database: ${data.length}\n`);
  console.log('─'.repeat(80));

  data.forEach((p, i) => {
    const imgCount = Array.isArray(p.images) ? p.images.length : 0;
    const premium = p.is_premium ? '⭐' : '  ';
    console.log(`${premium} ${i+1}. ${p.title}`);
    console.log(`   📍 ${p.location}`);
    console.log(`   💰 ₹${p.price.toLocaleString('en-IN')}  |  🖼️ ${imgCount} images  |  👤 ${p.owner_name || 'N/A'}`);
    console.log('');
  });
}

verify().catch(console.error);
