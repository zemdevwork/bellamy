"use client";
import { useEffect, useState } from "react";
import WishlistCard from "./WishlistCard";

type VariantProduct = { id: string; name: string; image: string };
type WishlistItem = { id: string; variant: { id: string; product: VariantProduct } };

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch('/api/wishlist');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setItems(data?.items || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, []);

  if (loading) return <div className="p-8">Loading wishlist...</div>;

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <WishlistCard
              key={it.id}
              variantId={it.variant.id}
              product={it.variant.product}
            />
          ))}
        </div>
      )}
    </div>
  );
}


