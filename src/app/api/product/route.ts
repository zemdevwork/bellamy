import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductAction } from "@/server/actions/product-action";


// GET all products and filter by categoryId + brandId + subCategoryId + sort by price
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");

    // ✅ Support multiple brands: ?brandId=1,2,3
    const brandIds = searchParams.get("brandId");

    // ✅ Support sorting: ?sort=price_asc or ?sort=price_desc
    const sort = searchParams.get("sort");

    // Build where clause dynamically
    const whereClause: Record<string, unknown> = {};
    if (categoryId) whereClause.categoryId = categoryId;
    if (subCategoryId) whereClause.subCategoryId = subCategoryId;
    if (brandIds) {
      const brandIdArray = brandIds.split(",");
      whereClause.brandId = { in: brandIdArray };
    }

    // Always fetch latest products, price sorting handled after mapping (variant-based)
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        brand: true,
        subCategory: true,
        variants: {
          take: 1,
          orderBy: { createdAt: "asc" },
          select: { id: true, price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to listing DTO expected by frontend (price from first variant)
    const mapped = products.map((p) => {
      const defaultVariant = p.variants?.[0] || null;
      return {
        id: p.id,
        name: p.name,
        description: p.description ?? undefined,
        image: p.image,
        brandId: p.brandId ?? undefined,
        categoryId: p.categoryId ?? undefined,
        subCategoryId: p.subCategoryId ?? undefined,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        brand: p.brand || undefined,
        category: p.category || undefined,
        subCategory: p.subCategory || undefined,
        price: defaultVariant?.price ?? 0,
        qty: undefined,
        subimage: [],
        defaultVariantId: defaultVariant?.id ?? null,
      };
    });

    // Apply price sorting if requested (on mapped array)
    if (sort === "price_asc") {
      mapped.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "price_desc") {
      mapped.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// CREATE product
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Convert FormData to the expected shape
    const productData = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      qty: formData.get("qty") as string,
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