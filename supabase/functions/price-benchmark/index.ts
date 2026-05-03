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

    const { lat, lng, price, radius_km = 5 } = await req.json();
    if (!lat || !lng || !price) {
      throw new Error("lat, lng, and price are required");
    }

    // Query properties within radius using Haversine approximation
    // 1 degree latitude ≈ 111km
    const latDelta = radius_km / 111;
    const lngDelta = radius_km / (111 * Math.cos((lat * Math.PI) / 180));

    const { data: nearby, error } = await supabase
      .from("properties")
      .select("price, location, title")
      .gte("lat", lat - latDelta)
      .lte("lat", lat + latDelta)
      .gte("lng", lng - lngDelta)
      .lte("lng", lng + lngDelta);

    if (error) throw error;

    const prices = (nearby || []).map((p: any) => Number(p.price)).filter((p: number) => p > 0);

    if (prices.length < 2) {
      // Not enough data for comparison
      return new Response(
        JSON.stringify({
          count: prices.length,
          avg: null,
          min: null,
          max: null,
          percentile: null,
          aiInsight: "Not enough nearby listings to compare prices. Be the first to set the standard!",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sorted = [...prices].sort((a, b) => a - b);
    const avg = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const belowCount = sorted.filter((p: number) => p <= price).length;
    const percentile = Math.round((belowCount / sorted.length) * 100);

    // Generate AI insight
    const priceDiff = ((price - avg) / avg) * 100;
    const prompt = `You are an Indian real estate pricing advisor. 

A property owner is listing their property at ₹${Number(price).toLocaleString("en-IN")}/month.
Nearby properties (within ${radius_km}km): ${prices.length} listings
Average rent: ₹${avg.toLocaleString("en-IN")}/month
Range: ₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}
Their price is ${priceDiff > 0 ? priceDiff.toFixed(0) + "% above" : Math.abs(priceDiff).toFixed(0) + "% below"} average.

Give ONE short sentence of pricing advice (max 20 words). Be practical and specific. Use ₹ symbol.`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 100 },
        }),
      }
    );

    const geminiData = await geminiResp.json();
    const aiInsight =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      `Your price is ${priceDiff > 0 ? "above" : "below"} the area average of ₹${avg.toLocaleString("en-IN")}.`;

    return new Response(
      JSON.stringify({ count: prices.length, avg, min, max, percentile, aiInsight }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
