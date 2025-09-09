'use client';

import { FC } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Brand } from "@prisma/client";
import { useAction } from "next-safe-action/hooks";
import { deleteBrandAction } from "@/server/actions/brand-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteBrandDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  brand: Brand;
}

export const DeleteBrandDialog: FC<DeleteBrandDialogProps> = ({
  open,
  setOpen,
  brand,
}) => {
  const router = useRouter();
  const { execute, isExecuting } = useAction(deleteBrandAction);

  const handleDelete = async (id: string) => {
    try {
      await execute({ id });
      router.refresh();
      toast.success("Brand deleted successfully");
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand");
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
            <span className="font-bold">{brand.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild onClick={() => handleDelete(brand.id)}>
            <Button variant="destructive" disabled={isExecuting}>
              {isExecuting ? "Loading..." : "Continue"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
