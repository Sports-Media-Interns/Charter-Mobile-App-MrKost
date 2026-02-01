import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";
import { withSecurityHeaders } from "../_shared/security-headers.ts";
import { errorResponse } from "../_shared/errors.ts";

// Cron: runs daily to mark overdue invoices

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey || !authHeader || !authHeader.includes(serviceKey)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = getServiceClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: overdue, error } = await supabase
      .from("invoices")
      .update({ status: "overdue" })
      .eq("status", "sent")
      .lt("due_date", today)
      .select("id, booking_id, organization_id, invoice_number");

    if (error) throw error;

    // Notify org admins about overdue invoices
    if (overdue && overdue.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      for (const inv of overdue) {
        await fetch(`${supabaseUrl}/functions/v1/notify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            event: "invoice_overdue",
            payload: {
              booking_id: inv.booking_id,
              invoice_number: inv.invoice_number,
            },
          }),
        });
      }
    }

    return new Response(
      JSON.stringify({ overdue: overdue?.length || 0 }),
      { headers: withSecurityHeaders({ "Content-Type": "application/json" }) },
    );
  } catch (err) {
    console.error("mark-overdue-invoices error:", err);
    return errorResponse(err, withSecurityHeaders({ "Content-Type": "application/json" }));
  }
});
