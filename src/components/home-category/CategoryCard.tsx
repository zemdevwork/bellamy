"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

type Category = {
  id: string;
  name: string;
  image?: string;
};

type CategoryCardProps = {
  category: Category;
  onSelect?: (category: Category) => void;
};

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect?.(category);
    router.push(`/shop/category/${category.id}`);
  };

  return (
    <div
      onClick={handleClick}
      onDragStart={(e) => e.preventDefault()}
      className="group cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md ring-1 ring-stone-200/60 bg-white">
        {/* Category Image */}
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-base font-medium">{category.name}</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

        {/* Category name */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <h3 className="text-white text-sm sm:text-base md:text-lg text-center tracking-wide">
            {category.name}
          </h3>
        </div>
      </div>
    </div>
  );
}