"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { removeFromWishlist } from "@/server/actions/wishlist-action";
import { toast } from "sonner";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

type WishlistItemProps = {
  variantId: string;
  product: { id: string; name: string; image: string; price?: number };
  onRemoved?: (variantId: string) => void;
};

export default function WishlistCard({ variantId, product, onRemoved }: WishlistItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeFromWishlist({ variantId });
        toast.success("Removed from wishlist");
        onRemoved?.(variantId);
      } catch {
        toast.error("Failed to remove from wishlist");
      }
    });
  };

  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity: 1 }),
        });
        if (!res.ok) throw new Error("Failed to add");
        toast.success("Added to cart");
      } catch {
        toast.error("Failed to add to cart");
      }
    });
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex gap-4">
        {/* Product Image */}
        <div
          onClick={() => router.push(`/product/${product.id}`)}
          className="cursor-pointer flex-shrink-0"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={100}
              height={100}
              className="rounded-lg object-cover w-24 h-24"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1">
            <h3
              onClick={() => router.push(`/product/${product.id}`)}
              className="font-medium text-gray-900 cursor-pointer hover:text-gray-700 mb-1"
            >
              {product.name}
            </h3>
            {product.price && (
              <p className="text-sm text-gray-600 mb-2">
                ₹{product.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isPending}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleRemove}
              disabled={isPending}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors border border-transparent hover:border-red-100"
              aria-label="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price on Right (Desktop) */}
        {product.price && (
          <div className="text-right hidden sm:block flex-shrink-0">
            <p className="font-medium text-gray-900">
              ₹{product.price.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}