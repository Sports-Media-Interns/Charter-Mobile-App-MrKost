import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

// Cron: runs every 6 hours to expire quotes past their valid_until date

serve(async (req) => {
  try {
    // Verify this is called by cron or service role
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey || !authHeader || !authHeader.includes(serviceKey)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = getServiceClient();

    const { data: expired, error } = await supabase
      .from("quotes")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("valid_until", new Date().toISOString())
      .select("id, request_id");

    if (error) throw error;

    // For each expired quote, check if all quotes for the request are expired
    // If so, revert request status to 'submitted' so it can be re-quoted
    if (expired && expired.length > 0) {
      const requestIds = [...new Set(expired.map((q) => q.request_id))];

      for (const requestId of requestIds) {
        const { data: activeQuotes } = await supabase
          .from("quotes")
          .select("id")
          .eq("request_id", requestId)
          .in("status", ["pending", "presented"])
          .limit(1);

        if (!activeQuotes || activeQuotes.length === 0) {
          await supabase
            .from("charter_requests")
            .update({ status: "submitted" })
            .eq("id", requestId)
            .eq("status", "quoted");
        }
      }
    }

    return new Response(
      JSON.stringify({ expired: expired?.length || 0 }),
      { headers: withSecurityHeaders({ "Content-Type": "application/json" }) },
    );
  } catch (err) {
    console.error("expire-quotes error:", err);
    return errorResponse(err, withSecurityHeaders({ "Content-Type": "application/json" }));
  }
});
