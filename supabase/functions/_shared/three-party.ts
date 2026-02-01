import { getServiceClient } from "./supabase-client.ts";

interface ThreePartyRecipients {
  client_user_ids: string[];
  broker_user_id: string | null;
  sports_media_admin_id: string;
}

/**
 * Resolves the three-party recipients for a given request or booking.
 * Returns client org users, the assigned broker, and Sports Media admin.
 */
export async function resolveRecipients(
  opts: { request_id?: string; booking_id?: string },
): Promise<ThreePartyRecipients> {
  const supabase = getServiceClient();
  const sportsMediaAdminId = Deno.env.get("SPORTS_MEDIA_ADMIN_USER_ID")!;

  let requestId = opts.request_id;

  // If we only have booking_id, look up the request
  if (!requestId && opts.booking_id) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("request_id")
      .eq("id", opts.booking_id)
      .single();
    requestId = booking?.request_id;
  }

  if (!requestId) {
    return {
      client_user_ids: [],
      broker_user_id: null,
      sports_media_admin_id: sportsMediaAdminId,
    };
  }

  // Get the request to find org and requester
  const { data: request } = await supabase
    .from("charter_requests")
    .select("organization_id, requester_id")
    .eq("id", requestId)
    .single();

  if (!request) {
    return {
      client_user_ids: [],
      broker_user_id: null,
      sports_media_admin_id: sportsMediaAdminId,
    };
  }

  // Get all users in the client org (team_admin + travel_coordinator)
  const { data: orgUsers } = await supabase
    .from("users")
    .select("id")
    .eq("organization_id", request.organization_id)
    .in("role", ["team_admin", "travel_coordinator"]);

  // Get the broker from the latest quote
  const { data: quote } = await supabase
    .from("quotes")
    .select("broker_id")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    client_user_ids: (orgUsers || []).map((u) => u.id),
    broker_user_id: quote?.broker_id || null,
    sports_media_admin_id: sportsMediaAdminId,
  };
}
