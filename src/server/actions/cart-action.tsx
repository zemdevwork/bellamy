'use server';

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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

  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user) throw new Error("User not found");

  return user;
}

//
// Add to Cart
//
export async function addToCart(data: unknown) {
  const user = await getAuthenticatedUser();
  const parsed = addToCartSchema.parse(data);

  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: user.id },
      include: { items: true },
    });
  }

  const existingItem = cart.items.find(
    (item) => item.productId === parsed.productId
  );

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + parsed.quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsed.productId,
        quantity: parsed.quantity,
      },
    });
  }

  return { success: true };
}

//
// Update Cart Item
//
export async function updateCartItem(data: unknown) {
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

  return { success: true };
}

//
// Remove from Cart
//
export async function removeFromCart(data: unknown) {
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

  return { success: true };
}