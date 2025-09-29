import { fallBackImage } from "@/constants/values";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface FormattedBestsellers {
  id: string;
  variantId: string;
  name: string;
  title: string;
  image: string;
  price: string;
  originalPrice?: string | null;
}

export async function GET() {
  try {
    // Step 1: Get most purchased variants
    const variantPurchases = await prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
    });

    if (variantPurchases.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Step 2: Get variant IDs
    const variantIds = variantPurchases.map((v) => v.variantId);

    // Step 3: Fetch variants with their parent products
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
      },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
    });

    // Step 4: Create a map of variantId -> purchase count
    const purchaseMap = new Map(
      variantPurchases.map((v) => [v.variantId, v._sum.quantity || 0])
    );

    // Step 5: Group by product and find the most purchased variant per product
    type ProductWithBrand = {
      id: string;
      name: string;
      image: string;
      brand: { name: string } | null;
    };

    type ProductMapValue = {
      product: ProductWithBrand;
      topVariantId: string;
      topVariantPurchases: number;
      topVariantPrice: number;
      topVariantImages: string[];
    };

    const productMap = new Map<string, ProductMapValue>();

    variants.forEach((variant) => {
      const productId = variant.product.id;
      const purchases = purchaseMap.get(variant.id) || 0;

      const productData: ProductWithBrand = {
        id: variant.product.id,
        name: variant.product.name,
        image: variant.product.image,
        brand: variant.product.brand,
      };

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: productData,
          topVariantId: variant.id,
          topVariantPurchases: purchases,
          topVariantPrice: variant.price,
          topVariantImages: variant.images,
        });
      } else {
        const existing = productMap.get(productId)!;
        // If this variant has more purchases, update it as the top variant
        if (purchases > existing.topVariantPurchases) {
          existing.topVariantId = variant.id;
          existing.topVariantPurchases = purchases;
          existing.topVariantPrice = variant.price;
          existing.topVariantImages = variant.images;
        }
      }
    });

    // Step 6: Sort products by their top variant's purchase count
    const sortedProducts = Array.from(productMap.values()).sort(
      (a, b) => b.topVariantPurchases - a.topVariantPurchases
    );

    // Step 7: Take top 5 products
    const top5Products = sortedProducts.slice(0, 5);

    // Step 8: Format the response
    const formattedBestsellers: FormattedBestsellers[] = top5Products.map(
      (item) => ({
        id: item.product.id,
        variantId: item.topVariantId,
        name: item.product.brand?.name || "Unknown Brand",
        title: item.product.name || "Unknown Product",
        price: item.topVariantPrice.toFixed(2),
        originalPrice: null,
        image: item.topVariantImages[0] || item.product.image || fallBackImage,
      })
    );

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