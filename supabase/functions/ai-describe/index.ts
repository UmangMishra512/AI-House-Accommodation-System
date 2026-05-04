import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not set");

    const { imageUrls } = await req.json();
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error("No image URLs provided");
    }

    // Build parts array with images
    const parts: any[] = [];

    // Add up to 3 images
    for (const url of imageUrls.slice(0, 3)) {
      try {
        const imgResp = await fetch(url);
        const imgBuffer = await imgResp.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
        const mimeType = imgResp.headers.get("content-type") || "image/jpeg";
        parts.push({
          inline_data: { mime_type: mimeType, data: base64 },
        });
      } catch (e) {
        console.error("Failed to fetch image:", url, e);
      }
    }

    if (parts.length === 0) throw new Error("Could not fetch any images");

    // Add text prompt
    parts.push({
      text: `You are an expert Indian real estate listing copywriter. Analyze these property images carefully and write a compelling, professional property description.

Requirements:
- Write 3-4 paragraphs in English
- Mention specific visible features: flooring type, kitchen style, balcony, view, furnishing level, room size, natural lighting, paint condition, fixtures
- Use a warm, inviting tone that appeals to potential tenants/buyers
- Mention practical aspects: ventilation, storage, layout flow
- Do NOT make up amenities you cannot see in the images
- Do NOT include any price or location references
- Start directly with the description, no titles or headers`,
    });

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const geminiData = await geminiResp.json();

    if (geminiData.error) {
      throw new Error(geminiData.error.message || "Gemini API error");
    }

    const description =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
