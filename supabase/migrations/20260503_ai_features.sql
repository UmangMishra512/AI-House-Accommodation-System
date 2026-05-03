-- AI Features Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pelhlgqvdrruyitrqdlb/sql/new

-- 1. Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column for semantic search vectors
ALTER TABLE properties ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Add AI-generated description column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ai_description TEXT;

-- 4. Create vector similarity search index (HNSW is better for small datasets)
CREATE INDEX IF NOT EXISTS properties_embedding_idx 
  ON properties USING hnsw (embedding vector_cosine_ops);

-- 5. Create the match_properties function for similarity search
CREATE OR REPLACE FUNCTION match_properties(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price numeric,
  location text,
  lat numeric,
  lng numeric,
  images jsonb,
  owner_name text,
  ai_description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.description, p.price, p.location, p.lat, p.lng, p.images,
    p.owner_name, p.ai_description,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM properties p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
