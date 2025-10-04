"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { rupee } from "@/constants/values";

type BestSellerCardProps = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export default function BestSellerCard({
  id,
  name,
  price,
  image,
}: BestSellerCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleMouseDown = () => {
    setIsDragging(false);
  };

  const handleMouseMove = () => {
    setIsDragging(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    router.push(`/product/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onDragStart={(e) => e.preventDefault()}
      className="cursor-pointer group flex-shrink-0 w-full sm:w-[300px] md:w-[310px] lg:w-[320px] min-h-[520px]"
    >
      {/* Image */}
      <div className="relative w-full h-[480px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-[1.01]"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
      </div>

      {/* Product Info */}
      <div className="pt-3 flex flex-col gap-2">
        <h3 className="font-medium text-sm text-gray-500 line-clamp-2 leading-tight">
          {name}
        </h3>
        <div className="font-bold text-base text-gray-900">
          {rupee}
          {price}
        </div>
      </div>
    </div>
  );
}