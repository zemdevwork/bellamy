"use client";

import { FC } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useAction } from "next-safe-action/hooks";
import { deleteProductAction } from "@/server/actions/product-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductDeleteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: Product;
}

export const ProductDeleteDialog: FC<ProductDeleteDialogProps> = ({
  open,
  setOpen,
  product,
}) => {
  const router = useRouter();
  const { execute, isExecuting } = useAction(deleteProductAction);

  const handleDelete = async (id: string) => {
    try {
      await execute({ id });
      router.refresh();
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-bold">{product.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild onClick={() => handleDelete(product.id)}>
            <Button variant="destructive" disabled={isExecuting}>
              {isExecuting ? "Deleting..." : "Continue"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
