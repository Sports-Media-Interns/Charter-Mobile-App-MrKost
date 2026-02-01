import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

const TIMESTAMP_TOLERANCE_SEC = 300; // 5 minutes

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1Sig = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !v1Sig) return false;

  // Timestamp tolerance check
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SEC) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Timing-safe comparison
  if (expectedSig.length !== v1Sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ v1Sig.charCodeAt(i);
  }
  return mismatch === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: withSecurityHeaders(getCorsHeaders(req)) });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

    if (!signature || !(await verifyStripeSignature(body, signature, webhookSecret))) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = getServiceClient();

    // Idempotency check
    const { data: existing } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", event.id)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: withSecurityHeaders({ "Content-Type": "application/json" }),
      });
    }

    // Record the event
    await supabase.from("webhook_events").insert({
      event_id: event.id,
      event_type: event.type,
      payload: event,
      processed_at: new Date().toISOString(),
    });

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const bookingId = pi.metadata?.booking_id;
        if (bookingId) {
          const amount = pi.amount / 100;
          await supabase.rpc("add_payment_to_booking", {
            p_booking_id: bookingId,
            p_amount: amount,
            p_stripe_pi_id: pi.id,
          });
        } else {
          // No booking_id - just update the transaction directly
          await supabase
            .from("payment_transactions")
            .update({
              status: "succeeded",
              receipt_url: pi.charges?.data?.[0]?.receipt_url || null,
              payment_method_type: pi.payment_method_types?.[0] || "card",
            })
            .eq("stripe_payment_intent_id", pi.id);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await supabase
          .from("payment_transactions")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", pi.id);

        // Trigger notification
        const bookingId = pi.metadata?.booking_id;
        if (bookingId) {
          await fetch(
            Deno.env.get("SUPABASE_URL") + "/functions/v1/notify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                event: "payment_failed",
                payload: { booking_id: bookingId, amount: pi.amount / 100 },
              }),
            },
          );
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const piId = charge.payment_intent;
        if (piId) {
          await supabase
            .from("payment_transactions")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", piId);

          // Update booking
          const { data: txn } = await supabase
            .from("payment_transactions")
            .select("booking_id, amount")
            .eq("stripe_payment_intent_id", piId)
            .single();

          if (txn) {
            await supabase
              .from("bookings")
              .update({ payment_status: "refunded" })
              .eq("id", txn.booking_id);
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: withSecurityHeaders({ "Content-Type": "application/json" }),
    });
  } catch (err) {
    return errorResponse(err, withSecurityHeaders({ "Content-Type": "application/json" }));
  }
});
