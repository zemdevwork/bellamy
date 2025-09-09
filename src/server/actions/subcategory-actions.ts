'use server';

import { actionClient } from "@/lib/safe-action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  createSubCategorySchema, 
  updateSubCategorySchema, 
  deleteSubCategorySchema 
} from "@/schema/subcategory-schema";

// ✅ CREATE SubCategory
export const createSubCategoryAction = actionClient
  .inputSchema(createSubCategorySchema)
  .action(async ({ parsedInput }) => {
    try {
      const subcategory = await prisma.subCategory.create({
        data: {
          name: parsedInput.name,
          categoryId: parsedInput.categoryId,
        },
      });
      revalidatePath('/subcategories'); // adjust path to your UI
      return { success: true, data: subcategory, message: 'SubCategory added successfully' };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to add SubCategory");
    }
  });

// ✅ UPDATE SubCategory
export const updateSubCategoryAction = actionClient
  .inputSchema(updateSubCategorySchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    try {
      const updated = await prisma.subCategory.update({
        where: { id },
        data: {
          name: data.name,
          categoryId: data.categoryId,
        },
      });
      revalidatePath('/subcategories');
      return { success: true, data: updated, message: 'SubCategory updated successfully' };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update SubCategory");
    }
  });

// ✅ DELETE SubCategory
export const deleteSubCategoryAction = actionClient
  .inputSchema(deleteSubCategorySchema)
  .action(async ({ parsedInput }) => {
    try {
      // Optional: check if any product is using this subcategory
      const productUsingSubCategory = await prisma.product.findFirst({
        where: { subCategoryId: parsedInput.id },
      });

      if (productUsingSubCategory) {
        throw new Error("Cannot delete: SubCategory is used in one or more products.");
      }

      await prisma.subCategory.delete({
        where: { id: parsedInput.id },
      });

      revalidatePath('/subcategories');
      return { success: true, message: 'SubCategory deleted successfully' };
    } catch (error) {
      console.error("Delete SubCategory Error:", error);
      throw new Error("Failed to delete SubCategory");
    }
  });
