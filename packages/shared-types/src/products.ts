import { z } from "zod";

// Decimal-safe price representation. Stored as numeric in Postgres,
// transported as string to avoid float precision loss.
const priceSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "price must be a decimal with up to 2 places");

export const productSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable(),
  price: priceSchema,
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Product = z.infer<typeof productSchema>;

export const createProductSchema = z.object({
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  price: priceSchema,
  stock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const listProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const listProductsResponseSchema = z.object({
  data: z.array(productSchema),
  total: z.number().int().nonnegative(),
});
export type ListProductsResponse = z.infer<typeof listProductsResponseSchema>;
