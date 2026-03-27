-- Add category and media columns to posts_lab
ALTER TABLE public.posts_lab
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'discussao',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS link_title text,
  ADD COLUMN IF NOT EXISTS link_description text,
  ADD COLUMN IF NOT EXISTS link_image text;

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-media
CREATE POLICY "Anyone can view post media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Users can delete own post media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);