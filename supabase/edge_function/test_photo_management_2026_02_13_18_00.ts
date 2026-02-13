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

    // Test media management functionality
    console.log('Testing photo management functionality...')

    // 1. Check storage bucket
    const { data: buckets, error: bucketError } = await supabaseClient.storage.listBuckets()
    if (bucketError) throw bucketError

    const spaceBucket = buckets.find(b => b.id === 'space-media')
    console.log('Storage bucket exists:', !!spaceBucket)

    // 2. Check media assets table
    const { data: mediaAssets, error: mediaError } = await supabaseClient
      .from('media_assets_2026_01_01_12_00')
      .select('*')
      .limit(5)

    if (mediaError) throw mediaError
    console.log('Media assets count:', mediaAssets?.length || 0)

    // 3. Check content sections
    const { data: contentSections, error: contentError } = await supabaseClient
      .from('content_sections_2026_01_01_12_00')
      .select('section_key, content')

    if (contentError) throw contentError
    console.log('Content sections count:', contentSections?.length || 0)

    // 4. Test media management edge function
    const { data: mediaManagementTest, error: mediaManagementError } = await supabaseClient.functions.invoke('media_management_2026_02_13_18_00', {
      body: { action: 'get_media_usage' }
    })

    console.log('Media management function test:', mediaManagementTest ? 'SUCCESS' : 'FAILED')
    if (mediaManagementError) {
      console.log('Media management error:', mediaManagementError)
    }

    // 5. Check site settings
    const { data: siteSettings, error: settingsError } = await supabaseClient
      .from('site_settings_2026_01_01_12_00')
      .select('*')

    if (settingsError) throw settingsError
    console.log('Site settings count:', siteSettings?.length || 0)

    const testResults = {
      storage_bucket_exists: !!spaceBucket,
      media_assets_count: mediaAssets?.length || 0,
      content_sections_count: contentSections?.length || 0,
      site_settings_count: siteSettings?.length || 0,
      media_management_function: mediaManagementTest ? 'working' : 'failed',
      media_management_error: mediaManagementError?.message || null,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Photo management functionality test completed',
        results: testResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Test error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})