// app/(sidebar)/admin/order/page.tsx
"use client";

import { useEffect, useState } from "react";
import OrderTable from "@/components/admin/order/order-table";
import { columns, Order } from "@/components/admin/order/order-columns";
import { getAllOrders } from "@/server/actions/admin-order-action";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await getAllOrders(page, limit, status, search);
        setOrders(res.data as unknown as Order[]);
        setTotalPages(res.pagination.totalPages);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page, limit, status, search]);

  if (loading) {
    return (
      <div className="container w-full h-screen text-center flex flex-col items-center justify-center"> 
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold">Admin Orders</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="PAID">PAID</SelectItem>
              <SelectItem value="FAILED">FAILED</SelectItem>
              <SelectItem value="SHIPPED">SHIPPED</SelectItem>
              <SelectItem value="DELIVERED">DELIVERED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Page Size" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setPage(1)}>Apply</Button>
        </div>
      </div>
      <OrderTable columns={columns} data={orders} />
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <div className="text-sm">Page {page} of {totalPages}</div>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
