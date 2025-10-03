"use client";

import { ProductDetail } from "@/types/product";
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
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export const productColumns: ColumnDef<ProductDetail>[] = [
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
      const text = desc || "-";
      const truncated = text.length > 60 ? `${text.slice(0, 60)}…` : text;
      return <div className="max-w-sm text-muted-foreground">{truncated}</div>;
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
  // Removed attributes column due to variant model
  {
    id: "action",
    cell: ({ row }) => {
      return row.original && <ProductDropdownMenu product={row.original} />;
    },
  },
];

export const ProductDropdownMenu = ({ product }: { product: ProductDetail }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAddVariant, setOpenAddVariant] = useState(false);
  const router = useRouter();

  const handleEditClick = () => {
    setOpenEdit(true);
  };

  const handleDeleteClick = () => {
    setOpenDelete(true);
  };
  const handleAddVariantClick = () => {
    setOpenAddVariant(true);
  };

  const handleViewClick = () => {
    
    router.push(`/admin/products/${product.id}`);
  };

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
          <DropdownMenuItem onSelect={handleViewClick}>
            <Eye className="size-4 mr-2" />
            View
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleEditClick}>
            <Edit2 className="size-4 mr-2" />
            Edit Product
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleAddVariantClick}>
            <Plus className="size-4 mr-2" />
            Add Variant
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive"
            onSelect={handleDeleteClick}
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
      {openAddVariant && <InlineAddVariant productId={product.id} onClose={() => setOpenAddVariant(false)} />}
    </div>
  );
};

import { useAction } from "next-safe-action/hooks";
import { createVariantAction } from "@/server/actions/variant-actions";
import { Input } from "@/components/ui/input";

function InlineAddVariant({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [attributes, setAttributes] = useState<{ id: string; name: string; values: { id: string; value: string }[] }[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ attributeId: string; valueId: string }[]>([]);
  const { execute, isExecuting } = useAction(createVariantAction, {
    onSuccess: () => { onClose(); },
  });

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/attributes');
      const data = await res.json();
      setAttributes(data || []);
    })();
  }, []);

  const setOption = (attributeId: string, valueId: string) => {
    setSelectedOptions((prev) => {
      const without = prev.filter(o => o.attributeId !== attributeId);
      return [...without, { attributeId, valueId }];
    });
  };

  const submit = async () => {
    const form = new FormData();
    form.append("productId", productId);
    form.append("price", price);
    form.append("qty", qty);
    files.forEach((f) => form.append("images", f));
    form.append("options", JSON.stringify(selectedOptions));
    await execute(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-4 w-full max-w-md space-y-3">
        <div className="font-semibold">Add Variant</div>
        <div className="space-y-2">
          {attributes.map(attr => (
            <div key={attr.id} className="flex items-center gap-2">
              <div className="w-28 text-sm text-muted-foreground">{attr.name}</div>
              <select className="border rounded px-2 py-1 text-sm flex-1"
                onChange={(e) => setOption(attr.id, e.target.value)}
                value={selectedOptions.find(o => o.attributeId === attr.id)?.valueId || ''}
              >
                <option value="">Select</option>
                {attr.values.map(v => (
                  <option key={v.id} value={v.id}>{v.value}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <Input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input type="number" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={isExecuting || !price || !qty || files.length === 0}>
            {isExecuting ? "Saving..." : "Save Variant"}
          </Button>
        </div>
      </div>
    </div>
  );
}