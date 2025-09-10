import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateProductAction, deleteProductAction } from "@/server/actions/product-action";

// GET product by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // await the params Promise
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true, subCategory: true },
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// UPDATE product
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // await the params Promise
    const formData = await req.formData();
    
    // Attach the ID from the URL to FormData
    formData.append("id", id);
    
    const result = await updateProductAction(formData);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // await the params Promise
    const data = { id }; // plain object matches deleteProductSchema
    
    const result = await deleteProductAction(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}