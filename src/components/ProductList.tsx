"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Heart } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/server/actions/cart-action";

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
};

// API response type
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
};

export default function ProductList() {
  const [showAll, setShowAll] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
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
        }));
  
        setProducts(transformedProducts);
        type CartItem = {
          product: {
            id: string;
          };
          quantity: number;
        };
        
        // ✅ Fetch cart after products
        const cartRes = await fetch("/api/cart", { cache: "no-store" });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (cartData?.items) {
            setCart(cartData.items.map((item: CartItem) => item.product.id));
          }
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
    startTransition(async () => {
      try {
        await addToCart({ productId: product.id, quantity: 1 });
        toast.success(`Added "${product.name}" to cart!`);
        setCart((prev) => [...prev, product.id]);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error("Failed to add to cart. Please try again.");
      }
    });
  };

  const handleGoToCart = () => router.push("/cart");

  const goToProductDetails = (id: string) => {
    router.push(`/product/${id}`);
  };

  if (loading) {
    return (
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Our Products</h2>
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
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Our Products</h2>
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
    <section className="py-10 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Our Products</h2>
        {products.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
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
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative border border-gray-100 group cursor-pointer"
              >
                {/* Badge */}
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

                {/* Wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWishlist((prev) =>
                      prev.includes(product.id)
                        ? prev.filter((id) => id !== product.id)
                        : [...prev, product.id]
                    );
                  }}
                  className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
                >
                  <Heart
                    size={16}
                    className={`transition-colors ${
                      wishlist.includes(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                {/* Clickable Card Content */}
                <div onClick={() => goToProductDetails(product.id)}>
                  {/* Image */}
                  <div className="relative w-full h-64">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Rating */}
                    {product.rating && product.rating > 0 && (
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < (product.rating ?? 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          {product.reviews ? `(${product.reviews})` : ""}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-3">
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through mr-2">
                          {product.oldPrice}
                        </span>
                      )}
                      <span className="text-lg font-semibold text-gray-800">
                        {product.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons (not navigating) */}
                <div className="p-4 pt-0">
                  <div className="flex flex-col space-y-2">
                    {cart.includes(product.id) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToCart();
                        }}
                        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={isPending}
                        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {isPending ? "Adding..." : "Add to Cart"}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Buy Now: ${product.id}`);
                      }}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
