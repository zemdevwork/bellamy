'use client';

import { FC, useEffect, useState } from "react";
import { SubCategory, Category } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { createSubCategoryAction, updateSubCategoryAction } from "@/server/actions/subcategory-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const subcategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  categoryId: z.string().min(1, "Category is required"),
});

interface SubcategoryDialogFormProps {
  open?: boolean;
  openChange?: (v: boolean) => void;
  subcategory?: SubCategory;
}

export const SubcategoryDialogForm: FC<SubcategoryDialogFormProps> = ({
  open: isOpen = false,
  openChange,
  subcategory,
}) => {
  const [open, setOpen] = useState(isOpen);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  const { execute: create, isExecuting: isCreating } = useAction(createSubCategoryAction);
  const { execute: updateSub, isExecuting: isUpdating } = useAction(updateSubCategoryAction);

  // Fetch categories for dropdown
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`, { cache: "no-store" })
      .then(res => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => toast.error("Failed to fetch categories"));
  }, []);

  useEffect(() => {
    openChange?.(open);
  }, [open, openChange]);

  const form = useForm<z.infer<typeof subcategorySchema>>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: subcategory?.name || "",
      categoryId: subcategory?.categoryId || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof subcategorySchema>) => {
    try {
      if (!subcategory) await create(values);
      if (subcategory) await updateSub({ id: subcategory.id, ...values });
      router.refresh();
      toast.success(`Subcategory ${subcategory ? "updated" : "added"} successfully`);
    } catch {
      toast.error("Failed to save subcategory");
    } finally {
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!subcategory && (
        <DialogTrigger asChild>
          <Button variant="outline">Add Subcategory</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subcategory ? "Edit" : "Add"} Subcategory</DialogTitle>
        </DialogHeader>
        <DialogDescription>Fill subcategory details below.</DialogDescription>

        <form className="space-y-4 mt-2" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Name */}
          <Input {...form.register("name")} placeholder="Subcategory Name" />

          {/* Category Dropdown */}
          <Select onValueChange={(val) => form.setValue("categoryId", val)} value={form.watch("categoryId")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{isCreating || isUpdating ? "Loading..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
