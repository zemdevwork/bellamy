"use client";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { removeFromWishlist } from "@/server/actions/wishlist-action";
import { toast } from "sonner";

type WishlistItemProps = {
  variantId: string;
  product: { id: string; name: string; image: string };
};

export default function WishlistCard({ variantId, product }: WishlistItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeFromWishlist({ variantId });
        toast.success("Removed from wishlist");
      } catch {
        toast.error("Failed to remove from wishlist");
      }
    });
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="relative w-24 h-24 rounded overflow-hidden bg-gray-50">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <Link href={`/product/${product.id}`} className="font-medium hover:underline">
          {product.name}
        </Link>
        <div className="mt-3">
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}


