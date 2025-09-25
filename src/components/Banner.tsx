"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ✅ Replace these with your actual images
import { BannerImages } from "@/constants/values";



export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-[#f0f7ff] flex flex-col md:flex-row items-center justify-between px-10 py-20">
      {/* Text */}
      <div className="max-w-xl">
        <h2 className="text-5xl font-bold text-blue-900 mb-6">
          Dress Your Kids <br /> In Comfort & Style
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Discover trendy, comfy, and affordable kidswear for every occasion.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          SHOP NOW
        </button>
      </div>

      {/* Image Slider */}
      <div className="flex space-x-5 mt-10 md:mt-0 relative w-[650px] h-[300px]">
        {BannerImages.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`Banner ${index + 1}`}
            width={400}
            height={300}
            className={`absolute inset-0 w-full h-full object-contain rounded-lg transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
