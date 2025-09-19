'use client';

import { Product } from "@prisma/client";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    MoreVertical,
    Package,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import InventoryDialogForm from "./inventory-dialog-form";

// Extended Product type with relations
type ProductWithRelations = Product & {
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  subCategory: { id: string; name: string } | null;
  isLowStock: boolean;
};

// Format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ✅ ActionCell for Renew Stock
function ActionCell({ row }: { row: Row<ProductWithRelations> }) {
    const [openInventory, setOpenInventory] = useState(false);
    const product = row.original;

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpenInventory(true)}>
            <Package className="mr-2 size-4" />
            Renew Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

       <InventoryDialogForm
                productId={product.id}
                productName={product.name}
                currentQty={product.qty}
                open={openInventory}
                onOpenChange={setOpenInventory}
            />
    </div>
  );
}
// Sortable header component
import { Column } from "@tanstack/react-table";

const SortableHeader = ({ column, children }: { column: Column<ProductWithRelations, unknown>; children: React.ReactNode }) => {
  const sort = column.getIsSorted();
  const renderIcon = () => {
    if (!sort) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    if (sort === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sort === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
  };
  
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(sort === "asc")}>
      {children} {renderIcon()}
    </Button>
  );
};

export const inventoryColumns: ColumnDef<ProductWithRelations>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <SortableHeader column={column}>Name</SortableHeader>
        ),
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <div className="font-medium">{product.name}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.category;
            return (
                <div className="space-y-1">
                    {category && (
                        <Badge variant="secondary">{category.name}</Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => {
            const brand = row.original.brand;
            return brand ? (
                <Badge variant="outline">{brand.name}</Badge>
            ) : (
                <span className="text-muted-foreground">No brand</span>
            );
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <SortableHeader column={column}>Price</SortableHeader>
        ),
        cell: ({ row }) => {
            const price = row.getValue("price") as number;
            return (
                <div className="font-medium">
                    {formatCurrency(price)}
                </div>
            );
        },
    },
    {
        accessorKey: "qty",
        header: ({ column }) => (
            <SortableHeader column={column}>Stock</SortableHeader>
        ),
        cell: ({ row }) => {
            const qty = row.getValue("qty") as number;
            const isLowStock = row.original.isLowStock;
            
            return (
                <div className="flex items-center space-x-2">
                    {isLowStock && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className={`font-medium ${isLowStock ? 'text-amber-600' : ''}`}>
                        {qty}
                    </span>
                    {isLowStock && (
                        <Badge variant="destructive" className="text-xs">
                            Low Stock
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <SortableHeader column={column}>Created</SortableHeader>
        ),
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as Date;
            return (
                <div className="text-sm text-muted-foreground">
                    {formatDate(date)}
                </div>
            );
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => (
            <SortableHeader column={column}>Updated</SortableHeader>
        ),
        cell: ({ row }) => {
            const date = row.getValue("updatedAt") as Date;
            return (
                <div className="text-sm text-muted-foreground">
                    {formatDate(date)}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: (props) => <ActionCell row={props.row} />,
    },
];