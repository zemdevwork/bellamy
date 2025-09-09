'use client';

import { FC, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { createCategoryAction, updateCategoryAction } from "@/server/actions/category-actions";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { z } from "zod";

const categorySchema = z.object({ name: z.string().min(1) });

interface CategoryDialogFormProps {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  category?: Category;
}

export const CategoryDialogForm: FC<CategoryDialogFormProps> = ({ open: isOpen = false, onOpenChange, category }) => {
  const [open, setOpen] = useState(isOpen);
  const router = useRouter();

  const { execute: create, isExecuting: isCreating } = useAction(createCategoryAction);
  const { execute: updateCategory, isExecuting: isUpdating } = useAction(updateCategoryAction);

  useEffect(() => onOpenChange?.(open), [open, onOpenChange]);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name || "" },
  });

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    try {
      if (!category) await create(values);
      if (category) await updateCategory({ id: category.id, ...values });
      toast.success(`Category ${category ? "updated" : "added"} successfully`);
      form.reset();
      router.refresh();
      setOpen(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!category && (
        <DialogTrigger asChild>
          <Button variant="outline">Add Category</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Add"} Category</DialogTitle>
        </DialogHeader>
        <DialogDescription>Fill in the category details below.</DialogDescription>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Loading..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
