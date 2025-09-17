"use client";

import { FC, useEffect, useState } from "react";
import Image from "next/image";
import {
  DialogClose,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormDialog,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
  FormDialogTrigger,
} from "@/components/ui/form-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/schema/product-schema";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { createProductAction, updateProductAction } from "@/server/actions/product-action";
import { getBrandlistForDropdown } from "@/server/actions/brand-actions";
import { getCategorylistForDropdown } from "@/server/actions/category-actions";
import { getSubCategorylistForDropdown } from "@/server/actions/subcategory-actions";
import { Product } from "@/types/product";

type ProductFormValues = z.infer<typeof createProductSchema>;

export const ProductFormDialog = ({
  product,
  open,
  openChange,
}: {
  product?: Product;
  open?: boolean;
  openChange?: (open: boolean) => void;
}) => {
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [subPreviews, setSubPreviews] = useState<string[]>([]);
  const router = useRouter();

  const { execute: createProduct, isExecuting: isCreating } = useAction(createProductAction);
  const { execute: updateProduct, isExecuting: isUpdating } = useAction(updateProductAction);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || undefined,
      qty: product?.qty || undefined,
      brandId: product?.brandId || "",
      categoryId: product?.categoryId || "",
      subcategoryId: product?.subCategoryId || "",
      image: undefined as any, // only used for new upload
      subimage: [] as any,     // only used for new upload
      attributes: (product?.attributes as { key?: string; value?: string }[] | undefined) || [],
    },
  });
  
  // ✅ Hydrate previews when editing
  useEffect(() => {
    if (product) {
      setPreview(product.image || null);
      setSubPreviews(product.subimage || []);
    } else {
      setPreview(null);
      setSubPreviews([]);
    }
  }, [product]);
  
  // --- Fetch dropdown data ---
  useEffect(() => {
    const fetchOptions = async () => {
      const brandRes = await getBrandlistForDropdown();
      const categoryRes = await getCategorylistForDropdown();
      const subCategoryRes = await getSubCategorylistForDropdown();
      setBrands(brandRes);
      setCategories(categoryRes);
      setSubcategories(subCategoryRes);
    };
    fetchOptions();
  }, []);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (product) {
        await updateProduct({ id: product.id, ...values });
        toast.success("Product updated successfully");
      } else {
        await createProduct(values);
        toast.success("Product added successfully");
      }
      form.reset();
      setPreview(null);
      setSubPreviews([]);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error submitting form");
    } finally {
      openChange?.(false);
    }
  };

  return (
    <FormDialog
      open={open}
      openChange={openChange}
      form={form}
      onSubmit={onSubmit}
    >
      <FormDialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          Product
        </Button>
      </FormDialogTrigger>

      <FormDialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <FormDialogHeader>
          <FormDialogTitle>{product ? "Edit" : "New"} Product</FormDialogTitle>
          <FormDialogDescription>
            {product
              ? "Update the product details"
              : "Fill out the product details. Click save when you’re done."}
          </FormDialogDescription>
        </FormDialogHeader>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Product name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Product description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price & Qty */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" 
                  {...field}
                  value={field.value ?? ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Qty</FormLabel>
                <FormControl>
                  <Input type="number" 
                  {...field}
                  value={field.value ?? ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Brand */}
        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subcategory */}
        <FormField
          control={form.control}
          name="subcategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image */}
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  {...rest}
                  value={undefined}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </FormControl>
              {preview && (
                <div className="mt-2 relative h-24 w-24 rounded-md border overflow-hidden">
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sub Images */}
        <FormField
          control={form.control}
          name="subimage"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel>Sub Images (max 3)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    onChange(files);
                    setSubPreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
              </FormControl>
              <div className="mt-2 flex gap-2 flex-wrap">
                {subPreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 w-20 rounded-md border overflow-hidden"
                  >
                    <Image src={src} alt={`Sub ${idx}`} fill className="object-cover" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-black/50 text-white p-1"
                      onClick={() => {
                        const newPreviews = subPreviews.filter((_, i) => i !== idx);
                        setSubPreviews(newPreviews);
                        form.setValue(
                          "subimage",
                          (form.getValues("subimage") || []).filter((_, i) => i !== idx)
                        );
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormDialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? "Saving..." : "Save"}
          </Button>
        </FormDialogFooter>
      </FormDialogContent>
    </FormDialog>
  );
};
