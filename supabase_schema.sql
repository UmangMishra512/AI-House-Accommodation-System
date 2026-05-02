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

-- Create contact_messages table
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

-- Set up Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Allow property owners to view messages for their properties
CREATE POLICY "Property owners can view messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = contact_messages.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Allow property owners to update messages for their properties
CREATE POLICY "Property owners can update messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = contact_messages.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Allow property owners to delete messages for their properties
CREATE POLICY "Property owners can delete messages"
  ON contact_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = contact_messages.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- ==========================================
-- ADMIN & USERS SCHEMA UPDATES
-- ==========================================

-- Create public users table to sync with auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to users"
  ON public.users
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Trigger to sync auth.users to public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Properties RLS to allow admins to manage all properties
CREATE POLICY "Admins can manage all properties"
  ON properties
  USING (is_admin());

-- Update Contact Messages RLS to allow admins to view all messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages FOR SELECT
  USING (is_admin());

-- Sync existing auth.users to public.users (Data Migration)
INSERT INTO public.users (id, email, name)
SELECT id, email, raw_user_meta_data->>'name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- WARNING: After running this script, run the following command replacing with your actual email to make yourself admin:
-- UPDATE public.users SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';
