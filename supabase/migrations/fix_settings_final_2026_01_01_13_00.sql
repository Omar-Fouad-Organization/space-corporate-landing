-- Fix site settings for logo management
-- Current time: 2026-01-01 13:00 UTC

-- Insert or update general settings with default logo
INSERT INTO public.site_settings_2026_01_01_12_00 (setting_key, setting_value)
VALUES (
  'general',
  '{
    "logoUrl": "./images/space_logo_20260101_120021.png",
    "logoWhiteUrl": "./images/space_logo_20260101_120021.png",
    "siteName": "SPACE",
    "tagline": "Organizing Exhibitions & Conferences"
  }'::jsonb
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = jsonb_set(
    COALESCE(site_settings_2026_01_01_12_00.setting_value, '{}'::jsonb),
    '{logoUrl}',
    '"./images/space_logo_20260101_120021.png"'::jsonb
  ),
  updated_at = NOW();

-- Ensure colors settings exist
INSERT INTO public.site_settings_2026_01_01_12_00 (setting_key, setting_value)
VALUES (
  'colors',
  '{
    "primary": "#0ea5e9",
    "secondary": "#64748b", 
    "accent": "#06b6d4"
  }'::jsonb
)
ON CONFLICT (setting_key) 
DO NOTHING;

-- Ensure SEO settings exist
INSERT INTO public.site_settings_2026_01_01_12_00 (setting_key, setting_value)
VALUES (
  'seo',
  '{
    "title": "SPACE - Organizing Exhibitions & Conferences",
    "description": "Professional exhibition and conference organization services. Creating exceptional experiences through precision planning and flawless execution.",
    "keywords": "exhibitions, conferences, events, organization, planning, SPACE"
  }'::jsonb
)
ON CONFLICT (setting_key) 
DO NOTHING;