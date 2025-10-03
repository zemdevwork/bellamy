"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "./admin-user-action";

export async function getAttributesWithValues() {
  const attrs = await prisma.attribute.findMany({
    include: {
      values: true,
    },
    orderBy: { name: "asc" },
  });
  return attrs.map((a) => ({
    id: a.id,
    name: a.name,
    values: a.values.map((v) => ({ id: v.id, value: v.value })),
  }));
}

// Create a new attribute
export async function createAttribute(name: string) {
  try{
    await getAuthenticatedAdmin();
    return prisma.attribute.create({ data: { name } });
  }catch(e){
    console.log("Error creating attribute:", e);
    return null;
  }
}

// Rename an attribute
export async function updateAttribute(id: string, name: string) {
  try{
    await getAuthenticatedAdmin();
    return prisma.attribute.update({ where: { id }, data: { name } });
  }catch(e){
    console.log("Error updating attribute:", e);
    return null;
  }
}

// Create a value under an attribute
export async function createAttributeValue(attributeId: string, value: string) {
  try{
    await getAuthenticatedAdmin();
    return prisma.attributeValue.create({ data: { attributeId, value } });
  }catch(e){
    console.log("Error creating attribute value:", e);
    return null;
  }
}

// Update a value
export async function updateAttributeValue(id: string, value: string) {
  try{
    await getAuthenticatedAdmin();
    return prisma.attributeValue.update({ where: { id }, data: { value } });
  }catch(e){
    console.log("Error updating attribute value:", e);
    return null;
  }
}

// Delete an attribute and all its values
export async function deleteAttribute(id: string) {
  try {
    await getAuthenticatedAdmin();
    
    // Get all values for this attribute
    const attributeValues = await prisma.attributeValue.findMany({
      where: { attributeId: id },
      select: { id: true }
    });
    
    // Check if any of the attribute values are being used by product variants
    if (attributeValues.length > 0) {
      const usageCount = await prisma.variantOption.count({
        where: { 
          valueId: { 
            in: attributeValues.map(v => v.id) 
          } 
        }
      });
      
      if (usageCount > 0) {
        throw new Error(
          `Cannot delete this attribute. One or more of its values are currently being used by ${usageCount} product variant(s). Please remove them from all variants first.`
        );
      }
    }
    
    // Delete the attribute (this will cascade delete all its values due to the schema relationship)
    return await prisma.attribute.delete({ where: { id } });
  } catch (e) {
    console.log("Error deleting attribute:", e);
    
    if (e instanceof Error && e.message.includes("Cannot delete")) {
      throw e;
    }
    
    return null;
  }
}

// Delete a value (allowed)
export async function deleteAttributeValue(id: string) {
  try {
    await getAuthenticatedAdmin();
    
    // Check if this attribute value is being used by any product variants
    const usageCount = await prisma.variantOption.count({
      where: { valueId: id }
    });
    
    if (usageCount > 0) {
      throw new Error(
        `Cannot delete this attribute value. It is currently being used by ${usageCount} product variant(s). Please remove it from all variants first.`
      );
    }
    
    return await prisma.attributeValue.delete({ where: { id } });
  } catch (e) {
    console.log("Error deleting attribute value:", e);
    
    if (e instanceof Error && e.message.includes("Cannot delete")) {
      throw e;
    }
    
    return null;
  }
}


