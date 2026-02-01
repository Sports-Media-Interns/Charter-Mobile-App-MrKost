// CRM Tracker Hook - React hook for tracking user activity

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'expo-router';
import { CRMService } from '@/services/crm';
import { CRMEventType } from '@/types/crm';
import { useCRMStore } from '@/store/crmStore';
import { getCRMConfig } from '@/config/crm';

interface TrackEventOptions {
  properties?: Record<string, unknown>;
  metadata?: {
    screen?: string;
    component?: string;
    action?: string;
    value?: string | number;
    previousValue?: string | number;
    errorMessage?: string;
    errorCode?: string;
  };
}

export function useCRMTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const { isInitialized } = useCRMStore();

  const getService = useCallback((): CRMService | null => {
    if (!getCRMConfig().enabled) return null;
    if (!CRMService.isInitialized()) return null;

    try {
      return CRMService.getInstance();
    } catch {
      return null;
    }
  }, []);

  // Auto-track screen views
  useEffect(() => {
    if (!isInitialized) return;
    if (pathname === previousPathRef.current) return;

    previousPathRef.current = pathname;

    const service = getService();
    if (service) {
      const screenName = formatScreenName(pathname);
      service.trackScreenView(screenName);
    }
  }, [pathname, isInitialized, getService]);

  const trackEvent = useCallback(
    async (type: CRMEventType, options?: TrackEventOptions) => {
      const service = getService();
      if (!service) return;

      await service.trackEvent(type, options);
    },
    [getService]
  );

  const trackButtonClick = useCallback(
    async (buttonName: string, screenName?: string) => {
      const service = getService();
      if (!service) return;

      await service.trackButtonClick(
        buttonName,
        screenName || formatScreenName(pathname)
      );
    },
    [getService, pathname]
  );

  const trackFormSubmit = useCallback(
    async (formName: string, properties?: Record<string, unknown>) => {
      const service = getService();
      if (!service) return;

      await service.trackFormSubmit(formName, properties);
    },
    [getService]
  );

  const trackFormAbandon = useCallback(
    async (formName: string, step?: number | string) => {
      const service = getService();
      if (!service) return;

      await service.trackFormAbandon(formName, step);
    },
    [getService]
  );

  const trackCustomEvent = useCallback(
    async (
      type: CRMEventType,
      properties?: Record<string, unknown>,
      metadata?: TrackEventOptions['metadata']
    ) => {
      const service = getService();
      if (!service) return;

      await service.trackEvent(type, { properties, metadata });
    },
    [getService]
  );

  const trackError = useCallback(
    async (errorMessage: string, errorCode?: string) => {
      const service = getService();
      if (!service) return;

      await service.trackError(
        errorMessage,
        errorCode,
        formatScreenName(pathname)
      );
    },
    [getService, pathname]
  );

  return {
    trackEvent,
    trackButtonClick,
    trackFormSubmit,
    trackFormAbandon,
    trackCustomEvent,
    trackError,
    currentScreen: formatScreenName(pathname),
  };
}

function formatScreenName(pathname: string): string {
  if (!pathname || pathname === '/') {
    return 'Home';
  }

  // Remove leading slash and format
  const formatted = pathname
    .replace(/^\//, '')
    .replace(/\[([^\]]+)\]/g, ':$1') // Convert [id] to :id
    .split('/')
    .map((segment) => {
      // Remove parentheses from route groups
      const cleaned = segment.replace(/[()]/g, '');
      // Capitalize first letter
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    })
    .join(' > ');

  return formatted || 'Unknown';
}

// Convenience hook for form tracking
export function useCRMFormTracker(formName: string) {
  const { trackFormSubmit, trackFormAbandon, trackButtonClick } = useCRMTracker();
  const startTimeRef = useRef<number>(Date.now());
  const currentStepRef = useRef<number | string>(1);

  const setCurrentStep = useCallback((step: number | string) => {
    currentStepRef.current = step;
  }, []);

  const onSubmit = useCallback(
    async (properties?: Record<string, unknown>) => {
      const duration = Date.now() - startTimeRef.current;
      await trackFormSubmit(formName, {
        ...properties,
        durationMs: duration,
        finalStep: currentStepRef.current,
      });
    },
    [formName, trackFormSubmit]
  );

  const onAbandon = useCallback(async () => {
    await trackFormAbandon(formName, currentStepRef.current);
  }, [formName, trackFormAbandon]);

  const onFieldInteraction = useCallback(
    async (fieldName: string) => {
      await trackButtonClick(`${formName}_${fieldName}_interaction`);
    },
    [formName, trackButtonClick]
  );

  // Track form abandonment on unmount
  useEffect(() => {
    return () => {
      // This will be called when the form component unmounts
      // We could track abandonment here, but we'd need to know if it was submitted
    };
  }, []);

  return {
    setCurrentStep,
    onSubmit,
    onAbandon,
    onFieldInteraction,
  };
}
