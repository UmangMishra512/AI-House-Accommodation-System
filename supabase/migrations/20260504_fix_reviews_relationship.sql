-- Fix relationship between reviews and users table
-- This allows Supabase to correctly join the reviews table with the public.users (profiles) table.

ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE reviews
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Also ensure RLS allows joining
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Ensure anyone can read user names for reviews
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone') THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
    END IF;
END $$;
