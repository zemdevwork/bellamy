'use client';

import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { createBrandAction, updateBrandAction } from "@/server/actions/brand-actions";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Brand } from "@prisma/client";
import { createBrandSchema, } from "@/schema/brand-schema";

interface BrandDialogFormProps {
  brand?: Brand;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const BrandDialogForm: FC<BrandDialogFormProps> = ({
  brand,
  open: isOpen = false,
  onOpenChange,
}) => {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!brand && (
        <DialogTrigger asChild>
          <Button variant="outline">Add Brand</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit" : "Add"} Brand</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {brand ? "Update brand details" : "Fill details of the brand here."}
        </DialogDescription>

        <BrandForm brand={brand} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};

interface BrandFormProps {
  brand?: Brand;
  setOpen: (open: boolean) => void;
}

export const BrandForm: FC<BrandFormProps> = ({ brand, setOpen }) => {
  const router = useRouter();
  const { execute: createBrand, isExecuting: isCreating } = useAction(createBrandAction);
  const { execute: updateBrand, isExecuting: isUpdating } = useAction(updateBrandAction);

  const form = useForm<z.infer<typeof createBrandSchema>>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: brand?.name || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof createBrandSchema>) => {
    try {
      if (brand) {
        await updateBrand({ id: brand.id, name: values.name });
        toast.success("Brand updated successfully");
      } else {
        await createBrand({ name: values.name });
        toast.success("Brand added successfully");
      }
      form.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error submitting form");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? "Loading..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
