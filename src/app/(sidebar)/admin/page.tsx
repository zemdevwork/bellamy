import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Tag, 
  Layers, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  // Mock data - replace with real data from your API
  const stats = [
    {
      title: "Total Products",
      value: "1,234",
      description: "+12% from last month",
      icon: Package,
      trend: "up"
    },
    {
      title: "Total Brands",
      value: "45",
      description: "+3 new this month",
      icon: Tag,
      trend: "up"
    },
    {
      title: "Categories",
      value: "12",
      description: "No change",
      icon: Layers,
      trend: "neutral"
    },
    {
      title: "Total Orders",
      value: "2,847",
      description: "+8% from last month",
      icon: ShoppingCart,
      trend: "up"
    },
    {
      title: "Customers",
      value: "1,523",
      description: "+15% from last month",
      icon: Users,
      trend: "up"
    },
    {
      title: "Revenue",
      value: "$45,231",
      description: "+20% from last month",
      icon: DollarSign,
      trend: "up"
    }
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Welcome Message */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Welcome back! Here&apos;s what&apos;s happening with your store.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
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

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders from your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: "ORD-001", customer: "John Doe", amount: "$129.99", status: "Completed" },
                    { id: "ORD-002", customer: "Jane Smith", amount: "$89.50", status: "Processing" },
                    { id: "ORD-003", customer: "Bob Johnson", amount: "$234.00", status: "Shipped" },
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{order.amount}</p>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <a 
                    href="/admin/products" 
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Manage Products</span>
                    </div>
                  </a>
                  <a 
                    href="/admin/orders" 
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm font-medium">View Orders</span>
                    </div>
                  </a>
                  <a 
                    href="/admin/customers" 
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Customer Management</span>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
