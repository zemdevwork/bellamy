"use client";

import React, { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils";
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart";
import { Eye, ShoppingCart } from "lucide-react";

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
  description,
  variantId,
  brandName,
  brandThemePrimary = "#000",
}: ProductProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();

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
              (item: { variant: { id: string } }) => !!item.variant && (variantId ? item.variant.id === variantId : false)
            );
            setIsInCart(exists);
          }
        } else {
          const localCart = getLocalCart();
          const exists = localCart.some((item) => (variantId ? item.variantId === variantId : false));
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
        ((parseFloat(oldPrice.replace(/[₹$]/g, "")) -
          parseFloat(price.replace(/[₹$]/g, ""))) /
          parseFloat(oldPrice.replace(/[₹$]/g, ""))) *
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
          toast.success(`Added "${name}" to cart!`);
        } else {
          addLocalCartItem(variantId, 1);
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
        className="cursor-pointer"
      >
        <div className="rounded-xl overflow-hidden border bg-white" style={{ borderColor: "#E9D8DD" }}>
          {/* Badges */}
          {(badge || discountPercentage > 0) && (
            <div className="absolute z-10 inset-x-0 top-0 flex justify-between p-3">
              <div>
                {badge && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {badge}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  -{discountPercentage}%
                </span>
              )}
            </div>
          )}

          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden bg-[#F9F6F7] relative">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
            
            {/* Action Buttons - Bottom right on mobile, center overlay on desktop hover */}
            <div className="absolute bottom-3 right-3 flex gap-2 md:hidden">
              {isInCart ? (
                <button
                  onClick={handleGoToCart}
                  aria-label="Go to cart"
                  title="Go to cart"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-stone-700 hover:bg-stone-50 transition-all shadow-lg"
                >
                  <ShoppingCart size={18} />
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isPending}
                  aria-label="Add to cart"
                  title="Add to cart"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-stone-800 hover:bg-amber-100 transition-all disabled:opacity-50 shadow-lg"
                >
                  <ShoppingCart size={18} />
                </button>
              )}
              <button
                onClick={handleViewDetails}
                aria-label="View details"
                title="View details"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-stone-700 hover:bg-stone-50 transition-all shadow-lg"
              >
                <Eye size={18} />
              </button>
            </div>

            {/* Desktop hover overlay */}
            <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {isInCart ? (
                <button
                  onClick={handleGoToCart}
                  aria-label="Go to cart"
                  title="Go to cart"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-stone-700 hover:bg-stone-50 transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0"
                >
                  <ShoppingCart size={20} />
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isPending}
                  aria-label="Add to cart"
                  title="Add to cart"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-stone-800 hover:bg-amber-100 transition-all disabled:opacity-50 shadow-lg transform translate-y-2 group-hover:translate-y-0"
                >
                  <ShoppingCart size={20} />
                </button>
              )}
              <button
                onClick={handleViewDetails}
                aria-label="View details"
                title="View details"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-stone-700 hover:bg-stone-50 transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="text-xs text-gray-500 mb-1">{brandName || " "}</div>
            <h3 className="font-serif text-base text-gray-900 line-clamp-2">{name}</h3>
            <div className="mt-2 flex items-center gap-2">
              {oldPrice && (
                <span className="text-sm text-gray-400 line-through">{oldPrice}</span>
              )}
              <div className="font-semibold" style={{ color: brandThemePrimary }}>
                {price}
              </div>
            </div>
            {description && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </div>

      {showCheckout && (
        <OrderCheckout
          products={[
            {
              id: variantId as string,
              name,
              price: parseFloat(price.replace(/[₹$]/g, "")),
              quantity: 1,
              image,
            },
          ]}
          total={parseFloat(price.replace(/[₹$]/g, ""))}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}