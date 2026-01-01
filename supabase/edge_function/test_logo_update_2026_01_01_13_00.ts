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
      const { logoUrl } = await req.json()
      
      console.log('Updating logo to:', logoUrl)
      
      // Update the general settings with new logo
      const { data, error } = await supabaseClient
        .from('site_settings_2026_01_01_12_00')
        .update({
          setting_value: {
            logoUrl: logoUrl,
            logoWhiteUrl: logoUrl,
            siteName: "SPACE",
            tagline: "Organizing Exhibitions & Conferences"
          }
        })
        .eq('setting_key', 'general')
        .select()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Update result:', data)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Logo updated successfully',
          data: data 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'GET') {
      // Get current settings
      const { data, error } = await supabaseClient
        .from('site_settings_2026_01_01_12_00')
        .select('*')

      if (error) throw error

      return new Response(
        JSON.stringify({ 
          success: true, 
          settings: data 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})