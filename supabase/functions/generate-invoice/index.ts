import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";
import { schemas } from "../_shared/validation.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

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

    const { booking_id } = await req.json();
    const validationError = schemas.generateInvoice.validate({ booking_id });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }
    const supabase = getServiceClient();

    // Get booking with quote details
    const { data: booking } = await supabase
      .from("bookings")
      .select("*, quotes(*)")
      .eq("id", booking_id)
      .single();

    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
      });
    }

    const quote = booking.quotes;

    // Generate atomic sequential invoice number via DB sequence
    const { data: invoiceNumData, error: seqError } = await supabase.rpc("next_invoice_number");
    if (seqError) throw seqError;
    const invoiceNumber = invoiceNumData as string;

    // Build line items
    const lineItems = [
      {
        description: `Charter Flight - ${quote.aircraft_type} (${quote.operator_name})`,
        amount: Number(quote.base_price),
      },
    ];

    if (Number(quote.taxes_fees) > 0) {
      lineItems.push({
        description: "Taxes & Fees",
        amount: Number(quote.taxes_fees),
      });
    }

    const amount = Number(quote.base_price);
    const tax = Number(quote.taxes_fees);
    const total = Number(quote.total_price);

    // Due in 30 days
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        booking_id,
        organization_id: booking.organization_id,
        invoice_number: invoiceNumber,
        amount,
        tax,
        total,
        status: "sent",
        due_date: dueDate.toISOString().split("T")[0],
        line_items: lineItems,
      })
      .select()
      .single();

    if (error) throw error;

    // Send invoice email to org users
    const { data: orgUsers } = await supabase
      .from("users")
      .select("email")
      .eq("organization_id", booking.organization_id)
      .in("role", ["team_admin", "travel_coordinator"]);

    for (const u of orgUsers || []) {
      await fetch(
        Deno.env.get("SUPABASE_URL") + "/functions/v1/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: u.email,
            subject: `Invoice ${invoiceNumber} - Sports Media Charter`,
            template: "invoice",
            data: {
              invoice_number: invoiceNumber,
              total,
              due_date: dueDate.toISOString().split("T")[0],
              confirmation_number: booking.confirmation_number,
            },
          }),
        },
      );
    }

    return new Response(JSON.stringify({ invoice }), {
      headers: withSecurityHeaders({ ...headers, "Content-Type": "application/json" }),
    });
  } catch (err) {
    return errorResponse(err, withSecurityHeaders(headers));
  }
});
