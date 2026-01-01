-- Create storage bucket for media files
-- Current time: 2026-01-01 12:00 UTC

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('space-media', 'space-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for media files
CREATE POLICY "Anyone can view media files" ON storage.objects
    FOR SELECT USING (bucket_id = 'space-media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'space-media' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'space-media' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'space-media' AND
        auth.role() = 'authenticated'
    );