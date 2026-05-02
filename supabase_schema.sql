-- Create properties table
CREATE TABLE properties (
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public properties are viewable by everyone."
  ON properties FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own properties."
  ON properties FOR INSERT
  WITH CHECK ( auth.uid() = owner_id );

CREATE POLICY "Users can update their own properties."
  ON properties FOR UPDATE
  USING ( auth.uid() = owner_id );

CREATE POLICY "Users can delete their own properties."
  ON properties FOR DELETE
  USING ( auth.uid() = owner_id );

-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true)
ON CONFLICT DO NOTHING;

-- Storage RLS
CREATE POLICY "Public access to property images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'property-images' );

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'property-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own property images"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'property-images' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'property-images' AND auth.uid() = owner );
