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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Package, Plus, Minus, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Schema for inventory update
const inventoryUpdateSchema = z.object({
  qty: z.coerce.number().min(0, "Quantity must be 0 or greater"),
});

interface InventoryDialogFormProps {
  productId?: string;
  productName?: string;
  currentQty?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const InventoryDialogForm: FC<InventoryDialogFormProps> = ({
  productId,
  productName = "Product",
  currentQty = 0,
  open: isOpen = false,
  onOpenChange,
}) => {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Inventory
          </DialogTitle>
          <DialogDescription>
            Update the stock quantity for <span className="font-medium">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Current Stock Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Stock:</span>
            <span className="font-semibold text-lg">{currentQty}</span>
            {currentQty <= 10 && currentQty > 0 && (
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Stock
              </Badge>
            )}
            {currentQty === 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        <InventoryForm 
          productId={productId}
          currentQty={currentQty}
          setOpen={setOpen} 
        />
      </DialogContent>
    </Dialog>
  );
};

interface InventoryFormProps {
  productId?: string;
  currentQty: number;
  setOpen: (open: boolean) => void;
}

export const InventoryForm: FC<InventoryFormProps> = ({ 
  productId, 
  currentQty, 
  setOpen 
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<{ qty: number }>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      qty: currentQty,
    },
  });

  const watchedQty = form.watch("qty");

  // Quick adjustment buttons
  const adjustQuantity = (adjustment: number) => {
    const currentValue = form.getValues("qty");
    const newValue = Math.max(0, currentValue + adjustment);
    form.setValue("qty", newValue);
  };

  // Preset quantity buttons
  const setQuantity = (qty: number) => {
    form.setValue("qty", qty);
  };

  const onSubmit = async (values: z.infer<typeof inventoryUpdateSchema>) => {
    if (!productId) {
      toast.error("Product ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          qty: values.qty,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update inventory');
      }

      const updatedProduct = await response.json();
      
      toast.success(
        `Inventory updated successfully. New quantity: ${updatedProduct.qty}`,
        {
          description: updatedProduct.qty <= 10 && updatedProduct.qty > 0
            ? "⚠️ This product is now low on stock"
            : updatedProduct.qty === 0
            ? "⚠️ This product is now out of stock"
            : undefined
        }
      );

      form.reset();
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Error updating inventory"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="qty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Quantity</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Main quantity input with adjustment buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustQuantity(-1)}
                      disabled={watchedQty <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      className="text-center text-lg font-semibold"
                      placeholder="Enter quantity"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustQuantity(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick adjustment buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <div className="text-xs text-muted-foreground mb-1 w-full">
                      Quick adjustments:
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(-10)}
                      disabled={watchedQty < 10}
                    >
                      -10
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(-5)}
                      disabled={watchedQty < 5}
                    >
                      -5
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(5)}
                    >
                      +5
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(10)}
                    >
                      +10
                    </Button>
                  </div>

                  {/* Preset quantities */}
                  <div className="flex gap-2 flex-wrap">
                    <div className="text-xs text-muted-foreground mb-1 w-full">
                      Set to:
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(0)}
                    >
                      0 (Out of Stock)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(25)}
                    >
                      25
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(50)}
                    >
                      50
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(100)}
                    >
                      100
                    </Button>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Change preview */}
        {watchedQty !== currentQty && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between text-sm">
              <span>Change:</span>
              <span className={`font-semibold ${
                watchedQty > currentQty 
                  ? 'text-green-600' 
                  : watchedQty < currentQty 
                  ? 'text-red-600' 
                  : 'text-muted-foreground'
              }`}>
                {currentQty} → {watchedQty} 
                ({watchedQty > currentQty ? '+' : ''}{watchedQty - currentQty})
              </span>
            </div>
            {watchedQty <= 10 && watchedQty > 0 && (
              <div className="text-xs text-amber-600 mt-1">
                ⚠️ This quantity will be marked as low stock
              </div>
            )}
            {watchedQty === 0 && (
              <div className="text-xs text-red-600 mt-1">
                ⚠️ This will mark the product as out of stock
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || watchedQty === currentQty}
          >
            {isLoading ? "Updating..." : "Update Inventory"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default InventoryDialogForm;