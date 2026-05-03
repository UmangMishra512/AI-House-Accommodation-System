import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { propertyId, question } = await req.json();
    if (!propertyId || !question) {
      throw new Error("propertyId and question are required");
    }

    // Fetch property details
    const { data: property, error: fetchErr } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (fetchErr || !property) {
      throw new Error("Property not found");
    }

    // Build property context
    const context = `
PROPERTY DETAILS:
- Title: ${property.title}
- Location: ${property.location}
- Monthly Rent: ₹${Number(property.price).toLocaleString("en-IN")}
- Description: ${property.description}
${property.ai_description ? `- AI-Generated Details: ${property.ai_description}` : ""}
- Owner: ${property.owner_name || "Not specified"}
- Phone: ${property.phone_number || "Not specified"}
- Email: ${property.email || "Not specified"}
- Coordinates: ${property.lat}, ${property.lng}
`.trim();

    // Get nearby places info via Nominatim
    let nearbyInfo = "";
    if (property.lat && property.lng) {
      try {
        const nominatimResp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${property.lat}&lon=${property.lng}&zoom=16&addressdetails=1`,
          { headers: { "User-Agent": "AIAccommodate/1.0" } }
        );
        const nominatimData = await nominatimResp.json();
        if (nominatimData.address) {
          const addr = nominatimData.address;
          nearbyInfo = `
AREA INFO:
- Neighborhood: ${addr.suburb || addr.neighbourhood || "N/A"}
- City: ${addr.city || addr.town || addr.village || "N/A"}
- State: ${addr.state || "N/A"}
- Postcode: ${addr.postcode || "N/A"}`;
        }
      } catch (e) {
        console.error("Nominatim error:", e);
      }
    }

    const systemPrompt = `You are a helpful AI assistant for this specific property listing on AI Accommodate, an Indian property platform. 

${context}
${nearbyInfo}

RULES:
- Answer the tenant's question using ONLY the property information above
- If you genuinely don't know something, say "I don't have that information. Please contact the owner directly."
- Be concise, friendly, and helpful
- Use ₹ for prices, use Indian context
- Keep answers to 2-3 sentences max
- Never make up information not in the property details`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "I understand. I'll answer questions about this specific property using only the information provided." }] },
            { role: "user", parts: [{ text: question }] },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    const geminiData = await geminiResp.json();

    if (geminiData.error) {
      throw new Error(geminiData.error.message || "Gemini API error");
    }

    const answer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process your question. Please try again.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
