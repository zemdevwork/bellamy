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

    // ✅ Expect address + paymentMethod from client
    const { paymentMethod,phoneNumber, street, city, state, pincode } = await req.json();

    if (!paymentMethod || !phoneNumber || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Fetch user cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + (item.variant?.price || 0) * item.quantity,
      0
    );

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
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant?.price || 0,
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
    for (const item of cart.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { qty: { decrement: item.quantity } },
      });
    }

    // ✅ Clear cart after placing order
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

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
