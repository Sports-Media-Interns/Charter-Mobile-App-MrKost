import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getUserClient } from "../_shared/supabase-client.ts";
import { schemas } from "../_shared/validation.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

const CRM_BASE_URL = "https://rest.gohighlevel.com/v1";

serve(async (req) => {
  const headers = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: withSecurityHeaders(headers) });
  }

  try {
    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    const userClient = getUserClient(authHeader);
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    const { endpoint, method, body } = await req.json();
    const validationError = schemas.crmProxy.validate({ endpoint });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    // Allowlist of CRM endpoints
    const allowedPrefixes = ["/contacts", "/opportunities", "/pipelines"];
    const isAllowed = allowedPrefixes.some((p) => endpoint.startsWith(p));
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Endpoint not allowed" }), {
        status: 403,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    // Normalize path to prevent traversal
    const normalizedEndpoint = endpoint.replace(/\.\.\//g, "").replace(/\.\.\\/g, "").replace(/\/\//g, "/");

    // Restrict HTTP methods
    const allowedMethods = ["GET", "POST", "PUT"];
    const requestMethod = (method || "GET").toUpperCase();
    if (!allowedMethods.includes(requestMethod)) {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    const crmApiKey = Deno.env.get("CRM_API_KEY");
    if (!crmApiKey) {
      return new Response(JSON.stringify({ error: "CRM not configured" }), {
        status: 503,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    const crmRes = await fetch(`${CRM_BASE_URL}${normalizedEndpoint}`, {
      method: requestMethod,
      headers: {
        Authorization: `Bearer ${crmApiKey}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await crmRes.json();

    return new Response(JSON.stringify(data), {
      status: crmRes.status,
      headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
    });
  } catch (err) {
    return errorResponse(err, withSecurityHeaders(headers));
  }
});
