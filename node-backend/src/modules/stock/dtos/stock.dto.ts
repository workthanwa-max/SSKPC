import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
});

export const updateProductSchema = createProductSchema.partial();

export const transactionSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
  note: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
});
