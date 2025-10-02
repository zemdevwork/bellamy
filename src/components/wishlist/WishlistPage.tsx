"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import WishlistCard from "./WishlistCard";

type VariantProduct = { id: string; name: string; image: string; price: number };
type WishlistItem = { id: string; variantId: string; variant: { id: string; product: VariantProduct } };

function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setItems(data?.items || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="page-wrap flex flex-col items-center justify-center py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-wrap">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 text-sm mb-6">
            Save your favorite products for later
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            Start Shopping
          </button>
      </div>
    );
  }

  return (
    <div className="page-wrap">
        {/* Header */}
        <div className="mb-8">
        <h1 className="page-title mb-6 md:mb-8">
            My Wishlist
          </h1>
          <p className="text-gray-600 text-sm">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {items.map((it) => (
            <WishlistCard
              key={it.id}
              variantId={it.variantId || it.variant.id}
              product={it.variant.product}
              onRemoved={(vid) =>
                setItems((prev) =>
                  prev.filter((x) => (x.variantId || x.variant.id) !== vid)
                )
              }
            />
          ))}
      </div>
    </div>
  );
}

export default WishlistPage;
