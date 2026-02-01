import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";
import { schemas } from "../_shared/validation.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

// Map notification event to SendGrid template ID (configure in env or hardcode)
const TEMPLATE_IDS: Record<string, string> = {
  request_submitted: "d-request-submitted",
  quote_received: "d-quote-received",
  quote_accepted: "d-quote-accepted",
  booking_confirmed: "d-booking-confirmed",
  payment_received: "d-payment-received",
  payment_failed: "d-payment-failed",
  booking_cancelled: "d-booking-cancelled",
  message_received: "d-message-received",
  flight_status_update: "d-flight-status-update",
  invoice: "d-invoice",
};

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

    const { to, subject, template, data } = await req.json();
    const validationError = schemas.sendEmail.validate({ to, subject });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }
    const supabase = getServiceClient();
    const apiKey = Deno.env.get("SENDGRID_API_KEY")!;
    const fromEmail =
      Deno.env.get("SPORTS_MEDIA_ADMIN_EMAIL") || "noreply@sportsmediacharter.com";

    const templateId = TEMPLATE_IDS[template];

    const emailPayload: Record<string, unknown> = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: data || {},
        },
      ],
      from: { email: fromEmail, name: "Sports Media Charter" },
      subject,
    };

    if (templateId) {
      emailPayload.template_id = templateId;
    } else {
      // Fallback to plain text
      emailPayload.content = [
        { type: "text/plain", value: subject },
      ];
    }

    // Log the email attempt
    const { data: logEntry } = await supabase
      .from("email_log")
      .insert({ to_email: to, subject, template, status: "queued" })
      .select("id")
      .single();

    const res = await fetch(SENDGRID_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const messageId = res.headers.get("X-Message-Id");
    const status = res.ok ? "sent" : "failed";

    if (logEntry) {
      await supabase
        .from("email_log")
        .update({ status, provider_id: messageId })
        .eq("id", logEntry.id);
    }

    return new Response(JSON.stringify({ success: res.ok, status }), {
      headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
    });
  } catch (err) {
    return errorResponse(err, withSecurityHeaders(headers));
  }
});
