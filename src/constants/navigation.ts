import {
  IconBrandProducthunt,
  IconCategory,
  IconCategory2,
  IconDashboard,
  IconFileText,
  IconIcons,
  IconShoppingBag,
  IconTruck,
  IconUserPlus
} from '@tabler/icons-react';
import type { SidebarData } from '@/types/navigation';
import { APP_CONFIG } from '@/config/app';

export const SIDEBAR_DATA: SidebarData = {
  // main navigation for all users
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Products',
      url: '/admin/products',
      icon: IconTruck,
    },
    {
      title: 'Brands',
      url: '/admin/brand',
      icon: IconIcons,
    },
    {
      title: 'Categories',
      url: '/admin/category',
      icon: IconCategory,
    },
    {
      title: 'Sub-category',
      url: '/admin/subcategory',
      icon: IconCategory2,
    },
    {
      title: 'Orders',
      url: '/admin/order',
      icon: IconShoppingBag,
    },
  ],

  // only admin can see this navigation
  admin: [
    {
      title: 'Products',
      url: '/admin/products',
      icon: IconBrandProducthunt
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconFileText,
      children: [
        {
          title: "Sales Report",
          url: "/reports/sales-reports",
        },
        {
          title: "Purchase Report",
          url: "/reports/purchase-reports",
        },
      ],
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUserPlus,
    },
  ],

};

export const COMPANY_INFO = {
  name: APP_CONFIG.name,
  description: APP_CONFIG.description,
} as const;
