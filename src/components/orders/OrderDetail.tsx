"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OrderIdProp {
  id: string;
}

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    images: string[];
    product: {
      id: string;
      name: string;
      image: string;
    };
  };
};

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

function OrderDetail({ id }: OrderIdProp) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (order.status === "DELIVERED") {
      toast.error("Cannot cancel delivered orders");
      return;
    }

    if (order.status === "CANCELLED") {
      toast.error("Order is already cancelled");
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to cancel order");
        return;
      }

      toast.success("Order cancelled successfully");
      setOrder(data.order);
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="page-wrap text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading order details...</p>
      </div>
    );
  }

  if (!order || !order.id) {
    return (
      <div className="page-wrap text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-muted-foreground">The order you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      {/* Order Header */}
      <div className="mb-8">
        <h1 className="page-title mb-2">Order Details</h1>
        <p className="text-sm text-muted-foreground">Order #{order.id.slice(-8).toUpperCase()}</p>
        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
      </div>

      {/* Status Badge */}
      <div className="mb-8">
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.variant.images[0] || item.variant.product.image}
                    alt={item.variant.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{item.variant.product.name}</h3>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  <p className="text-sm text-muted-foreground">Price: Rs. {item.price.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-8 border-t pt-6">
        <h2 className="text-lg font-medium mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs. {order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Charges</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-medium">Total</span>
            <span className="font-semibold">Rs. {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">Payment Method</h2>
        <p className="text-muted-foreground">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
      </div>

      {/* Delivery Address */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">Delivery Address</h2>
        <div className="text-muted-foreground space-y-1">
          <p>{order.street}</p>
          <p>{order.city}, {order.state}</p>
          <p>Pincode: {order.pincode}</p>
          <p className="pt-2">Phone: {order.phoneNumber}</p>
        </div>
      </div>

      {/* Cancel Button */}
      {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
        <Button
          variant="destructive"
          onClick={handleCancelOrder}
          disabled={cancelling}
          className="w-full"
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </Button>
      )}
    </div>
  );
}

export default OrderDetail;