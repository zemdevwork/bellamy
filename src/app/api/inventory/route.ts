// src/app/api/products/route.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Extract query parameters from URL
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // default sort by creation date
    const sortOrder = searchParams.get("sortOrder") || "desc"; // default descending
    
    if (!page || !limit) {
      return NextResponse.json({ error: "Missing page or limit" }, { status: 400 });
    }

    const pageNum = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(pageSize)) {
      return NextResponse.json({ error: "Invalid page or limit" }, { status: 400 });
    }

    // Validate sort parameters
    const validSortFields = ["name", "createdAt", "qty", "price", "updatedAt"];
    const validSortOrders = ["asc", "desc"];

    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json({ 
        error: `Invalid sortBy field. Valid options: ${validSortFields.join(", ")}` 
      }, { status: 400 });
    }

    if (!validSortOrders.includes(sortOrder)) {
      return NextResponse.json({ 
        error: `Invalid sortOrder. Valid options: ${validSortOrders.join(", ")}` 
      }, { status: 400 });
    }

    const where: Prisma.ProductWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        categoryId ? { categoryId: categoryId } : {},
        brandId ? { brandId: brandId } : {},
      ],
    };

    // Create orderBy object based on sort parameters
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder as "asc" | "desc"
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          subCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const results = products.map((p) => ({
      ...p,
      isLowStock: p.qty <= 10,
    }));

    return NextResponse.json({
      data: results,
      meta: {
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        sortBy,
        sortOrder,
      }
    }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { productIds, qty } = body;
    
    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ 
        error: "productIds array is required and must not be empty." 
      }, { status: 400 });
    }
    
    if (qty === undefined || qty === null) {
      return NextResponse.json({ 
        error: "qty is required." 
      }, { status: 400 });
    }

    const quantity = parseInt(qty, 10);
    
    if (isNaN(quantity) || quantity < 0) {
      return NextResponse.json({ 
        error: "Invalid quantity. Must be a non-negative number." 
      }, { status: 400 });
    }

    const updatedProducts = [];
    const notifications = [];
    const failedUpdates = [];

    // Process each product update
    for (const productId of productIds) {
      if (!productId || typeof productId !== 'string') {
        failedUpdates.push({
          productId: productId || 'undefined',
          error: 'Invalid product ID'
        });
        continue;
      }

      try {
        const product = await prisma.product.update({
          where: { id: productId },
          data: { qty: quantity },
        });

        updatedProducts.push(product);

        // Check if low stock notification needed
        if (product.qty <= 10) {
          const exists = await prisma.notification.findFirst({
            where: { 
              productId: product.id, 
              seen: false,
              message: { contains: "low on stock" }
            },
          });

          if (!exists) {
            const notification = await prisma.notification.create({
              data: {
                productId: product.id,
                message: `${product.name} is low on stock (${product.qty} left).`,
              },
            });
            notifications.push(notification);
          }
        }
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
        failedUpdates.push({
          productId,
          error: 'Product not found or update failed'
        });
      }
    }

    // Prepare response
    const response = {
      message: `Updated ${updatedProducts.length} out of ${productIds.length} products with quantity ${quantity}.`,
      summary: {
        total: productIds.length,
        successful: updatedProducts.length,
        failed: failedUpdates.length,
        notificationsCreated: notifications.length,
      },
      updatedProducts,
      ...(failedUpdates.length > 0 && { failedUpdates }),
    };

    return NextResponse.json(response, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}