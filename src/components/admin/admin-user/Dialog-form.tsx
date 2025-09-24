"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { banUser } from "@/server/actions/admin-user-action";
import { User } from "./Columns";

export function DialogForm({
  open,
  setOpen,
  user,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}) {
  const [reason, setReason] = useState("");
  const [expires, setExpires] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleBan = () => {
    startTransition(async () => {
      try {
        const res = await banUser({
          userId: user.id,
          reason,
          expires: expires ? new Date(expires) : undefined,
        });

        if (res.success) {
          toast.success(res.message || "User banned successfully");
          setOpen(false);
          window.location.reload(); // 🔄 reload list after banning
        } else {
          toast.error(res.message || "Failed to ban user");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while banning user");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Provide reason and optional expiry date for banning{" "}
            <span className="font-semibold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </div>
          <div>
            <Label htmlFor="expires">Expiry Date</Label>
            <Input
              id="expires"
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleBan}
          >
            {isPending ? "Banning..." : "Confirm Ban"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
