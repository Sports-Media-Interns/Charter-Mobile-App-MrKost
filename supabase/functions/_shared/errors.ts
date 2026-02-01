// Error sanitization: generic messages to client, details to logs

export class AppError extends Error {
  constructor(
    public userMessage: string,
    public statusCode: number = 500,
    public internalMessage?: string,
  ) {
    super(internalMessage || userMessage);
  }
}

export function sanitizeError(err: unknown): { message: string; status: number } {
  if (err instanceof AppError) {
    console.error(`[AppError] ${err.statusCode}: ${err.message}`);
    return { message: err.userMessage, status: err.statusCode };
  }

  if (err instanceof Error) {
    console.error(`[UnhandledError] ${err.message}`, err.stack);
  } else {
    console.error("[UnknownError]", err);
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    status: 500,
  };
}

export function errorResponse(
  err: unknown,
  corsHeaders: Record<string, string> = {},
): Response {
  const { message, status } = sanitizeError(err);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
