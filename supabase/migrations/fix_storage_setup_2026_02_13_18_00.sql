-- Check and fix storage bucket setup for media management
-- Current time: 2026-02-13 18:00 UTC

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'space-media';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public) 
VALUES ('space-media', 'space-media', true)
ON CONFLICT (id) DO NOTHING;

-- Check current media assets
SELECT id, file_name, file_path, file_type, category, is_active, created_at 
FROM public.media_assets_2026_01_01_12_00 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Create storage policies if they don't exist
DO $$
BEGIN
    -- Policy for viewing media files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view media files'
    ) THEN
        EXECUTE 'CREATE POLICY "Anyone can view media files" ON storage.objects
            FOR SELECT USING (bucket_id = ''space-media'')';
    END IF;

    -- Policy for uploading media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload media'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated users can upload media" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = ''space-media'' AND
                auth.role() = ''authenticated''
            )';
    END IF;

    -- Policy for updating media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can update media'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated users can update media" ON storage.objects
            FOR UPDATE USING (
                bucket_id = ''space-media'' AND
                auth.role() = ''authenticated''
            )';
    END IF;

    -- Policy for deleting media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can delete media'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated users can delete media" ON storage.objects
            FOR DELETE USING (
                bucket_id = ''space-media'' AND
                auth.role() = ''authenticated''
            )';
    END IF;
END $$;