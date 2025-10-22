"use client";

import React, { useState, useTransition} from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils";
import { addLocalCartItem } from "@/lib/local-cart";
import { Eye, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useCart, useWishlist } from "@/context/cartContext";
import { rupee } from "@/constants/values";
import { addToWishlist } from "@/server/actions/wishlist-action";

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
  isInCart?: boolean;
  isInWishlist?: boolean;
};

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  badge,
  isInCart,
  isInWishlist,
  variantId,
  brandThemePrimary = "#000",
}: ProductProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isInCartState, setIsInCartState] = useState(isInCart);
  const [isInWishlistState, setIsInWishlistState] = useState(isInWishlist);
  const router = useRouter();
  const { updateCartCount } = useCart();
  const { updateWishlistCount } = useWishlist();

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

    setIsCartLoading(true);

    startTransition(async () => {
      try {
        if (isLoggedIn()) {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId, quantity: 1 }),
          });
          if (!res.ok) throw new Error("Failed to add to cart");
          setIsInCartState(true);
          await updateCartCount();
          toast.success(`Added "${name}" to cart!`);
        } else {
          addLocalCartItem(variantId, 1);
          setIsInCartState(true);
          await updateCartCount();
          toast.success(`Added "${name}" to cart (Local)!`);
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error("Failed to add to cart. Please try again.");
      } finally {
        setIsCartLoading(false);
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

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variantId) {
      toast.error("Variant is required");
      return;
    }

    setIsWishlistLoading(true);

    startTransition(async () => {
      try {
        if (isInWishlist) {
          // Remove from wishlist
          if (isLoggedIn()) {
            setIsInWishlistState(false);
            router.push("/wishlist");
          } else {
            router.push('/login')
          }
        } else {
          // Add to wishlist
          if (isLoggedIn()) {
            await addToWishlist({ variantId });
            setIsInWishlistState(true);
            await updateWishlistCount();
            toast.success(`Added "${name}" to wishlist!`);
          } else {
            setIsInWishlistState(false);
            router.push('/login')
          }
        }
      } catch (error) {
        console.error("Failed to update wishlist:", error);
        toast.error("Failed to update wishlist. Please try again.");
      } finally {
        setIsWishlistLoading(false);
      }
    });
  };

  return (
    <div className="group relative">
      <div
        onClick={() => router.push(`/product/${id}`)}
        className="cursor-pointer pt-3 px-3 pb-10 rounded-tl-2xl md:rounded-tl-3xl rounded-br-2xl md:rounded-br-3xl hover:shadow-xl shadow-stone-200 transition-shadow duration-800"
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 opacity-100 transition-opacity duration-300">
              {/* Cart Button */}
              {isInCartState ? (
                <button
                  onClick={handleGoToCart}
                  aria-label="Go to cart"
                  title="Go to cart"
                  className="group/btn flex items-center justify-center gap-2 h-12 px-4 rounded-full 
text-stone-500 cursor-pointer transition-all shadow-lg backdrop-blur-sm overflow-hidden bg-white hover:bg-gray-50"
                >
                  <ShoppingCart
                    size={20}
                    strokeWidth={2}
                    fill="currentColor"
                    className="flex-shrink-0"
                  />
                  <span className="max-w-0 group-hover/btn:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-300 text-sm font-medium">
                    In Cart
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isPending || isCartLoading}
                  aria-label="Add to cart"
                  title="Add to cart"
                  className="group/btn flex items-center justify-center gap-2 h-12 cursor-pointer px-4 rounded-full 
bg-white hover:bg-gray-50 text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm overflow-hidden"
                >
                  {isCartLoading ? (
                    <Loader2 size={20} strokeWidth={1.5} className="flex-shrink-0 animate-spin" />
                  ) : (
                    <ShoppingCart
                      size={20}
                      strokeWidth={1.5}
                      fill="none"
                      className="flex-shrink-0"
                    />
                  )}
                  <span className="max-w-0 group-hover/btn:max-w-xs overflow-hidden cursor-pointer whitespace-nowrap transition-all duration-500 text-sm font-medium">
                    {isCartLoading ? "Adding..." : "Add to Cart"}
                  </span>
                </button>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                disabled={isPending || isWishlistLoading}
                aria-label={isInWishlistState ? "Go to wishlist" : "Add to wishlist"}
                title={isInWishlistState ? "Go to wishlist" : "Add to wishlist"}
                className={`group/btn flex items-center justify-center gap-2 h-12 cursor-pointer px-4 rounded-full 
bg-white hover:bg-gray-50 text-gray-800 transition-all shadow-lg backdrop-blur-sm 
disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
              >
                {isWishlistLoading ? (
                  <Loader2 size={20} strokeWidth={1.5} className="flex-shrink-0 animate-spin" />
                ) : (
                  <Heart
                    size={20}
                    strokeWidth={1.5}
                    fill={isInWishlistState ? "currentColor" : "none"}
                    className={`flex-shrink-0 transition-colors duration-300 ${isInWishlistState ? "text-amber-600" : "text-gray-800"
                      }`}
                  />
                )}
                <span className="max-w-0 group-hover/btn:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-500 text-sm font-medium">
                  {isWishlistLoading ? "Loading..." : isInWishlist ? "Go to wishlist" : "Wishlist"}
                </span>
              </button>


              {/* View Details Button */}
              <button
                onClick={handleViewDetails}
                aria-label="View details"
                title="View details"
                className="group/btn flex items-center justify-center gap-2 h-12 cursor-pointer px-4 rounded-full bg-white hover:bg-gray-50 text-gray-800 transition-all shadow-lg backdrop-blur-sm overflow-hidden"
              >
                <Eye size={20} strokeWidth={1.5} className="flex-shrink-0" />
                <span className="max-w-0 group-hover/btn:max-w-xs overflow-hidden cursor-pointer whitespace-nowrap transition-all duration-500 text-sm font-medium">
                  View Details
                </span>
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