"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getUserCart,
  updateCartItem,
  removeFromCart,
} from "@/server/actions/cart-action";

import OrderCheckout from "@/components/orders/OrderCheckout"; // ✅ import checkout

type Cart = {
  id: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      image: string | null;
    };
  }[];
};

export default function CartComponent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showCheckout, setShowCheckout] = useState(false); // ✅ toggle checkout
  const router = useRouter();
  const fetchCart = async () => {
    setLoading(true);
    const userCart = await getUserCart();
    setCart(userCart);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    startTransition(async () => {
      try {
        await updateCartItem({ productId, quantity: newQuantity });
        fetchCart();
      } catch {
        toast.error("Failed to update cart");
      }
    });
  };

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      try {
        await removeFromCart({ productId });
        toast.success("Item removed");
        fetchCart();
      } catch {
        toast.error("Failed to remove item");
      }
    });
  };

  const total =
    cart?.items?.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) || 0;

  if (loading) {
    return <p className="text-center py-10">Loading cart...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium">Your cart is empty</p>
      <p className="text-sm text-muted-foreground">
        Add some products to continue shopping.
      </p>
      <Button className="mt-6" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto ">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      {/* Title */}
      <h1 className="text-3xl font-serif mb-8">Your cart</h1>

      {/* Header row */}
      <div className="grid grid-cols-12 items-center border-b pb-4 mb-6 text-sm font-medium text-muted-foreground">
        <div className="col-span-6">PRODUCT</div>
        <div className="col-span-3 text-center">QUANTITY</div>
        <div className="col-span-3 text-right">TOTAL</div>
      </div>

      {/* Cart Items */}
      <div className="space-y-6">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center border-b pb-6"
          >
            {/* Product */}
            <div className="col-span-6 flex items-center gap-4">
              {item.product.image && (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover w-24 h-24"
                />
              )}
              <div>
                <h3 className="text-lg font-medium">{item.product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Rs. {item.product.price}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="col-span-3 flex items-center justify-center">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity - 1)
                  }
                  disabled={isPending || item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity + 1)
                  }
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(item.productId)}
                disabled={isPending}
                className="ml-4 text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Total */}
            <div className="col-span-3 text-right font-medium">
              Rs. {(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Total */}
      <div className="flex justify-end mt-10">
        <div className="w-full max-w-md space-y-4 border-t pt-6">
          <div className="flex justify-between text-lg">
            <span>Estimated total</span>
            <span className="font-semibold">Rs. {total.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Taxes included. Discounts and shipping calculated at checkout.
          </p>
          <Button
            className="w-full h-12 text-lg font-medium"
            onClick={() => setShowCheckout(true)} // ✅ open checkout
            disabled={isPending}
          >
            Buy it now
          </Button>
        </div>
      </div>

      {/* ✅ Checkout modal/component */}
      {showCheckout && (
        <OrderCheckout
          products={cart.items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image ?? undefined,
          }))}
          total={total}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}