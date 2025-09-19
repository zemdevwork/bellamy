"use client";

import { useEffect, useState } from "react";
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
import { createProductFormSchema, CreateProductFormValues } from "@/schema/product-schema";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { createProductAction, updateProductAction } from "@/server/actions/product-action";
import { getBrandlistForDropdown } from "@/server/actions/brand-actions";
import { getCategorylistForDropdown } from "@/server/actions/category-actions";
import { getSubCategorylistForDropdown } from "@/server/actions/subcategory-actions";
import { Product } from "@/types/product";

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

  // ✅ UPDATED: Added result handlers to close modal after completion
  const { execute: createProduct, isExecuting: isCreating } = useAction(createProductAction, {
    onSuccess: () => {
      toast.success("Product created successfully!");
      form.reset();
      setPreview(null);
      setSubPreviews([]);
      router.refresh();
      openChange?.(false); // Close modal on success
    },
    onError: (error) => {
      console.error("Create product error:", error);
      toast.error("Failed to create product");
    },
  });

  const { execute: updateProduct, isExecuting: isUpdating } = useAction(updateProductAction, {
    onSuccess: () => {
      toast.success("Product updated successfully!");
      form.reset();
      setPreview(null);
      setSubPreviews([]);
      router.refresh();
      openChange?.(false); // Close modal on success
    },
    onError: (error) => {
      console.error("Update product error:", error);
      toast.error("Failed to update product");
    },
  });

  // ✅ FIXED: Use the form schema for the form, not the processed schema
  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price?.toString() || "", // Convert to string
      qty: product?.qty?.toString() || "", // Convert to string
      brandId: product?.brandId || "",
      categoryId: product?.categoryId || "",
      subcategoryId: product?.subCategoryId || "",
      image: undefined,
      subimage: undefined,
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

  // ✅ UPDATED: Simplified onSubmit - let the action handlers deal with success/error
  const onSubmit = async (formValues: CreateProductFormValues) => {
    if (product) {
      // For updates, only validate required fields if image/subimage are provided
      const updateData = {
        id: product.id,
        name: formValues.name,
        description: formValues.description,
        price: formValues.price,
        qty: formValues.qty,
        brandId: formValues.brandId,
        categoryId: formValues.categoryId,
        subcategoryId: formValues.subcategoryId,
        attributes: formValues.attributes,
        // Only include image/subimage if new files are uploaded
        ...(formValues.image && { image: formValues.image }),
        ...(formValues.subimage && formValues.subimage.length > 0 && { subimage: formValues.subimage }),
      };
      
      updateProduct(updateData);
    } else {
      // For create, image is required
      if (!formValues.image) {
        toast.error("Product image is required");
        return;
      }
      
      const createData = {
        name: formValues.name,
        description: formValues.description || "",
        price: formValues.price,
        qty: formValues.qty,
        brandId: formValues.brandId,
        categoryId: formValues.categoryId,
        subcategoryId: formValues.subcategoryId,
        image: formValues.image,
        subimage: formValues.subimage || [],
        attributes: formValues.attributes || [],
      };
      
      createProduct(createData);
    }
  };

  // Helper functions for attributes
  const addAttribute = () => {
    const currentAttributes = form.getValues("attributes") || [];
    form.setValue("attributes", [...currentAttributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    const currentAttributes = form.getValues("attributes") || [];
    form.setValue("attributes", currentAttributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: "key" | "value", value: string) => {
    const currentAttributes = form.getValues("attributes") || [];
    const updatedAttributes = [...currentAttributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    form.setValue("attributes", updatedAttributes);
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
              : "Fill out the product details. Click save when you're done."}
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
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field}
                    placeholder="0.00"
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
                  <Input 
                    type="number" 
                    {...field}
                    placeholder="0"
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

        {/* Attributes */}
        <FormField
          control={form.control}
          name="attributes"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Product Attributes</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                >
                  <Plus className="size-4 mr-1" />
                  Add Attribute
                </Button>
              </div>
              <div className="space-y-3">
                {form.watch("attributes")?.map((attr, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Attribute name (e.g., Color, Size)"
                        value={attr.key || ""}
                        onChange={(e) => updateAttribute(index, "key", e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Attribute value (e.g., Red, Large)"
                        value={attr.value || ""}
                        onChange={(e) => updateAttribute(index, "value", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                {(!form.watch("attributes") || form.watch("attributes")?.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No attributes added. Click &quot;Add Attribute&quot; to add product specifications.
                  </p>
                )}
              </div>
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
              <FormLabel>
                Product Image
                {!product && <span className="text-red-500 ml-1">*</span>}
                {product && <span className="text-sm text-muted-foreground ml-2">(Leave empty to keep current)</span>}
              </FormLabel>
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
              <FormLabel>
                Sub Images (max 3)
                {product && <span className="text-sm text-muted-foreground ml-2">(Leave empty to keep current)</span>}
              </FormLabel>
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