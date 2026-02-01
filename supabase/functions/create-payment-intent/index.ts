import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase-client.ts";
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

    const { booking_id } = await req.json();
    const validationError = schemas.createPaymentIntent.validate({ booking_id });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }
    const userClient = getUserClient(authHeader);
    const serviceClient = getServiceClient();

    // Get authenticated user
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    // Get user's org
    const { data: profile } = await serviceClient
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    // Get booking and verify it belongs to user's org
    const { data: booking } = await serviceClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .eq("organization_id", profile!.organization_id)
      .single();

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found or access denied" }),
        {
          status: 404,
          headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
        },
      );
    }

    // Calculate amount remaining
    const amountDue = Math.round(
      (Number(booking.total_amount) - Number(booking.amount_paid)) * 100,
    );

    if (amountDue <= 0) {
      return new Response(
        JSON.stringify({ error: "Booking is already fully paid" }),
        {
          status: 400,
          headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
        },
      );
    }

    // Create Stripe PaymentIntent
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripeRes = await fetch(
      "https://api.stripe.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": "2024-04-10",
        },
        body: new URLSearchParams({
          amount: amountDue.toString(),
          currency: "usd",
          "metadata[booking_id]": booking_id,
          "metadata[organization_id]": booking.organization_id,
          "metadata[confirmation_number]": booking.confirmation_number,
        }),
      },
    );

    const paymentIntent = await stripeRes.json();

    if (paymentIntent.error) {
      return new Response(
        JSON.stringify({ error: paymentIntent.error.message }),
        {
          status: 400,
          headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
        },
      );
    }

    // Store transaction record
    await serviceClient.from("payment_transactions").insert({
      booking_id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: amountDue / 100,
      currency: "usd",
      status: "pending",
      payment_method_type: "card",
      metadata: { confirmation_number: booking.confirmation_number },
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: amountDue,
      }),
      { headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }) },
    );
  } catch (err) {
    return errorResponse(err, withSecurityHeaders(headers));
  }
});
