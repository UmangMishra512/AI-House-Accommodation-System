import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: corsHeaders })
    }

    // Use a browser-like User-Agent so Google returns full content
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }

    // Fetch the URL with redirect: 'follow'
    const response = await fetch(url, { redirect: 'follow', headers })
    const finalUrl = response.url
    
    // Also read the HTML body and try to extract coordinates from it
    let lat = null
    let lng = null
    
    try {
      const body = await response.text()
      
      // Try multiple patterns to find coordinates in the page content
      // Pattern: @lat,lng in any embedded URL
      const atMatch = body.match(/@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/)
      // Pattern: !3dlat!4dlng
      const bangMatch = body.match(/!3d(-?\d+\.\d{4,})!4d(-?\d+\.\d{4,})/)
      // Pattern: center=lat%2Clng or center=lat,lng
      const centerMatch = body.match(/center=(-?\d+\.\d{4,})%2C(-?\d+\.\d{4,})/) ||
                          body.match(/center=(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/)
      // Pattern: "latitude":num,"longitude":num
      const jsonMatch = body.match(/"latitude"\s*:\s*(-?\d+\.\d{4,})\s*,\s*"longitude"\s*:\s*(-?\d+\.\d{4,})/)
      // Pattern: ll=lat,lng
      const llMatch = body.match(/ll=(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/)
      // Pattern: sll=lat,lng 
      const sllMatch = body.match(/sll=(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/)
      // Pattern: [null,null,lat,lng] common in Google's JS data
      const arrayMatch = body.match(/\[null,null,(-?\d+\.\d{4,}),(-?\d+\.\d{4,})\]/)
      
      const coordMatch = atMatch || bangMatch || centerMatch || jsonMatch || llMatch || sllMatch || arrayMatch
      if (coordMatch) {
        lat = parseFloat(coordMatch[1])
        lng = parseFloat(coordMatch[2])
      }
    } catch (_) {
      // If body parsing fails, that's OK - we still have finalUrl
    }

    return new Response(JSON.stringify({ finalUrl, lat, lng }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
