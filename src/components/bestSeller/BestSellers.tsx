"use client";

import React, { useState, useEffect } from "react";
import BestSellerCard from "./BestSellerCard";

type Product = {
  id: string;
  variantId: string;
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
  variantId: string;
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
  const [loading, setLoading] = useState(true);

  // Separate refs and states for each slider
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const bottomScrollRef = React.useRef<HTMLDivElement>(null);

  const [topDragging, setTopDragging] = useState(false);
  const [topStartX, setTopStartX] = useState(0);
  const [topScrollLeft, setTopScrollLeft] = useState(0);

  const [bottomDragging, setBottomDragging] = useState(false);
  const [bottomStartX, setBottomStartX] = useState(0);
  const [bottomScrollLeft, setBottomScrollLeft] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/best-seller", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");

        const data: ProductResponse[] = await res.json();

        const mappedProducts: Product[] = data.map((p) => ({
          id: p.id,
          variantId: p.variantId,
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

  // Determine slider configuration based on product count
  let topRow: Product[] = [];
  let bottomRow: Product[] = [];
  let showTwoSliders = false;

  if (products.length < 5) {
    topRow = products;
    showTwoSliders = false;
  } else if (products.length >= 5 && products.length <= 8) {
    topRow = products.slice(0, 4);
    bottomRow = products.slice(4);
    showTwoSliders = true;
  } else {
    const midPoint = Math.ceil(products.length / 2);
    topRow = products.slice(0, midPoint);
    bottomRow = products.slice(midPoint);
    showTwoSliders = true;
  }

  // Top slider navigation
  const topNextSlide = () => {
    if (topScrollRef.current) {
      const scrollAmount = 288 + 16;
      topScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const topPrevSlide = () => {
    if (topScrollRef.current) {
      const scrollAmount = 288 + 16;
      topScrollRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Bottom slider navigation
  const bottomNextSlide = () => {
    if (bottomScrollRef.current) {
      const scrollAmount = 288 + 16;
      bottomScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const bottomPrevSlide = () => {
    if (bottomScrollRef.current) {
      const scrollAmount = 288 + 16;
      bottomScrollRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Drag handlers (top)
  const topHandleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setTopDragging(true);
    setTopStartX(e.pageX - e.currentTarget.offsetLeft);
    setTopScrollLeft(e.currentTarget.scrollLeft);
  };

  const topHandleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!topDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - topStartX) * 2;
    e.currentTarget.scrollLeft = topScrollLeft - walk;
  };

  const topHandleMouseUp = () => setTopDragging(false);

  const topHandleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTopDragging(true);
    setTopStartX(e.touches[0].pageX - e.currentTarget.offsetLeft);
    setTopScrollLeft(e.currentTarget.scrollLeft);
  };

  const topHandleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!topDragging) return;
    const x = e.touches[0].pageX - e.currentTarget.offsetLeft;
    const walk = (x - topStartX) * 2;
    e.currentTarget.scrollLeft = topScrollLeft - walk;
  };

  const topHandleTouchEnd = () => setTopDragging(false);

  // Drag handlers (bottom)
  const bottomHandleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setBottomDragging(true);
    setBottomStartX(e.pageX - e.currentTarget.offsetLeft);
    setBottomScrollLeft(e.currentTarget.scrollLeft);
  };

  const bottomHandleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bottomDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - bottomStartX) * 2;
    e.currentTarget.scrollLeft = bottomScrollLeft - walk;
  };

  const bottomHandleMouseUp = () => setBottomDragging(false);

  const bottomHandleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setBottomDragging(true);
    setBottomStartX(e.touches[0].pageX - e.currentTarget.offsetLeft);
    setBottomScrollLeft(e.currentTarget.scrollLeft);
  };

  const bottomHandleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!bottomDragging) return;
    const x = e.touches[0].pageX - e.currentTarget.offsetLeft;
    const walk = (x - bottomStartX) * 2;
    e.currentTarget.scrollLeft = bottomScrollLeft - walk;
  };

  const bottomHandleTouchEnd = () => setBottomDragging(false);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Best Sellers...</p>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="page-wrap">
        {/* Header */}
        <h2 className="page-title">Customer Favourites</h2>

        {/* Top Slider */}
        <div className="relative mb-6">
          <div
            ref={topScrollRef}
            className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={topHandleMouseDown}
            onMouseMove={topHandleMouseMove}
            onMouseUp={topHandleMouseUp}
            onMouseLeave={topHandleMouseUp}
            onTouchStart={topHandleTouchStart}
            onTouchMove={topHandleTouchMove}
            onTouchEnd={topHandleTouchEnd}
          >
            {topRow.map((product) => (
              <BestSellerCard
                key={product.id}
                id={product.id}
                name={product.title}
                price={product.price}
                image={product.image}
              />
            ))}
          </div>

          {/* Top Slider Arrows */}
          <button
            onClick={topPrevSlide}
            className="absolute hidden md:block -left-16 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 ring-1 ring-stone-200 text-stone-700 shadow-sm hover:shadow transition"
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

          <button
            onClick={topNextSlide}
            className="absolute -right-16 top-1/2 hidden md:block -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 ring-1 ring-stone-200 text-stone-700 shadow-sm hover:shadow transition"
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
        </div>

        {/* Bottom Slider */}
        {showTwoSliders && (
          <div className="relative">
            <div
              ref={bottomScrollRef}
              className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onMouseDown={bottomHandleMouseDown}
              onMouseMove={bottomHandleMouseMove}
              onMouseUp={bottomHandleMouseUp}
              onMouseLeave={bottomHandleMouseUp}
              onTouchStart={bottomHandleTouchStart}
              onTouchMove={bottomHandleTouchMove}
              onTouchEnd={bottomHandleTouchEnd}
            >
              {bottomRow.map((product) => (
                <BestSellerCard
                  key={product.id}
                  id={product.id}
                  name={product.title}
                  price={product.price}
                  image={product.image}
                />
              ))}
            </div>

            {/* Bottom Slider Arrows */}
            <button
              onClick={bottomPrevSlide}
              className="absolute hidden md:block -left-16 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 ring-1 ring-stone-200 text-stone-700 shadow-sm hover:shadow transition"
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

            <button
              onClick={bottomNextSlide}
              className="absolute -right-16 top-1/2 hidden md:block -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 ring-1 ring-stone-200 text-stone-700 shadow-sm hover:shadow transition"
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
          </div>
        )}
      </div>
    </section>
  );
}
