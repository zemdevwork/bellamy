"use client";

import React, { useState, useTransition } from "react";
import { addToCart } from "@/server/actions/cart-action";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ProductProps = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  badge?: string;
  description?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  badge,
  description,
}: ProductProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const router = useRouter();

  const discountPercentage = oldPrice
    ? Math.round(
        ((parseFloat(oldPrice.replace(/[₹$]/g, "")) -
          parseFloat(price.replace(/[₹$]/g, ""))) /
          parseFloat(oldPrice.replace(/[₹$]/g, ""))) *
          100
      )
    : 0;

  const handleAddToCart = async () => {
    if (!id) {
      toast.error("Product ID is missing");
      return;
    }

    startTransition(async () => {
      try {
        await addToCart({ productId: id, quantity: 1 });
        toast.success(`Added "${name}" to cart!`);
        setIsInCart(true);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error("Failed to add to cart. Please try again.");
      }
    });
  };

  const handleGoToCart = () => router.push("/cart");

  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {badge}
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}

        {/* Product Image */}
        <div className="relative">
          <Image
            src={image}
            alt={name}
            width={400}
            height={300}
            className="w-full h-64 object-cover"
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
            {name}
          </h3>
          {description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {description}
            </p>
          )}

          {/* Price */}
          <div className="mb-3">
            {oldPrice && (
              <span className="text-sm text-gray-400 line-through mr-2">
                {oldPrice}
              </span>
            )}
            <span className="text-lg font-semibold text-gray-800">
              {price}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col space-y-2">
            {isInCart ? (
              <button
                onClick={handleGoToCart}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isPending}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isPending ? "Adding..." : "Add to Cart"}
              </button>
            )}
            <button
              onClick={() => console.log(`Buy Now: ${id}`)}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
