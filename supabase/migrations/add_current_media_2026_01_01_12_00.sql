-- Add current website media to media assets table
-- Current time: 2026-01-01 12:00 UTC

-- Insert current website images into media_assets table
INSERT INTO public.media_assets_2026_01_01_12_00 (file_name, file_path, file_type, file_size, alt_text, category, is_active) VALUES
-- Generated images
('space_logo_20260101_120021.png', './images/space_logo_20260101_120021.png', 'image/png', 150000, 'SPACE Company Logo', 'logos', true),
('hero_background_20260101_120022.png', './images/hero_background_20260101_120022.png', 'image/png', 800000, 'Hero Background - Modern Exhibition Hall', 'backgrounds', true),
('diagonal_divider_20260101_120021.png', './images/diagonal_divider_20260101_120021.png', 'image/png', 200000, 'Diagonal Divider Element', 'graphics', true),

-- Unsplash images used in the website
('conference_exhibition_1.jpg', 'https://images.unsplash.com/photo-1482739627503-c2cb4fc17328?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 500000, 'Museum Exhibition Hall', 'exhibitions', true),
('conference_exhibition_2.jpg', 'https://images.unsplash.com/photo-1565262353342-6e919eab5b58?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 450000, 'Modern Conference Space', 'conferences', true),
('business_meeting.jpg', 'https://images.unsplash.com/photo-1758691736591-5bf31a5d0dea?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 400000, 'Business Meeting Discussion', 'business', true),
('event_planning.jpg', 'https://images.unsplash.com/photo-1712903276040-c99b32a057eb?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 350000, 'Event Planning Workspace', 'planning', true),
('office_workspace.jpg', 'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 600000, 'Modern Office Workspace', 'office', true),

-- Additional conference and exhibition images
('exhibition_hall_modern.jpg', 'https://images.unsplash.com/photo-1550389941-bc1b1f91a962?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 380000, 'Modern Exhibition Hall Interior', 'exhibitions', true),
('conference_room_setup.jpg', 'https://images.unsplash.com/photo-1727931287903-b24dd8011a56?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 420000, 'Conference Room Setup', 'conferences', true),
('business_presentation.jpg', 'https://images.unsplash.com/photo-1765438864227-288900d09d26?w=800&auto=format&fit=crop&q=80', 'image/jpeg', 480000, 'Business Presentation Scene', 'business', true);

-- Update content sections to reference these media assets
UPDATE public.content_sections_2026_01_01_12_00 
SET content = jsonb_set(
    content, 
    '{hero_image}', 
    '"https://images.unsplash.com/photo-1565262353342-6e919eab5b58?w=800&auto=format&fit=crop&q=80"'
)
WHERE section_key = 'hero';

UPDATE public.content_sections_2026_01_01_12_00 
SET content = jsonb_set(
    content, 
    '{featured_image}', 
    '"https://images.unsplash.com/photo-1482739627503-c2cb4fc17328?w=800&auto=format&fit=crop&q=80"'
)
WHERE section_key = 'green_life_expo';