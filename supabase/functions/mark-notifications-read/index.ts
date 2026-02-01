import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getUserClient } from "../_shared/supabase-client.ts";
import { schemas } from "../_shared/validation.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

serve(async (req) => {
  const headers = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: withSecurityHeaders(headers) });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    const { notification_ids } = await req.json();
    const validationError = schemas.markNotificationsRead.validate({ notification_ids });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }
    const supabase = getUserClient(authHeader);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    // RLS ensures only user's own notifications are updated
    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", notification_ids)
      .eq("user_id", user.id)
      .is("read_at", null)
      .select("id");

    if (error) throw error;

    return new Response(
      JSON.stringify({ updated: data?.length || 0 }),
      { headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }) },
    );
  } catch (err) {
    return errorResponse(err, withSecurityHeaders(headers));
  }
});
