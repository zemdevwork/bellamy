"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DialogForm } from "./order-dialog-from";

export type Order = {
  id: string;
  user: { id: string; name: string | null; email: string };
  totalAmount: number;
  status: string;
  createdAt: Date;   // ✅ Fix: should be Date, not string
  updatedAt: Date; 
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <span className="text-xs">{row.original.id}</span>,
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
      <span className="font-semibold">₹{row.original.totalAmount}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.status.toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("en-IN"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <DialogForm order={row.original} />,
  },
];
