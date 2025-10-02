
"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import {prisma} from "@/lib/prisma";
import uploadPhoto from "@/lib/upload";
import cloudinary from "@/lib/cloudinary";

import { createProductSchema, updateProductSchema, deleteProductSchema } from "@/schema/product-schema";
import { Prisma } from "@prisma/client";
import { getAuthenticatedAdmin } from "./admin-user-action";

// Define the update data type for better type safety
type ProductUpdateData = {
  name?: string;
  description?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  image?: string;
};

export const createProductAction = actionClient
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput }) => {
    try {
            await getAuthenticatedAdmin()
      
      // handle main image upload
      let photoUrl: string = "";
      if (parsedInput.image && parsedInput.image.size > 0) {
        photoUrl = await uploadPhoto(parsedInput.image);
      }
      if (!photoUrl) throw new Error("Image is required");
      console.log("=== END DEBUG ===");

      const product = await prisma.product.create({
        data: {
          name: parsedInput.name,
          description: parsedInput.description || null,
          brandId: parsedInput.brandId || null,
          categoryId: parsedInput.categoryId || null,
          subCategoryId: parsedInput.subcategoryId || null,
          image: photoUrl,
        },
      });

      revalidatePath("/product");
      revalidatePath("/admin/products");
      return { success: true, data: product, message: "Product created successfully" };
    } catch (error) {
      console.error("Create product error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create product");
    }
  });

export const updateProductAction = actionClient
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    try {
            await getAuthenticatedAdmin()

      // Get existing product to preserve current images if needed
      const existingProduct = await prisma.product.findUnique({
        where: { id: parsedInput.id },
        select: { image: true }
      });

      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // Handle main image upload
      let photoUrl: string | undefined;
      if (parsedInput.image && parsedInput.image.size > 0) {
        console.log("Uploading new main image:", parsedInput.image.name);
        photoUrl = await uploadPhoto(parsedInput.image);
        
        // Optional: Delete old main image from Cloudinary
        if (existingProduct.image) {
          const oldPublicId = existingProduct.image.split("/").pop()?.split(".")[0];
          if (oldPublicId) {
            try {
              await cloudinary.uploader.destroy(`BELLAMY/${oldPublicId}`);
              console.log("Deleted old main image:", oldPublicId);
            } catch (error) {
              console.warn("Failed to delete old main image:", error);
            }
          }
        }
      }


      // ✅ Fixed: Use proper type instead of any
      const updateData: ProductUpdateData = {};
      
      if (parsedInput.name) updateData.name = parsedInput.name;
      if (parsedInput.description !== undefined) updateData.description = parsedInput.description;
      if (parsedInput.brandId !== undefined) updateData.brandId = parsedInput.brandId;
      if (parsedInput.categoryId !== undefined) updateData.categoryId = parsedInput.categoryId;
      if (parsedInput.subcategoryId !== undefined) updateData.subCategoryId = parsedInput.subcategoryId;
      if (photoUrl) updateData.image = photoUrl;

      console.log("Update data to be applied:", updateData);
      console.log("=== END UPDATE DEBUG ===");

      const updated = await prisma.product.update({
        where: { id: parsedInput.id },
        data: updateData,
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
            await getAuthenticatedAdmin()

      // Ensure product exists
      const product = await prisma.product.findUnique({ where: { id: parsedInput.id } });
      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // Guard: if any variant of this product is referenced in order items, prevent delete
      const variantWithOrders = await prisma.productVariant.findFirst({
        where: { productId: parsedInput.id, orderItems: { some: {} } },
        select: { id: true },
      });
      if (variantWithOrders) {
        return {
          success: false,
          message: "Cannot delete product. One or more variants are part of existing orders.",
        };
      }

      // Optional: delete main image from Cloudinary
      if (product.image) {
        const oldPublicId = product.image.split("/").pop()?.split(".")[0];
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(`BELLAMY/${oldPublicId}`);
          } catch (e) {
            console.warn("Failed to delete product image:", e);
          }
        }
      }

      // Delete product; variants will cascade delete via relation
      await prisma.product.delete({ where: { id: parsedInput.id } });

      revalidatePath("/admin/products");
      return { 
        success: true, 
        message: "Product deleted successfully" 
      };
    } catch (error: unknown) {
      console.error("Delete product error:", error);
      
      // Type-safe Prisma error handling
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma error codes
        switch (error.code) {
          case 'P2014':
            return {
              success: false,
              message: "Cannot delete product. It is part of existing orders.",
            };
          case 'P2025':
            return {
              success: false,
              message: "Product not found.",
            };
          case 'P2003':
            return {
              success: false,
              message: "Cannot delete product due to related data.",
            };
          default:
            return {
              success: false,
              message: `Database error: ${error.message}`,
            };
        }
      }
      
      // Handle other Prisma errors
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return {
          success: false,
          message: "An unknown database error occurred.",
        };
      }
      
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        return {
          success: false,
          message: "Database connection error.",
        };
      }
      
      if (error instanceof Prisma.PrismaClientInitializationError) {
        return {
          success: false,
          message: "Database initialization error.",
        };
      }
      
      if (error instanceof Prisma.PrismaClientValidationError) {
        return {
          success: false,
          message: "Invalid data provided.",
        };
      }
      
      // Handle any other errors
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    }
  });


export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      // Use the 'include' option to fetch the related models
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          include: {
            options: {
              include: {
                attribute: true,
                attributeValue: true,
              }
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: product,
      message: "Product fetched successfully",
    };
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return {
      success: false,
      message: "Failed to fetch product",
    }
  }
}