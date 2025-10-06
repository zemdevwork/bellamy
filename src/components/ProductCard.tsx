"use client";

import React, { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils";
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart";
import { Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cartContext";
import { rupee } from "@/constants/values";

type ProductProps = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  badge?: string;
  description?: string;
  variantId?: string;
  brandName?: string;
  brandThemePrimary?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  badge,
  variantId,
  brandThemePrimary = "#000",
}: ProductProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const { updateCartCount } = useCart();

  // Check if product already in cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (isLoggedIn()) {
          const res = await fetch("/api/cart", { cache: "no-store" });
          if (!res.ok) return;
          const cart = await res.json();
          // cart is now an array
          if (Array.isArray(cart)) {
            const exists = cart.some(
              (item: { variant: { id: string } }) =>
                !!item.variant &&
                (variantId ? item.variant.id === variantId : false)
            );
            setIsInCart(exists);
          }
        } else {
          const localCart = getLocalCart();
          const exists = localCart.some((item) =>
            variantId ? item.variantId === variantId : false
          );
          setIsInCart(exists);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };

    if (id) fetchCart();
  }, [id, variantId]);

  const discountPercentage = oldPrice
    ? Math.round(
        ((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) *
          100
      )
    : 0;

  // Add to cart handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variantId) {
      toast.error("Variant is required");
      return;
    }

    startTransition(async () => {
      try {
        if (isLoggedIn()) {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId, quantity: 1 }),
          });
          if (!res.ok) throw new Error("Failed to add to cart");
          await updateCartCount();
          toast.success(`Added "${name}" to cart!`);
        } else {
          addLocalCartItem(variantId, 1);
          await updateCartCount();
          toast.success(`Added "${name}" to cart (Local)!`);
        }
        setIsInCart(true);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error("Failed to add to cart. Please try again.");
      }
    });
  };

  const handleGoToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/cart");
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${id}`);
  };

  return (
    <div className="group relative">
      <div
        onClick={() => router.push(`/product/${id}`)}
        className="cursor-pointer pt-3 px-3 pb-10 rounded-tl-2xl rounded-br-2xl hover:shadow-xl shadow-stone-200 transition-shadow duration-800"
      >
        <div>
          {/* Badges */}
          {(badge || discountPercentage > 0) && (
            <div className="absolute z-10 inset-x-0 top-0 flex justify-between p-4">
              <div>
                {badge && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded text-[11px] font-medium uppercase tracking-wide">
                    {badge}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="bg-green-600 text-white px-3 py-1 rounded text-[11px] font-medium">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          )}

          {/* Image */}
          <div className="relative w-full h-[500px] overflow-hidden rounded-br-lg rounded-tl-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover w-full h-full transition-transform duration-700"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}

            {/* Action Buttons - Always visible */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-6 opacity-100 transition-opacity duration-300">
              {isInCart ? (
                <button
                  onClick={handleGoToCart}
                  aria-label="Go to cart"
                  title="Go to cart"
                  className="flex items-center justify-center opacity-70 w-12 h-12 rounded-full 
       bg-white hover:bg-gray-50 text-gray-800 hover:w-20 transition-all shadow-lg backdrop-blur-sm"
                >
                  <ShoppingCart size={20} strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isPending}
                  aria-label="Add to cart"
                  title="Add to cart"
                  className="flex items-center justify-center w-12 h-12 opacity-70 rounded-full 
       bg-white hover:bg-gray-50 text-gray-800 transition-all hover:w-20 disabled:opacity-50 shadow-lg backdrop-blur-sm"
                >
                  <ShoppingCart size={20} strokeWidth={1.5} />
                </button>
              )}

              <button
                onClick={handleViewDetails}
                aria-label="View details"
                title="View details"
                className="flex items-center justify-center w-12 h-12 hover:w-20 rounded-full opacity-70 bg-white hover:bg-gray-50 text-gray-800 transition-all shadow-lg backdrop-blur-sm"
              >
                <Eye size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3 flex flex-col gap-2">
            <h3 className="font-medium text-sm text-stone-500 line-clamp-2 min-h-[36px] leading-tight">
              {name}
            </h3>
            <div className="flex items-baseline gap-2">
              <div
                className="font-bold text-base"
                style={{ color: brandThemePrimary }}
              >
                {rupee}
                {price}
              </div>
              {oldPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {rupee}
                  {oldPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <OrderCheckout
          products={[
            {
              id: variantId as string,
              name,
              price: parseFloat(price),
              quantity: 1,
              image,
            },
          ]}
          total={parseFloat(price)}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
