#!/usr/bin/env node
/**
 * Backfill embeddings for all existing properties that don't have one yet.
 * Usage: node scripts/backfill-embeddings.mjs
 */

const SUPABASE_URL = 'https://pelhlgqvdrruyitrqdlb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_augqU4fFiMmcFozKAf8-xQ_3xdtAm46';

async function main() {
  console.log('🔍 Fetching properties without embeddings...\n');

  // Fetch all properties
  const res = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=id,title,embedding&order=created_at.desc`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  const properties = await res.json();

  if (!Array.isArray(properties)) {
    console.error('❌ Failed to fetch properties:', properties);
    return;
  }

  const needsEmbedding = properties.filter(p => !p.embedding);
  console.log(`📊 Total properties: ${properties.length}`);
  console.log(`🧩 Need embedding: ${needsEmbedding.length}\n`);

  if (needsEmbedding.length === 0) {
    console.log('✅ All properties already have embeddings!');
    return;
  }

  let success = 0;
  let failed = 0;

  for (const prop of needsEmbedding) {
    process.stdout.write(`⚙️  Generating embedding for "${prop.title}" (${prop.id})... `);

    try {
      const fnRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-embedding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ propertyId: prop.id }),
      });

      const result = await fnRes.json();

      if (result.success) {
        console.log('✅');
        success++;
      } else {
        console.log(`❌ ${result.error || 'Unknown error'}`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }

    // Small delay to respect rate limits (Gemini free tier = 15 RPM)
    await new Promise(r => setTimeout(r, 4500));
  }

  console.log(`\n🏁 Done! ✅ ${success} succeeded, ❌ ${failed} failed`);
}

main().catch(console.error);
