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
    const formData = await req.formData();

    // Convert FormData to the expected shape
    const productData = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      qty: parseInt(formData.get("qty") as string, 10),
      image: formData.get("image") as File,
      subimage: formData.getAll("subimage") as File[],
      attributes: JSON.parse(formData.get("attributes") as string || "[]"),
      description: formData.get("description") as string | undefined,
      brandId: formData.get("brandId") as string | undefined,
      categoryId: formData.get("categoryId") as string | undefined,
      subcategoryId: formData.get("subcategoryId") as string | undefined,
    };

    const result = await createProductAction(productData);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
