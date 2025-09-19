import { z } from "zod";
import { zfd } from "zod-form-data";

// Define the attribute structure
const attributeSchema = z.object({
  key: z.string().min(1, "Attribute key is required"),
  value: z.string().min(1, "Attribute value is required")
});

// ✅ FIXED: Use string types for form inputs, then transform during validation
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.string()
    .min(1, "Price is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Price must be a positive number"),
  qty: z.string()
    .min(1, "Quantity is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, "Quantity must be a non-negative integer"),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  image: z.instanceof(File),
  subimage: z.array(z.instanceof(File)).max(3, "You can only upload up to 3 sub-images."),
  attributes: z.array(attributeSchema)
});

// ✅ FIXED: Create a separate type for the form that handles both create and edit cases
export const createProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  qty: z.string().min(1, "Quantity is required"),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  // ✅ Make image optional for edit mode
  image: z.instanceof(File).optional(),
  // ✅ Make subimage optional for edit mode
  subimage: z.array(z.instanceof(File)).max(3, "You can only upload up to 3 sub-images.").optional(),
  attributes: z.array(attributeSchema).optional()
});

// FormData schema for server actions (unchanged)
export const createProductFormDataSchema = zfd.formData({
  name: zfd.text(z.string().min(1, "Product name is required")),
  description: zfd.text(z.string().optional()),
  price: zfd.text(
    z.string()
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val > 0, "Price must be a positive number")
  ),
  qty: zfd.text(
    z.string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 0, "Quantity must be a non-negative integer")
  ),
  brandId: zfd.text(z.string().optional()),
  categoryId: zfd.text(z.string().optional()),
  subcategoryId: zfd.text(z.string().optional()),
  image: zfd.file(z.instanceof(File)),
  
  subimage: zfd.repeatableOfType(zfd.file(z.instanceof(File)))
    .optional()
    .default([])
    .transform((files) => {
      if (!files || files.length === 0) return [];
      return files.filter(file => file && file.size > 0 && file.name !== '');
    })
    .refine((files) => files.length <= 3, {
      message: "You can only upload up to 3 sub-images.",
    }),
    
  attributes: zfd.text(z.string().transform((val) => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return z.array(attributeSchema).parse(parsed);
    } catch {
      return [];
    }
  }))
});

export const updateProductSchema = zfd.formData({
  id: zfd.text(z.string().min(1, "ID is required")),
  name: zfd.text(z.string().min(1, "Product name is required")).optional(),
  description: zfd.text(z.string()).optional(),
  price: zfd.text(
    z.string()
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val > 0, "Price must be a positive number")
  ).optional(),
  qty: zfd.text(
    z.string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 0, "Quantity must be a non-negative integer")
  ).optional(),
  brandId: zfd.text(z.string()).optional(),
  categoryId: zfd.text(z.string()).optional(),
  subcategoryId: zfd.text(z.string()).optional(),
  image: zfd.file(z.instanceof(File)).optional(),
  
  subimage: zfd.repeatableOfType(zfd.file(z.instanceof(File)))
    .optional()
    .transform((files) => {
      if (!files || files.length === 0) return undefined;
      const validFiles = files.filter(file => file && file.size > 0 && file.name !== '');
      return validFiles.length > 0 ? validFiles : undefined;
    })
    .refine((files) => !files || files.length <= 3, {
      message: "You can only upload up to 3 sub-images.",
    }),
    
  attributes: zfd.text(z.string().transform((val) => {
    if (!val) return undefined;
    try {
      const parsed = JSON.parse(val);
      return z.array(attributeSchema).parse(parsed);
    } catch {
      return undefined;
    }
  })).optional()
});

export const deleteProductSchema = z.object({
  id: z.string().min(1, "ID is required")
});

// ✅ FIXED: Use the form schema for component types
export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;
export type CreateProductValues = z.infer<typeof createProductSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;