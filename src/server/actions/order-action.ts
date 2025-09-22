// "use server";
// import { headers } from "next/headers";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@/lib/auth";
// import {
//   createOrderSchema,
//   cancelOrderSchema,
// } from "@/schema/order-schema";

// //
// // 🔹 Get current user from session
// //
// export async function getCurrentUser() {
//   const h = await headers();

//   const session = await auth.api.getSession({
//     headers: new Headers(h),
//   });

//   if (!session?.session) return null;

//   return prisma.user.findUnique({
//     where: { id: session.session.userId },
//   });
// }

// //
// // 🔹 Place a new order (from cart)
// //
// export async function placeOrder(input: unknown) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) return { error: "Not logged in" };

//     const parsed = createOrderSchema.safeParse(input);
//     if (!parsed.success) {
//   return { error: parsed.error.issues[0]?.message || "Invalid input" };
// }




//     const { paymentMethod } = parsed.data;

//     const cart = await prisma.cart.findUnique({
//       where: { userId: user.id },
//       include: { items: { include: { product: true } } },
//     });

//     if (!cart || cart.items.length === 0) {
//       return { error: "Cart is empty" };
//     }

//     const totalAmount = cart.items.reduce(
//       (sum, item) => sum + item.product.price * item.quantity,
//       0
//     );

//     const order = await prisma.order.create({
//       data: {
//         userId: user.id,
//         paymentMethod,
//         totalAmount,
//         status: "PENDING",
//         items: {
//           create: cart.items.map((item) => ({
//             productId: item.productId,
//             quantity: item.quantity,
//             price: item.product.price,
//           })),
//         },
//       },
//       include: { items: true },
//     });

//     // clear cart
//     await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

//     return { success: true, order };
//   } catch (err) {
//     console.error("placeOrder error:", err);
//     return { error: "Failed to place order" };
//   }
// }

// //
// // 🔹 Place order directly for a single product
// //
// export async function createOrderForProduct(productId: string, quantity = 1, paymentMethod: "COD" | "ONLINE" = "COD") {
//   try {
//     const user = await getCurrentUser();
//     if (!user) return { error: "Not logged in" };

//     const product = await prisma.product.findUnique({
//       where: { id: productId },
//     });

//     if (!product) return { error: "Product not found" };

//     const totalAmount = product.price * quantity;

//     const order = await prisma.order.create({
//       data: {
//         userId: user.id,
//         paymentMethod,
//         totalAmount,
//         status: "PENDING",
//         items: {
//           create: [
//             {
//               productId: product.id,
//               quantity,
//               price: product.price,
//             },
//           ],
//         },
//       },
//       include: { items: true },
//     });

//     return { success: true, order };
//   } catch (err) {
//     console.error("createOrderForProduct error:", err);
//     return { error: "Failed to place order for product" };
//   }
// }

// //
// // 🔹 Cancel order (user)
// //
// export async function cancelOrder(input: unknown) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) return { error: "Not logged in" };

//     const parsed = cancelOrderSchema.safeParse(input);
//     if (!parsed.success) return { error: parsed.error.format() };

//     const { id } = parsed.data;

//     const order = await prisma.order.findUnique({ where: { id } });
//     if (!order || order.userId !== user.id) {
//       return { error: "Unauthorized" };
//     }

//     if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
//       return { error: "Order cannot be cancelled" };
//     }

//     const cancelled = await prisma.order.update({
//       where: { id },
//       data: { status: "CANCELLED" },
//     });

//     return { success: true, order: cancelled };
//   } catch (err) {
//     console.error("cancelOrder error:", err);
//     return { error: "Failed to cancel order" };
//   }
// }

// //
// // 🔹 Get all orders for logged-in user
// //
// export async function getMyOrders() {
//   try {
//     const user = await getCurrentUser();
//     if (!user) return { error: "Not logged in" };

//     const orders = await prisma.order.findMany({
//       where: { userId: user.id },
//       include: { items: { include: { product: true } } },
//       orderBy: { createdAt: "desc" },
//     });

//     return { success: true, orders };
//   } catch (err) {
//     console.error("getMyOrders error:", err);
//     return { error: "Failed to fetch orders" };
//   }
// }
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createOrderSchema,
  
  type CreateOrderInput,
} from "@/schema/order-schema";

/**
 * ✅ Place a new order
 */
export async function placeOrder(data: CreateOrderInput) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) throw new Error("Not logged in");

  const user = session.user;

  // Validate input
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

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      paymentMethod: parsed.paymentMethod,
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

  // Clear cart after placing order
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return order;
}

/**
 * ✅ Get all orders for logged-in user
 */
export async function getMyOrders() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) throw new Error("Not logged in");

  const user = session.user;

  return await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * ✅ Cancel an order (only if still pending/paid)
 */
export async function cancelOrder(orderId: string) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) throw new Error("Not logged in");

  const user = session.user;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
    throw new Error("Order cannot be cancelled");
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
}

/**
 * Helper: mimic headers() in server actions
 */
async function getHeaders() {
  const { headers } = await import("next/headers");
  return headers();
}
