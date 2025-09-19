"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Tag,
  Layers,
  Package,
  Users,
  Settings,
  BarChart3,
  ShoppingCart,
  FileText,
  ChevronRight,
  Boxes,
} from "lucide-react";

interface AdminHeaderProps {
  className?: string;
}

interface PageInfo {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const pageMap: Record<string, PageInfo> = {
  "/admin": {
    title: "Dashboard",
    description: "Overview of your store",
    icon: LayoutDashboard,
  },
  "/admin/products": {
    title: "Products",
    description: "Manage your product inventory",
    icon: Package,
  },
  "/admin/brand": {
    title: "Brands",
    description: "Manage product brands",
    icon: Tag,
  },
  "/admin/category": {
    title: "Categories",
    description: "Organize product categories",
    icon: Layers,
  },
  "/admin/subcategory": {
    title: "Subcategories",
    description: "Manage product subcategories",
    icon: FileText,
  },
  "/admin/orders": {
    title: "Orders",
    description: "View and manage customer orders",
    icon: ShoppingCart,
  },
  "/admin/customers": {
    title: "Customers",
    description: "Manage customer information",
    icon: Users,
  },
  "/admin/inventory": {
    title: "Inventory",
    description: "View and manage product inventory",
    icon: Boxes,
  },
  "/admin/analytics": {
    title: "Analytics",
    description: "View store performance metrics",
    icon: BarChart3,
  },
  "/admin/settings": {
    title: "Settings",
    description: "Configure store settings",
    icon: Settings,
  },
};

export function AdminHeader({ className }: AdminHeaderProps) {
  const pathname = usePathname();
  
  // Get current page info or default to dashboard
  const currentPage = pageMap[pathname] || pageMap["/admin"];
  const Icon = currentPage.icon;

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b border-sidebar-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Admin</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{currentPage.title}</span>
        </nav>

        {/* Page Info */}
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                {currentPage.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentPage.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
