"use client";

import React, { useTransition } from "react";
import { updateOrderStatus } from "@/server/actions/admin-order-action";
import { OrderDetailed, OrderItem } from "@/types/order";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, User, MapPin, CreditCard, Clock } from "lucide-react";
import { rupee } from "@/constants/values";

interface OrderDetailProps {
  order: OrderDetailed;
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateOrderStatus(order.id, newStatus);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "PAID":
        return "text-green-600 bg-green-50 border-green-200";
      case "SHIPPED":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "DELIVERED":
        return "text-green-700 bg-green-100 border-green-300";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200";
      case "FAILED":
        return "text-red-700 bg-red-100 border-red-300";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Order ID
                </p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-lg font-semibold">{rupee} {order.totalAmount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </p>
                <p className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Placed At
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="font-medium">{order.user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{order.user.email}</p>
            </div>
            {order.user.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p>{order.user.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{order.phoneNumber}</p>
            <p>{order.street}</p>
            <p>
              {order.city}, {order.state} - {order.pincode}
            </p>
          </CardContent>
        </Card>

        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
            <CardDescription>Change the status of this order</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              defaultValue={order.status}
              onValueChange={handleStatusChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {isPending && (
              <p className="text-sm text-muted-foreground mt-2">
                Updating status...
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.items.length} item{order.items.length !== 1 ? "s" : ""} in
            this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: OrderItem) => (
              <Card key={item.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">
                        {item.variant.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.variant.sku}
                      </p>
                      {item.variant.options &&
                        item.variant.options.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {item.variant.options
                              ?.map(
                                (o: {
                                  attribute: { name: string };
                                  attributeValue: { value: string };
                                }) =>
                                  `${o.attribute.name}: ${o.attributeValue.value}`
                              )
                              .join(", ")}
                          </p>
                        )}
                      {item.variant.product.brand && (
                        <p className="text-sm text-muted-foreground">
                          Brand: {item.variant.product.brand.name}
                        </p>
                      )}
                      {item.variant.product.category && (
                        <p className="text-sm text-muted-foreground">
                          Category: {item.variant.product.category.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{rupee} {item.price}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
