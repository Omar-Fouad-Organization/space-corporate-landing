-- Test and fix logo update in site settings
-- Current time: 2026-01-01 13:00 UTC

-- Test updating general settings directly with a test logo
UPDATE public.site_settings_2026_01_01_12_00 
SET 
  setting_value = jsonb_set(
    COALESCE(setting_value, '{}'::jsonb),
    '{logoUrl}',
    '"https://images.unsplash.com/photo-1482739627503-c2cb4fc17328?w=200&auto=format&fit=crop&q=80"'::jsonb
  ),
  updated_at = NOW()
WHERE setting_key = 'general';

-- Check the result
SELECT setting_key, setting_value->>'logoUrl' as logo_url, setting_value 
FROM public.site_settings_2026_01_01_12_00 
WHERE setting_key = 'general';

-- Also check all settings
SELECT * FROM public.site_settings_2026_01_01_12_00;