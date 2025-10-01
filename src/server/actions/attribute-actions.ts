"use server";

import { prisma } from "@/lib/prisma";

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
  return prisma.attribute.create({ data: { name } });
}

// Rename an attribute
export async function updateAttribute(id: string, name: string) {
  return prisma.attribute.update({ where: { id }, data: { name } });
}

// Create a value under an attribute
export async function createAttributeValue(attributeId: string, value: string) {
  return prisma.attributeValue.create({ data: { attributeId, value } });
}

// Update a value
export async function updateAttributeValue(id: string, value: string) {
  return prisma.attributeValue.update({ where: { id }, data: { value } });
}

// Delete a value (allowed)
export async function deleteAttributeValue(id: string) {
  return prisma.attributeValue.delete({ where: { id } });
}


