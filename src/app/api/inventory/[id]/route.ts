import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// For PATCH method, you would also need to update it similarly:
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { productId, qty } = body;
    
    if (!productId || qty === undefined) {
      return NextResponse.json({ error: "Product id and quantity required." }, { status: 400 });
    }

    const quantity = parseInt(qty, 10);

    const product = await prisma.product.update({
      where: { id: productId },
      data: { qty: quantity },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (product.qty <= 10) {
      const exists = await prisma.notification.findFirst({
        where: { productId: product.id, seen: false },
      });

      if (!exists) {
        await prisma.notification.create({
          data: {
            productId: product.id,
            message: `${product.name} is low on stock (${product.qty} left).`,
          },
        });
      }
    }

    return NextResponse.json(product, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}