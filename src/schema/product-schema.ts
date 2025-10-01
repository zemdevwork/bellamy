import { z } from "zod";
import { zfd } from "zod-form-data";

// Base product: variants carry price/qty/images; product has only primary image and meta
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  image: z.instanceof(File),
});

export const createProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  image: z.instanceof(File).optional(),
});

export const createProductFormDataSchema = zfd.formData({
  name: zfd.text(z.string().min(1, "Product name is required")),
  description: zfd.text(z.string().optional()),
  brandId: zfd.text(z.string().optional()),
  categoryId: zfd.text(z.string().optional()),
  subcategoryId: zfd.text(z.string().optional()),
  image: zfd.file(z.instanceof(File)),
});

export const updateProductSchema = zfd.formData({
  id: zfd.text(z.string().min(1, "ID is required")),
  name: zfd.text(z.string().min(1, "Product name is required")).optional(),
  description: zfd.text(z.string()).optional(),
  brandId: zfd.text(z.string()).optional(),
  categoryId: zfd.text(z.string()).optional(),
  subcategoryId: zfd.text(z.string()).optional(),
  image: zfd.file(z.instanceof(File)).optional(),
});

export const deleteProductSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;
export type CreateProductValues = z.infer<typeof createProductSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;