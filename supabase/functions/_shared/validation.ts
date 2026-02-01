// Shared validation schemas for edge functions
// Uses a lightweight runtime check approach compatible with Deno

export function validateRequired(
  data: Record<string, unknown>,
  fields: string[],
): string | null {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

export function validateUUID(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function validateEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validatePhone(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^\+?[1-9]\d{1,14}$/.test(value);
}

export function validateEnum(value: unknown, allowed: string[]): boolean {
  return typeof value === "string" && allowed.includes(value);
}

export function validatePositiveNumber(value: unknown): boolean {
  return typeof value === "number" && value > 0 && isFinite(value);
}

// Validation schemas for specific edge function payloads
export const schemas = {
  createPaymentIntent: {
    validate(data: Record<string, unknown>): string | null {
      if (!validateUUID(data.booking_id)) return "Invalid booking_id";
      return null;
    },
  },

  notify: {
    validate(data: Record<string, unknown>): string | null {
      if (!data.event || typeof data.event !== "string") return "Missing event";
      if (!data.payload || typeof data.payload !== "object") return "Missing payload";
      return null;
    },
  },

  markNotificationsRead: {
    validate(data: Record<string, unknown>): string | null {
      if (!Array.isArray(data.notification_ids)) return "notification_ids must be an array";
      if (data.notification_ids.length === 0) return "notification_ids cannot be empty";
      for (const id of data.notification_ids) {
        if (!validateUUID(id)) return `Invalid notification ID: ${id}`;
      }
      return null;
    },
  },

  generateInvoice: {
    validate(data: Record<string, unknown>): string | null {
      if (!validateUUID(data.booking_id)) return "Invalid booking_id";
      return null;
    },
  },

  sendEmail: {
    validate(data: Record<string, unknown>): string | null {
      if (!validateEmail(data.to)) return "Invalid email address";
      if (!data.subject || typeof data.subject !== "string") return "Missing subject";
      return null;
    },
  },

  sendSms: {
    validate(data: Record<string, unknown>): string | null {
      if (!validatePhone(data.to)) return "Invalid phone number";
      if (!data.message || typeof data.message !== "string") return "Missing message";
      return null;
    },
  },

  sendPush: {
    validate(data: Record<string, unknown>): string | null {
      if (!Array.isArray(data.tokens)) return "tokens must be an array";
      if (!data.title || typeof data.title !== "string") return "Missing title";
      if (!data.body || typeof data.body !== "string") return "Missing body";
      return null;
    },
  },

  crmProxy: {
    validate(data: Record<string, unknown>): string | null {
      if (!data.endpoint || typeof data.endpoint !== "string") return "Missing endpoint";
      return null;
    },
  },
};

export function normalizePath(path: string): string {
  // Remove path traversal sequences
  return path.replace(/\.\.\//g, "").replace(/\.\.\\/g, "").replace(/\/\//g, "/");
}

export function isAllowedMethod(method: string, allowed: string[] = ["GET", "POST", "PUT"]): boolean {
  return allowed.includes(method.toUpperCase());
}
