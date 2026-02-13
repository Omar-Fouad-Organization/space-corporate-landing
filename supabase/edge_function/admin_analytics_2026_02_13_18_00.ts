import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const action = url.searchParams.get('action')

      if (action === 'analytics') {
        // Get comprehensive analytics data
        const analytics = {
          content: {
            total_sections: 0,
            published_sections: 0,
            draft_sections: 0,
            last_updated: null
          },
          media: {
            total_assets: 0,
            total_size_mb: 0,
            categories: {},
            recent_uploads: []
          },
          users: {
            total_admins: 0,
            active_admins: 0,
            recent_logins: []
          },
          system: {
            database_health: 'good',
            storage_usage: 0,
            last_backup: null
          }
        }

        // Content analytics
        const { data: contentSections } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('*')

        if (contentSections) {
          analytics.content.total_sections = contentSections.length
          analytics.content.published_sections = contentSections.filter(s => s.is_published).length
          analytics.content.draft_sections = contentSections.filter(s => !s.is_published).length
          analytics.content.last_updated = contentSections
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]?.updated_at
        }

        // Media analytics
        const { data: mediaAssets } = await supabaseClient
          .from('media_assets_2026_01_01_12_00')
          .select('*')
          .eq('is_active', true)

        if (mediaAssets) {
          analytics.media.total_assets = mediaAssets.length
          analytics.media.total_size_mb = Math.round(
            mediaAssets.reduce((sum, asset) => sum + (asset.file_size || 0), 0) / (1024 * 1024)
          )
          
          // Category breakdown
          const categories = {}
          mediaAssets.forEach(asset => {
            categories[asset.category] = (categories[asset.category] || 0) + 1
          })
          analytics.media.categories = categories
          
          // Recent uploads (last 10)
          analytics.media.recent_uploads = mediaAssets
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10)
            .map(asset => ({
              file_name: asset.file_name,
              category: asset.category,
              size_kb: Math.round(asset.file_size / 1024),
              created_at: asset.created_at
            }))
        }

        // User analytics
        const { data: adminUsers } = await supabaseClient
          .from('admin_users_2026_01_01_12_00')
          .select('*')

        if (adminUsers) {
          analytics.users.total_admins = adminUsers.length
          analytics.users.active_admins = adminUsers.filter(u => u.is_active).length
          analytics.users.recent_logins = adminUsers
            .filter(u => u.last_login)
            .sort((a, b) => new Date(b.last_login).getTime() - new Date(a.last_login).getTime())
            .slice(0, 5)
            .map(user => ({
              email: user.email,
              role: user.role,
              last_login: user.last_login
            }))
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            analytics: analytics,
            generated_at: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'backup') {
        // Create a backup of critical data
        const backup = {
          timestamp: new Date().toISOString(),
          content_sections: [],
          site_settings: [],
          media_assets: [],
          admin_users: []
        }

        // Backup content sections
        const { data: content } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('*')
        backup.content_sections = content || []

        // Backup site settings
        const { data: settings } = await supabaseClient
          .from('site_settings_2026_01_01_12_00')
          .select('*')
        backup.site_settings = settings || []

        // Backup media assets (metadata only)
        const { data: media } = await supabaseClient
          .from('media_assets_2026_01_01_12_00')
          .select('*')
          .eq('is_active', true)
        backup.media_assets = media || []

        // Backup admin users (without sensitive data)
        const { data: users } = await supabaseClient
          .from('admin_users_2026_01_01_12_00')
          .select('id, email, role, full_name, is_active, created_at, last_login')
        backup.admin_users = users || []

        return new Response(
          JSON.stringify({ 
            success: true,
            backup: backup,
            message: 'Backup created successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'health') {
        // System health check
        const health = {
          database: 'healthy',
          storage: 'healthy',
          functions: 'healthy',
          overall: 'healthy',
          checks: []
        }

        try {
          // Test database connection
          const { data: testQuery } = await supabaseClient
            .from('content_sections_2026_01_01_12_00')
            .select('count')
            .limit(1)
          
          health.checks.push({
            component: 'Database',
            status: 'healthy',
            message: 'Database connection successful'
          })
        } catch (error) {
          health.database = 'unhealthy'
          health.overall = 'degraded'
          health.checks.push({
            component: 'Database',
            status: 'unhealthy',
            message: error.message
          })
        }

        try {
          // Test storage
          const { data: buckets } = await supabaseClient.storage.listBuckets()
          const spaceBucket = buckets?.find(b => b.id === 'space-media')
          
          if (spaceBucket) {
            health.checks.push({
              component: 'Storage',
              status: 'healthy',
              message: 'Storage bucket accessible'
            })
          } else {
            health.storage = 'degraded'
            health.checks.push({
              component: 'Storage',
              status: 'warning',
              message: 'Storage bucket not found'
            })
          }
        } catch (error) {
          health.storage = 'unhealthy'
          health.overall = 'degraded'
          health.checks.push({
            component: 'Storage',
            status: 'unhealthy',
            message: error.message
          })
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            health: health,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'POST') {
      const { action, data } = await req.json()

      if (action === 'optimize_images') {
        // Image optimization recommendations
        const { data: mediaAssets } = await supabaseClient
          .from('media_assets_2026_01_01_12_00')
          .select('*')
          .eq('is_active', true)
          .eq('file_type', 'image/jpeg')

        const recommendations = []
        
        if (mediaAssets) {
          mediaAssets.forEach(asset => {
            if (asset.file_size > 1024 * 1024) { // > 1MB
              recommendations.push({
                file_name: asset.file_name,
                current_size_mb: Math.round(asset.file_size / (1024 * 1024) * 100) / 100,
                recommendation: 'Consider compressing this image to improve loading speed',
                priority: 'high'
              })
            } else if (asset.file_size > 500 * 1024) { // > 500KB
              recommendations.push({
                file_name: asset.file_name,
                current_size_mb: Math.round(asset.file_size / (1024 * 1024) * 100) / 100,
                recommendation: 'This image could benefit from optimization',
                priority: 'medium'
              })
            }
          })
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            recommendations: recommendations,
            total_images: mediaAssets?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'seo_audit') {
        // SEO audit of content
        const { data: contentSections } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('*')
          .eq('is_published', true)

        const seoIssues = []
        
        if (contentSections) {
          contentSections.forEach(section => {
            const content = section.content
            
            // Check for missing meta descriptions
            if (!content.meta_description || content.meta_description.length < 120) {
              seoIssues.push({
                section: section.section_name,
                issue: 'Meta description missing or too short',
                recommendation: 'Add a meta description of 120-160 characters',
                severity: 'medium'
              })
            }
            
            // Check for missing alt text on images
            if (content.hero_image && !content.hero_image_alt) {
              seoIssues.push({
                section: section.section_name,
                issue: 'Image missing alt text',
                recommendation: 'Add descriptive alt text for accessibility and SEO',
                severity: 'high'
              })
            }
            
            // Check title length
            if (content.title && content.title.length > 60) {
              seoIssues.push({
                section: section.section_name,
                issue: 'Title too long for search results',
                recommendation: 'Keep titles under 60 characters',
                severity: 'low'
              })
            }
          })
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            seo_issues: seoIssues,
            total_sections_audited: contentSections?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Analytics error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})