"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";

import {
  getUserCart,
  updateCartItem,
  removeFromCart,
} from "@/server/actions/cart-action";

import OrderCheckout from "@/components/orders/OrderCheckout";

type Cart = {
  id: string;
  items: {
    id: string;
    variantId: string;
    quantity: number;
    variant: {
      id: string;
      price: number;
      product: {
        id: string;
        name: string;
        image: string | null;
      };
    };
  }[];
};

export default function CartComponent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const { updateCartCount } = useCart();

  const fetchCart = async () => {
    setLoading(true);
    const userCart = await getUserCart();
    setCart(userCart);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    startTransition(async () => {
      try {
        await updateCartItem({ variantId, quantity: newQuantity });
        fetchCart();
      } catch {
        toast.error("Failed to update cart");
      }
    });
  };

  const handleRemove = (variantId: string) => {
    startTransition(async () => {
      try {
        await removeFromCart({ variantId });
        toast.success("Item removed");
        await updateCartCount();
        fetchCart();
      } catch {
        toast.error("Failed to remove item");
      }
    });
  };

  const total =
    cart?.items?.reduce(
      (sum, item) => sum + (item.variant?.price || 0) * item.quantity,
      0
    ) || 0;

  if (loading) {
    return (
      <div className="page-wrap text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-wrap flex flex-col items-center justify-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">
          Add some products to continue shopping.
        </p>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      {/* Title */}
      <h1 className="page-title mb-6 md:mb-8">Your cart</h1>

      {/* Desktop Header row - hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 items-center border-b pb-4 mb-6 text-sm font-medium text-muted-foreground">
        <div className="col-span-6">PRODUCT</div>
        <div className="col-span-3 text-center">QUANTITY</div>
        <div className="col-span-3 text-right">TOTAL</div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 md:space-y-6">
        {cart.items.map((item) => (
          <div key={item.id} className="border-b pb-4 md:pb-6">
            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex gap-3">
                {/* Image */}
                {item.variant.product.image && (
                  <div
                    onClick={() =>
                      router.push(`/product/${item.variant.product.id}`)
                    }
                    className="cursor-pointer flex-shrink-0"
                  >
                    <Image
                      src={item.variant.product.image}
                      alt={item.variant.product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover w-20 h-20"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() =>
                      router.push(`/product/${item.variant.product.id}`)
                    }
                    className="font-medium text-sm sm:text-base line-clamp-2 cursor-pointer"
                  >
                    {item.variant.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rs. {item.variant.price}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Total: Rs.{" "}
                    {((item.variant?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls - Mobile */}
              <div className="flex items-center justify-between">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleUpdateQuantity(item.variantId, item.quantity - 1)
                    }
                    disabled={isPending || item.quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleUpdateQuantity(item.variantId, item.quantity + 1)
                    }
                    disabled={isPending}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.variantId)}
                  disabled={isPending}
                  className="text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-12 items-center">
              {/* Product */}
              <div
                onClick={() =>
                  router.push(`/product/${item.variant.product.id}`)
                }
                className="col-span-6 flex items-center gap-4 cursor-pointer"
              >
                {item.variant.product.image && (
                  <Image
                    src={item.variant.product.image}
                    alt={item.variant.product.name}
                    width={100}
                    height={100}
                    className="rounded-md object-cover w-24 h-24"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">
                    {item.variant.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rs. {item.variant.price}
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
                      handleUpdateQuantity(item.variantId, item.quantity - 1)
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
                      handleUpdateQuantity(item.variantId, item.quantity + 1)
                    }
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.variantId)}
                  disabled={isPending}
                  className="ml-4 text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Total */}
              <div className="col-span-3 text-right font-medium">
                Rs. {((item.variant?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Total */}
      <div className="flex justify-end mt-6 md:mt-10">
        <div className="w-full md:max-w-md space-y-3 md:space-y-4 border-t pt-4 md:pt-6">
          <div className="flex justify-between text-base md:text-lg">
            <span>Estimated total</span>
            <span className="font-semibold">Rs. {total.toFixed(2)}</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Taxes included. Discounts and shipping calculated at checkout.
          </p>
          <Button
            className="w-full h-11 md:h-12 text-base md:text-lg font-medium"
            onClick={() => setShowCheckout(true)}
            disabled={isPending}
          >
            Buy it now
          </Button>
        </div>
      </div>

      {/* Checkout modal/component */}
      {showCheckout && (
        <OrderCheckout
          products={cart.items.map((item) => ({
            id: item.variantId,
            name: item.variant.product.name,
            price: item.variant.price,
            quantity: item.quantity,
            image: item.variant.product.image ?? undefined,
          }))}
          total={total}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}