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
import { Plus} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { createProductAction, updateProductAction } from "@/server/actions/product-action";
import { getBrandlistForDropdown } from "@/server/actions/brand-actions";
import { getCategorylistForDropdown } from "@/server/actions/category-actions";
import { getSubCategorylistByCategory } from "@/server/actions/subcategory-actions";
import { ProductDetail } from "@/types/product";

export const ProductFormDialog = ({
  product,
  open,
  openChange,
}: {
  product?: ProductDetail;
  open?: boolean;
  openChange?: (open: boolean) => void;
}) => {
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  // ✅ UPDATED: Added result handlers to close modal after completion
  const { execute: createProduct, isExecuting: isCreating } = useAction(createProductAction, {
    onSuccess: () => {
      toast.success("Product created successfully!");
      form.reset();
      setPreview(null);
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
      // price/qty handled by variants now
      brandId: product?.brandId || "",
      categoryId: product?.categoryId || "",
      subcategoryId: product?.subCategoryId || "",
      image: undefined,
      // removed subimage/attributes in new model
    },
  });
  
  // ✅ Hydrate previews when editing
  useEffect(() => {
    if (product) {
      setPreview(product.image || null);
    } else {
      setPreview(null);
    }
  }, [product]);
  
  // --- Fetch dropdown data ---
  useEffect(() => {
    const fetchOptions = async () => {
      const brandRes = await getBrandlistForDropdown();
      const categoryRes = await getCategorylistForDropdown();
      setBrands(brandRes);
      setCategories(categoryRes);
      // Load subcategories if editing and a category is set
      const currentCategory = form.getValues("categoryId");
      if (currentCategory) {
        const subRes = await getSubCategorylistByCategory(currentCategory);
        setSubcategories(subRes);
      }
    };
    fetchOptions();
  }, [form]);

  // Filter subcategories whenever category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      const categoryId = form.watch("categoryId");
      if (categoryId) {
        const subRes = await getSubCategorylistByCategory(categoryId);
        setSubcategories(subRes);
        // Clear subcategory if it no longer belongs
        const currentSub = form.getValues("subcategoryId");
        if (currentSub && !subRes.find(s => s.id === currentSub)) {
          form.setValue("subcategoryId", "");
        }
      } else {
        setSubcategories([]);
        form.setValue("subcategoryId", "");
      }
    };

    const subscription = form.watch((_value, { name }) => {
      if (name === "categoryId") {
        loadSubcategories();
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // ✅ UPDATED: Simplified onSubmit - base product only
  const onSubmit = async (formValues: CreateProductFormValues) => {
    if (product) {
      // For updates, only validate required fields if image/subimage are provided
      const updateData = {
        id: product.id,
        name: formValues.name,
        description: formValues.description,
        brandId: formValues.brandId,
        categoryId: formValues.categoryId,
        subcategoryId: formValues.subcategoryId,
        // Only include image/subimage if new files are uploaded
        ...(formValues.image && { image: formValues.image }),
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
        brandId: formValues.brandId,
        categoryId: formValues.categoryId,
        subcategoryId: formValues.subcategoryId,
        image: formValues.image,
      };
      
      createProduct(createData);
    }
  };

  // Attributes removed in new model; variants hold options

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

        {/* Price & Qty moved to variants */}

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

        {/* Attributes removed. Use variant options in variant modal. */}

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

        {/* Sub Images removed; variant images live on variants */}

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