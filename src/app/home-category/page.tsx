"use client";

import React, { useState } from "react";
import CategorySection from "@/components/home-category/categoryListing";
import ProductListing from "@/components/home-category/product-listing";
type Category = {
  id: string;
  name: string;
};

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showProducts, setShowProducts] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">Discover our latest collection</p>
        </div>

        <div className="mb-12">
          <CategorySection
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
              setShowProducts(true);
              // Smooth scroll to products
              setTimeout(() => {
                const el = document.getElementById("products-section");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 0);
            }}
          />
        </div>

        {selectedCategory && showProducts && (
          <div id="products-section" className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  setShowProducts(false);
                  setSelectedCategory(null);
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-gray-500">Back to Categories</span>
            </div>
            <ProductListing
              categoryId={selectedCategory.id}
              categoryName={selectedCategory.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
