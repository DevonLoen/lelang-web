import { z } from 'zod';

export const ProductStatus = {
  DRAFT: 'DRAFT',
  REQUEST: 'REQUEST',
  VERIFIED: 'VERIFIED',
  SCHEDULED: 'SCHEDULED',
  ON_BIDS: 'ON_BIDS',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductCondition = {
  NEW: 'NEW',
  PRELOVED: 'PRELOVED',
} as const;

export type ProductCondition = (typeof ProductCondition)[keyof typeof ProductCondition];

export const ProductSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string().min(3),
  description: z.string().min(1).optional(),
  condition: z.enum(ProductCondition),
  coverImageUrl: z.string().min(1),
  imageUrls: z.array(z.string()),
  status: z.enum(ProductStatus),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  condition: z.enum(ProductCondition),
  weight_gram: z.number().int().positive(),
  coverImageUrl: z.any(),
  imageUrls: z.array(z.any()),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;

// Schema for the Backend Payload
export const CreateProductPayloadSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  condition: z.enum(ProductCondition),
  weight_gram: z.number().int().positive(),
  image_count: z.number(),
});

export type CreateProductPayload = z.infer<typeof CreateProductPayloadSchema>;
