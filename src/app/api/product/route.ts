import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { createProductAction } from "@/server/actions/product-action";

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, brand: true, subCategory: true },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// CREATE product
export async function POST(req: Request) {
  try {
    // Parse FormData from request
    const formData = await req.formData();

    // Pass FormData directly to server action
    const result = await createProductAction(formData);

    // server action already returns { success, data, message } or throws error
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
