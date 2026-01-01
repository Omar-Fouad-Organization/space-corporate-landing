-- Create admin system tables for SPACE corporate website
-- Current time: 2026-01-01 12:00 UTC

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create admin_users table for role management
CREATE TABLE IF NOT EXISTS public.admin_users_2026_01_01_12_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
    full_name TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create content_sections table for dynamic content management
CREATE TABLE IF NOT EXISTS public.content_sections_2026_01_01_12_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    section_name TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create media_assets table for file management
CREATE TABLE IF NOT EXISTS public.media_assets_2026_01_01_12_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    alt_text TEXT,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- Create site_settings table for global settings
CREATE TABLE IF NOT EXISTS public.site_settings_2026_01_01_12_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create content_history table for version control
CREATE TABLE IF NOT EXISTS public.content_history_2026_01_01_12_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL,
    content JSONB NOT NULL,
    version INTEGER NOT NULL,
    action TEXT NOT NULL DEFAULT 'update',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Insert default content sections
INSERT INTO public.content_sections_2026_01_01_12_00 (section_key, section_name, content) VALUES
('hero', 'Hero Section', '{
    "title": "We Create the Space for Impact",
    "subtitle": "Exhibitions Built with Precision and Scale",
    "description": "We transform concepts into powerful experiences that drive business results and create lasting connections.",
    "ctaPrimary": "Start Your Event",
    "ctaSecondary": "View Our Work"
}'),
('about', 'About Section', '{
    "title": "About SPACE",
    "description": "We are the architects of exceptional experiences. With unwavering focus on planning, precision, and execution, SPACE delivers events at any scale.",
    "subtitle": "From intimate executive forums to large-scale international exhibitions, we create the perfect environment for meaningful connections and business growth."
}'),
('services', 'Services Section', '{
    "title": "Our Capabilities",
    "description": "Comprehensive event solutions designed to exceed expectations and deliver measurable results.",
    "items": [
        {
            "title": "Exhibition Organizing",
            "description": "End-to-end exhibition planning and execution with precision and scale.",
            "icon": "🏢"
        },
        {
            "title": "Conference Management",
            "description": "Strategic conference planning from concept to completion.",
            "icon": "🎯"
        },
        {
            "title": "Sponsorship Planning",
            "description": "Comprehensive sponsorship strategies that deliver measurable results.",
            "icon": "🤝"
        },
        {
            "title": "Venue & Layout Design",
            "description": "Innovative space design optimized for engagement and flow.",
            "icon": "📐"
        },
        {
            "title": "On-ground Execution",
            "description": "Flawless event execution with dedicated project management.",
            "icon": "⚡"
        }
    ]
}'),
('work', 'Our Work Section', '{
    "title": "Our Work",
    "description": "Proven track record of delivering exceptional events that build trust and drive results.",
    "projects": [
        {
            "name": "Tech Innovation Summit 2024",
            "category": "Conference",
            "description": "3-day technology conference with 500+ attendees and 50+ speakers."
        },
        {
            "name": "Healthcare Expo Middle East",
            "category": "Exhibition",
            "description": "Regional healthcare exhibition featuring 200+ exhibitors."
        },
        {
            "name": "Sustainable Energy Forum",
            "category": "Conference",
            "description": "Executive forum on renewable energy with industry leaders."
        },
        {
            "name": "Digital Marketing Expo",
            "category": "Exhibition",
            "description": "Interactive exhibition showcasing latest marketing technologies."
        }
    ]
}'),
('green_life_expo', 'Green Life Expo', '{
    "title": "Green Life Expo",
    "subtitle": "Go Green & Healthy Living Expo",
    "description": "Our flagship sustainability exhibition connecting eco-conscious brands with health-focused consumers. A strategic platform driving the green economy forward.",
    "url": "https://greenlife-expo.com",
    "stats": [
        {"icon": "📅", "label": "Annual Event"},
        {"icon": "👥", "label": "10,000+ Visitors"},
        {"icon": "📍", "label": "Regional Focus"},
        {"icon": "🏆", "label": "Industry Leading"}
    ]
}'),
('contact', 'Contact Section', '{
    "title": "Let''s Build Your Next Event the Right Way",
    "description": "Ready to create an exceptional experience? Let''s discuss how SPACE can bring your vision to life with precision, scale, and impact.",
    "ctaPrimary": "Get in Touch",
    "ctaSecondary": "View Services"
}'),
('footer', 'Footer Section', '{
    "description": "Creating exceptional experiences through precision planning and flawless execution.",
    "contact": {
        "email": "info@space-events.com",
        "phone": "+971 4 XXX XXXX",
        "address": "Dubai, UAE"
    }
}');

-- Insert default site settings
INSERT INTO public.site_settings_2026_01_01_12_00 (setting_key, setting_value) VALUES
('general', '{
    "siteName": "SPACE",
    "logoUrl": "./images/space_logo_20260101_120021.png",
    "logoWhiteUrl": "./images/space_logo_20260101_120021.png",
    "language": "en",
    "darkMode": false
}'),
('colors', '{
    "primary": "#00BFFF",
    "secondary": "#000000",
    "accent": "#00BFFF"
}'),
('fonts', '{
    "heading": "Montserrat",
    "body": "Inter"
}'),
('seo', '{
    "title": "SPACE - Organizing Exhibitions & Conferences",
    "description": "Premium exhibition and conference organizing company. We create exceptional experiences through precision planning and flawless execution.",
    "keywords": "exhibitions, conferences, events, Dubai, UAE, event management, corporate events"
}');

-- Create RLS policies for admin_users
CREATE POLICY "Admin users can view all admin users" ON public.admin_users_2026_01_01_12_00
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Super admins can manage all users" ON public.admin_users_2026_01_01_12_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
        )
    );

CREATE POLICY "Admins can manage editors" ON public.admin_users_2026_01_01_12_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'admin') AND au.is_active = true
        )
        AND (role = 'editor' OR user_id = auth.uid())
    );

-- Create RLS policies for content_sections
CREATE POLICY "Authenticated users can view content" ON public.content_sections_2026_01_01_12_00
    FOR SELECT USING (true);

CREATE POLICY "Admin users can manage content" ON public.content_sections_2026_01_01_12_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

-- Create RLS policies for media_assets
CREATE POLICY "Authenticated users can view media" ON public.media_assets_2026_01_01_12_00
    FOR SELECT USING (true);

CREATE POLICY "Admin users can manage media" ON public.media_assets_2026_01_01_12_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

-- Create RLS policies for site_settings
CREATE POLICY "Authenticated users can view settings" ON public.site_settings_2026_01_01_12_00
    FOR SELECT USING (true);

CREATE POLICY "Admin users can manage settings" ON public.site_settings_2026_01_01_12_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

-- Create RLS policies for content_history
CREATE POLICY "Admin users can view content history" ON public.content_history_2026_01_01_12_00
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Admin users can create content history" ON public.content_history_2026_01_01_12_00
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('space-media', 'space-media', true);

-- Create storage policies
CREATE POLICY "Admin users can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'space-media' AND
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Anyone can view media" ON storage.objects
    FOR SELECT USING (bucket_id = 'space-media');

CREATE POLICY "Admin users can delete media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'space-media' AND
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users_2026_01_01_12_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_sections_updated_at BEFORE UPDATE ON public.content_sections_2026_01_01_12_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings_2026_01_01_12_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();