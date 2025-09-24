'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types for filters and responses
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface SalesMetricsFilter extends DateRangeFilter {
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod?: 'COD' | 'ONLINE';
  userId?: string;
}

export interface ProductFilter {
  brandId?: string;
  categoryId?: string;
  subCategoryId?: string;
  lowStock?: number; // Products with qty <= this value
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
}

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  totalQuantitySold: number;
  totalRevenue: number;
  currentStock: number;
  brand?: string;
  category?: string;
  image: string;
}

export interface ProductInventory {
  id: string;
  name: string;
  currentStock: number;
  price: number;
  brand?: string;
  category?: string;
  subCategory?: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummary {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  itemCount: number;
  phoneNumber: string;
  city: string;
  state: string;
}

// Sales Metrics Server Action
export async function getSalesMetrics(filter: SalesMetricsFilter = {}): Promise<SalesMetrics> {
  try {
    const whereClause: Record<string, unknown> = {};

    // Date range filter
    if (filter.startDate || filter.endDate) {
      whereClause.createdAt = {};
      if (filter.startDate) {
        (whereClause.createdAt as Record<string, unknown>).gte = filter.startDate;
      }
      if (filter.endDate) {
        (whereClause.createdAt as Record<string, unknown>).lte = filter.endDate;
      }
    }

    // Status filter
    if (filter.status) {
      whereClause.status = filter.status;
    }

    // Payment method filter
    if (filter.paymentMethod) {
      whereClause.paymentMethod = filter.paymentMethod;
    }

    // User filter
    if (filter.userId) {
      whereClause.userId = filter.userId;
    }

    const [totalSales, salesAggregation] = await Promise.all([
      // Count total orders
      prisma.order.count({
        where: whereClause,
      }),
      
      // Calculate revenue and average
      prisma.order.aggregate({
        where: whereClause,
        _sum: {
          totalAmount: true,
        },
        _avg: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalSales,
      totalOrders: totalSales,
      averageOrderValue: salesAggregation._avg.totalAmount || 0,
      totalRevenue: salesAggregation._sum.totalAmount || 0,
    };
  } catch (error) {
    console.error('Error fetching sales metrics:', error);
    throw new Error('Failed to fetch sales metrics');
  }
}

// Top Selling Products Server Action
export async function getTopSellingProducts(
  limit: number = 10,
  filter: DateRangeFilter = {}
): Promise<TopSellingProduct[]> {
  try {
    const whereClause: Record<string, unknown> = {};

    // Date range filter for orders
    if (filter.startDate || filter.endDate) {
      whereClause.order = {
        createdAt: {}
      };
      if (filter.startDate) {
        ((whereClause.order as Record<string, unknown>).createdAt as Record<string, unknown>).gte = filter.startDate;
      }
      if (filter.endDate) {
        ((whereClause.order as Record<string, unknown>).createdAt as Record<string, unknown>).lte = filter.endDate;
      }
    }

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: whereClause,
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Get detailed product information
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            brand: true,
            category: true,
          },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        return {
          id: product.id,
          name: product.name,
          totalQuantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.price || 0,
          currentStock: product.qty,
          brand: product.brand?.name,
          category: product.category?.name,
          image: product.image,
        };
      })
    );

    return productsWithDetails;
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw new Error('Failed to fetch top selling products');
  }
}

// Product Inventory Report Server Action
export async function getProductInventory(filter: ProductFilter = {}): Promise<ProductInventory[]> {
  try {
    const whereClause: Record<string, unknown> = {};

    // Brand filter
    if (filter.brandId) {
      whereClause.brandId = filter.brandId;
    }

    // Category filter
    if (filter.categoryId) {
      whereClause.categoryId = filter.categoryId;
    }

    // Subcategory filter
    if (filter.subCategoryId) {
      whereClause.subCategoryId = filter.subCategoryId;
    }

    // Low stock filter
    if (filter.lowStock !== undefined) {
      whereClause.qty = {
        lte: filter.lowStock,
      };
    }

    // Price range filter
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      whereClause.price = {};
      if (filter.minPrice !== undefined) {
        (whereClause.price as Record<string, unknown>).gte = filter.minPrice;
      }
      if (filter.maxPrice !== undefined) {
        (whereClause.price as Record<string, unknown>).lte = filter.maxPrice;
      }
    }

    // Search term filter
    if (filter.searchTerm) {
      whereClause.OR = [
        {
          name: {
            contains: filter.searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filter.searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true,
        category: true,
        subCategory: true,
      },
      orderBy: {
        qty: 'asc', // Show low stock items first
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      currentStock: product.qty,
      price: product.price,
      brand: product.brand?.name,
      category: product.category?.name,
      subCategory: product.subCategory?.name,
      image: product.image,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    throw new Error('Failed to fetch product inventory');
  }
}

// Orders with Payment Status Server Action
export async function getOrdersWithPaymentStatus(
  filter: SalesMetricsFilter = {}
): Promise<OrderSummary[]> {
  try {
    const whereClause: Record<string, unknown> = {};

    // Date range filter
    if (filter.startDate || filter.endDate) {
      whereClause.createdAt = {};
      if (filter.startDate) {
        (whereClause.createdAt as Record<string, unknown>).gte = filter.startDate;
      }
      if (filter.endDate) {
        (whereClause.createdAt as Record<string, unknown>).lte = filter.endDate;
      }
    }

    // Status filter
    if (filter.status) {
      whereClause.status = filter.status;
    }

    // Payment method filter
    if (filter.paymentMethod) {
      whereClause.paymentMethod = filter.paymentMethod;
    }

    // User filter
    if (filter.userId) {
      whereClause.userId = filter.userId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      userName: order.user.name,
      userEmail: order.user.email,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      razorpayOrderId: order.razorpayOrderId || undefined,
      razorpayPaymentId: order.razorpayPaymentId || undefined,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      phoneNumber: order.phoneNumber,
      city: order.city,
      state: order.state,
    }));
  } catch (error) {
    console.error('Error fetching orders with payment status:', error);
    throw new Error('Failed to fetch orders with payment status');
  }
}

// Get Low Stock Products Alert
export async function getLowStockProducts(threshold: number = 10): Promise<ProductInventory[]> {
  try {
    const products = await getProductInventory({ lowStock: threshold });
    return products;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw new Error('Failed to fetch low stock products');
  }
}

// Get Sales by Date Range (for charts/graphs)
export async function getSalesByDateRange(
  filter: DateRangeFilter = {}
): Promise<Array<{ date: string; sales: number; orders: number }>> {
  try {
    const whereClause: Record<string, unknown> = {};

    // Date range filter
    if (filter.startDate || filter.endDate) {
      whereClause.createdAt = {};
      if (filter.startDate) {
        (whereClause.createdAt as Record<string, unknown>).gte = filter.startDate;
      }
      if (filter.endDate) {
        (whereClause.createdAt as Record<string, unknown>).lte = filter.endDate;
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const salesByDate = orders.reduce((acc: Record<string, { sales: number; orders: number }>, order) => {
      const date = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!acc[date]) {
        acc[date] = { sales: 0, orders: 0 };
      }
      
      acc[date].sales += order.totalAmount;
      acc[date].orders += 1;
      
      return acc;
    }, {});

    return Object.entries(salesByDate).map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders,
    }));
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    throw new Error('Failed to fetch sales by date range');
  }
}

// Get Available Filter Options
export async function getFilterOptions(): Promise<{
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  subCategories: Array<{ id: string; name: string; categoryId: string }>;
}> {
  try {
    const [brands, categories, subCategories] = await Promise.all([
      prisma.brand.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      
      prisma.subCategory.findMany({
        select: {
          id: true,
          name: true,
          categoryId: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      brands,
      categories,
      subCategories,
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw new Error('Failed to fetch filter options');
  }
}

// Get Order Details with Items
export async function getOrderDetails(orderId: string): Promise<{
  order: OrderSummary & {
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      productImage: string;
    }>;
  };
} | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return {
      order: {
        id: order.id,
        userId: order.userId,
        userName: order.user.name,
        userEmail: order.user.email,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        razorpayOrderId: order.razorpayOrderId || undefined,
        razorpayPaymentId: order.razorpayPaymentId || undefined,
        createdAt: order.createdAt,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        phoneNumber: order.phoneNumber,
        city: order.city,
        state: order.state,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          productImage: item.product.image,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Failed to fetch order details');
  }
}