import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { createProductAction } from "@/server/actions/product-action";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract all possible parameters
    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const brandIds = searchParams.get("brandId");
    const sort = searchParams.get("sort") || "created_desc";
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    // Build where clause dynamically - only add conditions if they exist
    const whereClause: Record<string, unknown> = {};
    
    // Category filter - only add if categoryId exists and is not empty
    if (categoryId && categoryId.trim().length > 0) {
      whereClause.categoryId = categoryId;
    }
    
    // SubCategory filter - only if both subCategoryId and categoryId exist
    if (subCategoryId && subCategoryId.trim().length > 0 && categoryId && categoryId.trim().length > 0) {
      whereClause.subCategoryId = subCategoryId;
    }
    
    // Brand filter - only add if brandIds exist and contain valid IDs
    if (brandIds && brandIds.trim().length > 0) {
      const brandIdArray = brandIds.split(",")
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      if (brandIdArray.length > 0) {
        whereClause.brandId = { in: brandIdArray };
      }
    }

    // Search filter - only add if search term exists
    if (search && search.trim().length > 0) {
      whereClause.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive' as const
          }
        }
      ];
    }

    // Sorting logic
    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };

    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "stock_asc":
        orderBy = { qty: "asc" };
        break;
      case "stock_desc":
        orderBy = { qty: "desc" };
        break;
      case "created_asc":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination (with same filters applied)
    const totalCount = await prisma.product.count({
      where: whereClause,
    });

    // Fetch products with filters, search, sorting, and pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        categoryId: categoryId || null,
        subCategoryId: subCategoryId || null,
        brandIds: brandIds ? brandIds.split(",").map(id => id.trim()).filter(id => id.length > 0) : [],
        sort: sort,
        search: search || null,
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch products",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      },
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