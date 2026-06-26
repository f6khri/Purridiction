import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    // Check if Gemini responded with an error
    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.log("Gemini error:", errorText);
      return new Response(JSON.stringify({ error: "Gemini API error", narration: "" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();

    // Try multiple response paths
    const narration =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.output ||
      data.text ||
      "";

    // Log if empty for debugging
    if (!narration) {
      console.log("Gemini response:", JSON.stringify(data));
    }

    return new Response(JSON.stringify({ narration }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("Edge function error:", error.message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
