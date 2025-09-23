
// "use server";

// import { prisma } from "@/lib/prisma";
// import { auth } from "@/lib/auth";
// import {
//   createOrderSchema,
//   type CreateOrderInput,
// } from "@/schema/order-schema";

// /**
//  * ✅ Place a new order
//  */
// export async function placeOrder(data: CreateOrderInput) {
//   try {
//     const session = await auth.api.getSession({ headers: await getHeaders() });
//     if (!session) throw new Error("Not logged in");

//     const user = session.user;

//     // ✅ Validate input with Zod
//     const parsed = createOrderSchema.parse(data);

//     // Fetch user cart
//     const cart = await prisma.cart.findUnique({
//       where: { userId: user.id },
//       include: { items: { include: { product: true } } },
//     });

//     if (!cart || cart.items.length === 0) {
//       throw new Error("Cart is empty");
//     }

//     const totalAmount = cart.items.reduce(
//       (sum, item) => sum + item.product.price * item.quantity,
//       0
//     );

//     // ✅ Create order
//     const order = await prisma.order.create({
//       data: {
//         userId: user.id,
//         paymentMethod: parsed.paymentMethod,
//         phoneNumber: parsed.phoneNumber,
//         totalAmount,
//         status: "PENDING",
//         street: parsed.street,
//         city: parsed.city,
//         state: parsed.state,
//         pincode: parsed.pincode,
//         items: {
//           create: cart.items.map((item) => ({
//             productId: item.productId,
//             quantity: item.quantity,
//             price: item.product.price,
//           })),
//         },
//       },
//       include: { items: { include: { product: true } } },
//     });

//     // ✅ Clear cart
//     await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

//     return { success: true, order, message: "Order placed successfully" };
//   } catch (error: any) {
//     console.error("Order placement error:", error);

//     if (error.name === "ZodError") {
//       // ✅ Collect all error messages
//       const messages = error.errors.map((e: any) => e.message);
//       return {
//         success: false,
//         message: messages, // return as array
//       };
//     }

//     return {
//       success: false,
//       message: [error.message || "Failed to place order"],
//     };
//   }
// }

// /**
//  * ✅ Get all orders for logged-in user
//  */
// export async function getMyOrders() {
//   try {
//     const session = await auth.api.getSession({ headers: await getHeaders() });
//     if (!session) throw new Error("Not logged in");

//     const user = session.user;

//     return await prisma.order.findMany({
//       where: { userId: user.id },
//       include: { items: { include: { product: true } } },
//       orderBy: { createdAt: "desc" },
//     });
//   } catch (error: any) {
//     console.error("Get orders error:", error);
//     throw new Error(error.message || "Failed to fetch orders");
//   }
// }

// /**
//  * ✅ Cancel an order (only if still pending/paid)
//  */
// export async function cancelOrder(orderId: string) {
//   try {
//     const session = await auth.api.getSession({ headers: await getHeaders() });
//     if (!session) throw new Error("Not logged in");

//     const user = session.user;

//     const order = await prisma.order.findUnique({ where: { id: orderId } });
//     if (!order || order.userId !== user.id) {
//       throw new Error("Unauthorized");
//     }

//     if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
//       throw new Error("Order cannot be cancelled");
//     }

//     return await prisma.order.update({
//       where: { id: orderId },
//       data: { status: "CANCELLED" },
//     });
//   } catch (error: any) {
//     console.error("Cancel order error:", error);
//     throw new Error(error.message || "Failed to cancel order");
//   }
// }

// /**
//  * Helper: mimic headers() in server actions
//  */
// async function getHeaders() {
//   const { headers } = await import("next/headers");
//   return headers();
// }
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "@/schema/order-schema";
import { ZodError } from "zod";

/**
 * ✅ Place a new order
 */
export async function placeOrder(data: CreateOrderInput) {
  try {
    const session = await auth.api.getSession({ headers: await getHeaders() });
    if (!session) throw new Error("Not logged in");

    const user = session.user;

    // ✅ Validate input with Zod
    const parsed = createOrderSchema.parse(data);

    // Fetch user cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // ✅ Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        paymentMethod: parsed.paymentMethod,
        phoneNumber: parsed.phoneNumber,
        totalAmount,
        status: "PENDING",
        street: parsed.street,
        city: parsed.city,
        state: parsed.state,
        pincode: parsed.pincode,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // ✅ Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { success: true, order, message: "Order placed successfully" };
  } catch (error: unknown) {
    console.error("Order placement error:", error);

    if (error instanceof ZodError) {
      // ✅ Collect all error messages
      const messages = error.issues.map((e) => e.message);
      return {
        success: false,
        message: messages, // return as array
      };
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to place order";
    return {
      success: false,
      message: [errorMessage],
    };
  }
}

/**
 * ✅ Get all orders for logged-in user
 */
export async function getMyOrders() {
  try {
    const session = await auth.api.getSession({ headers: await getHeaders() });
    if (!session) throw new Error("Not logged in");

    const user = session.user;

    return await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (error: unknown) {
    console.error("Get orders error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
    throw new Error(errorMessage);
  }
}

/**
 * ✅ Cancel an order (only if still pending/paid)
 */
export async function cancelOrder(orderId: string) {
  try {
    const session = await auth.api.getSession({ headers: await getHeaders() });
    if (!session) throw new Error("Not logged in");

    const user = session.user;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== user.id) {
      throw new Error("Unauthorized");
    }

    // 🚫 Block cancellation for shipped/delivered/cancelled
    if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
      throw new Error("Order cannot be cancelled");
    }

    // ✅ Update status
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return {
      success: true,
      order: cancelledOrder,
      message: "Order cancelled successfully",
    };
  } catch (error: unknown) {
    console.error("Cancel order error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel order";
    return { success: false, message: errorMessage };
  }
}

/**
 * Helper: mimic headers() in server actions
 */
async function getHeaders() {
  const { headers } = await import("next/headers");
  return headers();
}