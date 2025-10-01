"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";


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
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Categories...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-serif text-stone-800 tracking-tight">Shop By Occasion</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">

        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect?.(category)}
            className="group cursor-pointer"
          >
            <div className="relative w-full aspect-[5/4] rounded-2xl overflow-hidden shadow-md ring-1 ring-stone-200/60 bg-white transition-transform duration-300 group-hover:scale-[1.02]">
              {/* Category Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                {category.image ? (
                  
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-medium">{category.name}</span>
                  </div>
                )}
              </div>
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              
              {/* Category name centered */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <h3 className="text-white text-lg font-semibold drop-shadow-lg text-center tracking-wide">
                  {category.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
