"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import prisma from "@/lib/prisma";
import uploadPhoto from "@/lib/upload";
import cloudinary from "@/lib/cloudinary";

import { createProductSchema, updateProductSchema, deleteProductSchema } from "@/schema/product-schema";

// ✅ CREATE Product
export const createProductAction = actionClient
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      // handle image upload
      let photoUrl: string = "";
      if (parsedInput.image && parsedInput.image.size > 0) {
        photoUrl = await uploadPhoto(parsedInput.image);
      }
      if (!photoUrl) throw new Error("Image is required");

      const product = await prisma.product.create({
        data: {
          name: parsedInput.name,
          description: parsedInput.description || null,
          price: parsedInput.price,
          qty: parsedInput.qty,
          brandId: parsedInput.brandId || null,
          categoryId: parsedInput.categoryId || null,
          subCategoryId: parsedInput.subcategoryId || null,
          image: photoUrl,
          attributes: parsedInput.attributes, // already parsed to array of { key, value }
        },
      });

      revalidatePath("/product");
      return { success: true, data: product, message: "Product created successfully" };
    } catch (error) {
      console.error("Create product error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create product");
    }
  });

// ✅ UPDATE Product
export const updateProductAction = actionClient
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      let photoUrl: string | undefined;

      if (parsedInput.image && parsedInput.image.size > 0) {
        photoUrl = await uploadPhoto(parsedInput.image);
      }

      const updated = await prisma.product.update({
        where: { id: parsedInput.id },
        data: {
          ...(parsedInput.name && { name: parsedInput.name }),
          ...(parsedInput.description && { description: parsedInput.description }),
          ...(parsedInput.price && { price: parsedInput.price }),
          ...(parsedInput.qty !== undefined && { qty: parsedInput.qty }),
          ...(parsedInput.brandId && { brandId: parsedInput.brandId }),
          ...(parsedInput.categoryId && { categoryId: parsedInput.categoryId }),
          ...(parsedInput.subcategoryId && { subcategoryId: parsedInput.subcategoryId }),
          ...(photoUrl && { image: photoUrl }),
          ...(parsedInput.attributes && { attributes: parsedInput.attributes }),
        },
      });

      revalidatePath("/product");
      return { success: true, data: updated, message: "Product updated successfully" };
    } catch (error) {
      console.error("Update product error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to update product");
    }
  });

// ✅ DELETE Product
export const deleteProductAction = actionClient
  .inputSchema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parsedInput.id },
      });
      if (!product) throw new Error("Product not found");

      // Optional: delete image from Cloudinary
      if (product.image) {
        const publicId = product.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`BELLAMY/${publicId}`);
        }
      }

      await prisma.product.delete({ where: { id: parsedInput.id } });

      revalidatePath("/product");
      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      console.error("Delete product error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to delete product");
    }
  });
