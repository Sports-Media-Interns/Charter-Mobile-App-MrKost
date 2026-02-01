import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store';

export function useInvoices() {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: ['invoices', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          amount,
          tax,
          total,
          status,
          due_date,
          paid_at,
          created_at,
          booking:bookings (
            confirmation_number
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePaymentTransactions(bookingId?: string) {
  return useQuery({
    queryKey: ['transactions', bookingId],
    queryFn: async () => {
      if (!bookingId) return [];

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}
