import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'client/.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunction() {
  const imageUrl = "https://pelhlgqvdrruyitrqdlb.supabase.co/storage/v1/object/public/property-images/da6db21f-13e1-49b4-9bc3-04054d362f71/0.5930544376108372.png";
  console.log(`Testing edge function with image: ${imageUrl}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('tripo', {
      body: { 
        action: 'generate',
        imageUrl: imageUrl
      }
    });

    if (error) {
      console.error("Edge function returned an error:", error);
      return;
    }

    console.log("Success! Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Exception:", err);
  }
}

testEdgeFunction();
