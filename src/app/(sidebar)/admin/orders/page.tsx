// app/(sidebar)/admin/order/page.tsx
"use client";

import { useEffect, useState } from "react";
import OrderTable from "@/components/admin/order/order-table";
import { columns, Order } from "@/components/admin/order/order-columns";
import { getAllOrders } from "@/server/actions/admin-order-action";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res: Order[] = await getAllOrders();
        setOrders(res); // ✅ no conversion needed, keep Date objects
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>
      <OrderTable columns={columns} data={orders} />
    </div>
  );
}
