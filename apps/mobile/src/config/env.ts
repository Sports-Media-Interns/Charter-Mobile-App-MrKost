import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  EXPO_PUBLIC_APP_NAME: z.string().optional().default("Sports Media Charter"),
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_CRM_API_BASE_URL: z.string().url().optional(),
  EXPO_PUBLIC_CRM_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function validateEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(`Environment validation failed:\n${issues}`);

    // In dev, return defaults to avoid blocking startup
    const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;
    if (isDev) {
      console.warn("Running with invalid env in development mode");
      _env = {
        EXPO_PUBLIC_SUPABASE_URL:
          (process.env.EXPO_PUBLIC_SUPABASE_URL as string) || "https://placeholder.supabase.co",
        EXPO_PUBLIC_SUPABASE_ANON_KEY:
          (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string) || "placeholder",
        EXPO_PUBLIC_APP_NAME: "Sports Media Charter",
        EXPO_PUBLIC_CRM_ENABLED: false,
      } as Env;
      return _env;
    }

    throw new Error(`Missing or invalid environment variables:\n${issues}`);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (!_env) return validateEnv();
  return _env;
}
