import { ColumnDef } from "@tanstack/react-table";

// Admin product type shaped for UI with computed fields based on variants
export interface AdminProduct {
  id: string;
  name: string;
  description?: string | null;
  image: string;
  brandId?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Computed from variants
  price: number; // first variant's price
  qty: number; // sum of all variants qty
  // Relations
  brand?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  subCategory?: { id: string; name: string } | null;
}

// Props for product table component
export interface ProductTableProps<TValue> {
  columns: ColumnDef<AdminProduct, TValue>[];
  data: AdminProduct[];
}

// Dropdown / select option type for product usage (like in sales, purchase, etc.)
export interface ProductOption {
  id: string;
  name: string;
  tax: string;
  sellingPrice: number;
  stock: number;
  excTax: number;   // price excluding tax
  incTax: number;   // price including tax
  margin: number;   // profit margin percentage
  quantity: number; // quantity to order/sell
}
