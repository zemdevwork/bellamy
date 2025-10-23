"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { removeFromWishlist } from "@/server/actions/wishlist-action";
import { toast } from "sonner";
import { ShoppingCart, Trash2 } from "lucide-react";
import { rupee } from "@/constants/values";
import { useWishlist } from "@/context/cartContext";

type WishlistItemProps = {
  variantId: string;
  product: { id: string; name: string; image: string; price?: number };
  onRemoved?: (variantId: string) => void;
};

export default function WishlistCard({ variantId, product, onRemoved }: WishlistItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { updateWishlistCount } = useWishlist();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeFromWishlist({ variantId });
        await updateWishlistCount();
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
    <div className="border rounded-xl p-4 sm:p-5 hover:shadow-sm transition-shadow bg-white">
      <div className="flex items-center gap-4 sm:gap-6">
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
              className="rounded-lg object-cover w-20 h-20 sm:w-24 sm:h-24"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <ShoppingCart className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => router.push(`/product/${product.id}`)}
            className="font-medium text-gray-900 cursor-pointer hover:text-gray-700 truncate"
          >
            {product.name}
          </h3>

          {product.price && (
            <p className="text-sm text-gray-600 mt-1">{rupee} {product.price.toFixed(2)}</p>
          )}
        </div>

        {/* Actions + Price */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {product.price && (
            <p className="font-medium text-gray-900 hidden sm:block">
              {rupee} {product.price.toFixed(2)}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="w-4 h-4 cursor-pointer" />
              <span>Add</span>
            </button>

            <button
              onClick={handleRemove}
              disabled={isPending}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
              aria-label="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
