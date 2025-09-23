"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;  // ✅ Added
  title: string;
  price: string;
  originalPrice?: string | null;
  rating?: number;
  reviewCount?: number;
  image: string;
  isOnSale?: boolean;
  saleTag?: string;
};

type ProductResponse = {
  id: string;
  name: string;  // ✅ Added
  title: string;
  price: string;
  originalPrice?: string | null;
  rating?: number;
  reviewCount?: number;
  image: string;
  isOnSale?: boolean;
  saleTag?: string;
};


export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");

        const data: ProductResponse[] = await res.json();

        // Map backend data to Product type if needed
        const mappedProducts: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,   // ✅ Added
          title: p.title,
          price: p.price,
          originalPrice: p.originalPrice,
          rating: p.rating,
          reviewCount: p.reviewCount,
          image: p.image,
          isOnSale: p.isOnSale,
          saleTag: p.saleTag,
        }));
        

        setProducts(mappedProducts);
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
  
  type CartItem = {
    product: {
      id: string;
    };
    quantity: number;
  };
  
  // Cart functions
// Inside BestSellers.tsx

const handleAddToCart = async (productId: string) => {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (!res.ok) throw new Error("Failed to add to cart");

    // Update UI
    setCartItems([...cartItems, productId]);
  } catch (error) {
    console.error("Add to cart failed:", error);
  }
};

// Load existing cart when page loads
useEffect(() => {
  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;
      const cart = await res.json();
      if (cart?.items) {
        setCartItems(cart.items.map((item: CartItem) => item.product.id));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };
  fetchCart();
}, []);


  const handleGoToCart = () => router.push("/cart");

  // Render stars
  const renderStars = (rating: number = 0) => {
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
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> </svg>
            </button>
            <button onClick={nextSlide} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /> </svg>
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
          {products.map((product) => (
            <div key={product.id} className="w-72 flex-shrink-0">
              <div
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName === "BUTTON") return;
                  router.push(`/product/${product.id}`);
                }}
              >
                <div className="relative">
                  <Image src={product.image} alt={product.title} width={400} height={300} className="w-full h-64 object-cover" />
                  {product.isOnSale && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-green-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {product.saleTag || "Sale"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
  <h4 className="text-xs text-gray-500 font-semibold">{product.name}</h4> {/* ✅ Brand/Name */}
  <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{product.title}</h3>
  
  <div className="flex items-center mb-2">
    <div className="flex items-center">{renderStars(product.rating ?? 0)}</div>
    {product.reviewCount && <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>}
  </div>

  <div className="mb-3">
    {product.originalPrice && (
      <span className="text-sm text-gray-400 line-through mr-2">{product.originalPrice}</span>
    )}
    <span className="text-lg font-semibold text-gray-800">{product.price}</span>
  </div>


                  <div className="flex flex-col space-y-2">
                    {cartItems.includes(product.id) ? (
                      <button onClick={handleGoToCart} className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Go to Cart
                      </button>
                    ) : (
                      <button onClick={() => handleAddToCart(product.id)} className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Add to Cart
                      </button>
                    )}
                    <button onClick={() => console.log(`Buy Now: ${product.id}`)} className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
