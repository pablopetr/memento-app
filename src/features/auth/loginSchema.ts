import {z} from 'zod';

/**
 * Single source of truth for the login form: drives both runtime validation
 * (via zodResolver) and the `LoginForm` TypeScript type (DRY).
 */
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginForm = z.infer<typeof loginSchema>;
