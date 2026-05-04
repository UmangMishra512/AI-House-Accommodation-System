const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pelhlgqvdrruyitrqdlb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_augqU4fFiMmcFozKAf8-xQ_3xdtAm46';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
  console.log('Testing signup...');
  const testEmail = `test_${Date.now()}@testaccount.com`;
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'TestPass123!',
    options: { data: { name: 'Test User', role: 'user' } }
  });
  
  if (error) {
    console.error('Signup error:', error.message);
    return;
  }
  
  console.log('Session exists:', !!data.session);
  console.log('User ID:', data.user?.id);
  console.log('Email confirmed:', data.user?.email_confirmed_at);
  
  if (data.session) {
    console.log('✅ Email confirmation is DISABLED - we can proceed!');
    
    // Test insert a property
    const { data: propData, error: propError } = await supabase
      .from('properties')
      .insert([{
        owner_id: data.user.id,
        title: 'TEST PROPERTY - DELETE ME',
        description: 'Test property for automation verification',
        price: 1000000,
        location: 'Test Location, Patna',
        lat: 25.6,
        lng: 85.1,
        phone_number: '+91 9999999999',
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800']
      }])
      .select('id')
      .single();
    
    if (propError) {
      console.error('Property insert error:', propError.message);
    } else {
      console.log('✅ Property inserted:', propData.id);
      // Clean up
      await supabase.from('properties').delete().eq('id', propData.id);
      console.log('✅ Test property cleaned up');
    }
  } else {
    console.log('❌ Email confirmation is ENABLED - need service role key');
  }
  
  // Clean up test user auth (can't delete via anon key, but that's ok)
}

testSignup().catch(console.error);
