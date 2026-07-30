import { z } from 'zod';

export const checkInSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  gender: z.string().optional(),
  type: z.string().optional(),
  basicInfo: z.string().optional(),
});

export const checkOutSchema = z.object({
  identifier: z.string().min(1, "Name or Registration Code is required"),
});

export const updateCapacitySchema = z.object({
  capacity: z.number().int().min(0, "Capacity cannot be negative"),
  specInfo: z.string().optional(),
});
