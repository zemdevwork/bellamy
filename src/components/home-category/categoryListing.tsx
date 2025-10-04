"use client";

import React, { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";

type Category = {
  id: string;
  name: string;
  image?: string;
};

type CategorySectionProps = {
  onCategorySelect?: (category: Category) => void;
};

export default function CategorySection({ onCategorySelect }: CategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center page-wrap py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Categories...</p>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h2 className="page-title">Shop By Category</h2>

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5 lg:gap-8">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onSelect={onCategorySelect}
          />
        ))}
      </div>
    </div>
  );
}
