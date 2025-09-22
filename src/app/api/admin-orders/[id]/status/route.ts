import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Add admin authentication check here
    const { id } = await params; // ← Need to await params in Next.js 15
    const { status } = await req.json();
    
    // Allowed statuses for admin
    const allowedStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Admin update order status error:", err);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}