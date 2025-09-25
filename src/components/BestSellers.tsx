"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, ShoppingCart } from "lucide-react";
import { isLoggedIn } from "@/lib/utils"; // 👈 add
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart"; // 👈 add
import { toast } from "sonner"; // 👈 make sure this is at the top


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
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); // start loader
        const res = await fetch("/api/product", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: ProductResponse[] = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false); // stop loader
      }
    };
    fetchProducts();
  }, []);
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
    if (isLoggedIn()) {
      // ✅ Logged in → server cart
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Add to cart failed:", errorData);
        toast.error("❌ Failed to add product to cart.");
        return;
      }

      toast.success("✅ Product added to cart!");
    } else {
      // ✅ Not logged in → local cart
      addLocalCartItem(productId, 1);
      toast.success("🛒 Product added to cart (local)!");
    }

    // Update UI
    setCartItems([...cartItems, productId]);
  } catch (error) {
    console.error("Add to cart failed:", error);
    toast.error("❌ Something went wrong. Please try again.");
  }
};

 useEffect(() => {
  const fetchCart = async () => {
    try {
      if (isLoggedIn()) {
        // ✅ Logged in → get server cart
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const cart = await res.json();
        if (cart?.items) {
          setCartItems(cart.items.map((item: CartItem) => item.product.id));
        }
      } else {
        // ✅ Not logged in → get local cart
        const localCart = getLocalCart();
        setCartItems(localCart.map((item) => item.productId));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };
  fetchCart();
}, []);
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Best Sellers...</p>
      </div>
    );
  }



  const handleGoToCart = () => router.push("/cart");

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
            <div
              key={product.id}
              className="w-72 flex-shrink-0"
            >
              <div
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105 overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName === "BUTTON") return;
                  router.push(`/product/${product.id}`);
                }}
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={"Product"}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.isOnSale && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-green-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {product.saleTag || "Sale"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-xs text-gray-500 font-semibold">{product.name}</h4>
                  <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="mb-3">
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through mr-2">
                        ₹{product.originalPrice}
                      </span>
                    )}
                    <span className="text-lg font-semibold text-gray-800">
                      ₹{product.price}
                    </span>
                  </div>


                  <div className="flex flex-col space-y-2">
                    {cartItems.includes(product.id) ? (
                      <button
                        onClick={handleGoToCart}
                        className="w-full flex items-center cursor-pointer justify-center gap-2 py-2 px-4 border border-gray-300
                         rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingCart size={16} />
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 
                        rounded-md text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 border 
                      border-gray-300 text-gray-700 rounded-md cursor-pointer text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Eye size={16} />
                      View Details
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
