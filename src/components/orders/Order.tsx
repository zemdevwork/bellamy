"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, ShoppingBag } from "lucide-react";
import { rupee } from "@/constants/values";

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    product?: { name: string; image?: string };
  }[];
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
        status
      )}`}
    >
      {status.toUpperCase()}
    </span>
  );
};

const ProductImage = ({
  src,
  alt,
  name,
}: {
  src?: string;
  alt: string;
  name: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-xs font-medium">
          {name.substring(0, 2).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16">
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        className="object-cover rounded-lg"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default function OrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        toast.error("Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to cancel order");
        return;
      }

      toast.success("Order cancelled successfully");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED" } : o
        )
      );
    } catch (err) {
      console.error("Cancel order failed:", err);
      toast.error("Something went wrong");
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-1">My Orders</h2>
          <p className="text-gray-600 text-sm">View and manage your orders</p>
        </div>

        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 text-sm">
            When you place your first order, it will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-1">My Orders</h2>
        <p className="text-gray-600 text-sm">
          {orders.length} {orders.length === 1 ? "order" : "orders"} in total
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewOrder(order.id)}
          >
            {/* Order Header */}
            <div className="p-6 border-b bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="text-lg font-medium text-gray-900 mt-2">
                    {rupee}{" "}{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <ProductImage
                      src={item.product?.image}
                      alt={item.product?.name || "Product"}
                      name={item.product?.name || "Product"}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.product?.name || "Unknown Product"}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>{rupee} {item.price.toFixed(2)} each</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {rupee} {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Actions */}
            {["PENDING", "PROCESSING", "DELIVERED"].includes(
              order.status.toUpperCase()
            ) && (
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center justify-end gap-3">
                  {order.status.toUpperCase() === "DELIVERED" && (
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                    >
                      Reorder
                    </button>
                  )}
                  {["PENDING", "PROCESSING"].includes(
                    order.status.toUpperCase()
                  ) && (
                    <button
                      onClick={(e) => handleCancelOrder(order.id, e)}
                      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}