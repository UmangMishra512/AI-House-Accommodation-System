-- MASTER SCHEMA: AI House Accommodation System
-- This file contains the complete database state as of May 2026.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  owner_name TEXT,
  phone_number TEXT,
  alternate_phone TEXT,
  email TEXT,
  qr_code_url TEXT,
  qr_target_url TEXT,
  video_url TEXT[],
  ai_model_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  embedding vector(768),
  ai_description TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  amenities TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public properties are viewable by everyone." ON properties FOR SELECT USING (true);
CREATE POLICY "Users can insert their own properties." ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own properties." ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own properties." ON properties FOR DELETE USING (auth.uid() = owner_id);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Property owners can view messages" ON contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = contact_messages.property_id AND properties.owner_id = auth.uid())
);

-- 5. USERS & ROLES
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- 6. AI MATCH FUNCTION
CREATE OR REPLACE FUNCTION match_properties(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 12
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
  is_premium boolean,
  amenities text[],
  status text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.description, p.price, p.location, p.lat, p.lng, p.images,
    p.owner_name, p.ai_description, p.is_premium, p.amenities, p.status,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM properties p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.is_premium DESC, p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS properties_embedding_idx ON properties USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
