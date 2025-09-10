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
  
  attributes: zfd.text(z.string().transform((val) => {
    const parsed = JSON.parse(val);
    return z.array(attributeSchema).parse(parsed);
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
  
  attributes: zfd.text(z.string().transform((val) => {
    const parsed = JSON.parse(val);
    return z.array(attributeSchema).parse(parsed);
  })).optional()
});
export const deleteProductSchema = z.object({
  id: z.string().min(1, "ID is required")
});