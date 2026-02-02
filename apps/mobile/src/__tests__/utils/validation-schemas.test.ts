import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  newRequestSchema,
  profileSchema,
} from '@/utils/validation-schemas';

describe('loginSchema', () => {
  it('validates correct input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '1234567' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validInput = {
    fullName: 'John Doe',
    organizationName: 'Dallas Mavericks',
    email: 'test@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('validates correct input', () => {
    expect(registerSchema.safeParse(validInput).success).toBe(true);
  });

  it('rejects short name', () => {
    expect(registerSchema.safeParse({ ...validInput, fullName: 'J' }).success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(registerSchema.safeParse({ ...validInput, password: 'password1', confirmPassword: 'password1' }).success).toBe(false);
  });

  it('rejects password without number', () => {
    expect(registerSchema.safeParse({ ...validInput, password: 'Password', confirmPassword: 'Password' }).success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    expect(registerSchema.safeParse({ ...validInput, confirmPassword: 'Different1' }).success).toBe(false);
  });

  it('rejects short password', () => {
    expect(registerSchema.safeParse({ ...validInput, password: 'Pa1', confirmPassword: 'Pa1' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('validates correct email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'test@example.com' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });
});

describe('newRequestSchema', () => {
  const validLeg = {
    departureAirport: 'LAX',
    arrivalAirport: 'JFK',
    departureDate: '2024-06-15',
    departureTime: '09:00',
    flexibilityHours: 2,
  };

  const validRequest = {
    tripType: 'one_way' as const,
    passengerCount: 5,
    urgency: 'standard' as const,
    legs: [validLeg],
  };

  it('validates correct input', () => {
    expect(newRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it('validates with optional fields', () => {
    expect(newRequestSchema.safeParse({ ...validRequest, baggageNotes: 'Extra bags', specialRequirements: 'Wheelchair' }).success).toBe(true);
  });

  it('rejects invalid trip type', () => {
    expect(newRequestSchema.safeParse({ ...validRequest, tripType: 'invalid' }).success).toBe(false);
  });

  it('rejects zero passengers', () => {
    expect(newRequestSchema.safeParse({ ...validRequest, passengerCount: 0 }).success).toBe(false);
  });

  it('rejects negative passengers', () => {
    expect(newRequestSchema.safeParse({ ...validRequest, passengerCount: -1 }).success).toBe(false);
  });

  it('rejects empty legs array', () => {
    expect(newRequestSchema.safeParse({ ...validRequest, legs: [] }).success).toBe(false);
  });

  it('rejects leg with short airport code', () => {
    expect(newRequestSchema.safeParse({ ...validRequest, legs: [{ ...validLeg, departureAirport: 'LA' }] }).success).toBe(false);
  });

  it('rejects leg without departure date', () => {
    expect(newRequestSchema.safeParse({ ...validRequest, legs: [{ ...validLeg, departureDate: '' }] }).success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('validates correct input', () => {
    expect(profileSchema.safeParse({ fullName: 'John Doe', email: 'test@example.com' }).success).toBe(true);
  });

  it('validates with phone', () => {
    expect(profileSchema.safeParse({ fullName: 'John Doe', email: 'test@example.com', phone: '+11234567890' }).success).toBe(true);
  });

  it('validates with empty phone', () => {
    expect(profileSchema.safeParse({ fullName: 'John Doe', email: 'test@example.com', phone: '' }).success).toBe(true);
  });

  it('rejects invalid phone', () => {
    expect(profileSchema.safeParse({ fullName: 'John Doe', email: 'test@example.com', phone: 'abc' }).success).toBe(false);
  });

  it('rejects short name', () => {
    expect(profileSchema.safeParse({ fullName: 'J', email: 'test@example.com' }).success).toBe(false);
  });
});
