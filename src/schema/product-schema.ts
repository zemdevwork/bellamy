
import { z } from "zod";
import { zfd } from "zod-form-data";

// Define the attribute structure
const attributeSchema = z.object({
  key: z.string().min(1, "Attribute key is required"),
  value: z.string().min(1, "Attribute value is required")
});

export const createProductSchema = zfd.formData({
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
  
  // ✅ FIXED: Proper handling of multiple subimage uploads
  subimage: zfd.repeatableOfType(zfd.file(z.instanceof(File)))
    .optional()
    .default([])
    .transform((files) => {
      if (!files || files.length === 0) return [];
      // Filter out empty files and files with 0 size
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
  
  // ✅ FIXED: Proper handling of multiple subimage uploads for update
  subimage: zfd.repeatableOfType(zfd.file(z.instanceof(File)))
    .optional()
    .transform((files) => {
      if (!files || files.length === 0) return undefined;
      // Filter out empty files and files with 0 size
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