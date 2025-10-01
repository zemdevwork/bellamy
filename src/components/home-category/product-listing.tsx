"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";


type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  isNew?: boolean;
};

type ProductListingProps = {
  categoryId: string;
  categoryName?: string;
};

export default function ProductListing({ categoryId, categoryName }: ProductListingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/product?categoryId=${categoryId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products || data);
        setProductCount(data.count || data.length);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Category Title */}
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        {categoryName?.toUpperCase()} ({productCount})
      </h2>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Product Image Container */}
              <div className="relative aspect-[3/4] bg-gray-100">
                {/* New Arrivals Banner */}
                {product.isNew && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="text-yellow-300">★</span>
                      <span className="text-yellow-300">★</span>
                      <span className="ml-1">New Arrivals</span>
                    </div>
                  </div>
                )}
                
                {/* Product Image */}
                <div className="w-full h-full">
                  {product.image ? (
                     <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Action Icons Overlay */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-gray-700 text-sm font-medium mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-900 text-lg font-bold">
                  ₹ {product.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* No Products Message */}
      {products.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
