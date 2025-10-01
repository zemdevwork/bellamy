"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/schema/order-schema";
import { getAuthenticatedAdmin } from "./admin-user-action";

// 🔹 Get all orders (admin)
export async function getAllOrders() {
  try {
    await getAuthenticatedAdmin();
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { 
          include: { 
            variant: { 
              include: { 
                product: true,
                options: { include: { attribute: true, attributeValue: true } },
              }
            }
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  } catch (error) {
    console.error("❌ Admin fetch orders error:", error);
    throw new Error("Failed to fetch orders");
  }
}

// 🔹 Update order status (admin)
export async function updateOrderStatus(orderId: string, status: string) {

  try {
await getAuthenticatedAdmin();
    // ✅ validate status using schema
    orderStatusSchema.parse(status);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Revalidate the admin orders page
    revalidatePath("/admin/orders");

    return order;
  } catch (error) {
    console.error("❌ Admin update order status error:", error);
    throw new Error("Failed to update order status");
  }
}


export async function getOrderByID(orderId: string) {
  try {
    await getAuthenticatedAdmin();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            variant: {
              include: {
                product: { include: { brand: true, category: true, subCategory: true } },
                options: { include: { attribute: true, attributeValue: true } },
              },
            },
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error("❌ Admin fetch order error:", error);
    throw new Error("Failed to fetch order");
  }
}
