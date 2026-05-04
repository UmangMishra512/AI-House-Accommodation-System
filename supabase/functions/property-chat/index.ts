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
- Amenities: ${Array.isArray(property.amenities) ? property.amenities.join(", ") : "Not specified"}
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
        if (nominatimResp.ok) {
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
        }
      } catch (e) {
        console.error("Nominatim error:", e);
      }
    }

    const systemPrompt = `You are a helpful AI assistant and Rent Negotiation Coach for this specific property listing on AI Accommodate, an Indian property platform. 

${context}
${nearbyInfo}

RULES:
- Answer the tenant's question using ONLY the property information above.
- If you genuinely don't know something, say "I don't have that information. Please contact the owner directly."
- Be concise, friendly, and helpful.
- Use ₹ for prices, use Indian context.
- Keep answers to 3-4 sentences max.
- Never make up information not in the property details.

RENT NEGOTIATION COACHING RULES:
- If the user asks for tips on negotiating the rent, evaluating if the rent is fair, or how to talk to the landlord, act as an expert Rent Negotiation Coach.
- Provide actionable, polite, and data-driven negotiation strategies suitable for the Indian real estate market.
- Use the property's price, amenities, and area information to give specific advice.
- Suggest polite phrases the user can use to negotiate.`;

    const geminiBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        { role: "user", parts: [{ text: question }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    if (!geminiResp.ok) {
      const errorData = await geminiResp.json();
      console.error("Gemini API Error:", errorData);
      
      if (errorData.error?.message?.includes("quota") || geminiResp.status === 429) {
        return new Response(JSON.stringify({ 
          answer: "I'm a bit busy right now (quota limit reached). Please try again in about 60 seconds!" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(errorData.error?.message || `Gemini API returned ${geminiResp.status}`);
    }

    const geminiData = await geminiResp.json();

    const answer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process your question. Please try again.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
