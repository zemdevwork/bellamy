'use server';

import { actionClient } from "@/lib/safe-action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  createCategorySchema, 
  updateCategorySchema, 
  deleteCategorySchema 
} from "@/schema/category-schema";

// ✅ CREATE Category
export const createCategoryAction = actionClient
  .inputSchema(createCategorySchema)
  .action(async ({ parsedInput }) => {
    try {
      const category = await prisma.category.create({
        data: { name: parsedInput.name },
      });
      revalidatePath('/categories'); // adjust path to your UI
      return { success: true, data: category, message: 'Category added successfully' };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to add category");
    }
  });

// ✅ UPDATE Category
export const updateCategoryAction = actionClient
  .inputSchema(updateCategorySchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    try {
      const updated = await prisma.category.update({
        where: { id },
        data: { name: data.name },
      });
      revalidatePath('/categories');
      return { success: true, data: updated, message: 'Category updated successfully' };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update category");
    }
  });

// ✅ DELETE Category
export const deleteCategoryAction = actionClient
  .inputSchema(deleteCategorySchema)
  .action(async ({ parsedInput }) => {
    try {
      // Optional: check if any product is using this category
      const productUsingCategory = await prisma.product.findFirst({
        where: { categoryId: parsedInput.id },
      });

      if (productUsingCategory) {
        throw new Error("Cannot delete: Category is used in one or more products.");
      }

      await prisma.category.delete({
        where: { id: parsedInput.id },
      });

      revalidatePath('/categories');
      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      console.error("Delete Category Error:", error);
      throw new Error("Failed to delete category");
    }
  });
