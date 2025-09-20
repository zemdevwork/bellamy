// 'use server';

// import { prisma } from "@/lib/prisma";
// import { headers } from "next/headers";
// import { auth } from "@/lib/auth";

// import {
//   addToCartSchema,
//   updateCartItemSchema,
//   removeFromCartSchema,
// } from "@/schema/cart-schema";



// export async function getAuthenticatedUser() {
//   const nextHeaders = await headers();
//   const standardHeaders = new Headers();

//   nextHeaders.forEach((value, key) => {
//     standardHeaders.set(key, value);
//   });

//   const session = await auth.api.getSession({ headers: standardHeaders });

//   if (!session?.user) throw new Error("Unauthorized");

//   const user = await prisma.user.findUnique({
//     where: { id: session.user.id },
//     select: { id: true, role: true },
//   });

//   if (!user) throw new Error("User not found");

//   return user;
// }

// //
// // Add to Cart
// //
// export async function addToCart(data: unknown) {
//   const user = await getAuthenticatedUser();
//   const parsed = addToCartSchema.parse(data);

//   let cart = await prisma.cart.findUnique({
//     where: { userId: user.id },
//     include: { items: true },
//   });

//   if (!cart) {
//     cart = await prisma.cart.create({
//       data: { userId: user.id },
//       include: { items: true },
//     });
//   }

//   const existingItem = cart.items.find(
//     (item) => item.productId === parsed.productId
//   );

//   if (existingItem) {
//     await prisma.cartItem.update({
//       where: { id: existingItem.id },
//       data: { quantity: existingItem.quantity + parsed.quantity },
//     });
//   } else {
//     await prisma.cartItem.create({
//       data: {
//         cartId: cart.id,
//         productId: parsed.productId,
//         quantity: parsed.quantity,
//       },
//     });
//   }

//   return { success: true };
// }

// //
// // Update Cart Item
// //
// export async function updateCartItem(data: unknown) {
//   const user = await getAuthenticatedUser();
//   const parsed = updateCartItemSchema.parse(data);

//   const cart = await prisma.cart.findUnique({
//     where: { userId: user.id },
//     include: { items: true },
//   });

//   if (!cart) throw new Error("Cart not found");

//   const item = cart.items.find((i) => i.productId === parsed.productId);
//   if (!item) throw new Error("Item not found in cart");

//   await prisma.cartItem.update({
//     where: { id: item.id },
//     data: { quantity: parsed.quantity },
//   });

//   return { success: true };
// }

// //
// // Remove from Cart
// //
// export async function removeFromCart(data: unknown) {
//   const user = await getAuthenticatedUser();
//   const parsed = removeFromCartSchema.parse(data);

//   const cart = await prisma.cart.findUnique({
//     where: { userId: user.id },
//     include: { items: true },
//   });

//   if (!cart) throw new Error("Cart not found");

//   const item = cart.items.find((i) => i.productId === parsed.productId);
//   if (!item) throw new Error("Item not found in cart");

//   await prisma.cartItem.delete({
//     where: { id: item.id },
//   });

//   return { success: true };
// }
// export async function getUserCart() {
//   try {
//     const user = await getAuthenticatedUser();
    
//     const cart = await prisma.cart.findUnique({
//       where: { userId: user.id },
//       include: {
//         items: {
//           include: {
//             product: {
//               select: {
//                 id: true,
//                 name: true,
//                 price: true,
//                 image: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return cart;
//   } catch (error) {
//     console.error("Failed to get user cart:", error);
//     return null;
//   }
// }
'use server';

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
} from "@/schema/cart-schema";

export async function getAuthenticatedUser() {
  const nextHeaders = await headers();
  const standardHeaders = new Headers();

  nextHeaders.forEach((value, key) => {
    standardHeaders.set(key, value);
  });

  const session = await auth.api.getSession({ headers: standardHeaders });

  if (!session?.user) {
    console.log("❌ No session found");
    throw new Error("Unauthorized");
  }

  console.log("✅ Session found for user:", session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user) {
    console.log("❌ User not found in database");
    throw new Error("User not found");
  }

  console.log("✅ User found:", user.id);
  return user;
}

// Add to Cart with extensive debugging
export async function addToCart(data: unknown) {
  try {
    console.log("🛒 AddToCart called with data:", data);
    
    const user = await getAuthenticatedUser();
    console.log("✅ User authenticated:", user.id);
    
    const parsed = addToCartSchema.parse(data);
    console.log("✅ Data parsed:", parsed);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parsed.productId },
    });

    if (!product) {
      console.log("❌ Product not found:", parsed.productId);
      throw new Error("Product not found");
    }
    console.log("✅ Product found:", product.name);

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) {
      console.log("📦 Creating new cart for user:", user.id);
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: true },
      });
      console.log("✅ New cart created:", cart.id);
    } else {
      console.log("✅ Existing cart found:", cart.id);
    }

    const existingItem = cart.items.find(
      (item) => item.productId === parsed.productId
    );

    if (existingItem) {
      console.log("📦 Updating existing item quantity");
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parsed.quantity },
      });
      console.log("✅ Item quantity updated");
    } else {
      console.log("📦 Creating new cart item");
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parsed.productId,
          quantity: parsed.quantity,
        },
      });
      console.log("✅ New cart item created:", newItem.id);
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/cart");
    
    console.log("✅ Cart operation successful");
    return { success: true };
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    throw error;
  }
}

// Get user cart with debugging
export async function getUserCart() {
  try {
    console.log("🔍 Getting user cart...");
    const user = await getAuthenticatedUser();
    
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      console.log("📦 No cart found for user:", user.id);
      return null;
    }

    console.log("✅ Cart found with", cart.items.length, "items");
    console.log("Cart items:", cart.items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity
    })));
    
    return cart;
  } catch (error) {
    console.error("❌ Failed to get user cart:", error);
    return null;
  }
}

// Update Cart Item
export async function updateCartItem(data: unknown) {
  try {
    console.log("🔄 Updating cart item:", data);
    const user = await getAuthenticatedUser();
    const parsed = updateCartItemSchema.parse(data);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find((i) => i.productId === parsed.productId);
    if (!item) throw new Error("Item not found in cart");

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: parsed.quantity },
    });

    revalidatePath("/");
    revalidatePath("/cart");

    console.log("✅ Cart item updated successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Update cart item error:", error);
    throw error;
  }
}

// Remove from Cart
export async function removeFromCart(data: unknown) {
  try {
    console.log("🗑️ Removing from cart:", data);
    const user = await getAuthenticatedUser();
    const parsed = removeFromCartSchema.parse(data);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find((i) => i.productId === parsed.productId);
    if (!item) throw new Error("Item not found in cart");

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    revalidatePath("/");
    revalidatePath("/cart");

    console.log("✅ Item removed from cart successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Remove from cart error:", error);
    throw error;
  }
}
