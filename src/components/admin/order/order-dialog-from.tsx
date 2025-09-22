"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/server/actions/admin-order-action";
import { toast } from "sonner";
import { Order } from "@/components/admin/order/order-columns"; // ✅ import type

const statuses: Order["status"][] = [
  "PENDING",
  "PAID",
  "FAILED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function DialogForm({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, status);
        toast.success("Order updated successfully");
        setOpen(false);
      } catch {
        toast.error("Failed to update order");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleUpdate}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
