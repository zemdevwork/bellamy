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

// Delete a value (allowed)
export async function deleteAttributeValue(id: string) {
 try{
   await getAuthenticatedAdmin();
  return prisma.attributeValue.delete({ where: { id } });
 }catch(e){
   console.log("Error deleting attribute value:", e);
   return null;
 }
}


