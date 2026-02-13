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

    if (req.method === 'POST') {
      const { action, data } = await req.json()

      if (action === 'generate_sitemap') {
        // Generate XML sitemap
        const { data: contentSections } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('section_key, updated_at')
          .eq('is_published', true)

        const baseUrl = 'https://space-corporate-landing.com' // Replace with actual domain
        const currentDate = new Date().toISOString().split('T')[0]
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`

        if (contentSections) {
          contentSections.forEach(section => {
            if (section.section_key !== 'home') {
              const lastmod = new Date(section.updated_at).toISOString().split('T')[0]
              sitemap += `
  <url>
    <loc>${baseUrl}/#${section.section_key}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
            }
          })
        }

        sitemap += `
</urlset>`

        return new Response(
          JSON.stringify({ 
            success: true,
            sitemap: sitemap,
            generated_at: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'generate_robots') {
        // Generate robots.txt
        const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://space-corporate-landing.com/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /#/admin/`

        return new Response(
          JSON.stringify({ 
            success: true,
            robots_txt: robotsTxt
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'optimize_content') {
        // Content optimization suggestions
        const { data: contentSections } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('*')
          .eq('is_published', true)

        const optimizations = []

        if (contentSections) {
          contentSections.forEach(section => {
            const content = section.content
            
            // Check content length
            if (content.description && content.description.length < 100) {
              optimizations.push({
                section: section.section_name,
                type: 'content_length',
                issue: 'Content too short',
                suggestion: 'Expand content to at least 100 characters for better SEO',
                priority: 'medium'
              })
            }

            // Check for keywords
            if (content.title && !content.title.toLowerCase().includes('event')) {
              optimizations.push({
                section: section.section_name,
                type: 'keywords',
                issue: 'Missing target keywords',
                suggestion: 'Consider including relevant keywords like "event", "exhibition", "conference"',
                priority: 'high'
              })
            }

            // Check for call-to-action
            if (content.description && !content.description.toLowerCase().includes('contact')) {
              optimizations.push({
                section: section.section_name,
                type: 'cta',
                issue: 'Missing call-to-action',
                suggestion: 'Add clear call-to-action phrases to encourage user engagement',
                priority: 'low'
              })
            }
          })
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            optimizations: optimizations,
            total_sections: contentSections?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'performance_audit') {
        // Performance audit recommendations
        const { data: mediaAssets } = await supabaseClient
          .from('media_assets_2026_01_01_12_00')
          .select('*')
          .eq('is_active', true)

        const performanceIssues = []
        let totalSize = 0

        if (mediaAssets) {
          mediaAssets.forEach(asset => {
            totalSize += asset.file_size || 0
            
            // Large images
            if (asset.file_type?.startsWith('image/') && asset.file_size > 1024 * 1024) {
              performanceIssues.push({
                type: 'large_image',
                file: asset.file_name,
                size_mb: Math.round(asset.file_size / (1024 * 1024) * 100) / 100,
                recommendation: 'Compress image to improve page load speed',
                impact: 'high'
              })
            }

            // Unoptimized formats
            if (asset.file_type === 'image/png' && asset.file_size > 500 * 1024) {
              performanceIssues.push({
                type: 'format_optimization',
                file: asset.file_name,
                recommendation: 'Consider converting to WebP format for better compression',
                impact: 'medium'
              })
            }
          })
        }

        // Overall recommendations
        const recommendations = [
          {
            category: 'Images',
            suggestion: 'Implement lazy loading for images below the fold',
            impact: 'high'
          },
          {
            category: 'Caching',
            suggestion: 'Enable browser caching for static assets',
            impact: 'high'
          },
          {
            category: 'Minification',
            suggestion: 'Minify CSS and JavaScript files',
            impact: 'medium'
          },
          {
            category: 'CDN',
            suggestion: 'Use a Content Delivery Network for global performance',
            impact: 'high'
          }
        ]

        return new Response(
          JSON.stringify({ 
            success: true,
            performance_issues: performanceIssues,
            recommendations: recommendations,
            total_media_size_mb: Math.round(totalSize / (1024 * 1024) * 100) / 100,
            audit_date: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'generate_meta_tags') {
        // Generate meta tags for each section
        const { data: contentSections } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('*')
          .eq('is_published', true)

        const metaTags = {}

        if (contentSections) {
          contentSections.forEach(section => {
            const content = section.content
            
            metaTags[section.section_key] = {
              title: content.title || 'SPACE - Organizing Exhibitions & Conferences',
              description: content.meta_description || content.description?.substring(0, 160) || 'Premier event management company specializing in exhibitions and conferences.',
              keywords: content.keywords || 'events, exhibitions, conferences, event management, Dubai, UAE',
              og_title: content.og_title || content.title || 'SPACE - Organizing Exhibitions & Conferences',
              og_description: content.og_description || content.description?.substring(0, 160) || 'Premier event management company specializing in exhibitions and conferences.',
              og_image: content.og_image || content.hero_image || '/images/hero_background_20260101_120022.png',
              twitter_card: 'summary_large_image',
              twitter_title: content.twitter_title || content.title || 'SPACE - Organizing Exhibitions & Conferences',
              twitter_description: content.twitter_description || content.description?.substring(0, 160) || 'Premier event management company specializing in exhibitions and conferences.'
            }
          })
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            meta_tags: metaTags,
            generated_at: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const action = url.searchParams.get('action')

      if (action === 'seo_score') {
        // Calculate SEO score
        const { data: contentSections } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('*')
          .eq('is_published', true)

        let score = 0
        let maxScore = 0
        const issues = []

        if (contentSections) {
          contentSections.forEach(section => {
            const content = section.content
            
            // Title check (10 points)
            maxScore += 10
            if (content.title && content.title.length > 0 && content.title.length <= 60) {
              score += 10
            } else {
              issues.push(`${section.section_name}: Title missing or too long`)
            }

            // Meta description check (15 points)
            maxScore += 15
            if (content.meta_description && content.meta_description.length >= 120 && content.meta_description.length <= 160) {
              score += 15
            } else {
              issues.push(`${section.section_name}: Meta description missing or wrong length`)
            }

            // Content length check (10 points)
            maxScore += 10
            if (content.description && content.description.length >= 100) {
              score += 10
            } else {
              issues.push(`${section.section_name}: Content too short`)
            }

            // Image alt text check (10 points)
            maxScore += 10
            if (!content.hero_image || content.hero_image_alt) {
              score += 10
            } else {
              issues.push(`${section.section_name}: Image missing alt text`)
            }

            // Keywords check (5 points)
            maxScore += 5
            if (content.keywords || (content.title && content.title.toLowerCase().includes('event'))) {
              score += 5
            } else {
              issues.push(`${section.section_name}: Missing target keywords`)
            }
          })
        }

        const seoScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

        return new Response(
          JSON.stringify({ 
            success: true,
            seo_score: seoScore,
            score_breakdown: {
              current: score,
              maximum: maxScore
            },
            issues: issues,
            grade: seoScore >= 90 ? 'A' : seoScore >= 80 ? 'B' : seoScore >= 70 ? 'C' : seoScore >= 60 ? 'D' : 'F'
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
    console.error('SEO/Performance error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})