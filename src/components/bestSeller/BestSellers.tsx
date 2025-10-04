"use client";

import React, { useState, useEffect } from "react";
import BestSellerCard from "./BestSellerCard";

type Product = {
  id: string;
  variantId: string; // ✅ Add this
  name: string;
  title: string;
  price: string;
  originalPrice?: string | null;
  rating?: number;
  reviewCount?: number;
  image: string;
};

type ProductResponse = {
  id: string;
  variantId: string; // ✅ Add this
  name: string;
  title: string;
  price: string;
  originalPrice?: string | null;
  rating?: number;
  reviewCount?: number;
  image: string;
};

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/best-seller", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");

        const data: ProductResponse[] = await res.json();

        const mappedProducts: Product[] = data.map((p) => ({
          id: p.id,
          variantId: p.variantId, // ✅ Add this
          name: p.name,
          title: p.title,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
        }));

        setProducts(mappedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Slide navigation
  const nextSlide = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 288 + 16;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const prevSlide = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 288 + 16;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => setIsDragging(false);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Best Sellers...</p>
      </div>
    );
  }

  return (
    <section className="w-full relative">
      <div className="page-wrap">
        {/* Header */}
        <h2 className="page-title">Customer Favourites</h2>

        {/* Scrollable Product Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 md:gap-12 lg:gap-16 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {products.map((product) => (
            <BestSellerCard
              key={product.id}
              id={product.id}
              name={product.title}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
      </div>

      {/* Left Arrow - Outside page-wrap */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 ring-1 ring-stone-200 text-stone-700 shadow-sm hover:shadow transition"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Right Arrow - Outside page-wrap */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 ring-1 ring-stone-200 text-stone-700 shadow-sm hover:shadow transition"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </section>
  );
}
