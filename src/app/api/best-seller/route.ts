import { fallBackImage } from "@/constants/values";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface FormattedBestsellers{
    id: string;
    name: string;
    title: string;
    image: string;
    price: string;
}

export async function GET() {
  try {
    const orderItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const bestsellerIds = orderItems.map((item) => item.productId);

    const bestsellers = await prisma.product.findMany({
      where: {
        id: {
          in: bestsellerIds,
        },
      },
      include: {
        brand: true, // Include brand details
        category: true, // Include category details
      },
    });

    const sortedBestsellers = bestsellerIds
      .map((id) => bestsellers.find((p) => p.id === id))
      .filter(Boolean); // Filter out any undefined results


    const formattedBestsellers : FormattedBestsellers[] = sortedBestsellers.map((product) => ({
      id: product?.id || "Unknown ID",
      name: product?.brand?.name || "Unknown Brand",
      title: product?.name || "Unknown Product",
      price: product?.price.toFixed(2) || "0.00",
      image: product?.image || fallBackImage,
    }));

    return NextResponse.json(formattedBestsellers, { status: 200 });
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    return NextResponse.json(
      { error: "Failed to fetch best-selling products." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}