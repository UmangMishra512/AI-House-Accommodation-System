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

    const { propertyId } = await req.json();
    if (!propertyId) throw new Error("propertyId is required");

    // Fetch property
    const { data: property, error: fetchErr } = await supabase
      .from("properties")
      .select("title, description, location, price, ai_description, owner_name")
      .eq("id", propertyId)
      .single();

    if (fetchErr || !property) throw new Error("Property not found");

    // Build text for embedding
    const text = [
      property.title,
      property.description,
      property.ai_description || "",
      property.location,
      `Rent ₹${property.price}`,
      property.owner_name ? `Listed by ${property.owner_name}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    // Generate embedding
    const embResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
        }),
      }
    );

    const embData = await embResp.json();

    if (embData.error) {
      throw new Error(embData.error.message || "Embedding API error");
    }

    const embedding = embData.embedding?.values;
    if (!embedding) throw new Error("Failed to generate embedding");

    // Store embedding
    const { error: updateErr } = await supabase
      .from("properties")
      .update({ embedding })
      .eq("id", propertyId);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
