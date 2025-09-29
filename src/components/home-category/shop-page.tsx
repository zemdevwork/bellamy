"use client";

import React, { useState } from "react";
import CategorySection from "./categoryListing";
import ProductListing from "./product-listing";

type Category = {
  id: string;
  name: string;
};

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">Discover our latest collection</p>
        </div>

        {/* Category Section */}
        <div className="mb-12">
          <CategorySection onCategorySelect={handleCategorySelect} />
        </div>

        {/* Product Listing */}
        {selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
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
