-- Ensure general settings exist for logo management
-- Current time: 2026-01-01 13:00 UTC

-- Insert or update general settings with default logo
INSERT INTO public.site_settings_2026_01_01_12_00 (setting_key, setting_value, created_by)
VALUES (
  'general',
  '{
    "logoUrl": "./images/space_logo_20260101_120021.png",
    "logoWhiteUrl": "./images/space_logo_20260101_120021.png",
    "siteName": "SPACE",
    "tagline": "Organizing Exhibitions & Conferences"
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Ensure colors settings exist
INSERT INTO public.site_settings_2026_01_01_12_00 (setting_key, setting_value, created_by)
VALUES (
  'colors',
  '{
    "primary": "#0ea5e9",
    "secondary": "#64748b", 
    "accent": "#06b6d4"
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = COALESCE(setting_value, EXCLUDED.setting_value);

-- Ensure SEO settings exist
INSERT INTO public.site_settings_2026_01_01_12_00 (setting_key, setting_value, created_by)
VALUES (
  'seo',
  '{
    "title": "SPACE - Organizing Exhibitions & Conferences",
    "description": "Professional exhibition and conference organization services. Creating exceptional experiences through precision planning and flawless execution.",
    "keywords": "exhibitions, conferences, events, organization, planning, SPACE"
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = COALESCE(setting_value, EXCLUDED.setting_value);