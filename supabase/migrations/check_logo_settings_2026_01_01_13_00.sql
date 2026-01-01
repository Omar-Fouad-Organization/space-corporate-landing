-- Check current site settings and logo URL
-- Current time: 2026-01-01 13:00 UTC

-- Check what's currently in site_settings table
SELECT setting_key, setting_value FROM public.site_settings_2026_01_01_12_00;

-- Check if general settings exist and what logoUrl is set to
SELECT 
  setting_key,
  setting_value->>'logoUrl' as logo_url,
  setting_value->>'logoWhiteUrl' as logo_white_url,
  setting_value
FROM public.site_settings_2026_01_01_12_00 
WHERE setting_key = 'general';