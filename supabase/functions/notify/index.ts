import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";
import { resolveRecipients } from "../_shared/three-party.ts";
import { schemas } from "../_shared/validation.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

const EVENT_CATEGORY_MAP: Record<string, string> = {
  request_submitted: "request_updates",
  quote_received: "quotes",
  quote_accepted: "quotes",
  booking_confirmed: "bookings",
  payment_received: "payments",
  payment_failed: "payments",
  booking_cancelled: "bookings",
  message_received: "messages",
  flight_status_update: "bookings",
  invoice_overdue: "payments",
};

const EVENT_TEMPLATES: Record<string, { title: string; body: string }> = {
  request_submitted: {
    title: "New Charter Request",
    body: "A new charter request has been submitted.",
  },
  quote_received: {
    title: "New Quote Available",
    body: "A new quote has been received for your charter request.",
  },
  quote_accepted: {
    title: "Quote Accepted",
    body: "A quote has been accepted.",
  },
  booking_confirmed: {
    title: "Booking Confirmed",
    body: "Your charter flight has been confirmed.",
  },
  payment_received: {
    title: "Payment Received",
    body: "Payment has been successfully processed.",
  },
  payment_failed: {
    title: "Payment Failed",
    body: "A payment attempt has failed. Please try again.",
  },
  booking_cancelled: {
    title: "Booking Cancelled",
    body: "A booking has been cancelled.",
  },
  message_received: {
    title: "New Message",
    body: "You have a new message.",
  },
  flight_status_update: {
    title: "Flight Status Update",
    body: "There is an update on your flight status.",
  },
  invoice_overdue: {
    title: "Invoice Overdue",
    body: "An invoice is past due. Please arrange payment.",
  },
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

    const { event, payload, recipients: explicitRecipients } = await req.json();
    const validationError = schemas.notify.validate({ event, payload });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }
    const supabase = getServiceClient();
    const template = EVENT_TEMPLATES[event];
    if (!template) {
      return new Response(JSON.stringify({ error: "Unknown event" }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    // Resolve recipients via three-party routing
    let recipientIds: string[] = explicitRecipients || [];
    if (recipientIds.length === 0) {
      const resolved = await resolveRecipients({
        request_id: payload.request_id,
        booking_id: payload.booking_id,
      });
      recipientIds = [
        ...resolved.client_user_ids,
        ...(resolved.broker_user_id ? [resolved.broker_user_id] : []),
        resolved.sports_media_admin_id,
      ];
    }

    // Filter out the sender from notification recipients
    if (payload.sender_id) {
      recipientIds = recipientIds.filter((id) => id !== payload.sender_id);
    }

    // De-duplicate
    recipientIds = [...new Set(recipientIds)];
    const category = EVENT_CATEGORY_MAP[event] || "system";

    // Batch-fetch preferences and user details for all recipients
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id, push_enabled, email_enabled, sms_enabled")
      .in("user_id", recipientIds)
      .eq("category", category);

    const prefMap = new Map(
      (prefs || []).map((p) => [p.user_id, p]),
    );

    const { data: users } = await supabase
      .from("users")
      .select("id, push_token, email, phone")
      .in("id", recipientIds);

    const userMap = new Map(
      (users || []).map((u) => [u.id, u]),
    );

    // Insert all in-app notifications in one batch
    const notificationRows = recipientIds.map((userId) => ({
      user_id: userId,
      title: template.title,
      body: template.body,
      type: event,
      data: payload,
    }));

    await supabase.from("notifications").insert(notificationRows);

    // Dispatch push/email/sms using Promise.allSettled
    const dispatches: Promise<unknown>[] = [];
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${svcKey}`,
    };

    for (const userId of recipientIds) {
      const pref = prefMap.get(userId);
      const user = userMap.get(userId);
      if (!user) continue;

      const pushEnabled = pref?.push_enabled ?? true;
      const emailEnabled = pref?.email_enabled ?? true;
      const smsEnabled = pref?.sms_enabled ?? false;

      if (pushEnabled && user.push_token) {
        dispatches.push(
          fetch(`${supabaseUrl}/functions/v1/send-push`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              tokens: [user.push_token],
              title: template.title,
              body: template.body,
              data: { event, ...payload },
            }),
          }),
        );
      }

      if (emailEnabled && user.email) {
        dispatches.push(
          fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              to: user.email,
              subject: template.title,
              template: event,
              data: payload,
            }),
          }),
        );
      }

      if (
        smsEnabled &&
        user.phone &&
        ["payment_failed", "booking_confirmed", "booking_cancelled"].includes(event)
      ) {
        dispatches.push(
          fetch(`${supabaseUrl}/functions/v1/send-sms`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              to: user.phone,
              message: `${template.title}: ${template.body}`,
            }),
          }),
        );
      }
    }

    await Promise.allSettled(dispatches);

    return new Response(
      JSON.stringify({ success: true, notified: recipientIds.length }),
      { headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }) },
    );
  } catch (err) {
    return errorResponse(err, withSecurityHeaders(headers));
  }
});
