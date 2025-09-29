"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity: newQuantity }),
        });
        if (!res.ok) throw new Error("Failed to update");
        fetchCart();
      } catch {
        toast.error("Failed to update cart");
      }
    });
  };

  const handleRemove = (variantId: string) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId }),
        });
        if (!res.ok) throw new Error("Failed to remove");
        toast.success("Item removed from cart");
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
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Add some products to get started
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-gray-900 mb-1">Shopping Cart</h1>
          <p className="text-gray-600 text-sm">
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div
                    onClick={() => router.push(`/product/${item.variant.product.id}`)}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {item.variant.product.image ? (
                      <Image
                        src={item.variant.product.image}
                        alt={item.variant.product.name}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover w-24 h-24"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => router.push(`/product/${item.variant.product.id}`)}
                      className="font-medium text-gray-900 cursor-pointer hover:text-gray-700 mb-1"
                    >
                      {item.variant.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      ₹{item.variant.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.variantId, item.quantity - 1)
                          }
                          disabled={isPending || item.quantity <= 1}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.variantId, item.quantity + 1)
                          }
                          disabled={isPending}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.variantId)}
                        disabled={isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{((item.variant?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-sm text-gray-500">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-sm text-gray-500">Included</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="text-lg font-medium text-gray-900">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                disabled={isPending}
                className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal - You'll need to create/import this */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-medium mb-4">Checkout</h2>
            <p className="text-gray-600 mb-4">Checkout component goes here</p>
            <button
              onClick={() => setShowCheckout(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}