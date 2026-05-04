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

    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    // Fetch the image
    const imgResp = await fetch(imageUrl);
    const imgBuffer = await imgResp.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
    const mimeType = imgResp.headers.get("content-type") || "image/jpeg";

    // Ask Gemini to analyze the photo quality
    const prompt = `You are a professional real estate photography expert. Analyze this property photo and provide enhancement recommendations.

Return ONLY a valid JSON object with these exact fields (no markdown, no code blocks, just raw JSON):
{
  "brightness": <number 0.8-1.5, where 1.0 is no change>,
  "contrast": <number 0.8-1.4, where 1.0 is no change>,
  "saturate": <number 0.8-1.4, where 1.0 is no change>,
  "warmth": <number -10 to 10, where 0 is no change, positive adds warmth>,
  "quality_score": <number 1-100, overall photo quality>,
  "issues": <array of strings, max 3 issues like "too dark", "low contrast", "washed out colors">
}

Be conservative with adjustments. Only suggest changes if the photo genuinely needs improvement.`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: base64 } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    const geminiData = await geminiResp.json();

    if (geminiData.error) {
      throw new Error(geminiData.error.message || "Gemini API error");
    }

    const rawText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (handle potential markdown wrapping)
    let enhancements;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      enhancements = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      enhancements = null;
    }

    if (!enhancements) {
      // Default safe enhancements
      enhancements = {
        brightness: 1.1,
        contrast: 1.05,
        saturate: 1.1,
        warmth: 3,
        quality_score: 50,
        issues: ["Could not analyze photo"],
      };
    }

    return new Response(JSON.stringify(enhancements), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
