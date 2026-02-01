import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";
import { schemas } from "../_shared/validation.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  const headers = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: withSecurityHeaders(headers) });
  }

  try {
    // Verify service-role authorization
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey || !authHeader || !authHeader.includes(serviceKey)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    const { tokens, title, body, data } = await req.json();
    const validationError = schemas.sendPush.validate({ tokens, title, body });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    // Build messages, batch up to 100
    const messages = tokens.map((token: string) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: data || {},
    }));

    const batches: typeof messages[] = [];
    for (let i = 0; i < messages.length; i += 100) {
      batches.push(messages.slice(i, i + 100));
    }

    const supabase = getServiceClient();
    const expoToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (expoToken) {
      reqHeaders["Authorization"] = `Bearer ${expoToken}`;
    }

    let sent = 0;
    for (const batch of batches) {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify(batch),
      });

      const result = await res.json();

      // Handle invalid/expired tokens
      if (result.data) {
        for (let i = 0; i < result.data.length; i++) {
          const ticket = result.data[i];
          if (
            ticket.status === "error" &&
            ticket.details?.error === "DeviceNotRegistered"
          ) {
            // Clear invalid token from DB
            await supabase
              .from("users")
              .update({ push_token: null })
              .eq("push_token", batch[i].to);
          }
          if (ticket.status === "ok") sent++;
        }
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
    });
  } catch (err) {
    return errorResponse(err, withSecurityHeaders(headers));
  }
});
