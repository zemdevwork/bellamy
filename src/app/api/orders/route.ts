import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // better-auth

// Place a new order
export async function POST(req: NextRequest) {
  try {
    // ✅ Get current session/user
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = session.user;

    // ✅ Expect address + paymentMethod from client, optionally direct items for Buy Now
    const { paymentMethod, phoneNumber, street, city, state, pincode, items } = await req.json();

    if (!paymentMethod || !phoneNumber || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Define type for items
    type OrderItemInput = {
      variantId: string;
      quantity: number;
    };

    // ✅ Determine source: direct items (Buy Now) vs cart
    const orderItems: { variantId: string; quantity: number; price: number }[] = [];
    let totalAmount = 0;
    let isDirectBuyNow = true; // Track if this is a direct buy

    if (Array.isArray(items) && items.length > 1) {
      // Direct Buy Now using provided items (with variantId)
      isDirectBuyNow = false;
      const variantIds = (items as OrderItemInput[]).map((i) => i.variantId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, price: true, qty: true },
      });

      for (const it of items as OrderItemInput[]) {
        const v = variants.find((vv) => vv.id === it.variantId);
        if (!v) return NextResponse.json({ error: `Variant not found: ${it.variantId}` }, { status: 400 });
        if (it.quantity < 1) return NextResponse.json({ error: `Invalid quantity for ${it.variantId}` }, { status: 400 });
        if (it.quantity > v.qty) return NextResponse.json({ error: `Insufficient stock for ${it.variantId}` }, { status: 400 });
        orderItems.push({ variantId: v.id, quantity: it.quantity, price: v.price });
        totalAmount += v.price * it.quantity;
      }
    } else {
      // Fallback to cart
      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: { include: { variant: { select: { id: true, price: true, qty: true } } } },
        },
      });

      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      for (const ci of cart.items) {
        if (!ci.variant) continue;
        if (ci.quantity > ci.variant.qty) {
          return NextResponse.json({ error: `Insufficient stock for ${ci.variant.id}` }, { status: 400 });
        }
        orderItems.push({ variantId: ci.variantId, quantity: ci.quantity, price: ci.variant.price });
        totalAmount += ci.variant.price * ci.quantity;
      }
    }

    // ✅ Create order with address snapshot
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        paymentMethod,
        totalAmount,
        status: "PENDING",
        phoneNumber,
        street,
        city,
        state,
        pincode,
        items: {
          create: orderItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    });

    // ✅ Update product stock
    for (const item of orderItems) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { qty: { decrement: item.quantity } },
      });
    }

    // ✅ Clear cart only if order was placed from cart (not direct buy)
    if (!isDirectBuyNow) {
      const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

// Get all orders of logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = session.user;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Transform data to match frontend expectations
    const transformedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        productId: item.variant.product.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          name: item.variant.product.name,
          image: item.variant.product.image,
        }
      }))
    }));

    return NextResponse.json(transformedOrders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}