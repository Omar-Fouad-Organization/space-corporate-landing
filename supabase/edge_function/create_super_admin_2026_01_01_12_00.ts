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
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'om301208@gmail.com',
      password: '123456789',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user', details: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Auth user created:', authData.user.id)

    // Add to admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users_2026_01_01_12_00')
      .insert({
        user_id: authData.user.id,
        email: 'om301208@gmail.com',
        role: 'super_admin',
        full_name: 'Super Admin',
        is_active: true
      })
      .select()

    if (adminError) {
      console.error('Admin table error:', adminError)
      return new Response(
        JSON.stringify({ error: 'Failed to create admin user', details: adminError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin user created:', adminData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super Admin user created successfully',
        user_id: authData.user.id,
        email: 'om301208@gmail.com',
        role: 'super_admin'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})