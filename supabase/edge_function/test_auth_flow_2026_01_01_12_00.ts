import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with anon key (same as frontend)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'om301208@gmail.com',
      password: '123456789'
    })

    if (authError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          step: 'auth_signin',
          error: authError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test admin user lookup
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users_2026_01_01_12_00')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('is_active', true)
      .single()

    if (adminError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          step: 'admin_lookup',
          user_id: authData.user.id,
          error: adminError.message,
          details: adminError
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sign out after test
    await supabase.auth.signOut()

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Authentication test successful',
        user: {
          id: authData.user.id,
          email: authData.user.email
        },
        admin_user: {
          id: adminUser.id,
          role: adminUser.role,
          is_active: adminUser.is_active,
          email: adminUser.email
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        step: 'unexpected_error',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})