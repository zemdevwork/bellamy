"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const bestSellers = [
  {
    id: 1,
    title: "Flaviour 100% Pure Rosemary Essential Oil - For Hair Growth & Aromatherapy",
    price: "From Rs. 390.00",
    originalPrice: "Rs. 469.00",
    rating: 4.5,
    reviewCount: 34,
    image: "/Images/banner.jpg",
    isOnSale: true,
    saleTag: "Sale",
  },
  {
    id: 2,
    title: "Flaviour Lavender Essential Oil for Sleep & Stress Relief",
    price: "From Rs. 489.00",
    rating: 1,
    reviewCount: 1,
    image: "/Images/banner.jpg",
    isOnSale: false,
  },
  {
    id: 3,
    title: "Flaviour Frankincense Essential Oil for Skin Rejuvenation & Calm",
    price: "From Rs. 499.00",
    rating: 5,
    reviewCount: 121,
    image: "/Images/banner.jpg",
    isOnSale: false,
  },
  {
    id: 4,
    title: "Flaviour Peppermint Essential Oil for Headache & Sinus Relief",
    price: "From Rs. 499.00",
    rating: 3,
    reviewCount: 1,
    image: "/Images/banner.jpg",
    isOnSale: false,
  },
  {
    id: 5,
    title: "Flaviour Eucalyptus Essential Oil for Respiratory Health",
    price: "From Rs. 450.00",
    rating: 4,
    reviewCount: 25,
    image: "/Images/banner.jpg",
    isOnSale: false,
  },
  {
    id: 6,
    title: "Flaviour Tea Tree Essential Oil for Acne & Skin Care",
    price: "From Rs. 420.00",
    rating: 4.2,
    reviewCount: 18,
    image: "/Images/banner.jpg",
    isOnSale: false,
  },
];

export default function BestSellers() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [cartItems, setCartItems] = useState<number[]>([]); // store product IDs
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Slide navigation
  const nextSlide = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 288 + 16; // card width + gap
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  const prevSlide = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 288 + 16;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
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

  // Cart functions
  const handleAddToCart = (productId: number) => {
    if (!cartItems.includes(productId)) setCartItems([...cartItems, productId]);
  };
  const handleGoToCart = () => router.push("/cart");

  // Star rendering
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-fill)"
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
          />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif text-gray-800">Our Best Sellers</h2>
          <div className="flex space-x-2">
            <button onClick={prevSlide} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={nextSlide} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {bestSellers.map((product) => (
            <div key={product.id} className="w-72 flex-shrink-0">
              <div
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName === "BUTTON") return; // don't navigate if button clicked
                  router.push(`${process.env.NEXT_PUBLIC_URL}/product/${product.id}`);
                }}
              >
                {/* Image */}
                <div className="relative">
                  <Image src={product.image} alt={product.title} width={400} height={300} className="w-full h-64 object-cover" />
                  {product.isOnSale && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-green-800 text-white text-xs px-2 py-1 rounded-full font-medium">{product.saleTag}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{product.title}</h3>

                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">{renderStars(product.rating)}</div>
                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    {product.originalPrice && <span className="text-sm text-gray-400 line-through mr-2">{product.originalPrice}</span>}
                    <span className="text-lg font-semibold text-gray-800">{product.price}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col space-y-2">
                    {cartItems.includes(product.id) ? (
                      <button
                        onClick={handleGoToCart}
                        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => console.log(`Buy Now: ${product.id}`)}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
