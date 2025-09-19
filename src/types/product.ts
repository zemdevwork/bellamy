import { Product as PrismaProduct } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

// Extend Prisma Product with relations
export interface Product extends PrismaProduct {
  brand: { id: string; name: string };
  category: { id: string; name: string };
  subCategory?: { id: string; name: string };
}

// Props for product table component
export interface ProductTableProps<TValue> {
  columns: ColumnDef<Product, TValue>[];
  data: Product[];
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
