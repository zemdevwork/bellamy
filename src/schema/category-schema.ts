import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Category name is required").optional(),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
});
