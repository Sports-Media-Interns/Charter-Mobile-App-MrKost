import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    organizationName: z.string().min(2, 'Organization name is required'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newRequestSchema = z.object({
  tripType: z.enum(['one_way', 'round_trip', 'multi_leg']),
  passengerCount: z.number().int().positive('Must have at least 1 passenger'),
  urgency: z.enum(['standard', 'urgent', 'emergency']),
  baggageNotes: z.string().optional(),
  specialRequirements: z.string().optional(),
  legs: z
    .array(
      z.object({
        departureAirport: z.string().min(3, 'Select departure airport'),
        arrivalAirport: z.string().min(3, 'Select arrival airport'),
        departureDate: z.string().min(1, 'Select departure date'),
        departureTime: z.string().min(1, 'Select departure time'),
        flexibilityHours: z.number().int().min(0).max(48),
      }),
    )
    .min(1, 'At least one flight leg required'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type NewRequestInput = z.infer<typeof newRequestSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
