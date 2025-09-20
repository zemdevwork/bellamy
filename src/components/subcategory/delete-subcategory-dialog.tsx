'use client';

import { FC } from "react";
import { SubCategory } from "@prisma/client";
import { 
  AlertDialog, 
  AlertDialogContent,
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction, 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { deleteSubCategoryAction } from "@/server/actions/subcategory-actions";
import { toast } from "sonner";

interface DeleteSubcategoryDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  subcategory: SubCategory;
}

export const DeleteSubcategoryDialog: FC<DeleteSubcategoryDialogProps> = ({ 
  open, 
  setOpen, 
  subcategory 
}) => {
  const router = useRouter();
  const { execute, isExecuting } = useAction(deleteSubCategoryAction);

  const handleDelete = async () => {
    try {
      await execute({ id: subcategory.id });
      toast.success("Subcategory deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Failed to delete subcategory");
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
            This will permanently delete <span className="font-bold">{subcategory.name}</span>.
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