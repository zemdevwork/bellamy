"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  MoreVertical, 
  Eye, 
  Edit,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type Order = {
  id: string;
  user: { id: string; name: string | null; email: string };
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date; 
};

// Status options with icons
const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-600" },
  { value: "processing", label: "Processing", icon: Package, color: "text-blue-600" },
  { value: "shipped", label: "Shipped", icon: Truck, color: "text-purple-600" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, color: "text-green-600" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-600" },
];

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "shipped":
      return "outline";
    case "delivered":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

// Status Update Dialog Component
function StatusUpdateDialog({ 
  order, 
  open, 
  onOpenChange 
}: { 
  order: Order; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      
      console.log(`Updating order ${order.id} status to ${selectedStatus}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh the page or update the data
      window.location.reload(); 
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status for order #{order.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Status</label>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusVariant(order.status)} className="capitalize">
                {order.status}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <span className="capitalize">{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate}
            disabled={isLoading || selectedStatus === order.status}
          >
            {isLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Action Cell Component
function ActionCell({ row }: { row: Row<Order> }) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const router = useRouter();
  const order = row.original;

  const handleViewOrder = () => {
    router.push(`/admin/orders/${order.id}`);
  };

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleViewOrder}>
            <Eye className="mr-2 size-4" />
            View Order
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setStatusDialogOpen(true)}>
            <Edit className="mr-2 size-4" />
            Update Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusUpdateDialog
        order={order}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
    </div>
  );
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <span className="text-xs">#{row.original.id.slice(-8)}</span>,
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.user?.name || "N/A"}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.user?.email}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-semibold">₹{row.original.totalAmount.toLocaleString('en-IN')}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusOption = statusOptions.find(option => option.value === status.toLowerCase());
      const Icon = statusOption?.icon || Package;
      
      return (
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${statusOption?.color || 'text-gray-600'}`} />
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status.toLowerCase()}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("en-IN", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
  },
  {
    id: "actions",
    header: "Actions",
    cell: (props) => <ActionCell row={props.row} />,
  },
];