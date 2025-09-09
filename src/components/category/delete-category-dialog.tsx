'use client';

import { FC } from "react";
import { Category } from "@prisma/client";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { deleteCategoryAction } from "@/server/actions/category-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  category: Category;
}

export const DeleteCategoryDialog: FC<DeleteCategoryDialogProps> = ({ open, setOpen, category }) => {
  const router = useRouter();
  const { execute, isExecuting } = useAction(deleteCategoryAction);

  const handleDelete = async () => {
    try {
      await execute({ id: category.id });
      router.refresh();
      toast.success("Category deleted successfully");
    } catch {
      toast.error("Failed to delete category");
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
            This will permanently delete <strong>{category.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" disabled={isExecuting} onClick={handleDelete}>
              {isExecuting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
