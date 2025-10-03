"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

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

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          price: `${product.price}`,
          oldPrice: product.oldPrice ? `${product.oldPrice}` : undefined,
          image: product.image || "/Images/placeholder.jpg",
          description: product.description,
          rating: product.rating ?? 0,
          reviews: product.reviews ?? 0,
          badge: product.badge,
          variantId: product.defaultVariantId,
        }));

        setProducts(transformedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCart();
  }, []);

  const visibleProducts = products.slice(0, 8);

  if (loading) {
    return (
      <div className="page-wrap">
        <div >
          <div className="flex justify-between items-center mb-8">
            <h2 className="page-title">Our Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrap">
        <h2 className="page-title">Our Products</h2>
        <div className="text-center py-10">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
        <div className="flex justify-between items-center mb-8">
          <h2 className="page-title">Our Products</h2>
          {products.length > 8 && (
            <Link
              href="/shop"
              className="px-6 py-2 border border-stone-300 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              See All Products
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ">
            {visibleProducts.map((product) => (
              <div key={product.id}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={product.image}
                  description={product.description}
                  variantId={product.variantId}
                      />
                    </div>
            ))}
          </div>
        )}
    </div>
  );
}