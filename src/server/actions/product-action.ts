
"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import prisma from "@/lib/prisma";
import uploadPhoto from "@/lib/upload";
import cloudinary from "@/lib/cloudinary";

import { createProductSchema, updateProductSchema, deleteProductSchema } from "@/schema/product-schema";

// Define the attribute structure for type safety
type ProductAttribute = {
  key: string;
  value: string;
};

// Define the update data type for better type safety
type ProductUpdateData = {
  name?: string;
  description?: string | null;
  price?: number;
  qty?: number;
  brandId?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  image?: string;
  subimage?: string[];
  attributes?: ProductAttribute[];
};

export const createProductAction = actionClient
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      // 🔍 DEBUG: Log the parsed input
      console.log("=== CREATE PRODUCT DEBUG ===");
      console.log("Full parsedInput:", parsedInput);
      console.log("Subimage array:", parsedInput.subimage);
      console.log("Subimage length:", parsedInput.subimage?.length || 0);
      console.log("Subimage details:", parsedInput.subimage?.map((file, index) => ({
        index,
        name: file?.name,
        size: file?.size,
        type: file?.type,
        isFile: file instanceof File
      })));

      // handle main image upload
      let photoUrl: string = "";
      if (parsedInput.image && parsedInput.image.size > 0) {
        photoUrl = await uploadPhoto(parsedInput.image);
      }
      if (!photoUrl) throw new Error("Image is required");

      // ✅ Fixed sub-images upload handling - using const instead of let
      const subImageUrls: string[] = [];
      
      if (parsedInput.subimage && parsedInput.subimage.length > 0) {
        console.log("Processing subimages...");
        for (const [index, file] of parsedInput.subimage.entries()) {
          // Check if it's a valid file with content
          if (file && file.size > 0) {
            console.log(`Uploading subimage ${index}:`, file.name, "Size:", file.size);
            const url = await uploadPhoto(file);
            console.log(`Subimage ${index} uploaded to:`, url);
            subImageUrls.push(url);
          } else {
            console.log(`Skipping invalid subimage ${index}:`, {
              exists: !!file,
              size: file?.size || 0,
              name: file?.name || 'unknown'
            });
          }
        }
      } else {
        console.log("No subimages to process");
      }

      console.log("Final subImageUrls:", subImageUrls);
      console.log("=== END DEBUG ===");

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
          subimage: subImageUrls,
          attributes: parsedInput.attributes || [],
        },
      });

      revalidatePath("/product");
      return { success: true, data: product, message: "Product created successfully" };
    } catch (error) {
      console.error("Create product error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create product");
    }
  });

// ✅ UPDATED Product Action with Fixed Sub-images Handling
export const updateProductAction = actionClient
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("=== UPDATE PRODUCT DEBUG ===");
      console.log("Full parsedInput:", parsedInput);
      console.log("Update subimage array:", parsedInput.subimage);
      console.log("Update subimage length:", parsedInput.subimage?.length || 0);

      // Get existing product to preserve current images if needed
      const existingProduct = await prisma.product.findUnique({
        where: { id: parsedInput.id },
        select: { image: true, subimage: true }
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

      // ✅ FIXED: Sub-images upload handling for update - using const and proper initialization
      let subImageUrls: string[] | undefined;
      
      if (parsedInput.subimage && parsedInput.subimage.length > 0) {
        console.log("Processing subimages for update...");
        const newSubImageUrls: string[] = [];
        
        // Optional: Delete old subimages from Cloudinary
        if (existingProduct.subimage && existingProduct.subimage.length > 0) {
          for (const url of existingProduct.subimage) {
            const oldPublicId = url.split("/").pop()?.split(".")[0];
            if (oldPublicId) {
              try {
                await cloudinary.uploader.destroy(`BELLAMY/${oldPublicId}`);
                console.log("Deleted old subimage:", oldPublicId);
              } catch (error) {
                console.warn("Failed to delete old subimage:", error);
              }
            }
          }
        }
        
        // Upload new subimages
        for (const [index, file] of parsedInput.subimage.entries()) {
          if (file && file.size > 0 && file.name !== '') {
            console.log(`Uploading update subimage ${index}:`, file.name, "Size:", file.size);
            const url = await uploadPhoto(file);
            console.log(`Update subimage ${index} uploaded to:`, url);
            newSubImageUrls.push(url);
          } else {
            console.log(`Skipping invalid update subimage ${index}:`, {
              exists: !!file,
              size: file?.size || 0,
              name: file?.name || 'unknown'
            });
          }
        }
        
        // If no valid files were processed, keep existing subimages
        if (newSubImageUrls.length === 0) {
          console.log("No new valid subimages, keeping existing ones");
          subImageUrls = undefined; // Don't update subimage field
        } else {
          subImageUrls = newSubImageUrls;
        }
      }
      // If parsedInput.subimage is explicitly empty array, clear subimages
      else if (parsedInput.subimage && parsedInput.subimage.length === 0) {
        console.log("Explicitly clearing subimages");
        subImageUrls = [];
        
        // Delete existing subimages from Cloudinary
        if (existingProduct.subimage && existingProduct.subimage.length > 0) {
          for (const url of existingProduct.subimage) {
            const oldPublicId = url.split("/").pop()?.split(".")[0];
            if (oldPublicId) {
              try {
                await cloudinary.uploader.destroy(`BELLAMY/${oldPublicId}`);
                console.log("Cleared subimage:", oldPublicId);
              } catch (error) {
                console.warn("Failed to clear subimage:", error);
              }
            }
          }
        }
      }

      console.log("Final update subImageUrls:", subImageUrls);

      // ✅ Fixed: Use proper type instead of any
      const updateData: ProductUpdateData = {};
      
      if (parsedInput.name) updateData.name = parsedInput.name;
      if (parsedInput.description !== undefined) updateData.description = parsedInput.description;
      if (parsedInput.price !== undefined) updateData.price = parsedInput.price;
      if (parsedInput.qty !== undefined) updateData.qty = parsedInput.qty;
      if (parsedInput.brandId !== undefined) updateData.brandId = parsedInput.brandId;
      if (parsedInput.categoryId !== undefined) updateData.categoryId = parsedInput.categoryId;
      if (parsedInput.subcategoryId !== undefined) updateData.subCategoryId = parsedInput.subcategoryId;
      if (photoUrl) updateData.image = photoUrl;
      if (subImageUrls !== undefined) updateData.subimage = subImageUrls;
      if (parsedInput.attributes !== undefined) updateData.attributes = parsedInput.attributes;

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
      const product = await prisma.product.findUnique({
        where: { id: parsedInput.id },
      });
      if (!product) throw new Error("Product not found");

      // delete main image from Cloudinary
      if (product.image) {
        const publicId = product.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`BELLAMY/${publicId}`);
        }
      }

      // delete subimages from Cloudinary
      if (product.subimage && product.subimage.length > 0) {
        for (const url of product.subimage) {
          const publicId = url.split("/").pop()?.split(".")[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`BELLAMY/${publicId}`);
          }
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