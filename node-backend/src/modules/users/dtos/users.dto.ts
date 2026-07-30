import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'CENTRAL', 'BRANCH']),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;
