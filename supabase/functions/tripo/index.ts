import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, imageUrl, taskId } = await req.json()
    const API_KEY = Deno.env.get('TRIPO_API_KEY')
    
    if (!API_KEY) {
      throw new Error("Missing TRIPO_API_KEY. Set it via Supabase secrets.")
    }

    if (action === 'generate') {
      if (!imageUrl) throw new Error("imageUrl is required");

      // 1. Fetch image from the provided URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        const errText = await imageResponse.text();
        throw new Error(`Failed to download image from URL: ${imageResponse.status} ${errText}`);
      }
      
      const arrayBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      
      // Use File instead of Blob so Deno FormData correctly sets filename and content-type
      const file = new File([arrayBuffer], "image.jpg", { type: contentType });
      
      // 2. Upload to Tripo
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('https://api.tripo3d.ai/v2/openapi/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        },
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      console.log("Upload Data:", JSON.stringify(uploadData));
      
      if (uploadData.code !== 0) {
        throw new Error("Upload failed: " + JSON.stringify(uploadData));
      }
      const imageToken = uploadData.data.image_token;
      
      // 3. Start Task
      const taskRes = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: "image_to_model",
          file: {
            type: "jpg",
            file_token: imageToken
          }
        })
      });
      
      const taskData = await taskRes.json();
      console.log("Task Data:", JSON.stringify(taskData));
      
      if (taskData.code !== 0) {
         throw new Error("Task creation failed: " + JSON.stringify(taskData));
      }

      return new Response(
        JSON.stringify({ taskId: taskData.data.task_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    
    if (action === 'status') {
      if (!taskId) throw new Error("taskId is required");

      const statusRes = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      const statusData = await statusRes.json();
      if (statusData.code !== 0) {
        throw new Error("Status check failed: " + JSON.stringify(statusData));
      }

      const status = statusData.data.status; // 'running', 'success', 'failed'
      
      // Tripo typically puts the result under result.model.url
      let modelUrl = null;
      if (status === 'success') {
         modelUrl = statusData.data.result?.model?.url || statusData.data.output?.model;
      }
      
      return new Response(
        JSON.stringify({ status, modelUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error("Invalid action. Must be 'generate' or 'status'.");

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
