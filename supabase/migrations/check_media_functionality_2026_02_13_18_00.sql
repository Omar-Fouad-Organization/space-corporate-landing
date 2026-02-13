-- Check storage bucket and media management functionality
-- Current time: 2026-02-13 18:00 UTC

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'space-media';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'space-media';

-- Check current media assets
SELECT id, file_name, file_path, file_type, category, is_active, created_at 
FROM public.media_assets_2026_01_01_12_00 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any media assets that should be linked to content
SELECT 
  cs.section_key,
  cs.section_name,
  cs.content->>'hero_image' as hero_image,
  cs.content->>'featured_image' as featured_image
FROM public.content_sections_2026_01_01_12_00 cs
WHERE cs.content ? 'hero_image' OR cs.content ? 'featured_image';