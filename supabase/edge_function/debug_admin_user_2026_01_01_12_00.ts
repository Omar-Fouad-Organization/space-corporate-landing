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

    // Find the user by email in Auth
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Failed to list users', details: userError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const targetUser = users.users.find(user => user.email === 'om301208@gmail.com')
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found in Auth', email: 'om301208@gmail.com' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check admin_users table
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users_2026_01_01_12_00')
      .select('*')
      .eq('user_id', targetUser.id)

    // Also check all admin users
    const { data: allAdminUsers, error: allAdminError } = await supabase
      .from('admin_users_2026_01_01_12_00')
      .select('*')

    return new Response(
      JSON.stringify({ 
        success: true,
        auth_user: {
          id: targetUser.id,
          email: targetUser.email,
          created_at: targetUser.created_at
        },
        admin_user_lookup: {
          data: adminUsers,
          error: adminError?.message || null
        },
        all_admin_users: {
          data: allAdminUsers,
          error: allAdminError?.message || null,
          count: allAdminUsers?.length || 0
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})