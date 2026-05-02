import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const TRIPO_API_KEY = Deno.env.get('TRIPO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    if (req.method === 'POST') {
      const { imageUrl, propertyId } = await req.json()

      if (!imageUrl) {
        return new Response(JSON.stringify({ error: 'Image URL is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Start Tripo AI Task
      const response = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TRIPO_API_KEY}`,
        },
        body: JSON.stringify({
          type: 'image_to_model',
          file: {
            type: imageUrl.split('.').pop() || 'jpg',
            url: imageUrl,
          },
        }),
      })

      const tripoData = await response.json()

      if (tripoData.code !== 0) {
        return new Response(JSON.stringify({ error: tripoData.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ taskId: tripoData.data.task_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const taskId = url.searchParams.get('taskId')
      const propertyId = url.searchParams.get('propertyId')

      if (!taskId) {
        return new Response(JSON.stringify({ error: 'Task ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Check Tripo AI Status
      const response = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`,
        },
      })

      const tripoData = await response.json()

      if (tripoData.code !== 0) {
        return new Response(JSON.stringify({ error: tripoData.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const status = tripoData.data.status
      let modelUrl = null

      if (status === 'success') {
        // The model URL is usually in outputs
        modelUrl = tripoData.data.output.model // Adjust based on actual API response structure
        
        // Update Supabase Database if propertyId is provided
        if (propertyId && modelUrl) {
          await supabase
            .from('properties')
            .update({ ai_model_url: modelUrl })
            .eq('id', propertyId)
        }
      }

      return new Response(JSON.stringify({ status, modelUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method not allowed', { status: 405 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
