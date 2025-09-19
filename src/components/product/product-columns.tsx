"use client";

import { Product } from "@/types/product";
import { ProductFormDialog } from "./product-dialog-form";
import { ProductDeleteDialog } from "./delete-product-dialog";

import { ColumnDef } from "@tanstack/react-table";
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
  Edit2,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string | null;
      return image ? (
        <Image
          src={image}
          alt="Product"
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
      ) : (
        <span className="text-muted-foreground">No image</span>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      const renderIcon = () => {
        if (!sort) return <ArrowUpDown className="size-4" />;
        if (sort === "asc") return <ArrowUp className="size-4" />;
        if (sort === "desc") return <ArrowDown className="size-4" />;
        return null;
      };

      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(sort === "asc")}
        >
          Name
          {renderIcon()}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="px-3 font-medium">{row.getValue("name") as string}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | null;
      return (
        <div className="truncate max-w-xs text-muted-foreground">
          {desc || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const amount = row.getValue("price") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "qty",
    header: "Stock",
    cell: ({ row }) => {
      const qty = row.getValue("qty") as number;
      return (
        <span
          className={`${
            qty > 0 ? "text-green-600" : "text-red-600"
          } font-semibold`}
        >
          {qty}
        </span>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => row.original.brand?.name || "-",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name || "-",
  },
  {
    accessorKey: "subcategory",
    header: "Subcategory",
    cell: ({ row }) => row.original.subCategory?.name || "-",
  },
  {
    accessorKey: "attributes",
    header: "Attributes",
    cell: ({ row }) => {
      const attrs = row.getValue("attributes") as { key: string; value: string }[] | undefined;
      if (!attrs || attrs.length === 0) return <span>-</span>;
      return (
        <div className="flex flex-col gap-1">
          {attrs.slice(0, 2).map((attr, i) => (
            <span key={i} className="text-xs text-muted-foreground">
              {attr.key}: {attr.value}
            </span>
          ))}
          {attrs.length > 2 && (
            <span className="text-xs text-blue-500">+{attrs.length - 2} more</span>
          )}
        </div>
      );
    },
  },
  {
    id: "action",
    cell: ({ row }) =>
      row.original && <ProductDropdownMenu product={row.original} />,
  },
];

export const ProductDropdownMenu = ({ product }: { product: Product }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const router = useRouter();

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => router.push(`/products/${product.id}`)}
          >
            <Eye className="size-4 mr-2" />
            View
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Edit2 className="size-4 mr-2" />
            Edit Product
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setOpenDelete(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <ProductFormDialog
        product={product}
        open={openEdit}
        openChange={setOpenEdit}
      />

      {/* Delete Dialog */}
      <ProductDeleteDialog
        product={product}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </div>
  );
};
