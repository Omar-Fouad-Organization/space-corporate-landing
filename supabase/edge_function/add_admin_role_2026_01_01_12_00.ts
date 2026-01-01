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

    // Find the user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to find user', details: userError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const targetUser = users.users.find(user => user.email === 'om301208@gmail.com')
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found with email om301208@gmail.com' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found user:', targetUser.id)

    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users_2026_01_01_12_00')
      .select('*')
      .eq('user_id', targetUser.id)
      .single()

    if (existingAdmin) {
      // Update existing admin user
      const { data: updateData, error: updateError } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .update({
          role: 'super_admin',
          is_active: true,
          full_name: 'Super Admin'
        })
        .eq('user_id', targetUser.id)
        .select()

      if (updateError) {
        console.error('Update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update admin role', details: updateError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User updated to Super Admin successfully',
          user_id: targetUser.id,
          email: 'om301208@gmail.com',
          role: 'super_admin',
          action: 'updated'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Create new admin user entry
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .insert({
          user_id: targetUser.id,
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

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Super Admin role added successfully',
          user_id: targetUser.id,
          email: 'om301208@gmail.com',
          role: 'super_admin',
          action: 'created'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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