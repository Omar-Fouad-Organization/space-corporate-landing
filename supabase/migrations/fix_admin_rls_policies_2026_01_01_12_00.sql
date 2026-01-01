-- Fix RLS policies for admin authentication
-- Current time: 2026-01-01 12:00 UTC

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can view all admin users" ON public.admin_users_2026_01_01_12_00;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.admin_users_2026_01_01_12_00;
DROP POLICY IF EXISTS "Admins can manage editors" ON public.admin_users_2026_01_01_12_00;

-- Create simpler, working policies
-- Allow users to view their own admin record for authentication
CREATE POLICY "Users can view their own admin record" ON public.admin_users_2026_01_01_12_00
    FOR SELECT USING (user_id = auth.uid());

-- Allow authenticated users to view admin users (needed for admin dashboard)
CREATE POLICY "Authenticated users can view admin users" ON public.admin_users_2026_01_01_12_00
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow super admins to manage all users
CREATE POLICY "Super admins can manage all users" ON public.admin_users_2026_01_01_12_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
        )
    );

-- Allow admins to manage editors
CREATE POLICY "Admins can manage editors" ON public.admin_users_2026_01_01_12_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_2026_01_01_12_00 au
            WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'admin') AND au.is_active = true
        )
        AND (role = 'editor' OR user_id = auth.uid())
    );

-- Allow users to update their own last_login
CREATE POLICY "Users can update their own last login" ON public.admin_users_2026_01_01_12_00
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());