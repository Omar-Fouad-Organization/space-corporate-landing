-- Create RLS policies for admin system tables
-- Current time: 2026-01-01 12:00 UTC

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
CREATE POLICY "Anyone can view published content" ON public.content_sections_2026_01_01_12_00
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admin users can view all content" ON public.content_sections_2026_01_01_12_00
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Admin users can manage content" ON public.content_sections_2026_01_01_12_00
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Admin users can update content" ON public.content_sections_2026_01_01_12_00
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Admin users can delete content" ON public.content_sections_2026_01_01_12_00
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'admin') AND au.is_active = true
        )
    );

-- Create RLS policies for media_assets
CREATE POLICY "Anyone can view active media" ON public.media_assets_2026_01_01_12_00
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin users can view all media" ON public.media_assets_2026_01_01_12_00
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Admin users can upload media" ON public.media_assets_2026_01_01_12_00
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Admin users can update media" ON public.media_assets_2026_01_01_12_00
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "Admin users can delete media" ON public.media_assets_2026_01_01_12_00
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'admin') AND au.is_active = true
        )
    );

-- Create RLS policies for site_settings
CREATE POLICY "Anyone can view site settings" ON public.site_settings_2026_01_01_12_00
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