import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Tag, 
  Layers, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { 
  getSalesMetrics, 
  getOrdersWithPaymentStatus,
  getLowStockProducts,
  getFilterOptions  
} from "@/server/actions/admin-report-actions";
import { Suspense } from "react";
import { getProductInventory } from "@/server/actions/admin-report-actions";

// $
// Loading component for individual stat cards
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

// Component for displaying dashboard stats
async function DashboardStats() {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentMetrics, lastMonthMetrics, filterOptions, lowStockProducts] = await Promise.all([
      getSalesMetrics({ startDate: currentMonth, endDate: now }),
      getSalesMetrics({ startDate: lastMonth, endDate: lastMonthEnd }),
      getFilterOptions(),
      getLowStockProducts(10)
    ]);

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculatePercentageChange(currentMetrics.totalRevenue, lastMonthMetrics.totalRevenue);
    const ordersChange = calculatePercentageChange(currentMetrics.totalOrders, lastMonthMetrics.totalOrders);
    
    const totalProducts = await getProductInventory({});
    const totalProductsCount = totalProducts.length;
    
    const stats = [
      {
        title: "Total Products",
        value: totalProductsCount.toLocaleString(),
        description: `${lowStockProducts.length} low stock items`,
        icon: Package,
        trend: lowStockProducts.length > 5 ? "down" : "neutral" as const,
        alert: lowStockProducts.length > 5
      },
      {
        title: "Total Brands",
        value: filterOptions.brands.length.toString(),
        description: "Active brands",
        icon: Tag,
        trend: "neutral" as const
      },
      {
        title: "Categories",
        value: filterOptions.categories.length.toString(),
        description: `${filterOptions.subCategories.length} subcategories`,
        icon: Layers,
        trend: "neutral" as const
      },
      {
        title: "Total Orders",
        value: currentMetrics.totalOrders.toLocaleString(),
        description: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}% from last month`,
        icon: ShoppingCart,
        trend: ordersChange >= 0 ? "up" : "down" as const
      },
      {
        title: "Revenue",
        value: `₹${currentMetrics.totalRevenue.toLocaleString()}`,
        description: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% from last month`,
        icon: DollarSign,
        trend: revenueChange >= 0 ? "up" : "down" as const
      },
      {
        title: "Average Order",
        value: `₹${currentMetrics.averageOrderValue.toFixed(2)}`,
        description: "Average order value",
        icon: TrendingUp,
        trend: "neutral" as const
      }
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={stat.alert ? "border-orange-200 bg-orange-50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {stat.alert && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stat.trend === "up" && (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  )}
                  {stat.trend === "down" && (
                    <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />
                  )}
                  {stat.trend === "neutral" && (
                    <Activity className="mr-1 h-3 w-3 text-gray-500" />
                  )}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">Error loading dashboard statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Component for recent orders
async function RecentOrders() {
  try {
    const recentOrders = await getOrdersWithPaymentStatus({});
    const latestOrders = recentOrders.slice(0, 5);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest orders from your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {latestOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No orders found
              </p>
            ) : (
              latestOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.id.slice(-8)}</p>
                    <p className="text-xs text-muted-foreground">{order.userName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{order.totalAmount.toFixed(2)}</p>
                    <p className={`text-xs ${
                      order.status === 'DELIVERED' ? 'text-green-600' :
                      order.status === 'CANCELLED' ? 'text-red-600' :
                      order.status === 'SHIPPED' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {latestOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link 
                href="/admin/orders" 
                className="text-sm text-primary hover:underline"
              >
                View all orders →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error loading recent orders:', error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading recent orders</p>
        </CardContent>
      </Card>
    );
  }
}

// Component for low stock alerts
async function LowStockAlert() {
  try {
    const lowStockProducts = await getLowStockProducts(10);
    
    return (
      <Card className={lowStockProducts.length > 0 ? "border-orange-200 bg-orange-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {lowStockProducts.length > 0 && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <span>Stock Alerts</span>
          </CardTitle>
          <CardDescription>
            Products running low on inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-green-600 text-center py-4">
                ✅ All products are well stocked
              </p>
            ) : (
              <>
                {lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand || 'No Brand'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.currentStock === 0 ? 'text-red-600' :
                        product.currentStock <= 5 ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {product.currentStock} left
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 3 && (
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      href="/admin/products?filter=lowstock" 
                      className="text-sm text-primary hover:underline"
                    >
                      View all {lowStockProducts.length} low stock items →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error loading low stock products:', error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading stock information</p>
        </CardContent>
      </Card>
    );
  }
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here&apos;s what&apos;s happening with your store.
              </p>
            </div>
          </div>

          <Suspense 
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(6).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
              </div>
            }
          >
            <DashboardStats />
          </Suspense>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Suspense 
              fallback={
                <Card>
                  <CardHeader>
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <RecentOrders />
            </Suspense>

            <Suspense 
              fallback={
                <Card>
                  <CardHeader>
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <LowStockAlert />
            </Suspense>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    href="/admin/products" 
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Manage Products</span>
                    </div>
                  </Link>
                  <Link 
                    href="/admin/orders" 
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm font-medium">View Orders</span>
                    </div>
                  </Link>
                  <Link 
                    href="/admin/customers" 
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Customer Management</span>
                    </div>
                  </Link>
                  <Link 
                    href="/admin/inventory" 
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Inventory Reports</span>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
