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
      const { action, mediaId, newImageUrl, sectionKey, imageField } = await req.json()
      
      console.log('Media management action:', action, { mediaId, newImageUrl, sectionKey, imageField })
      
      if (action === 'update_content_image') {
        // Update content section with new image
        const { data: currentContent, error: fetchError } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('content')
          .eq('section_key', sectionKey)
          .single()

        if (fetchError) throw fetchError

        // Update the specific image field in content
        const updatedContent = {
          ...currentContent.content,
          [imageField]: newImageUrl
        }

        const { error: updateError } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .update({ 
            content: updatedContent,
            version: supabaseClient.sql`version + 1`,
            updated_at: new Date().toISOString()
          })
          .eq('section_key', sectionKey)

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Content image updated successfully',
            updatedContent: updatedContent
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'replace_website_image') {
        // Replace image across multiple content sections
        const { data: sections, error: fetchError } = await supabaseClient
          .from('content_sections_2026_01_01_12_00')
          .select('*')

        if (fetchError) throw fetchError

        const updates = []
        
        // Find and update all sections that use the old image
        for (const section of sections) {
          let needsUpdate = false
          let updatedContent = { ...section.content }
          
          // Check common image fields
          const imageFields = ['hero_image', 'featured_image', 'background_image', 'image_url']
          
          for (const field of imageFields) {
            if (updatedContent[field] === mediaId) {
              updatedContent[field] = newImageUrl
              needsUpdate = true
            }
          }
          
          // Check items array for images
          if (updatedContent.items && Array.isArray(updatedContent.items)) {
            updatedContent.items = updatedContent.items.map(item => {
              if (item.image === mediaId || item.imageUrl === mediaId) {
                return { ...item, image: newImageUrl, imageUrl: newImageUrl }
              }
              return item
            })
            needsUpdate = true
          }
          
          if (needsUpdate) {
            updates.push({
              section_key: section.section_key,
              content: updatedContent
            })
          }
        }

        // Apply all updates
        for (const update of updates) {
          const { error } = await supabaseClient
            .from('content_sections_2026_01_01_12_00')
            .update({ 
              content: update.content,
              version: supabaseClient.sql`version + 1`,
              updated_at: new Date().toISOString()
            })
            .eq('section_key', update.section_key)

          if (error) throw error
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Updated ${updates.length} content sections with new image`,
            updatedSections: updates.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get media usage across content sections
      const { data: sections, error } = await supabaseClient
        .from('content_sections_2026_01_01_12_00')
        .select('section_key, section_name, content')

      if (error) throw error

      const mediaUsage = {}
      
      sections.forEach(section => {
        const content = section.content
        const imageFields = ['hero_image', 'featured_image', 'background_image', 'image_url']
        
        imageFields.forEach(field => {
          if (content[field]) {
            if (!mediaUsage[content[field]]) {
              mediaUsage[content[field]] = []
            }
            mediaUsage[content[field]].push({
              section: section.section_key,
              field: field
            })
          }
        })
        
        // Check items array
        if (content.items && Array.isArray(content.items)) {
          content.items.forEach((item, index) => {
            if (item.image || item.imageUrl) {
              const imageUrl = item.image || item.imageUrl
              if (!mediaUsage[imageUrl]) {
                mediaUsage[imageUrl] = []
              }
              mediaUsage[imageUrl].push({
                section: section.section_key,
                field: `items[${index}].image`
              })
            }
          })
        }
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          mediaUsage: mediaUsage
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Media management error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})