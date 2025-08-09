import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const origin = `${url.protocol}//${url.host}`;

    // Static routes to include
    const staticRoutes = [
      "/",
      "/auctions",
      "/browse-categories",
      "/declutter",
      "/contact",
      "/about",
      "/how-it-works",
    ];

    // Fetch dynamic items
    const [auctionsRes, declutterRes] = await Promise.all([
      supabase.from("auction_items").select("id, updated_at, status").eq("status", "Active").limit(1000),
      supabase.from("declutter_listings").select("id, updated_at, status").eq("status", "Available").limit(1000),
    ]);

    const urls: string[] = [];

    // Static URLs
    for (const path of staticRoutes) {
      urls.push(`${origin}${path}`);
    }

    // Dynamic URLs
    if (auctionsRes.data) {
      for (const item of auctionsRes.data as any[]) {
        urls.push(`${origin}/item/${item.id}`);
      }
    }
    if (declutterRes.data) {
      for (const item of declutterRes.data as any[]) {
        urls.push(`${origin}/declutter/${item.id}`);
      }
    }

    const lastmod = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${loc === `${origin}/` ? "1.0" : "0.7"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
      status: 200,
    });
  } catch (e) {
    console.error("Sitemap error:", e);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
