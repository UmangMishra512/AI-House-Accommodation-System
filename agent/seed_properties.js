const { createClient } = require('@supabase/supabase-js');
const { USERS, PROPERTIES } = require('./patna_properties_data');
const { PROPERTIES_PART2 } = require('./patna_properties_data2');

const SUPABASE_URL = 'https://pelhlgqvdrruyitrqdlb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_augqU4fFiMmcFozKAf8-xQ_3xdtAm46';

const ALL_PROPERTIES = [...PROPERTIES, ...PROPERTIES_PART2];

// We need separate Supabase clients per user session
function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function registerUser(user, index) {
  const supabase = createSupabaseClient();
  console.log(`\n👤 Registering user ${index + 1}/5: ${user.name} (${user.email})`);

  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: { data: { name: user.name, role: 'user' } }
  });

  if (error) {
    // If user already exists, try to sign in
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      console.log(`   ℹ️  User already exists, signing in...`);
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email, password: user.password
      });
      if (loginError) throw new Error(`Login failed for ${user.email}: ${loginError.message}`);
      return { supabase, userId: loginData.user.id };
    }
    throw new Error(`Signup failed for ${user.email}: ${error.message}`);
  }

  if (!data.session) {
    throw new Error(`Email confirmation required for ${user.email}. Cannot proceed.`);
  }

  // Insert into public.users table
  const { error: profileError } = await supabase.from('users').upsert([{
    id: data.user.id, name: user.name, email: user.email, role: 'user'
  }]);
  if (profileError) console.warn(`   ⚠️  Profile insert warning: ${profileError.message}`);

  console.log(`   ✅ Registered: ${data.user.id}`);
  return { supabase, userId: data.user.id };
}

async function createProperty(supabase, userId, property, propIndex) {
  const label = `[${propIndex + 1}/20]`;
  console.log(`   🏠 ${label} Creating: ${property.title}`);

  const propData = {
    owner_id: userId,
    title: property.title,
    description: property.description,
    price: property.price,
    location: property.location,
    lat: property.lat,
    lng: property.lng,
    owner_name: property.owner_name,
    phone_number: property.phone_number,
    email: property.email,
    images: property.images,
    amenities: property.amenities,
    is_premium: property.is_premium,
    status: property.status,
    video_url: [],
  };

  const { data, error } = await supabase
    .from('properties')
    .insert([propData])
    .select('id')
    .single();

  if (error) {
    console.error(`   ❌ ${label} Failed: ${error.message}`);
    return null;
  }

  console.log(`   ✅ ${label} Created: ${data.id}`);
  return data.id;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   PATNA PROPERTY SEEDER - 20 LISTINGS, 5 USERS         ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log(`Total properties to create: ${ALL_PROPERTIES.length}`);
  console.log(`Total users to register: ${USERS.length}\n`);

  // Step 1: Register all users and get their authenticated clients
  const userSessions = [];
  for (let i = 0; i < USERS.length; i++) {
    try {
      const session = await registerUser(USERS[i], i);
      userSessions.push(session);
      await sleep(1000); // Rate limit between signups
    } catch (err) {
      console.error(`❌ Failed to register ${USERS[i].name}: ${err.message}`);
      return;
    }
  }

  console.log(`\n✅ All ${userSessions.length} users registered successfully!\n`);
  console.log('━'.repeat(60));

  // Step 2: Create properties for each user
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < ALL_PROPERTIES.length; i++) {
    const property = ALL_PROPERTIES[i];
    const userSession = userSessions[property.userIndex];

    if (!userSession) {
      console.error(`❌ No session for user index ${property.userIndex}`);
      failCount++;
      continue;
    }

    try {
      const propId = await createProperty(userSession.supabase, userSession.userId, property, i);
      if (propId) successCount++;
      else failCount++;
      await sleep(500); // Rate limit
    } catch (err) {
      console.error(`❌ Error creating property ${i + 1}: ${err.message}`);
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(60));
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SEEDING COMPLETE!                                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed:  ${failCount}`);
  console.log(`   📦 Total:   ${ALL_PROPERTIES.length}`);
  console.log(`\n🌐 View at: https://house-accomodation.vercel.app`);
  console.log(`\n👥 User accounts created:`);
  USERS.forEach(u => console.log(`   • ${u.name} (${u.email}) — Password: ${u.password}`));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
