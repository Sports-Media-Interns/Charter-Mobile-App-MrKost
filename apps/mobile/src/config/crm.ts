// CRM Configuration - Environment-based configuration

import { CRMConfig } from '@/types/crm';

export function getCRMConfig(): CRMConfig {
  const apiBaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/crm-proxy`
    : '';
  const enabled = process.env.EXPO_PUBLIC_CRM_ENABLED === 'true';

  return {
    apiBaseUrl,
    apiKey: '', // Key is now server-side only (crm-proxy edge function)
    enabled: enabled && !!apiBaseUrl,
  };
}

export function isCRMEnabled(): boolean {
  return getCRMConfig().enabled;
}
