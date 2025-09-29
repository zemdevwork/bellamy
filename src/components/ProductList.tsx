"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addToCart } from "@/server/actions/cart-action";
import { Eye, ShoppingCart } from "lucide-react";
import { isLoggedIn } from "@/lib/utils";
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart";

type Product = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  description?: string;
  variantId?: string;
};

type ProductResponse = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  description?: string;
  defaultVariantId: string;
};

type CartItem = {
  variant: {
    id: string;
  };
  quantity: number;
};

export default function ProductList() {
  const [showAll, setShowAll] = useState(false);
  const [cart, setCart] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const fetchProductsAndCart = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/product");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data: ProductResponse[] = await response.json();

        const transformedProducts: Product[] = data.map((product) => ({
          id: product.id,
          name: product.name,
          price: `₹${product.price}`,
          oldPrice: product.oldPrice ? `₹${product.oldPrice}` : undefined,
          image: product.image || "/Images/placeholder.jpg",
          description: product.description,
          rating: product.rating ?? 0,
          reviews: product.reviews ?? 0,
          badge: product.badge,
          variantId: product.defaultVariantId,
        }));

        setProducts(transformedProducts);

        // ✅ Fetch cart with variantId
        if (isLoggedIn()) {
          const cartRes = await fetch("/api/cart", { cache: "no-store" });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            if (cartData?.items) {
              setCart(cartData.items.map((item: CartItem) => item.variant.id));
            }
          }
        } else {
          const localCart = getLocalCart();
          setCart(localCart.map((item) => item.variantId));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCart();
  }, []);

  const visibleProducts = showAll ? products : products.slice(0, 8);

  const handleAddToCart = async (product: Product) => {
    if (!product.variantId) {
      toast.error("Variant is required");
      return;
    }

    startTransition(async () => {
      try {
        if (isLoggedIn()) {
          await addToCart({ variantId: product.variantId, quantity: 1 });
          toast.success(`✅ "${product.name}" added to your cart!`);
        } else {
          addLocalCartItem(product.variantId as string, 1);
          toast.success(`🛒 "${product.name}" added to your cart (local)!`);
        }

        setCart((prev) => [...prev, product.variantId!]);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error("❌ Failed to add to cart. Please try again.");
      }
    });
  };

  const handleGoToCart = () => router.push("/cart");

  const goToProductDetails = (id: string) => {
    router.push(`/product/${id}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif text-gray-800">Our Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="w-full h-64 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif mb-8">Our Products</h2>
        <div className="text-center py-10">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-6 ">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif text-stone-800">Our Products</h2>
          {products.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 border border-stone-300 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              {showAll ? "Show Less" : "See All Products"}
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleProducts.map((product) => {
              const discountPercentage = product.oldPrice
                ? Math.round(
                    ((parseFloat(product.oldPrice.replace(/[₹$]/g, "")) -
                      parseFloat(product.price.replace(/[₹$]/g, ""))) /
                      parseFloat(product.oldPrice.replace(/[₹$]/g, ""))) *
                      100
                  )
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white/95 backdrop-blur rounded-xl shadow-sm hover:shadow-lg transition-transform duration-300 ease-in-out transform hover:-translate-y-0.5 overflow-hidden relative border border-stone-200 group cursor-pointer"
                >
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.badge}
                    </div>
                  )}
                  {discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      -{discountPercentage}%
                    </div>
                  )}

                  <div onClick={() => goToProductDetails(product.id)}>
                    <div className="relative w-full h-64 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-medium text-stone-800 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-stone-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="mb-3">
                        {product.oldPrice && (
                          <span className="text-sm text-stone-400 line-through mr-2">
                            {product.oldPrice}
                          </span>
                        )}
                        <span className="text-lg font-semibold text-stone-800">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="flex items-center gap-2">
                      {cart.includes(product.variantId || "") ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToCart();
                          }}
                          aria-label="Go to cart"
                          title="Go to cart"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={isPending}
                          aria-label="Add to cart"
                          title="Add to cart"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-stone-300 text-stone-800 hover:bg-stone-50 transition-colors disabled:opacity-50 bg-amber-100/80 cursor-pointer"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/product/${product.id}`)}
                        aria-label="View details"
                        title="View details"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full border cursor-pointer border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}